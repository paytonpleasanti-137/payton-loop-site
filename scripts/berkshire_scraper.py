#!/usr/bin/env python3
"""
Berkshire Hathaway Letter Scraper
Runs via GitHub Actions on Azure infrastructure (not Tencent-blacklisted)
Fetches letter index + extracts key passages from each annual letter
Saves to data/berkshire_letters.json
"""
import urllib.request, urllib.error, ssl, json, re, os, time

ctx = ssl.create_default_context()
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.google.com/',
}

BASE = 'https://www.berkshirehathaway.com'

def fetch(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            resp = urllib.request.urlopen(req, context=ctx, timeout=15)
            return resp.read().decode('utf-8', errors='replace')
        except Exception as e:
            print(f"  Attempt {attempt+1} failed for {url}: {e}")
            time.sleep(2)
    return None

def parse_letter_links(html):
    """Extract letter links from the letters index page"""
    links = []
    # Pattern: href="letters/YYYY ltr.htm" or similar
    patterns = [
        r'href="(letters/\d{4}ltr\.html?)"',
        r'href="(/letters/\d{4}ltr\.html?)"',
        r'href="(letters/\d{4}[^"]*\.html?)"',
    ]
    for pat in patterns:
        found = re.findall(pat, html, re.IGNORECASE)
        for f in found:
            url = BASE + '/' + f.lstrip('/')
            if url not in [l['url'] for l in links]:
                year = re.search(r'(\d{4})', f)
                if year:
                    links.append({'year': year.group(1), 'url': url})
    links.sort(key=lambda x: x['year'], reverse=True)
    return links[:30]  # Most recent 30 years

def extract_text_from_html(html):
    """Strip HTML tags, return clean text"""
    # Remove scripts and styles
    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL|re.IGNORECASE)
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL|re.IGNORECASE)
    # Remove tags
    text = re.sub(r'<[^>]+>', ' ', html)
    # Clean whitespace
    text = re.sub(r'&nbsp;', ' ', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'&ldquo;|&rdquo;', '"', text)
    text = re.sub(r'&mdash;', '—', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_passages(text, year):
    """Extract notable passages — first 3000 chars and key sections"""
    # Find the opening of the letter (usually starts after 'To the Shareholders')
    markers = ['To the Shareholders', 'To the shareholders', 'TO THE SHAREHOLDERS']
    start = 0
    for m in markers:
        idx = text.find(m)
        if idx >= 0:
            start = idx
            break
    
    excerpt = text[start:start + 4000].strip()
    return excerpt

print("Starting Berkshire letter scraper...")
print(f"Fetching letter index...")

index_html = fetch(f'{BASE}/letters/letters.html')
if not index_html:
    # Try alternate URL
    index_html = fetch(f'{BASE}/releases.html')

results = []

if index_html:
    links = parse_letter_links(index_html)
    print(f"Found {len(links)} letter links")
    
    for link in links[:15]:  # Process 15 most recent letters
        print(f"  Fetching {link['year']} letter...")
        html = fetch(link['url'])
        if html:
            text = extract_text_from_html(html)
            passage = extract_passages(text, link['year'])
            results.append({
                'year': link['year'],
                'url': link['url'],
                'excerpt': passage[:3000],
                'char_count': len(text),
                'fetched': True
            })
            print(f"    OK: {len(text)} chars")
        else:
            results.append({'year': link['year'], 'url': link['url'], 'excerpt': '', 'fetched': False})
        time.sleep(1)  # Be polite
else:
    print("Could not fetch letter index")

# Save results
os.makedirs('data', exist_ok=True)
output = {
    'scraped_at': __import__('datetime').datetime.utcnow().isoformat(),
    'letter_count': len(results),
    'letters': results
}
with open('data/berkshire_letters.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"\nSaved {len(results)} letters to data/berkshire_letters.json")
fetched = sum(1 for r in results if r['fetched'])
print(f"Successfully fetched: {fetched}/{len(results)}")
