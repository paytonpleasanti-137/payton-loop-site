#!/usr/bin/env python3
"""
Berkshire Hathaway Letter Scraper
Runs via GitHub Actions on Azure infrastructure
Fetches annual letters (HTM + PDF) from berkshirehathaway.com
Saves extracted text to data/berkshire_letters.json
"""
import urllib.request, urllib.error, ssl, json, re, os, time
import subprocess, sys

ctx = ssl.create_default_context()
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.google.com/',
}

BASE = 'https://www.berkshirehathaway.com'

# Known letter URLs — hardcoded as fallback if index parse fails
KNOWN_LETTERS = [
    {'year': '2023', 'url': f'{BASE}/letters/2023ltr.pdf'},
    {'year': '2022', 'url': f'{BASE}/letters/2022ltr.pdf'},
    {'year': '2021', 'url': f'{BASE}/letters/2021ltr.pdf'},
    {'year': '2020', 'url': f'{BASE}/letters/2020ltr.pdf'},
    {'year': '2019', 'url': f'{BASE}/letters/2019ltr.htm'},
    {'year': '2018', 'url': f'{BASE}/letters/2018ltr.htm'},
    {'year': '2017', 'url': f'{BASE}/letters/2017ltr.htm'},
    {'year': '2016', 'url': f'{BASE}/letters/2016ltr.htm'},
    {'year': '2015', 'url': f'{BASE}/letters/2015ltr.htm'},
    {'year': '2014', 'url': f'{BASE}/letters/2014ltr.htm'},
    {'year': '2013', 'url': f'{BASE}/letters/2013ltr.htm'},
    {'year': '2012', 'url': f'{BASE}/letters/2012ltr.htm'},
    {'year': '2011', 'url': f'{BASE}/letters/2011ltr.htm'},
    {'year': '2010', 'url': f'{BASE}/letters/2010ltr.html'},
    {'year': '2009', 'url': f'{BASE}/letters/2009ltr.html'},
    {'year': '2008', 'url': f'{BASE}/letters/2008ltr.html'},
    {'year': '2007', 'url': f'{BASE}/letters/2007ltr.pdf'},
    {'year': '2006', 'url': f'{BASE}/letters/2006ltr.pdf'},
    {'year': '2005', 'url': f'{BASE}/letters/2005ltr.pdf'},
    {'year': '2004', 'url': f'{BASE}/letters/2004ltr.pdf'},
]

def fetch_bytes(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            resp = urllib.request.urlopen(req, context=ctx, timeout=20)
            return resp.read()
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {e}")
            time.sleep(3)
    return None

def fetch_text(url):
    data = fetch_bytes(url)
    if data is None:
        return None
    return data.decode('utf-8', errors='replace')

def html_to_text(html):
    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL|re.IGNORECASE)
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL|re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', html)
    text = re.sub(r'&nbsp;', ' ', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'&ldquo;|&#8220;', '"', text)
    text = re.sub(r'&rdquo;|&#8221;', '"', text)
    text = re.sub(r'&mdash;|&#8212;', '—', text)
    text = re.sub(r'&rsquo;|&#8217;', "'", text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def pdf_to_text(data, year):
    """Extract text from PDF bytes using pdfminer or pypdf"""
    try:
        import pypdf
        import io
        reader = pypdf.PdfReader(io.BytesIO(data))
        text = ''
        for page in reader.pages[:8]:  # First 8 pages = the letter
            text += page.extract_text() or ''
        return text
    except Exception as e:
        print(f"  pypdf failed: {e}")
    
    # Fallback: save to tmp and use pdftotext if available
    try:
        tmp = f'/tmp/berk_{year}.pdf'
        with open(tmp, 'wb') as f:
            f.write(data)
        result = subprocess.run(['pdftotext', tmp, '-'], capture_output=True, text=True, timeout=15)
        if result.returncode == 0:
            return result.stdout
    except Exception as e:
        print(f"  pdftotext failed: {e}")
    
    return None

def try_install_pypdf():
    try:
        import pypdf
        return True
    except ImportError:
        print("Installing pypdf...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'pypdf', '-q'], check=True)
        return True

def get_letter_text(letter):
    url = letter['url']
    year = letter['year']
    
    if url.endswith('.pdf'):
        data = fetch_bytes(url)
        if data:
            text = pdf_to_text(data, year)
            return text, len(data)
    else:
        html = fetch_text(url)
        if html:
            text = html_to_text(html)
            return text, len(html)
    
    return None, 0

def extract_opener(text, year):
    """Get the opening passage of each letter — first 3000 chars after salutation"""
    markers = ['To the Shareholders of Berkshire Hathaway', 
               'To the shareholders of Berkshire Hathaway',
               'To the Shareholders', 'BERKSHIRE HATHAWAY INC.']
    start = 0
    for m in markers:
        idx = text.find(m)
        if idx >= 0:
            start = idx
            break
    return re.sub(r'\s+', ' ', text[start:start+3500]).strip()

# ── MAIN ──────────────────────────────────────────────────────────────────────
print("Berkshire Hathaway Letter Scraper — GitHub Actions run")
try_install_pypdf()

os.makedirs('data', exist_ok=True)

results = []
for letter in KNOWN_LETTERS[:15]:
    year = letter['year']
    url  = letter['url']
    print(f"\n[{year}] {url}")
    
    text, size = get_letter_text(letter)
    
    if text and len(text) > 500:
        opener = extract_opener(text, year)
        results.append({
            'year': year,
            'url': url,
            'fetched': True,
            'char_count': len(text),
            'excerpt': opener[:3000],
        })
        print(f"  OK — {len(text):,} chars extracted")
    else:
        results.append({'year': year, 'url': url, 'fetched': False, 'char_count': 0, 'excerpt': ''})
        print(f"  FAILED — no text extracted")
    
    time.sleep(1.5)

output = {
    'scraped_at': __import__('datetime').datetime.utcnow().isoformat() + 'Z',
    'letter_count': len([r for r in results if r['fetched']]),
    'total_attempted': len(results),
    'letters': results
}

with open('data/berkshire_letters.json', 'w') as f:
    json.dump(output, f, indent=2)

fetched = output['letter_count']
print(f"\nDone: {fetched}/{len(results)} letters fetched")
print(f"Saved to data/berkshire_letters.json")
