
(function() {
  var SEARCH_INDEX = [
  {"page":"General Ledger","url":"ledger.html","title":"General Ledger — Double-Entry Bookkeeping","type":"tool","text":"ledger general journal double entry debit credit balance capital expense revenue milestone pacioli buffett audit trail"},{"page": "Financial Calculators", "url": "calc.html", "title": "CAGR Calculator", "type": "tool", "text": "cagr compound annual growth rate return investment revenue berkshire apple tesla microsoft sec edgar"}, {"page": "Financial Calculators", "url": "calc.html", "title": "ROIC \u2014 Return on Invested Capital", "type": "tool", "text": "roic return invested capital nopat ebit operating income equity debt buffett moat efficiency competitive advantage"}, {"page": "Financial Calculators", "url": "calc.html", "title": "CD Calculator \u2014 Certificate of Deposit", "type": "tool", "text": "cd certificate deposit interest rate term early withdrawal penalty compounding apy savings bank"}, {"page": "Financial Calculators", "url": "calc.html", "title": "Compound Interest Calculator", "type": "tool", "text": "compound interest growth investment principal contributions rate inflation real value wealth building"}, {"page": "Financial Calculators", "url": "calc.html", "title": "DCF \u2014 Intrinsic Value per Share", "type": "tool", "text": "dcf discounted cash flow intrinsic value per share enterprise equity wacc terminal growth buffett valuation"}, {"page": "Prediction Markets", "url": "predict.html", "title": "Live Polymarket Markets", "type": "tool", "text": "polymarket prediction market live odds politics crypto sports economy election fed interest rate"}, {"page": "Prediction Markets", "url": "predict.html", "title": "Edge Analyzer \u2014 EV Calculator", "type": "tool", "text": "edge analyzer kelly criterion expected value ev probability stake bankroll kalshi polymarket"}, {"page": "Prediction Markets", "url": "predict.html", "title": "Kalshi \u2014 CFTC Regulated", "type": "tool", "text": "kalshi cftc regulated prediction market usd legal oklahoma federal reserve fed rate"}, {"page": "The Edge", "url": "edge.html", "title": "Gray Area Opportunities Overview", "type": "intel", "text": "gray area unregulated prediction markets defi yield arbitrage information edge tokenized asymmetric forward thinking"}, {"page": "The Edge", "url": "edge.html", "title": "DeFi Stablecoin Yield 8-20% APY", "type": "intel", "text": "defi stablecoin yield aave compound ethena usdc usdt dai lending apy passive income crypto"}, {"page": "The Edge", "url": "edge.html", "title": "Sports Book Arbitrage \u2014 Guaranteed Profit", "type": "intel", "text": "arbitrage sports book sportsbook fanduel draftkings guaranteed profit both sides oklahoma legal"}, {"page": "The Edge", "url": "edge.html", "title": "Prediction Market Arbitrage", "type": "intel", "text": "prediction market arbitrage polymarket kalshi same event two prices riskless spread"}, {"page": "The Edge", "url": "edge.html", "title": "Tokenized Real World Assets", "type": "intel", "text": "tokenized real world assets rwa blackrock ondo maple centrifuge treasury bonds private credit onchain"}, {"page": "The Edge", "url": "edge.html", "title": "SEC EDGAR Information Edge", "type": "intel", "text": "sec edgar 8-k 13-d form 4 insider buying activist hedge fund filing early alert signal"}, {"page": "The Edge", "url": "edge.html", "title": "AI Content Arbitrage \u2014 Your Primary Edge", "type": "intel", "text": "ai content arbitrage youtube tiktok productivity advantage payton loop 10x edge"}, {"page": "Whale Tracker", "url": "whales.html", "title": "Smart Money Signal Cards", "type": "tool", "text": "whale tracker smart money large position price movement polymarket signal hot warm stable"}, {"page": "Whale Tracker", "url": "whales.html", "title": "Activity Feed \u2014 Price Movement Alerts", "type": "tool", "text": "whale activity feed alert price change movement large trade institutional money"}, {"page": "Bets Desk", "url": "bets.html", "title": "Clean Ticket Protocol Analyzer", "type": "tool", "text": "bets desk ticket analyzer kelly criterion expected value edge implied probability odds stake bankroll"}, {"page": "Bets Desk", "url": "bets.html", "title": "Bankroll Tracker", "type": "tool", "text": "bankroll tracker win loss record pnl profit history bets log oklahoma legal betting fanduel draftkings"}, {"page": "Command Brief", "url": "command.html", "title": "Daily Command Brief", "type": "tool", "text": "command brief daily mission scoreboard freedom day revenue views videos goals progress"}, {"page": "Filings Archive", "url": "filings.html", "title": "SEC 10-K / 10-Q Filings", "type": "tool", "text": "sec filings 10-k 10-q annual quarterly berkshire apple tesla microsoft nvidia amazon alphabet jpmorgan walmart visa"}, {"page": "Operations Page", "url": "plc-capital.html", "title": "Financial Position", "type": "section", "text": "financial position revenue earnings invested capital debt freedom day target monthly income"}, {"page": "Operations Page", "url": "plc-capital.html", "title": "Editorial Strategy", "type": "section", "text": "editorial strategy content youtube tiktok shorts scripts thumbnails batch production"}, {"page": "Operations Page", "url": "plc-capital.html", "title": "Algorithms & Live Data", "type": "section", "text": "algorithm content opportunity scorer revenue projection engine 10-k speed reader live data"}, {"page": "Operations Page", "url": "plc-capital.html", "title": "Long-Term Objectives", "type": "section", "text": "objectives freedom day ferrari f-150 black widow home edmond debt elimination dream"}, {"page": "Operations Page", "url": "plc-capital.html", "title": "Revenue Partners", "type": "section", "text": "revenue partners affiliate amazon associates gumroad ai money playbook commission"}, {"page": "Operations Page", "url": "plc-capital.html", "title": "Quantitative Analysis", "type": "section", "text": "quantitative analysis charts revenue projection break-even ev per hour view compounding roi"}, {"page": "Operations Page", "url": "plc-capital.html", "title": "Intrinsic Value Analysis", "type": "section", "text": "intrinsic value dcf human capital payton pleasant payton loop business entity comparison"}, {"page": "Operations Page", "url": "plc-capital.html", "title": "Risk Assessment", "type": "section", "text": "risk assessment platform dependency credit burn burn rate scenario planning worst case"}, {"page": "Operations Page", "url": "plc-capital.html", "title": "Recent Dispatches", "type": "section", "text": "recent dispatches notes ledger log activity history"}];

  var TYPE_ICONS = {
    "tool":    "&#9632;",
    "intel":   "&#9650;",
    "section": "&#9632;"
  };
  var TYPE_LABELS = {
    "tool":    "TOOL",
    "intel":   "INTEL",
    "section": "SECTION"
  };
  var TYPE_COLORS = {
    "tool":    "#00008b",
    "intel":   "#cc0000",
    "section": "#555"
  };

  function score(entry, q) {
    var terms = q.toLowerCase().split(/\s+/).filter(function(t){ return t.length > 1; });
    var title = entry.title.toLowerCase();
    var text  = entry.text.toLowerCase();
    var page  = entry.page.toLowerCase();
    var s = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (title.indexOf(t) === 0)       s += 20;
      else if (title.indexOf(t) >= 0)   s += 10;
      if (text.indexOf(t) >= 0)         s += 3;
      if (page.indexOf(t) >= 0)         s += 5;
    }
    return s;
  }

  function search(q) {
    if (!q || q.trim().length < 2) return [];
    var scored = [];
    for (var i = 0; i < SEARCH_INDEX.length; i++) {
      var s = score(SEARCH_INDEX[i], q);
      if (s > 0) scored.push({entry: SEARCH_INDEX[i], score: s});
    }
    scored.sort(function(a,b){ return b.score - a.score; });
    return scored.slice(0, 12);
  }

  function renderResults(results, q) {
    var el = document.getElementById('gs-results');
    if (!el) return;
    if (!results.length) {
      el.innerHTML = '<div style="padding:20px;text-align:center;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">No results for "' + q + '"</div>';
      return;
    }
    var html = '';
    var lastPage = '';
    for (var i = 0; i < results.length; i++) {
      var e = results[i].entry;
      if (e.page !== lastPage) {
        if (lastPage) html += '</div>';
        html += '<div class="gs-group">';
        html += '<div class="gs-group-label">' + e.page + '</div>';
        lastPage = e.page;
      }
      var icon = TYPE_ICONS[e.type] || '&#9632;';
      var label = TYPE_LABELS[e.type] || e.type.toUpperCase();
      var color = TYPE_COLORS[e.type] || '#555';
      html += '<a class="gs-result" href="' + e.url + '">'
            + '<span class="gs-type" style="color:' + color + '">' + icon + ' ' + label + '</span>'
            + '<span class="gs-title">' + highlight(e.title, q) + '</span>'
            + '</a>';
    }
    if (lastPage) html += '</div>';
    el.innerHTML = html;
  }

  function highlight(text, q) {
    var terms = q.toLowerCase().split(/\s+/).filter(function(t){ return t.length > 1; });
    var result = text;
    for (var i = 0; i < terms.length; i++) {
      var re = new RegExp('(' + terms[i].replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')', 'gi');
      result = result.replace(re, '<mark style="background:#ffff00;color:#000;padding:0 1px">$1</mark>');
    }
    return result;
  }

  function openSearch() {
    var overlay = document.getElementById('gs-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      setTimeout(function(){ document.getElementById('gs-input').focus(); }, 50);
    }
  }

  function closeSearch() {
    var overlay = document.getElementById('gs-overlay');
    if (overlay) overlay.style.display = 'none';
    var inp = document.getElementById('gs-input');
    if (inp) inp.value = '';
    var res = document.getElementById('gs-results');
    if (res) res.innerHTML = '';
  }

  function onInput(val) {
    if (val.length < 2) {
      document.getElementById('gs-results').innerHTML = '<div style="padding:16px 20px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px">Type to search across all pages and tools&hellip;</div>';
      return;
    }
    var results = search(val);
    renderResults(results, val);
  }

  // Inject overlay HTML
  var overlay = document.createElement('div');
  overlay.id = 'gs-overlay';
  overlay.innerHTML = '<div class="gs-box">'
    + '<div class="gs-bar">'
    + '<span class="gs-icon">&#128269;</span>'
    + '<input type="text" id="gs-input" class="gs-input" placeholder="Search calculators, markets, intel, filings&hellip;" autocomplete="off" oninput="window._gsOnInput(this.value)">'
    + '<button class="gs-close" onclick="window._gsClose()">&#10005;</button>'
    + '</div>'
    + '<div id="gs-results"><div style="padding:16px 20px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px">Type to search across all pages and tools&hellip;</div></div>'
    + '<div class="gs-footer">&#9166; Open &nbsp;&nbsp; &#8593;&#8595; Navigate &nbsp;&nbsp; Esc Close &nbsp;&nbsp; Cmd+K / Ctrl+K Anywhere</div>'
    + '</div>';
  overlay.setAttribute('style','display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:99999;align-items:flex-start;justify-content:center;padding-top:80px');
  overlay.onclick = function(e){ if(e.target===overlay) window._gsClose(); };
  document.body.appendChild(overlay);

  // Inject styles
  var style = document.createElement('style');
  style.textContent = '.gs-box{background:#fff;width:100%;max-width:640px;border:2px solid #000;box-shadow:0 20px 60px rgba(0,0,0,0.5);font-family:Arial,sans-serif;max-height:80vh;display:flex;flex-direction:column}'
    + '.gs-bar{display:flex;align-items:center;border-bottom:1px solid #eee;padding:0 14px;gap:10px;flex-shrink:0}'
    + '.gs-icon{font-size:16px;color:#999}'
    + '.gs-input{flex:1;border:none;padding:16px 0;font-size:16px;font-family:Arial;outline:none;background:#fff}'
    + '.gs-close{border:none;background:none;font-size:18px;cursor:pointer;color:#999;padding:8px}'
    + '.gs-close:hover{color:#000}'
    + '#gs-results{overflow-y:auto;flex:1}'
    + '.gs-group{border-bottom:1px solid #f0f0f0}'
    + '.gs-group-label{font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px;color:#999;padding:8px 20px 4px;background:#fafafa}'
    + '.gs-result{display:flex;align-items:center;gap:12px;padding:10px 20px;text-decoration:none;color:#000;border-bottom:1px solid #f8f8f8}'
    + '.gs-result:hover{background:#f5f5f5}'
    + '.gs-type{font-size:10px;font-weight:bold;letter-spacing:1px;min-width:56px;flex-shrink:0}'
    + '.gs-title{font-size:13px;font-weight:bold}'
    + '.gs-footer{padding:8px 20px;font-size:10px;color:#bbb;border-top:1px solid #eee;letter-spacing:.5px;flex-shrink:0;text-align:right}';
  document.head.appendChild(style);

  // Inject trigger button into nav (looks for common patterns)
  function injectTrigger() {
    var btn = document.createElement('button');
    btn.id = 'gs-trigger';
    btn.innerHTML = '&#128269; Search';
    btn.setAttribute('style','background:none;border:1px solid #555;color:#aaa;font-size:10px;font-family:Arial;padding:4px 10px;cursor:pointer;letter-spacing:.5px;text-transform:uppercase;margin-left:8px');
    btn.onclick = function(){ window._gsOpen(); };
    // Try to append to nav bar
    var nav = document.querySelector('nav') || document.querySelector('[style*="position:sticky"]') || document.querySelector('[style*="position:fixed"]');
    if (nav) {
      nav.appendChild(btn);
    } else {
      // Fallback: float fixed
      btn.setAttribute('style', btn.getAttribute('style') + ';position:fixed;bottom:20px;right:20px;z-index:9999;background:#000;color:#fff;border-color:#000;padding:8px 16px;font-size:11px');
      document.body.appendChild(btn);
    }
  }

  // Keyboard shortcut
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      window._gsOpen();
    }
    if (e.key === 'Escape') {
      window._gsClose();
    }
    // Arrow key navigation in results
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && document.getElementById('gs-overlay').style.display !== 'none') {
      e.preventDefault();
      var links = document.querySelectorAll('.gs-result');
      var active = document.querySelector('.gs-result:focus');
      if (!active && links.length) { links[0].focus(); return; }
      var idx = Array.prototype.indexOf.call(links, active);
      if (e.key === 'ArrowDown' && idx < links.length-1) links[idx+1].focus();
      if (e.key === 'ArrowUp' && idx > 0) links[idx-1].focus();
    }
  });

  window._gsOpen  = openSearch;
  window._gsClose = closeSearch;
  window._gsOnInput = onInput;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectTrigger);
  } else {
    injectTrigger();
  }
})();
