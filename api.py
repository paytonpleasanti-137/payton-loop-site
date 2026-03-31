#!/usr/bin/env python3
"""
api.py — Payton Loop Capital backend
Real financial data: SEC EDGAR filings, Fed rates, insider transactions
Serves JSON endpoints consumed by plc-capital.js
Run: python3 api.py
"""

import json, urllib.request, urllib.parse, ssl, re, time, os
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

PORT = 8081
CTX  = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode    = ssl.CERT_NONE

EDGAR_HEADERS = {
    'User-Agent': 'Payton Loop Research research@paytonloop.com',
    'Accept-Encoding': 'gzip, deflate',
    'Host': 'data.sec.gov'
}

# ── HELPERS ────────────────────────────────────────────────────────────────────

def fetch(url, headers=None, timeout=10):
    req = urllib.request.Request(url, headers=headers or {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
    })
    try:
        resp = urllib.request.urlopen(req, context=CTX, timeout=timeout)
        return resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        return None

def json_response(data):
    return json.dumps(data, indent=2)

# ── DATA FUNCTIONS ─────────────────────────────────────────────────────────────

def get_fed_rates():
    """Fetch current Fed Funds rate from FRED API (St. Louis Fed — public endpoint)"""
    url = 'https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=annualkey&file_type=json&limit=12&sort_order=desc'
    # Use public FRED without key for latest observation
    url2 = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=FEDFUNDS'
    raw = fetch(url2)
    if raw:
        lines = raw.strip().split('\n')
        recent = []
        for line in lines[-13:]:
            parts = line.split(',')
            if len(parts) == 2 and parts[0] != 'DATE':
                recent.append({'date': parts[0], 'rate': parts[1]})
        return {'source': 'FRED / St. Louis Fed', 'series': 'FEDFUNDS', 'data': recent[-12:]}
    return {'error': 'Could not fetch Fed rate'}

def get_treasury_yields():
    """Current Treasury yields from US Treasury"""
    url = 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value_month=' + datetime.now().strftime('%Y%m')
    raw = fetch(url)
    if raw:
        # Parse table — look for most recent date row
        dates = re.findall(r'(\d{2}/\d{2}/\d{4})', raw)
        rates_1m = re.findall(r'1 Mo.*?(\d+\.\d+)', raw)
        rates_10y = re.findall(r'10 Yr.*?(\d+\.\d+)', raw)
        if dates:
            return {
                'source': 'US Treasury',
                'date': dates[-1] if dates else 'N/A',
                '1mo': rates_1m[-1] if rates_1m else 'N/A',
                '10yr': rates_10y[-1] if rates_10y else 'N/A'
            }
    return {'error': 'Could not fetch Treasury yields'}

def get_insider_transactions(ticker='BRK.B', limit=20):
    """Fetch recent Form 4 insider transactions from SEC EDGAR"""
    # Get CIK for ticker
    cik_url = f'https://efts.sec.gov/LATEST/search-index?q=%22{ticker}%22&dateRange=custom&startdt=2024-01-01&forms=4'
    search_url = f'https://efts.sec.gov/LATEST/search-index?q=%22{ticker}%22&forms=4&hits.hits._source.period_of_report=&hits.hits.total=true'

    # Use EDGAR full-text search for Form 4 filings
    edgar_url = f'https://efts.sec.gov/LATEST/search-index?q=%22{urllib.parse.quote(ticker)}%22&forms=4&hits.hits.total=true'
    edgar_search = f'https://efts.sec.gov/LATEST/search-index?q=%22{ticker}%22&forms=4'

    url = f'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=berkshire+hathaway&CIK=&type=4&dateb=&owner=include&count=20&search_text=&action=getcompany'
    raw = fetch(url, headers={'User-Agent': 'Payton Loop Research research@paytonloop.com'})

    results = []
    if raw:
        # Extract filing entries
        matches = re.findall(r'<td[^>]*>.*?(\d{4}-\d{2}-\d{2}).*?</td>', raw)
        results = [{'date': m} for m in matches[:limit]]

    return {'ticker': ticker, 'form': '4', 'results': results, 'source': 'SEC EDGAR'}

