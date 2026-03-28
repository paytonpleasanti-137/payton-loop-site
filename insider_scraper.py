#!/usr/bin/env python3
"""
Insider Transaction Scraper (Form 4)
Pulls CEO/CFO/Director buys & sells from SEC EDGAR
Outputs to data/insider_signals.json
Charlie Munger would approve.
"""

import urllib.request, json, re, time, os
from datetime import datetime, timedelta

HEADERS = {"User-Agent": "Payton Loop Research research@paytonloop.com"}
OUT = os.path.join(os.path.dirname(__file__), "insider_signals.json")

TRANSACTION_CODES = {
    "P": "Open Market Purchase",
    "S": "Open Market Sale",
    "A": "Grant / Award",
    "D": "Disposition to Issuer",
    "F": "Tax Withholding",
    "G": "Gift",
    "V": "Voluntary",
    "M": "Option Exercise",
    "C": "Conversion",
    "E": "Expiration of Short",
    "H": "Expiration of Long",
    "I": "Discretionary",
    "L": "Small Acquisition",
    "W": "Acquisition/Disposition by Will",
    "X": "Exercise/Conversion",
    "Z": "Trust",
}

HIGH_SIGNAL_CODES = {"P", "S"}

def fetch(url, retries=3):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as r:
                return r.read().decode("utf-8", errors="replace")
        except Exception as e:
            if i < retries - 1:
                time.sleep(1.5)
    return None

def xml_val(xml, tag):
    m = re.search(r'<' + tag + r'[^>]*>\s*(?:<value>)?\s*(.*?)\s*(?:</value>)?\s*</' + tag + r'>', xml, re.DOTALL)
    return m.group(1).strip() if m else ""

def parse_form4_xml(xml, adsh, file_date):
    """Parse a Form 4 XML and extract transaction records"""
    records = []
    issuer_name = xml_val(xml, "issuerName")
    ticker = xml_val(xml, "issuerTradingSymbol")
    owner_name = xml_val(xml, "rptOwnerName")
    is_director = xml_val(xml, "isDirector") == "1" or xml_val(xml, "isDirector") == "true"
    is_officer = xml_val(xml, "isOfficer") == "1" or xml_val(xml, "isOfficer") == "true"
    is_10pct = xml_val(xml, "isTenPercentOwner") == "1" or xml_val(xml, "isTenPercentOwner") == "true"
    officer_title = xml_val(xml, "officerTitle")

    role = []
    if is_director: role.append("Director")
    if is_officer and officer_title: role.append(officer_title)
    elif is_officer: role.append("Officer")
    if is_10pct: role.append("10%+ Owner")
    role_str = ", ".join(role) if role else "Insider"

    # Parse non-derivative transactions (actual stock buys/sells)
    txn_blocks = re.findall(r'<nonDerivativeTransaction>(.*?)</nonDerivativeTransaction>', xml, re.DOTALL)
    for block in txn_blocks:
        code = xml_val(block, "transactionCode")
        if code not in HIGH_SIGNAL_CODES:
            continue
        date = xml_val(block, "transactionDate")
        shares_raw = xml_val(block, "transactionShares")
        price_raw = xml_val(block, "transactionPricePerShare")
        shares_after_raw = xml_val(block, "sharesOwnedFollowingTransaction")
        direct = xml_val(block, "directOrIndirectOwnership")
        security = xml_val(block, "securityTitle")

        try:
            shares = float(re.sub(r'[^0-9.\-]', '', shares_raw)) if shares_raw else 0
            price = float(re.sub(r'[^0-9.\-]', '', price_raw)) if price_raw else 0
            shares_after = float(re.sub(r'[^0-9.\-]', '', shares_after_raw)) if shares_after_raw else 0
            value = shares * price
        except:
            continue

        if shares < 100:  # skip noise — tiny transactions
            continue

        action = TRANSACTION_CODES.get(code, code)
        direction = "BUY" if code == "P" else "SELL"

        # Conviction score: CEO buying > Director buying > 10% owner
        conviction = 50
        if is_officer and officer_title:
            title_up = officer_title.upper()
            if "CEO" in title_up or "CHIEF EXECUTIVE" in title_up:
                conviction = 95
            elif "CFO" in title_up or "CHIEF FINANCIAL" in title_up:
                conviction = 85
            elif "PRESIDENT" in title_up:
                conviction = 80
            elif "CHIEF" in title_up:
                conviction = 75
            else:
                conviction = 65
        elif is_director:
            conviction = 60
        if is_10pct:
            conviction = max(conviction, 70)
        if value > 1000000:
            conviction = min(100, conviction + 15)
        elif value > 500000:
            conviction = min(100, conviction + 10)
        elif value > 100000:
            conviction = min(100, conviction + 5)

        implication = ""
        if direction == "BUY":
            if conviction >= 85:
                implication = "C-suite executive deploying personal capital. No rational motive except belief price is too low. Strongest insider signal in markets."
            elif conviction >= 70:
                implication = "Officer or director buying open market. Aligns personal wealth with shareholder outcome. Uncommon and meaningful."
            else:
                implication = "Insider adding to position. Watch for cluster buys — when multiple insiders buy in the same window, signal strength multiplies."
        else:
            if conviction >= 85:
                implication = "C-suite selling. Could be diversification, tax planning, or concern. Context matters — is this a pattern or a one-time event?"
            else:
                implication = "Insider selling open market shares. Not automatically bearish — executives sell for many reasons. Watch for acceleration."

        records.append({
            "type": "INSIDER_" + direction,
            "company": issuer_name,
            "ticker": ticker,
            "insider": owner_name,
            "role": role_str,
            "action": action,
            "direction": direction,
            "security": security,
            "shares": int(shares),
            "price": round(price, 2),
            "value": int(value),
            "shares_after": int(shares_after),
            "ownership": "Direct" if direct == "D" else "Indirect",
            "date": date or file_date,
            "filed": file_date,
            "adsh": adsh,
            "conviction": conviction,
            "actionability": conviction,
            "signal": "{} {} {:,.0f} shares of {} @ ${:.2f} (${:,.0f} total)".format(
                owner_name, action.lower(), shares, security, price, value
            ),
            "implication": implication
        })

    return records

def run():
    print("[Insider] Fetching recent Form 4 filings...")
    start_dt = (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d")
    end_dt = datetime.now().strftime("%Y-%m-%d")

    search_url = (
        "https://efts.sec.gov/LATEST/search-index?forms=4"
        "&dateRange=custom&startdt={}&enddt={}"
        "&hits.hits.total.value=true"
    ).format(start_dt, end_dt)

    data = fetch(search_url)
    if not data:
        print("[Insider] EDGAR search failed")
        return

    j = json.loads(data)
    hits = j.get("hits", {}).get("hits", [])
    total = j.get("hits", {}).get("total", {}).get("value", 0)
    print(f"[Insider] {total} Form 4s in range, sampling {len(hits)}")

    all_records = []
    processed = 0

    for hit in hits:
        src = hit.get("_source", {})
        adsh = src.get("adsh", "")
        file_date = src.get("file_date", "")
        ciks = src.get("ciks", [])
        display_names = src.get("display_names", [])

        # Find the issuer CIK (not the filer CIK)
        # The issuer is typically the second CIK listed
        if len(ciks) < 2:
            continue

        issuer_cik = ciks[-1].lstrip("0")
        adsh_path = adsh.replace("-", "")

        # Get directory listing to find XML file
        idx_url = "https://www.sec.gov/Archives/edgar/data/{}/{}/".format(issuer_cik, adsh_path)
        idx = fetch(idx_url)
        if not idx:
            # Try with first CIK
            issuer_cik = ciks[0].lstrip("0")
            idx_url = "https://www.sec.gov/Archives/edgar/data/{}/{}/".format(issuer_cik, adsh_path)
            idx = fetch(idx_url)
        if not idx:
            continue

        xml_files = re.findall(r'href="(/Archives/edgar/data/[^"]+\.xml)"', idx)
        if not xml_files:
            continue

        xml_url = "https://www.sec.gov" + xml_files[0]
        xml = fetch(xml_url)
        if not xml:
            continue

        records = parse_form4_xml(xml, adsh, file_date)
        all_records.extend(records)
        processed += 1
        time.sleep(0.4)  # EDGAR rate limit

        if processed % 10 == 0:
            print(f"[Insider] Processed {processed}/{len(hits)}, {len(all_records)} transactions found")

    # Sort by conviction desc, then value desc
    all_records.sort(key=lambda x: (-x["conviction"], -x["value"]))

    # Keep top 50
    all_records = all_records[:50]

    out = {
        "updated": datetime.now().isoformat(),
        "total_filings_in_range": total,
        "transactions": all_records,
        "high_conviction_buys": len([r for r in all_records if r["direction"] == "BUY" and r["conviction"] >= 75]),
        "high_conviction_sells": len([r for r in all_records if r["direction"] == "SELL" and r["conviction"] >= 75])
    }

    with open(OUT, "w") as f:
        json.dump(out, f, indent=2)

    print(f"[Insider] Done. {len(all_records)} transactions saved.")
    print(f"  High-conviction buys: {out['high_conviction_buys']}")
    print(f"  High-conviction sells: {out['high_conviction_sells']}")

if __name__ == "__main__":
    run()