def get_berkshire_fundamentals():
    """Pull Berkshire Hathaway key metrics from SEC EDGAR company facts"""
    url = 'https://data.sec.gov/api/xbrl/companyfacts/CIK0001067983.json'
    raw = fetch(url, headers=EDGAR_HEADERS)
    if not raw:
        return {'error': 'EDGAR blocked or unavailable from this IP'}

    try:
        data = json.loads(raw)
        facts = data.get('facts', {})
        us_gaap = facts.get('us-gaap', {})

        def latest(key):
            entries = us_gaap.get(key, {}).get('units', {})
            for unit_key in ['USD', 'shares', 'pure']:
                if unit_key in entries:
                    vals = [v for v in entries[unit_key] if v.get('form') in ('10-K','10-Q')]
                    if vals:
                        vals.sort(key=lambda x: x.get('end',''), reverse=True)
                        return vals[0]
            return None

        metrics = {}
        for key in ['NetIncomeLoss', 'Revenues', 'Assets', 'StockholdersEquity',
                    'CommonStockSharesOutstanding', 'EarningsPerShareBasic']:
            v = latest(key)
            if v:
                metrics[key] = {'value': v.get('val'), 'end': v.get('end'), 'form': v.get('form')}

        return {'cik': '0001067983', 'entity': 'Berkshire Hathaway', 'metrics': metrics}
    except Exception as e:
        return {'error': str(e)}

def calc_roic(ebit, tax_rate, debt, equity, cash):
    nopat = ebit * (1 - tax_rate / 100)
    ic    = debt + equity - cash
    return {'nopat': nopat, 'invested_capital': ic, 'roic': (nopat / ic * 100) if ic else 0}

def calc_dcf(fcf, g1, g2, terminal_g, discount_rate, shares):
    pv = 0
    cf = fcf
    yearly = []
    for i in range(1, 11):
        rate = g1 / 100 if i <= 5 else g2 / 100
        cf   = cf * (1 + rate)
        disc = cf / ((1 + discount_rate / 100) ** i)
        pv  += disc
        yearly.append({'year': i, 'fcf': round(cf, 2), 'pv': round(disc, 2)})

    terminal = (cf * (1 + terminal_g / 100)) / ((discount_rate - terminal_g) / 100)
    pv_term  = terminal / ((1 + discount_rate / 100) ** 10)
    total    = pv + pv_term
    per_share = total / shares if shares else 0

    return {
        'pv_cash_flows':   round(pv, 2),
        'terminal_value':  round(terminal, 2),
        'pv_terminal':     round(pv_term, 2),
        'total_value':     round(total, 2),
        'per_share':       round(per_share, 2),
        'yearly':          yearly
    }

# ── HTTP SERVER ────────────────────────────────────────────────────────────────

class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]} {args[1]}")

    def send_json(self, data, status=200):
        body = json_response(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        params = dict(urllib.parse.parse_qsl(urllib.parse.urlparse(self.path).query))

        if path == '/api/health':
            self.send_json({'status': 'ok', 'time': datetime.utcnow().isoformat()})

        elif path == '/api/fed-rates':
            self.send_json(get_fed_rates())

        elif path == '/api/treasury':
            self.send_json(get_treasury_yields())

        elif path == '/api/insider':
            ticker = params.get('ticker', 'BRK.B')
            self.send_json(get_insider_transactions(ticker))

        elif path == '/api/berkshire':
            self.send_json(get_berkshire_fundamentals())

        elif path == '/api/roic':
            try:
                result = calc_roic(
                    float(params.get('ebit', 500)),
                    float(params.get('tax', 21)),
                    float(params.get('debt', 1000)),
                    float(params.get('equity', 3000)),
                    float(params.get('cash', 200))
                )
                self.send_json(result)
            except Exception as e:
                self.send_json({'error': str(e)}, 400)

        elif path == '/api/dcf':
            try:
                result = calc_dcf(
                    float(params.get('fcf', 100)),
                    float(params.get('g1', 15)),
                    float(params.get('g2', 8)),
                    float(params.get('tg', 3)),
                    float(params.get('dr', 10)),
                    float(params.get('shares', 100))
                )
                self.send_json(result)
            except Exception as e:
                self.send_json({'error': str(e)}, 400)

        else:
            self.send_json({'error': 'Not found', 'path': path}, 404)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.end_headers()


if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', PORT), Handler)
    print(f"Payton Loop Capital API — port {PORT}")
    print(f"Endpoints: /api/health  /api/fed-rates  /api/treasury  /api/insider  /api/berkshire  /api/roic  /api/dcf")
    server.serve_forever()
