/* plc-capital.js — Payton Loop Capital site scripts */


var TICKER_DATA = [
  {name:"INVESTED", val:"$221", delta:"-$221", up:false},
  {name:"EARNED", val:"$0", delta:"$0.00", up:false},
  {name:"VIEWS", val:"306", delta:"+306", up:true},
  {name:"TARGET", val:"$5,821/mo", delta:"0%", up:false},
  {name:"GUMROAD", val:"$27", delta:"Live", up:true},
  {name:"BREAK-EVEN", val:"$221", delta:"Day 3", up:false},
  {name:"BELMONT", val:"$0", delta:"Domain needed", up:false},
  {name:"VIDEOS", val:"3 Live", delta:"+10 Ready", up:true},
  {name:"CREDITS", val:"$12.50", delta:"Low", up:false},
  {name:"INDEP.", val:"$5,821", delta:"Building", up:false},
];



function show(name, btn) {
  document.querySelectorAll('.view').forEach(function(v){ v.classList.remove('active'); });
  document.querySelectorAll('.plc-sub').forEach(function(t){ t.classList.remove('active'); });
  var el = document.getElementById('v-' + name);
  if (el) el.classList.add('active');
  if (btn) btn.classList.add('active');
}

function showSection(sec, btn) {
  document.querySelectorAll('.plc-sec').forEach(function(b){ b.classList.remove('active'); });
  document.querySelectorAll('.plc-subnav').forEach(function(n){ n.style.display='none'; });
  if (btn) btn.classList.add('active');
  var sub = document.getElementById('sub-' + sec);
  if (sub) sub.style.display = 'flex';
  // Auto-show default view for section
  var defaults = {money:'rates', business:'belmont', life:'home', tools:'writing'};
  if (defaults[sec]) {
    var defBtn = document.querySelector('#sub-' + sec + ' .plc-sub');
    show(defaults[sec], defBtn);
  }
}

var _privUnlocked = false;
function showPrivate() {
  if (_privUnlocked) {
    // Already unlocked this session — show directly
    document.querySelectorAll('.plc-sec').forEach(function(b){ b.classList.remove('active'); });
    document.querySelectorAll('.plc-subnav').forEach(function(n){ n.style.display='none'; });
    document.getElementById('sec-private').classList.add('active');
    show('private', null);
    return;
  }
  var overlay = document.getElementById('priv-overlay');
  overlay.classList.add('show');
  setTimeout(function(){ document.getElementById('priv-pw').focus(); }, 100);
}

function checkPrivatePassword() {
  var pw = document.getElementById('priv-pw').value;
  if (pw === 'Ledger') {
    _privUnlocked = true;
    document.getElementById('priv-overlay').classList.remove('show');
    document.getElementById('priv-pw').value = '';
    document.getElementById('priv-err').style.display = 'none';
    document.querySelectorAll('.plc-sec').forEach(function(b){ b.classList.remove('active'); });
    document.querySelectorAll('.plc-subnav').forEach(function(n){ n.style.display='none'; });
    document.getElementById('sec-private').classList.add('active');
    show('private', null);
  } else {
    var err = document.getElementById('priv-err');
    err.style.display = 'block';
    err.textContent = 'Incorrect password.';
    document.getElementById('priv-pw').value = '';
    document.getElementById('priv-pw').focus();
  }
}

function closePrivate() {
  document.getElementById('priv-overlay').classList.remove('show');
}















// ========= FOUR FILTERS MODULE =========
var FF_ENTRIES = JSON.parse(localStorage.getItem('ff_entries') || 'null');
if (!FF_ENTRIES) {
  FF_ENTRIES = [{year:1991,company:'Salomon Inc.',pos:0.7,nw:5.3,note:'Salomon was a giant firm on Wall Street and its short-term borrowings were exceeded by only one public company in the United States.',page:16}];
  localStorage.setItem('ff_entries', JSON.stringify(FF_ENTRIES));
}

function ffSave() { localStorage.setItem('ff_entries', JSON.stringify(FF_ENTRIES)); }

var FF_OPEN = [true, false, false, false];

function ffToggle(n) {
  var body = document.getElementById('ff-body-' + n);
  var ch = document.getElementById('ff-ch' + n);
  var isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  ch.classList.toggle('open', !isOpen);
  FF_OPEN[n-1] = !isOpen;
}

function ffLoadCoke() {
  document.getElementById('ff-company').value = 'Coca-Cola';
  document.getElementById('ff-year').value = '1988';
  document.getElementById('ff-roic').value = '31.2';
  document.getElementById('ff-netincome').value = '1045';
  document.getElementById('ff-da').value = '168';
  document.getElementById('ff-capex').value = '72';
  document.getElementById('ff-debt').value = '1820';
  document.getElementById('ff-equity').value = '3345';
  document.getElementById('ff-price').value = '5.22';
  document.getElementById('ff-shares').value = '671';
  document.getElementById('ff-growth').value = '12';
  ffUpdate();
}

function ffSetVerdict(n, status, label) {
  var el = document.getElementById('ff-v' + n);
  el.textContent = label;
  el.className = 'ff-verdict ff-verdict-' + status;
}

function ffUpdate() {
  var roic = parseFloat(document.getElementById('ff-roic').value) || null;
  var ni = parseFloat(document.getElementById('ff-netincome').value) || null;
  var da = parseFloat(document.getElementById('ff-da').value) || null;
  var capex = parseFloat(document.getElementById('ff-capex').value) || null;
  var debt = parseFloat(document.getElementById('ff-debt').value) || null;
  var equity = parseFloat(document.getElementById('ff-equity').value) || null;
  var price = parseFloat(document.getElementById('ff-price').value) || null;
  var shares = parseFloat(document.getElementById('ff-shares').value) || null;
  var growth = parseFloat(document.getElementById('ff-growth').value) || null;

  var results = {pass:0, fail:0, caution:0, pending:0};

  // FILTER 1: ROIC
  if (roic !== null) {
    var r1status, r1label, r1note;
    if (roic >= 20) { r1status='pass'; r1label='Pass'; r1note='Exceptional. ' + roic.toFixed(1) + '% ROIC places this in the top decile of public companies. At this rate, $1 reinvested becomes $' + Math.pow(1+roic/100,10).toFixed(2) + ' in 10 years. Munger\'s preferred range.'; results.pass++; }
    else if (roic >= 15) { r1status='pass'; r1label='Pass'; r1note='Solid. ' + roic.toFixed(1) + '% meets Munger\'s minimum threshold. Good business, verify moat durability over a full cycle.'; results.pass++; }
    else if (roic >= 10) { r1status='caution'; r1label='Caution'; r1note=roic.toFixed(1) + '% ROIC is below Munger\'s 15% minimum. The business is generating some return above its cost of capital but not compounding at a rate worth holding for decades. Pass unless price is extraordinary.'; results.caution++; }
    else { r1status='fail'; r1label='Fail'; r1note=roic.toFixed(1) + '% ROIC means the business is likely destroying economic value. Even at a low purchase price, compounding at this rate produces mediocre outcomes over 10+ years. Munger would not proceed.'; results.fail++; }
    document.getElementById('ff-calc-1').innerHTML = '<div class="ff-result-grid">'
      + '<div class="ff-result-item"><div class="ff-result-label">ROIC</div><div class="ff-result-val ' + r1status + '">' + roic.toFixed(1) + '%</div><div class="ff-result-note">Munger threshold: 15% min / 20%+ preferred</div></div>'
      + '<div class="ff-result-item"><div class="ff-result-label">$1 reinvested &rarr; 10yr</div><div class="ff-result-val">' + (roic > 0 ? '$' + Math.pow(1+roic/100,10).toFixed(2) : '\u2014') + '</div><div class="ff-result-note">The compounding engine at this rate</div></div>'
      + '<div class="ff-result-item"><div class="ff-result-label">vs 8% alternative</div><div class="ff-result-val">' + (roic > 0 ? '$' + (Math.pow(1+roic/100,10) - Math.pow(1.08,10)).toFixed(2) + ' advantage' : '\u2014') + '</div><div class="ff-result-note">Per dollar vs S&P baseline return</div></div>'
      + '</div><div style="margin-top:12px;padding:12px 16px;border-left:3px solid var(--' + (r1status==='pass'?'green':r1status==='caution'?'gold':'red') + ');background:var(--bg3);font-size:12px;color:var(--ink2);line-height:1.6">' + r1note + '</div>';
    ffSetVerdict(1, r1status, r1label);
  } else { ffSetVerdict(1,'pending','\u2014'); results.pending++; }

  // FILTER 2: OWNER'S EARNINGS
  if (ni !== null && da !== null && capex !== null) {
    var oe = ni + da - capex;
    var oeRatio = oe / ni;
    var r2status, r2label, r2note;
    if (oeRatio >= 1.0) { r2status='pass'; r2label='Pass'; r2note='Owner\'s Earnings exceed Net Income. D&A overstates real maintenance requirements, meaning accounting understates the cash generation. This is the signature of a truly capital-light business. Munger\'s ideal.'; results.pass++; }
    else if (oeRatio >= 0.75) { r2status='pass'; r2label='Pass'; r2note='Owner\'s Earnings are ' + (oeRatio*100).toFixed(0) + '% of Net Income. Healthy. The business consumes modest capital to maintain position. Proceed.'; results.pass++; }
    else if (oeRatio >= 0.60) { r2status='caution'; r2label='Caution'; r2note='Owner\'s Earnings are ' + (oeRatio*100).toFixed(0) + '% of Net Income. The business is consuming meaningful capital just to hold position. Understand whether CapEx is truly maintenance or contains growth investment.'; results.caution++; }
    else { r2status='fail'; r2label='Fail'; r2note='Owner\'s Earnings are only ' + (oeRatio*100).toFixed(0) + '% of Net Income. This business is a capital consumption machine. Reported profits are an accounting fiction. Munger would call this "bullshit earnings" territory.'; results.fail++; }
    document.getElementById('ff-calc-2').innerHTML = '<div class="ff-result-grid">'
      + '<div class="ff-result-item"><div class="ff-result-label">Net Income</div><div class="ff-result-val">$' + ni.toFixed(0) + 'M</div></div>'
      + '<div class="ff-result-item"><div class="ff-result-label">+ D&amp;A</div><div class="ff-result-val">+$' + da.toFixed(0) + 'M</div></div>'
      + '<div class="ff-result-item"><div class="ff-result-label">- Maint. CapEx</div><div class="ff-result-val ' + (capex/ni > 0.5 ? 'fail':'') + '">\u2212$' + capex.toFixed(0) + 'M</div></div>'
      + '<div class="ff-result-item"><div class="ff-result-label">Owner\'s Earnings</div><div class="ff-result-val ' + r2status + '">$' + oe.toFixed(0) + 'M</div><div class="ff-result-note">' + (oeRatio*100).toFixed(0) + '% of Net Income</div></div>'
      + '</div><div style="margin-top:12px;padding:12px 16px;border-left:3px solid var(--' + (r2status==='pass'?'green':r2status==='caution'?'gold':'red') + ');background:var(--bg3);font-size:12px;color:var(--ink2);line-height:1.6">' + r2note + '</div>';
    ffSetVerdict(2, r2status, r2label);
    // Store OE for filter 3
    window._ff_oe = oe;
  } else { ffSetVerdict(2,'pending','\u2014'); window._ff_oe = null; results.pending++; }

  // FILTER 3: MARGIN OF SAFETY
  var oe3 = window._ff_oe;
  if (oe3 && price && shares && growth !== null) {
    var discountRate = 0.10; // Munger used ~10% as hurdle
    var growthR = growth / 100;
    var iv = oe3 / ((discountRate - growthR) * 1000); // IV per share in $B / shares-in-M = $ per share
    // Simpler: IV per share = (OE per share) / (discount - growth)
    var oePerShare = oe3 / shares; // $ per share
    var ivPerShare = growthR < discountRate ? oePerShare / (discountRate - growthR) : null;
    var r3status, r3label, r3note;
    if (ivPerShare) {
      var mos = ((ivPerShare - price) / ivPerShare) * 100;
      if (mos >= 30) { r3status='pass'; r3label='Pass'; r3note='Margin of safety: ' + mos.toFixed(1) + '%. The market is pricing this at a significant discount to intrinsic value. Graham\'s 30% threshold is met. Munger\'s buffer is in place.'; results.pass++; }
      else if (mos >= 15) { r3status='caution'; r3label='Caution'; r3note='Margin of safety: ' + mos.toFixed(1) + '%. Thin but not zero. Munger accepted narrower margins on extraordinary businesses with durable moats. Requires high confidence in the moat assessment.'; results.caution++; }
      else if (mos >= 0) { r3status='caution'; r3label='Thin'; r3note='Margin of safety: ' + mos.toFixed(1) + '%. Essentially no safety buffer. The market is already pricing in a significant portion of the intrinsic value. Any adverse development eliminates the return.'; results.caution++; }
      else { r3status='fail'; r3label='Fail'; r3note='Price exceeds estimated intrinsic value by ' + Math.abs(mos).toFixed(1) + '%. You are paying a premium to fair value. No margin of safety. Munger would wait.'; results.fail++; }
      document.getElementById('ff-calc-3-result').innerHTML = '<div class="ff-result-grid">'
        + '<div class="ff-result-item"><div class="ff-result-label">OE / Share</div><div class="ff-result-val">$' + oePerShare.toFixed(2) + '</div></div>'
        + '<div class="ff-result-item"><div class="ff-result-label">Intrinsic Value / Share</div><div class="ff-result-val">$' + ivPerShare.toFixed(2) + '</div><div class="ff-result-note">At ' + growth + '% growth, 10% hurdle rate</div></div>'
        + '<div class="ff-result-item"><div class="ff-result-label">Market Price</div><div class="ff-result-val">$' + price.toFixed(2) + '</div></div>'
        + '<div class="ff-result-item"><div class="ff-result-label">Margin of Safety</div><div class="ff-result-val ' + r3status + '">' + mos.toFixed(1) + '%</div><div class="ff-result-note">Graham minimum: 30%</div></div>'
        + '</div><div style="margin-top:12px;padding:12px 16px;border-left:3px solid var(--' + (r3status==='pass'?'green':r3status==='caution'?'gold':'red') + ');background:var(--bg3);font-size:12px;color:var(--ink2);line-height:1.6">' + r3note + '</div>';
    } else {
      document.getElementById('ff-calc-3-result').innerHTML = '<div style="color:var(--red);font-size:12px">Growth rate must be below discount rate (10%). Lower the growth assumption.</div>';
      r3status='fail'; r3label='Error'; results.fail++;
    }
    ffSetVerdict(3, r3status, r3label);
  } else { ffSetVerdict(3,'pending','\u2014'); results.pending++; }

  // FILTER 4: DEBT
  if (debt !== null && equity !== null && equity > 0) {
    var de = debt / equity;
    var r4status, r4label, r4note;
    if (de < 0.5) { r4status='pass'; r4label='Pass'; r4note='D/E: ' + de.toFixed(2) + '. The business funds itself from earnings. Recessions are survivable. Munger passes immediately.'; results.pass++; }
    else if (de < 1.0) { r4status='caution'; r4label='Caution'; r4note='D/E: ' + de.toFixed(2) + '. Elevated leverage. Understand debt maturity schedule and covenant structure. This business can survive a moderate downturn, but not a severe one without consequences.'; results.caution++; }
    else { r4status='fail'; r4label='Fail'; r4note='D/E: ' + de.toFixed(2) + '. Above 1.0. Munger stops here. This leverage level introduces the mathematical possibility of a zero. No business quality compensates for a zero. Pass.'; results.fail++; }
    document.getElementById('ff-calc-4').innerHTML = '<div class="ff-result-grid">'
      + '<div class="ff-result-item"><div class="ff-result-label">Total Debt</div><div class="ff-result-val">$' + debt.toFixed(0) + 'M</div></div>'
      + '<div class="ff-result-item"><div class="ff-result-label">Total Equity</div><div class="ff-result-val">$' + equity.toFixed(0) + 'M</div></div>'
      + '<div class="ff-result-item"><div class="ff-result-label">Debt-to-Equity</div><div class="ff-result-val ' + r4status + '">' + de.toFixed(2) + 'x</div><div class="ff-result-note">Munger limit: &lt;0.5 pass / &gt;1.0 fail</div></div>'
      + '</div><div style="margin-top:12px;padding:12px 16px;border-left:3px solid var(--' + (r4status==='pass'?'green':r4status==='caution'?'gold':'red') + ');background:var(--bg3);font-size:12px;color:var(--ink2);line-height:1.6">' + r4note + '</div>';
    ffSetVerdict(4, r4status, r4label);
  } else { ffSetVerdict(4,'pending','\u2014'); results.pending++; }

  // OVERALL VERDICT
  var overall = document.getElementById('ff-overall');
  var company = document.getElementById('ff-company').value.trim() || 'This company';
  if (results.pending < 4) {
    overall.style.display = 'block';
    var oText, oSub, oBorder;
    if (results.fail > 0) {
      oText = company + ' fails the Munger screen.';
      oSub = results.fail + ' of 4 filters failed. Munger\'s system is binary on the hard filters. A single fail on Debt (Filter 4) is an immediate stop. Review the specific failure before considering any position. The filter exists to protect you from your own optimism.';
      oBorder = 'var(--red)';
    } else if (results.caution > 0) {
      oText = company + ' passes with conditions.';
      oSub = results.pass + ' filters passed, ' + results.caution + ' require additional scrutiny. Munger would want to understand the caution points deeply before proceeding. Caution is not a pass \u2014 it is an invitation to do more work.';
      oBorder = 'var(--gold)';
    } else if (results.pass === 4) {
      oText = company + ' passes all four filters.';
      oSub = 'All 4 filters passed. This is the kind of business Munger described as a "wonderful company." The remaining question is price. If Filter 3 passed with a margin of safety \u226530%, Munger would proceed. If it passed narrowly, he would wait for a better entry.';
      oBorder = 'var(--green)';
    } else {
      oText = 'Partial data \u2014 continue entering values.';
      oSub = results.pass + ' filters evaluated so far.';
      oBorder = 'var(--border)';
    }
    overall.style.borderColor = oBorder;
    document.getElementById('ff-overall-text').textContent = oText;
    document.getElementById('ff-overall-sub').textContent = oSub;
  } else {
    overall.style.display = 'none';
  }
}

function ffShowAddEntry() {
  var f = document.getElementById('ff-add-form');
  f.style.display = f.style.display === 'none' ? 'block' : 'none';
}

function ffAddEntry() {
  var year = parseInt(document.getElementById('be-year').value);
  var company = document.getElementById('be-company').value.trim();
  if (!year || !company) { alert('Year and company required.'); return; }
  FF_ENTRIES.push({
    year: year,
    company: company,
    pos: parseFloat(document.getElementById('be-pos').value) || null,
    nw: parseFloat(document.getElementById('be-nw').value) || null,
    note: document.getElementById('be-note').value.trim() || null,
    page: parseInt(document.getElementById('be-page').value) || null
  });
  ffSave();
  ffRenderEntries();
  ['be-year','be-company','be-pos','be-nw','be-note','be-page'].forEach(function(id){ document.getElementById(id).value=''; });
  var c = document.getElementById('be-confirm');
  c.style.display='inline';
  setTimeout(function(){ c.style.display='none'; },2000);
}

function ffDeleteEntry(idx) {
  FF_ENTRIES.splice(idx,1);
  ffSave();
  ffRenderEntries();
}

function ffRenderEntries() {
  var sorted = FF_ENTRIES.slice().sort(function(a,b){ return a.year-b.year; });
  var tbody = document.getElementById('ff-entries-body');
  if (!tbody) return;
  tbody.innerHTML = sorted.length ? sorted.map(function(e,i){
    var conc = (e.pos && e.nw) ? ((e.pos/e.nw)*100).toFixed(1)+'%' : '\u2014';
    var cc = (e.pos && e.nw && e.pos/e.nw > 0.1) ? 'color:var(--red);font-weight:700' : '';
    return '<tr style="border-bottom:1px solid var(--border)">'
      + '<td style="padding:9px 10px;font-family:var(--mono);font-size:12px;font-weight:700">' + e.year + '</td>'
      + '<td style="padding:9px 10px;font-size:13px;font-weight:500">' + e.company + '</td>'
      + '<td style="padding:9px 10px;font-family:var(--mono);font-size:12px;text-align:right">' + (e.pos ? '$' + (e.pos>=1?e.pos.toFixed(1)+'B':(e.pos*1000).toFixed(0)+'M') : '\u2014') + '</td>'
      + '<td style="padding:9px 10px;font-family:var(--mono);font-size:12px;text-align:right;' + cc + '">' + conc + '</td>'
      + '<td style="padding:9px 10px;font-size:11px;color:var(--ink3);max-width:360px">' + (e.page ? '<span style="font-family:var(--mono);font-size:9px;background:var(--bg3);padding:1px 6px;margin-right:6px">p.'+e.page+'</span>' : '') + (e.note || '') + '</td>'
      + '<td style="padding:9px 10px"><button onclick="ffDeleteEntry(' + i + ')" style="font-family:var(--mono);font-size:8px;color:var(--ink4);background:none;border:none;cursor:pointer">\u2715</button></td>'
      + '</tr>';
  }).join('') : '<tr><td colspan="6" style="padding:32px;text-align:center;font-family:var(--mono);font-size:10px;color:var(--ink4)">No entries yet. Add holdings from the book above.</td></tr>';
}

// Auto-init entries when Berkshire tab opens
var _ffInit = false;
var _origShow2 = window.show;
window.show = function(name, btn) {
  _origShow2(name, btn);
  if (name === 'berkshire' && !_ffInit) { _ffInit = true; ffRenderEntries(); }
};



// ═══════════════════════════════════════════
// RATES MODULE — official sources, client-side fetch
// ═══════════════════════════════════════════
var RATES_HISTORY = {
  fedfunds: [
    {y:2015,v:0.13},{y:2016,v:0.40},{y:2017,v:1.00},{y:2018,v:1.83},
    {y:2019,v:2.16},{y:2020,v:0.36},{y:2021,v:0.08},{y:2022,v:1.68},
    {y:2023,v:5.02},{y:2024,v:5.33},{y:2025,v:4.58}
  ],
  mortgage30: [
    {y:2015,v:3.85},{y:2016,v:3.65},{y:2017,v:3.99},{y:2018,v:4.54},
    {y:2019,v:3.94},{y:2020,v:3.11},{y:2021,v:2.96},{y:2022,v:5.34},
    {y:2023,v:6.81},{y:2024,v:6.72},{y:2025,v:6.65}
  ],
  savings: [
    {y:2015,v:0.06},{y:2016,v:0.06},{y:2017,v:0.06},{y:2018,v:0.08},
    {y:2019,v:0.10},{y:2020,v:0.06},{y:2021,v:0.06},{y:2022,v:0.33},
    {y:2023,v:0.58},{y:2024,v:0.61},{y:2025,v:0.59}
  ],
  treasury10: [
    {y:2015,v:2.14},{y:2016,v:1.84},{y:2017,v:2.33},{y:2018,v:2.91},
    {y:2019,v:2.14},{y:2020,v:0.89},{y:2021,v:1.45},{y:2022,v:3.96},
    {y:2023,v:3.96},{y:2024,v:4.20},{y:2025,v:4.28}
  ]
};

var RATES_DATA = [
  {id:'fedfunds', label:'Fed Funds Rate', value:'5.25–5.50%', source:'Federal Reserve', note:'Target range set by FOMC. Primary benchmark for all consumer rates.', dir:'flat', color:'var(--blue)'},
  {id:'mortgage30', label:'30-yr Fixed Mortgage', value:'6.72%', source:'Freddie Mac PMMS', note:'National weekly average. At this rate, $400k home = $2,588/mo principal + interest.', dir:'down', color:'var(--red)'},
  {id:'mortgage15', label:'15-yr Fixed Mortgage', value:'5.99%', source:'Freddie Mac PMMS', note:'Lower rate, higher monthly payment. Total interest paid is ~40% less than 30-yr.', dir:'down', color:'var(--red)'},
  {id:'savings', label:'National Avg Savings', value:'0.59%', source:'FDIC Weekly', note:'National average. High-yield savings accounts available at 4.5%+. The gap is real money.', dir:'flat', color:'var(--gold)'},
  {id:'treasury10', label:'10-yr Treasury', value:'4.28%', source:'U.S. Treasury', note:'Risk-free benchmark. When above Fed Funds rate, curve is normal. Inverted = recession signal.', dir:'up', color:'var(--ink)'},
  {id:'prime', label:'Prime Rate', value:'8.50%', source:'Federal Reserve H.15', note:'Fed Funds + 3%. Basis for credit cards, HELOCs, and many business loans.', dir:'flat', color:'var(--ink3)'}
];

function renderRates() {
  var grid = document.getElementById('rates-grid');
  if (!grid) return;
  grid.innerHTML = RATES_DATA.map(function(r) {
    var arrow = r.dir === 'up' ? '\u2191' : r.dir === 'down' ? '\u2193' : '\u2192';
    var arrowColor = r.dir === 'up' ? 'var(--red)' : r.dir === 'down' ? 'var(--green)' : 'var(--ink4)';
    return '<div onclick="showRateChart(\'' + r.id + '\')" style="padding:18px 20px;background:var(--bg);cursor:pointer;transition:background 0.12s" onmouseover="this.style.background=\'var(--bg2)\'" onmouseout="this.style.background=\'var(--bg)\'">'
      + '<div style="font-family:var(--mono);font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink4);margin-bottom:6px">' + r.source + '</div>'
      + '<div style="font-size:12px;color:var(--ink2);margin-bottom:8px">' + r.label + '</div>'
      + '<div style="display:flex;align-items:baseline;gap:8px">'
      + '<div style="font-family:var(--mono);font-size:26px;font-weight:700;color:var(--ink)">' + r.value + '</div>'
      + '<div style="font-size:18px;color:' + arrowColor + '">' + arrow + '</div>'
      + '</div>'
      + '<div style="font-size:11px;color:var(--ink4);margin-top:6px;line-height:1.5">' + r.note + '</div>'
      + '</div>';
  }).join('');
}

function showRateChart(id) {
  var hist = RATES_HISTORY[id];
  var rateObj = RATES_DATA.filter(function(r){ return r.id === id; })[0];
  if (!hist || !rateObj) return;
  document.getElementById('rates-chart-title').textContent = rateObj.label + ' (2015\u20132025, annual avg)';
  var chart = document.getElementById('rates-chart');
  var labels = document.getElementById('rates-chart-labels');
  var maxV = Math.max.apply(null, hist.map(function(h){ return h.v; }));
  var minV = Math.min.apply(null, hist.map(function(h){ return h.v; }));
  var range = maxV - minV || 1;
  var H = 170;
  var barW = Math.floor((chart.offsetWidth - 40) / hist.length) - 3;
  var barsHtml = hist.map(function(h, i) {
    var hPct = ((h.v - minV) / range);
    var barH = Math.max(4, Math.round(hPct * (H - 20)) + 20);
    var left = 40 + i * (barW + 3);
    return '<div style="position:absolute;bottom:0;left:' + left + 'px;width:' + barW + 'px;height:' + barH + 'px;background:' + (rateObj.color || 'var(--red)') + ';opacity:0.82;cursor:default" title="' + h.y + ': ' + h.v + '%"></div>'
      + '<div style="position:absolute;bottom:' + (barH + 2) + 'px;left:' + left + 'px;width:' + barW + 'px;text-align:center;font-family:var(--mono);font-size:8px;color:var(--ink3)">' + h.v + '</div>';
  }).join('');
  var yHtml = '<div style="position:absolute;left:0;top:0;height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:2px 0">'
    + '<span style="font-family:var(--mono);font-size:8px;color:var(--ink4)">' + maxV.toFixed(2) + '%</span>'
    + '<span style="font-family:var(--mono);font-size:8px;color:var(--ink4)">' + minV.toFixed(2) + '%</span>'
    + '</div>';
  chart.innerHTML = yHtml + barsHtml;
  labels.innerHTML = hist.map(function(h){ return '<span style="font-family:var(--mono);font-size:9px">' + h.y + '</span>'; }).join('');
}

// ═══════════════════════════════════════════
// WRITING ASSISTANT
// ═══════════════════════════════════════════
var GEMINI_KEY = 'AIzaSyD6uS8gG5CZXdZ05e4c7YXZOJ4rCsmVMHg';

function wrAnalyze() {
  var text = document.getElementById('wr-input').value.trim();
  if (!text) return;
  var tone = document.getElementById('wr-tone').value;
  var focus = document.getElementById('wr-focus').value;
  var btn = document.getElementById('wr-btn');
  var out = document.getElementById('wr-output');
  btn.textContent = 'Analyzing...';
  btn.disabled = true;
  out.textContent = 'Processing...';

  var toneMap = {professional:'professional and polished', concise:'concise and direct (cut every unnecessary word)', warm:'warm and approachable while remaining professional', firm:'firm and authoritative', executive:'executive-level, high-impact'};
  var focusMap = {full:'Rewrite the email to be ' + toneMap[tone] + '.', grammar:'Correct grammar and punctuation only. Keep the original voice.', clarity:'Improve clarity and structure. Use clear paragraphs. Keep the original tone.', shorter:'Make this significantly shorter. Keep all key points. Remove all filler.', subject:'Write 3 strong subject line options for this email.'};

  var prompt = focusMap[focus] + ' Here is the text:\n\n' + text + '\n\nProvide only the refined text with no preamble or explanation.';

  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_KEY;
  var body = JSON.stringify({contents:[{parts:[{text:prompt}]}]});

  fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body:body})
    .then(function(r){ return r.json(); })
    .then(function(d) {
      var result = d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts && d.candidates[0].content.parts[0] && d.candidates[0].content.parts[0].text;
      if (result) {
        out.textContent = result;
        wrLocalAnalysis(text);
      } else {
        out.textContent = wrLocalRewrite(text, focus);
        wrLocalAnalysis(text);
      }
    })
    .catch(function() {
      out.textContent = wrLocalRewrite(text, focus);
      wrLocalAnalysis(text);
    })
    .finally(function() {
      btn.textContent = 'Refine Writing';
      btn.disabled = false;
    });
}

function wrLocalRewrite(text, focus) {
  if (focus === 'shorter') {
    var sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences.slice(0, Math.ceil(sentences.length * 0.6)).join(' ').trim();
  }
  return text;
}

function wrLocalAnalysis(text) {
  var issues = [];
  var words = text.split(/\s+/).length;
  var sentences = (text.match(/[.!?]+/g) || []).length || 1;
  var avgWords = Math.round(words / sentences);
  if (avgWords > 30) issues.push({type:'warn', msg:'Average sentence length: ' + avgWords + ' words. Aim for under 20 for clarity.'});
  var fillers = ['just','very','really','quite','basically','actually','literally','honestly'];
  var found = fillers.filter(function(w){ return new RegExp('\\b'+w+'\\b','i').test(text); });
  if (found.length) issues.push({type:'warn', msg:'Filler words detected: ' + found.join(', ') + '. Consider removing.'});
  if (!/^(Hi|Hello|Dear|Good|To|I |We |Thank|Following|Please)/i.test(text.trim())) issues.push({type:'info', msg:'Email does not start with a standard greeting.'});
  var passiveMatches = (text.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || []).length;
  if (passiveMatches > 2) issues.push({type:'warn', msg:passiveMatches + ' passive voice constructions found. Active voice is more direct.'});
  issues.push({type:'info', msg:words + ' words \u2022 ' + sentences + ' sentences \u2022 ' + avgWords + ' words/sentence avg'});

  var el = document.getElementById('wr-issues');
  el.innerHTML = issues.map(function(iss){
    var col = iss.type === 'warn' ? 'var(--gold)' : 'var(--ink4)';
    return '<div style="font-size:11px;color:' + col + ';padding:4px 0;border-bottom:1px solid var(--border);font-family:var(--mono)">' + iss.msg + '</div>';
  }).join('');
}

function wrCopy() {
  var text = document.getElementById('wr-output').textContent;
  if (navigator.clipboard) navigator.clipboard.writeText(text);
  else { var t = document.createElement('textarea'); t.value=text; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); }
}

function wrClear() {
  document.getElementById('wr-input').value = '';
  document.getElementById('wr-output').textContent = 'Your refined text will appear here.';
  document.getElementById('wr-issues').innerHTML = '';
}

// ═══════════════════════════════════════════
// PRIVATE FINANCE MODULE
// ═══════════════════════════════════════════
var PRIV = JSON.parse(sessionStorage.getItem('priv_data') || 'null') || {income:[], expenses:[], debts:[]};

function privSave() { sessionStorage.setItem('priv_data', JSON.stringify(PRIV)); }

function privFmt(n) { return '$' + Number(n).toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:0}); }

function privRender() {
  var totalIncome = PRIV.income.reduce(function(s,i){ return s + Number(i.amt); }, 0);
  var totalExpenses = PRIV.expenses.reduce(function(s,e){ return s + Number(e.amt); }, 0);
  var totalDebt = PRIV.debts.reduce(function(s,d){ return s + Number(d.bal); }, 0);
  var totalMinPmt = PRIV.debts.reduce(function(s,d){ return s + Number(d.pmt); }, 0);
  var surplus = totalIncome - totalExpenses - totalMinPmt;

  // Snapshot strip
  var snap = document.getElementById('priv-snapshot');
  if (snap) {
    snap.innerHTML = [
      {l:'Monthly Income', v:privFmt(totalIncome), c:'var(--green)'},
      {l:'Monthly Expenses', v:privFmt(totalExpenses), c:'var(--red)'},
      {l:'Total Debt', v:privFmt(totalDebt), c:'var(--gold)'},
      {l:'Monthly Surplus', v:privFmt(surplus), c: surplus >= 0 ? 'var(--green)' : 'var(--red)'}
    ].map(function(s){
      return '<div style="padding:14px 18px;border-right:1px solid var(--border)">'
        + '<div style="font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--ink4);margin-bottom:4px">' + s.l + '</div>'
        + '<div style="font-family:var(--mono);font-size:22px;font-weight:700;color:' + s.c + '">' + s.v + '</div>'
        + '</div>';
    }).join('');
  }

  // Income list
  var il = document.getElementById('priv-income-list');
  if (il) il.innerHTML = PRIV.income.length ? PRIV.income.map(function(i,idx){
    return '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px">'
      + '<span>' + i.label + '</span>'
      + '<span style="font-family:var(--mono);color:var(--green);font-weight:600">' + privFmt(i.amt) + '/mo</span>'
      + '<button onclick="privDelIncome(' + idx + ')" style="background:none;border:none;color:var(--ink4);cursor:pointer;font-size:11px">\u2715</button>'
      + '</div>';
  }).join('') : '<div style="font-size:12px;color:var(--ink4);padding:8px 0">No income added yet.</div>';

  // Expense list
  var el = document.getElementById('priv-expense-list');
  if (el) el.innerHTML = PRIV.expenses.length ? PRIV.expenses.map(function(e,idx){
    return '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px">'
      + '<span>' + e.label + '</span>'
      + '<span style="font-family:var(--mono);color:var(--red);font-weight:600">' + privFmt(e.amt) + '/mo</span>'
      + '<button onclick="privDelExpense(' + idx + ')" style="background:none;border:none;color:var(--ink4);cursor:pointer;font-size:11px">\u2715</button>'
      + '</div>';
  }).join('') : '<div style="font-size:12px;color:var(--ink4);padding:8px 0">No expenses added yet.</div>';

  // Debt list
  var dl = document.getElementById('priv-debt-list');
  if (dl) dl.innerHTML = PRIV.debts.length ? '<table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<tr style="border-bottom:1px solid var(--border)"><th style="text-align:left;padding:5px 8px;font-family:var(--mono);font-size:9px;color:var(--ink4)">Debt</th><th style="text-align:right;padding:5px 8px;font-family:var(--mono);font-size:9px;color:var(--ink4)">Balance</th><th style="text-align:right;padding:5px 8px;font-family:var(--mono);font-size:9px;color:var(--ink4)">APR</th><th style="text-align:right;padding:5px 8px;font-family:var(--mono);font-size:9px;color:var(--ink4)">Min Pmt</th><th></th></tr>'
    + PRIV.debts.map(function(d,idx){
      return '<tr style="border-bottom:1px solid var(--border)">'
        + '<td style="padding:7px 8px">' + d.label + '</td>'
        + '<td style="padding:7px 8px;text-align:right;font-family:var(--mono);color:var(--gold);font-weight:600">' + privFmt(d.bal) + '</td>'
        + '<td style="padding:7px 8px;text-align:right;font-family:var(--mono)">' + d.apr + '%</td>'
        + '<td style="padding:7px 8px;text-align:right;font-family:var(--mono);color:var(--red)">' + privFmt(d.pmt) + '</td>'
        + '<td style="padding:7px 8px"><button onclick="privDelDebt(' + idx + ')" style="background:none;border:none;color:var(--ink4);cursor:pointer">\u2715</button></td>'
        + '</tr>';
    }).join('') + '</table>' : '<div style="font-size:12px;color:var(--ink4);padding:8px 0">No debts added yet.</div>';

  // Freedom Day calculator
  var freedom = document.getElementById('priv-freedom');
  if (freedom) {
    var TARGET = 5821;
    if (totalIncome > 0) {
      var gap = TARGET - totalIncome;
      var debtPayoffMonths = totalDebt > 0 && surplus > 0 ? Math.ceil(totalDebt / surplus) : null;
      var html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px">'
        + '<div><div style="font-family:var(--mono);font-size:9px;color:var(--ink4);margin-bottom:4px;text-transform:uppercase;letter-spacing:1px">Current Income</div><div style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--green)">' + privFmt(totalIncome) + '</div></div>'
        + '<div><div style="font-family:var(--mono);font-size:9px;color:var(--ink4);margin-bottom:4px;text-transform:uppercase;letter-spacing:1px">Freedom Target</div><div style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--ink)">' + privFmt(TARGET) + '</div></div>'
        + '<div><div style="font-family:var(--mono);font-size:9px;color:var(--ink4);margin-bottom:4px;text-transform:uppercase;letter-spacing:1px">' + (gap > 0 ? 'Gap to Freedom' : 'Above Target') + '</div><div style="font-family:var(--mono);font-size:20px;font-weight:700;color:' + (gap > 0 ? 'var(--red)' : 'var(--green)') + '">' + privFmt(Math.abs(gap)) + '</div></div>'
        + '</div>';
      if (surplus > 0) {
        html += '<div style="font-size:13px;color:var(--ink2);line-height:1.8">Monthly surplus after expenses and minimum debt payments: <strong>' + privFmt(surplus) + '</strong>. ';
        if (debtPayoffMonths) html += 'At this rate, all debts paid off in approximately <strong>' + debtPayoffMonths + ' months</strong> (' + Math.ceil(debtPayoffMonths/12) + ' years). After payoff, that ' + privFmt(totalMinPmt) + '/mo in minimum payments becomes available capital.';
        html += '</div>';
      } else if (surplus < 0) {
        html += '<div style="font-size:13px;color:var(--red);line-height:1.8">Monthly expenses and debt payments exceed income by <strong>' + privFmt(Math.abs(surplus)) + '</strong>. Address this gap before projecting payoff timelines.</div>';
      }
      freedom.innerHTML = html;
    } else {
      freedom.innerHTML = '<div style="font-size:13px;color:var(--ink4)">Add income and expenses above to calculate your Freedom Day timeline. Target: ' + privFmt(TARGET) + '/month to replace your Citizens Bank salary.</div>';
    }
  }
}

function privAddIncome() {
  var l = document.getElementById('priv-inc-label').value.trim();
  var a = parseFloat(document.getElementById('priv-inc-amt').value);
  if (!l || !a) return;
  PRIV.income.push({label:l, amt:a});
  privSave(); privRender();
  document.getElementById('priv-inc-label').value = '';
  document.getElementById('priv-inc-amt').value = '';
}

function privDelIncome(idx) { PRIV.income.splice(idx,1); privSave(); privRender(); }

function privAddExpense() {
  var l = document.getElementById('priv-exp-label').value.trim();
  var a = parseFloat(document.getElementById('priv-exp-amt').value);
  if (!l || !a) return;
  PRIV.expenses.push({label:l, amt:a});
  privSave(); privRender();
  document.getElementById('priv-exp-label').value = '';
  document.getElementById('priv-exp-amt').value = '';
}

function privDelExpense(idx) { PRIV.expenses.splice(idx,1); privSave(); privRender(); }

function privAddDebt() {
  var l = document.getElementById('priv-dbt-label').value.trim();
  var b = parseFloat(document.getElementById('priv-dbt-bal').value);
  var a = parseFloat(document.getElementById('priv-dbt-apr').value) || 0;
  var p = parseFloat(document.getElementById('priv-dbt-pmt').value) || 0;
  if (!l || !b) return;
  PRIV.debts.push({label:l, bal:b, apr:a, pmt:p});
  privSave(); privRender();
  ['priv-dbt-label','priv-dbt-bal','priv-dbt-apr','priv-dbt-pmt'].forEach(function(id){ document.getElementById(id).value=''; });
}

function privDelDebt(idx) { PRIV.debts.splice(idx,1); privSave(); privRender(); }

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
function setDate() {
  var el = document.getElementById('nav-date');
  if (!el) return;
  var d = new Date();
  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  el.textContent = days[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

window.onload = function() {
  setDate();
  renderRates();
  showSection('money', document.getElementById('sec-money'));
};

// Override show() to also render section-specific content
var _baseShow = window.show;
window.show = function(name, btn) {
  _baseShow(name, btn);
  if (name === 'rates') renderRates();
  if (name === 'private') privRender();
};

// Override showSection for berkshire init
window.showSection = function(sec, btn) {
  if (sec === 'money') {
    var ratesBtn = document.querySelector('#sub-money .plc-sub');
    show('rates', ratesBtn);
  }
};






// ════════════════════════════════════════════════════
// LETTERS — fetches real Berkshire letters from GitHub
// Source: github.com/ReeceHarding/buffett-letters
// ════════════════════════════════════════════════════

var LETTER_YEARS = [
  '2024','2023','2022','2021','2020','2019','2018','2017','2016','2015',
  '2014','2013','2012','2011','2010','2009','2008','2007','2006','2005',
  '2004','2003','2002','2001','2000','1999','1998','1997','1996','1995',
  '1994','1993','1992','1991','1990','1989','1988','1987','1986','1985',
  '1984','1983','1982','1981','1980','1979','1978','1977'
];

var LETTER_CACHE = {};
var _lettersTag = 'all';
var _lettersSearch = '';
var _activeYear = null;

var RAW_BASE = 'https://raw.githubusercontent.com/ReeceHarding/buffett-letters/main/';

function filterLetters() {
  _lettersSearch = document.getElementById('letters-search').value.toLowerCase();
  renderLetterIndex();
}

function setLettersTag(tag, btn) {
  _lettersTag = tag;
  document.querySelectorAll('.ltag-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  renderLetterIndex();
}

function renderLetterIndex() {
  var container = document.getElementById('letters-list');
  if (!container) return;

  var eras = [
    { label: '2020s — The Final Chapter', years: ['2024','2023','2022','2021','2020'] },
    { label: '2010s — Scale and Succession', years: ['2019','2018','2017','2016','2015','2014','2013','2012','2011','2010'] },
    { label: '2000s — Crisis and Resilience', years: ['2009','2008','2007','2006','2005','2004','2003','2002','2001','2000'] },
    { label: '1990s — The Compounding Years', years: ['1999','1998','1997','1996','1995','1994','1993','1992','1991','1990'] },
    { label: '1980s — Building the Machine', years: ['1989','1988','1987','1986','1985','1984','1983','1982','1981','1980'] },
    { label: '1970s — The Foundation', years: ['1979','1978','1977'] }
  ];

  var ERASummaries = {
    '2020s': 'COVID response, Berkshire at $900B+, Charlie Munger obituary (2023), succession clarity.',
    '2010s': 'Berkshire at full scale. BNSF acquisition. Apple investment. Pre-mortem on derivatives.',
    '2000s': 'Dot-com aftermath. 9/11 insurance losses. Financial crisis. Derivatives as weapons of mass destruction.',
    '1990s': 'Coca-Cola, GEICO, General Re. The moat concept fully articulated. The Owner\'s Manual published.',
    '1980s': 'Capital Cities/ABC. Nebraska Furniture Mart. Float theory developed. The franchise concept emerges.',
    '1970s': 'The foundation. Return on equity as the right metric. Insurance float. Ben Graham\'s legacy.'
  };

  var html = '';

  // If there's a search, show flat list
  if (_lettersSearch) {
    var matches = LETTER_YEARS.filter(function(y) { return y.indexOf(_lettersSearch) >= 0; });
    if (matches.length === 0) {
      html = '<div style="padding:40px;text-align:center;font-family:var(--mono);font-size:10px;color:var(--ink4);letter-spacing:2px">No letters match.</div>';
    } else {
      html = matches.map(function(y) { return renderLetterRow(y); }).join('');
    }
    container.innerHTML = html;
    return;
  }

  // Grouped by era
  eras.forEach(function(era) {
    var decade = era.label.split(' — ')[0].replace(/\d/g,'').trim() || era.label.slice(0,5);
    var eraKey = era.label.split(' — ')[0].slice(0,5) + 's';
    var summary = ERASummaries[eraKey] || '';
    html += '<div style="margin-bottom:2px">';
    html += '<div style="padding:10px 22px;background:var(--bg2);border:1px solid var(--border);border-bottom:0;display:flex;justify-content:space-between;align-items:center">';
    html += '<div>';
    html += '<div style="font-family:var(--mono);font-size:8px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--ink4)">' + era.label + '</div>';
    if (summary) html += '<div style="font-size:11px;color:var(--ink3);margin-top:3px">' + summary + '</div>';
    html += '</div>';
    html += '<div style="font-family:var(--mono);font-size:9px;color:var(--ink4)">' + era.years.length + ' letters</div>';
    html += '</div>';
    era.years.forEach(function(y) { html += renderLetterRow(y); });
    html += '</div>';
  });

  container.innerHTML = html;
}

function renderLetterRow(year) {
  var isLoaded = !!LETTER_CACHE[year];
  var isActive = _activeYear === year;
  return '<div class="letter-card" id="lc-' + year + '">'
    + '<div class="letter-card-header' + (isActive ? ' open' : '') + '" onclick="openLetter(\'' + year + '\')">'
    + '<div style="display:flex;align-items:center;gap:16px">'
    + '<div style="font-family:var(--mono);font-size:22px;font-weight:700;color:var(--ink);min-width:60px">' + year + '</div>'
    + '<div>'
    + '<div style="font-family:var(--serif);font-size:16px;color:var(--ink);font-weight:600">Berkshire Hathaway Shareholder Letter</div>'
    + '<div style="font-family:var(--mono);font-size:8px;color:var(--ink4);letter-spacing:1px;margin-top:2px">Warren E. Buffett &nbsp;&bull;&nbsp; Primary Source</div>'
    + '</div>'
    + '</div>'
    + '<div style="font-family:var(--mono);font-size:9px;color:var(--ink4)">'
    + (isLoaded ? '<span style="color:var(--green)">&#10003; Loaded</span>' : 'Click to load')
    + '</div>'
    + '</div>'
    + '<div class="letter-body' + (isActive ? ' open' : '') + '" id="lb-' + year + '">'
    + '<div id="lt-' + year + '" style="padding:20px 22px 24px">'
    + (isLoaded ? renderLetterContent(year) : '<div style="font-family:var(--mono);font-size:10px;color:var(--ink4);padding:20px 0">Loading from berkshire archive...</div>')
    + '</div>'
    + '</div>'
    + '</div>';
}

function mdToHtml(text) {
  // Escape HTML
  var s = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  // Split into lines for processing
  var lines = s.split('\n');
  var out = [];
  var inPara = false;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var trimmed = line.trim();

    // Skip performance table lines (mostly dots and numbers)
    if (/^[\d\s\.\-\(\)%,]+$/.test(trimmed) && trimmed.length > 10) continue;
    // Skip lines that are mostly dashes/dots (table rows)
    if (/^[.\-\s\d%\(\)]{20,}$/.test(trimmed)) continue;

    // Headings
    if (/^# /.test(trimmed)) {
      if (inPara) { out.push('</p>'); inPara = false; }
      out.push('<h2 class="ltr-h1">' + trimmed.slice(2) + '</h2>');
      continue;
    }
    if (/^## /.test(trimmed)) {
      if (inPara) { out.push('</p>'); inPara = false; }
      out.push('<h3 class="ltr-h2">' + trimmed.slice(3) + '</h3>');
      continue;
    }
    if (/^### /.test(trimmed)) {
      if (inPara) { out.push('</p>'); inPara = false; }
      out.push('<h4 class="ltr-h3">' + trimmed.slice(4) + '</h4>');
      continue;
    }

    // Empty line = paragraph break
    if (trimmed === '') {
      if (inPara) { out.push('</p>'); inPara = false; }
      continue;
    }

    // Regular text line
    var formatted = trimmed
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>');

    if (!inPara) { out.push('<p class="ltr-p">'); inPara = true; }
    else { out.push(' '); }
    out.push(formatted);
  }

  if (inPara) out.push('</p>');
  return out.join('');
}

function renderLetterContent(year) {
  var text = LETTER_CACHE[year];
  if (!text) return '';

  var html = mdToHtml(text);
  var wordCount = text.split(/\s+/).length;

  return '<div style="border-bottom:1px solid var(--border);padding-bottom:12px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center">'
    + '<div style="font-family:var(--mono);font-size:9px;color:var(--ink4)">Source: github.com/ReeceHarding/buffett-letters &nbsp;&bull;&nbsp; '
    + wordCount.toLocaleString() + ' words &nbsp;&bull;&nbsp; <a href="https://www.berkshirehathaway.com/letters/letters.html" target="_blank" style="color:var(--blue)">berkshirehathaway.com</a></div>'
    + '<a href="' + RAW_BASE + year + '.md" target="_blank" style="font-family:var(--mono);font-size:8px;color:var(--blue);letter-spacing:1px">RAW &rarr;</a>'
    + '</div>'
    + '<div style="font-family:var(--serif);font-size:15px;line-height:1.9;color:var(--ink2)">'
    + '<p>' + html + '</p>'
    + '</div>';
}

function openLetter(year) {
  var wasActive = _activeYear === year;

  // Close previous
  if (_activeYear) {
    var prevBody = document.getElementById('lb-' + _activeYear);
    var prevHeader = document.getElementById('lc-' + _activeYear);
    if (prevBody) { prevBody.classList.remove('open'); }
    if (prevHeader) { prevHeader.querySelector('.letter-card-header').classList.remove('open'); }
  }

  if (wasActive) {
    _activeYear = null;
    return;
  }

  _activeYear = year;
  var body = document.getElementById('lb-' + year);
  var header = document.getElementById('lc-' + year);
  if (body) body.classList.add('open');
  if (header) header.querySelector('.letter-card-header').classList.add('open');

  // If already cached, render immediately
  if (LETTER_CACHE[year]) {
    var lt = document.getElementById('lt-' + year);
    if (lt) lt.innerHTML = renderLetterContent(year);
    return;
  }

  // Fetch from GitHub CDN
  var url = RAW_BASE + year + '.md';
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      var lt = document.getElementById('lt-' + year);
      if (xhr.status === 200) {
        LETTER_CACHE[year] = xhr.responseText;
        // Update header badge
        var card = document.getElementById('lc-' + year);
        if (card) {
          var badge = card.querySelector('.letter-card-header div:last-child');
          if (badge) badge.innerHTML = '<span style="color:var(--green)">&#10003; Loaded</span>';
        }
        if (lt) lt.innerHTML = renderLetterContent(year);
      } else {
        if (lt) lt.innerHTML = '<div style="font-family:var(--mono);font-size:10px;color:var(--red);padding:12px 0">Failed to load (' + xhr.status + '). Try refreshing.</div>';
      }
    }
  };
  xhr.send();
}

setTimeout(function() { renderLetterIndex(); }, 150);





// ═══════════════════════════════════════
// FINANCIAL CALCULATORS
// ═══════════════════════════════════════

function showCalc(id, btn) {
  document.querySelectorAll('.calc-panel').forEach(function(p){ p.classList.add('hidden'); });
  document.querySelectorAll('.calc-tab').forEach(function(b){ b.classList.remove('active'); });
  var panel = document.getElementById('cp-' + id);
  if (panel) panel.classList.remove('hidden');
  if (btn) btn.classList.add('active');
}

function fmtC(n) { return '$' + Number(n.toFixed(2)).toLocaleString(); }
function fmtP(n) { return n.toFixed(2) + '%'; }
function fmtX(n) { return n.toFixed(2) + 'x'; }
function color(val, good, mid) { return val >= good ? 'var(--green)' : val >= mid ? 'var(--gold)' : 'var(--red)'; }

function resultRow(label, val, col) {
  return '<div class="cp-result-row"><span class="cp-result-label">' + label + '</span>'
    + '<span class="cp-result-val" style="color:' + (col||'var(--ink)') + '">' + val + '</span></div>';
}

function verdict(txt, col) {
  return '<div class="cp-result-verdict" style="color:' + col + '">' + txt + '</div>';
}

// ── ROIC
function calcROIC() {
  var ebit   = parseFloat(document.getElementById('roic-ebit').value)   || 0;
  var tax    = parseFloat(document.getElementById('roic-tax').value)    || 21;
  var debt   = parseFloat(document.getElementById('roic-debt').value)   || 0;
  var equity = parseFloat(document.getElementById('roic-equity').value) || 1;
  var cash   = parseFloat(document.getElementById('roic-cash').value)   || 0;

  var nopat  = ebit * (1 - tax / 100);
  var ic     = debt + equity - cash;
  var roic   = ic > 0 ? (nopat / ic) * 100 : 0;

  var col = color(roic, 15, 8);
  var vrd = roic >= 15 ? 'PASS — Likely durable competitive advantage'
          : roic >= 8  ? 'MARGINAL — Adequate but verify moat'
          : 'FAIL — Value destruction; cost of capital exceeds return';

  document.getElementById('roic-results').innerHTML =
    resultRow('NOPAT', fmtC(nopat))
    + resultRow('Invested Capital', fmtC(ic))
    + resultRow('ROIC', fmtP(roic), col)
    + resultRow('Equity / IC', fmtP(equity / ic * 100))
    + resultRow('Debt / IC', fmtP(debt / ic * 100))
    + verdict(vrd, col);
}

// ── CAGR
function calcCAGRpro() {
  var start    = parseFloat(document.getElementById('cagr-start').value)    || 1;
  var end      = parseFloat(document.getElementById('cagr-end').value)      || 1;
  var years    = parseFloat(document.getElementById('cagr-years').value)    || 1;
  var projRate = parseFloat(document.getElementById('cagr-proj').value)     || 20;
  var projYrs  = parseInt(document.getElementById('cagr-projyrs').value)    || 10;

  var cagr = (Math.pow(end / start, 1 / years) - 1) * 100;
  var projVal = start * Math.pow(1 + projRate / 100, projYrs);
  var multiple = end / start;

  var rows = '';
  for (var i = 1; i <= Math.min(projYrs, 10); i++) {
    var v = start * Math.pow(1 + projRate / 100, i);
    rows += resultRow('Year ' + i, fmtC(v));
  }

  document.getElementById('cagr-results').innerHTML =
    resultRow('Historical CAGR', fmtP(cagr), color(cagr, 15, 8))
    + resultRow('Total Return Multiple', fmtX(multiple), color(multiple, 3, 1.5))
    + resultRow('Projected Value (' + projYrs + 'yr @ ' + projRate + '%)', fmtC(projVal), 'var(--green)')
    + resultRow('Projected Multiple', fmtX(projVal / start), 'var(--green)')
    + rows;
}

// ── DCF
function calcDCF() {
  var fcf    = parseFloat(document.getElementById('dcf-fcf').value)    || 1;
  var g1     = parseFloat(document.getElementById('dcf-g1').value)     || 15;
  var g2     = parseFloat(document.getElementById('dcf-g2').value)     || 8;
  var tg     = parseFloat(document.getElementById('dcf-tg').value)     || 3;
  var dr     = parseFloat(document.getElementById('dcf-dr').value)     || 10;
  var shares = parseFloat(document.getElementById('dcf-shares').value) || 100;

  var pv = 0;
  var cf = fcf;
  var rows = '';

  for (var i = 1; i <= 10; i++) {
    var rate = i <= 5 ? g1 / 100 : g2 / 100;
    cf = cf * (1 + rate);
    var discounted = cf / Math.pow(1 + dr / 100, i);
    pv += discounted;
    rows += resultRow('Year ' + i + ' FCF', fmtC(cf) + 'M');
  }

  var termVal  = (cf * (1 + tg / 100)) / ((dr - tg) / 100);
  var pvTerminal = termVal / Math.pow(1 + dr / 100, 10);
  var totalPV    = pv + pvTerminal;
  var perShare   = totalPV / shares;

  document.getElementById('dcf-results').innerHTML =
    rows
    + resultRow('PV of Cash Flows', fmtC(pv) + 'M')
    + resultRow('Terminal Value', fmtC(termVal) + 'M')
    + resultRow('PV of Terminal', fmtC(pvTerminal) + 'M')
    + resultRow('Intrinsic Value (Total)', fmtC(totalPV) + 'M', 'var(--green)')
    + resultRow('Intrinsic Value / Share', fmtC(perShare), 'var(--green)');
}

// ── MARGINS
function calcMargins() {
  var rev   = parseFloat(document.getElementById('mg-rev').value)   || 1;
  var cogs  = parseFloat(document.getElementById('mg-cogs').value)  || 0;
  var opex  = parseFloat(document.getElementById('mg-opex').value)  || 0;
  var int_  = parseFloat(document.getElementById('mg-int').value)   || 0;
  var tax   = parseFloat(document.getElementById('mg-tax').value)   || 21;
  var capex = parseFloat(document.getElementById('mg-capex').value) || 0;
  var da    = parseFloat(document.getElementById('mg-da').value)    || 0;

  var gross = rev - cogs;
  var ebitda = gross - opex + da;
  var ebit   = gross - opex;
  var ebt    = ebit - int_;
  var net    = ebt * (1 - tax / 100);
  var fcf    = net + da - capex;

  var gm   = gross  / rev * 100;
  var ebitdaM = ebitda / rev * 100;
  var om   = ebit   / rev * 100;
  var nm   = net    / rev * 100;
  var fcfm = fcf    / rev * 100;

  document.getElementById('margin-results').innerHTML =
    resultRow('Gross Profit', fmtC(gross))
    + resultRow('Gross Margin', fmtP(gm), color(gm, 40, 20))
    + resultRow('EBITDA', fmtC(ebitda))
    + resultRow('EBITDA Margin', fmtP(ebitdaM), color(ebitdaM, 25, 12))
    + resultRow('Operating Income', fmtC(ebit))
    + resultRow('Operating Margin', fmtP(om), color(om, 20, 10))
    + resultRow('Net Income', fmtC(net))
    + resultRow('Net Margin', fmtP(nm), color(nm, 15, 5))
    + resultRow('Free Cash Flow', fmtC(fcf))
    + resultRow('FCF Margin', fmtP(fcfm), color(fcfm, 10, 3));
}

// ── EV / EBITDA
function calcEV() {
  var mktcap = parseFloat(document.getElementById('ev-mktcap').value)  || 0;
  var debt   = parseFloat(document.getElementById('ev-debt').value)    || 0;
  var cash   = parseFloat(document.getElementById('ev-cash').value)    || 0;
  var pref   = parseFloat(document.getElementById('ev-pref').value)    || 0;
  var ebitda = parseFloat(document.getElementById('ev-ebitda').value)  || 1;
  var rev    = parseFloat(document.getElementById('ev-rev').value)     || 1;

  var ev = mktcap + debt + pref - cash;
  var evEbitda = ev / ebitda;
  var evRev = ev / rev;
  var mktEbitda = mktcap / ebitda;

  var col = evEbitda <= 10 ? 'var(--green)' : evEbitda <= 18 ? 'var(--gold)' : 'var(--red)';
  var vrd = evEbitda <= 10 ? 'Potentially undervalued — check earnings quality'
          : evEbitda <= 18 ? 'Fair range — in line with market average'
          : 'Expensive — requires high sustained growth to justify';

  document.getElementById('ev-results').innerHTML =
    resultRow('Enterprise Value', fmtC(ev) + 'M')
    + resultRow('EV / EBITDA', fmtX(evEbitda), col)
    + resultRow('EV / Revenue', fmtX(evRev))
    + resultRow('Mkt Cap / EBITDA', fmtX(mktEbitda))
    + verdict(vrd, col);
}

// ── WACC
function calcWACC() {
  var eq   = parseFloat(document.getElementById('wacc-eq').value)   || 1;
  var debt = parseFloat(document.getElementById('wacc-debt').value) || 0;
  var ke   = parseFloat(document.getElementById('wacc-ke').value)   || 10;
  var kd   = parseFloat(document.getElementById('wacc-kd').value)   || 5;
  var tax  = parseFloat(document.getElementById('wacc-tax').value)  || 21;

  var total  = eq + debt;
  var we     = eq / total;
  var wd     = debt / total;
  var kd_at  = kd * (1 - tax / 100);
  var wacc   = we * ke + wd * kd_at;

  document.getElementById('wacc-results').innerHTML =
    resultRow('Weight of Equity', fmtP(we * 100))
    + resultRow('Weight of Debt', fmtP(wd * 100))
    + resultRow('After-Tax Cost of Debt', fmtP(kd_at))
    + resultRow('WACC', fmtP(wacc), color(0, wacc - 1, wacc))
    + resultRow('Hurdle Rate', fmtP(wacc), 'var(--ink)')
    + verdict('Any investment must return > ' + fmtP(wacc) + ' to create value', 'var(--ink4)');
}

// ── MOAT SCORE
function calcMoat() {
  var pricing    = parseInt(document.getElementById('moat-pricing').value)    || 0;
  var switching  = parseInt(document.getElementById('moat-switch').value)     || 0;
  var network    = parseInt(document.getElementById('moat-network').value)    || 0;
  var cost       = parseInt(document.getElementById('moat-cost').value)       || 0;
  var intangible = parseInt(document.getElementById('moat-intangible').value) || 0;
  var durability = parseInt(document.getElementById('moat-durability').value) || 0;

  var total = pricing + switching + network + cost + intangible + durability;
  var pct   = Math.round(total / 60 * 100);
  var col   = color(pct, 70, 50);
  var vrd   = pct >= 70 ? 'Strong moat — pass Munger filter'
            : pct >= 50 ? 'Moderate moat — investigate further'
            : 'Weak moat — FAIL; avoid or short';

  document.getElementById('moat-results').innerHTML =
    resultRow('Pricing Power', pricing + '/10')
    + resultRow('Switching Costs', switching + '/10')
    + resultRow('Network Effects', network + '/10')
    + resultRow('Cost Advantage', cost + '/10')
    + resultRow('Intangible Assets', intangible + '/10')
    + resultRow('Durability', durability + '/10')
    + '<div class="cp-result-row"><span class="cp-result-label">Total Score</span>'
    + '<span class="cp-result-val" style="color:' + col + '">' + total + '/60 (' + pct + '%)</span></div>'
    + '<div style="padding:8px 16px"><div class="cp-score-bar"><div class="cp-score-fill" style="width:' + pct + '%;background:' + col + '"></div></div></div>'
    + verdict(vrd, col);
}

// Auto-run on load
setTimeout(function() {
  calcROIC(); calcCAGRpro(); calcDCF(); calcMargins(); calcEV(); calcWACC(); calcMoat();
}, 250);


// ═══════════════════════════════════════
// WRITING ASSISTANT — Gemini-powered
// ═══════════════════════════════════════
var _writeMode = 'fix';
var GEMINI_KEY = 'AIzaSyD6uS8gG5CZXdZ05e4c7YXZOJ4rCsmVMHg';

var WRITE_MODES = {
  fix: {
    label: 'Fix Grammar',
    desc:  'Fix grammar, spelling, and punctuation. Keep the writer\'s voice.',
    prompt: 'Fix all grammar, spelling, and punctuation errors in the text below. Keep the original tone and voice exactly. Return only the corrected text with no explanation or commentary.\n\n'
  },
  sharpen: {
    label: 'Sharpen',
    desc:  'Cut the fat. Make every sentence earn its place.',
    prompt: 'Rewrite the text below to be sharper, cleaner, and more direct. Cut unnecessary words. Keep all key information. No filler phrases. Return only the rewritten text.\n\n'
  },
  email: {
    label: 'Email',
    desc:  'Rewrite as a clear, professional email.',
    prompt: 'Rewrite the text below as a clear, professional business email. Keep it concise and direct. Use a confident but respectful tone. Return only the email body text (no subject line).\n\n'
  },
  linkedin: {
    label: 'LinkedIn',
    desc:  'Rewrite as a high-performing LinkedIn post.',
    prompt: 'Rewrite the text below as a LinkedIn post optimized for engagement. Use a strong opening hook, clear value delivery, and a call to action. Professional but personal tone. Under 300 words. Return only the post text.\n\n'
  },
  caption: {
    label: 'Caption',
    desc:  'Short, punchy social media caption with hook.',
    prompt: 'Rewrite the text below as a short, punchy social media caption (Instagram/TikTok style). Strong hook first. Emotional or surprising angle. Under 150 characters if possible. Return only the caption.\n\n'
  },
  buffett: {
    label: 'Buffett Style',
    desc:  'Rewrite in Warren Buffett\'s plain-spoken, shareholder-letter style.',
    prompt: 'Rewrite the text below in Warren Buffett\'s writing style: plain-spoken, direct, self-deprecating where appropriate, concrete examples over abstractions, no jargon, conversational but intelligent. As if writing to a smart friend who is not a finance professional. Return only the rewritten text.\n\n'
  }
};

function setWriteMode(mode, btn) {
  _writeMode = mode;
  document.querySelectorAll('.wr-mode').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  var desc = document.getElementById('wr-mode-desc');
  if (desc && WRITE_MODES[mode]) desc.textContent = WRITE_MODES[mode].desc;
}

function updateWordCount() {
  var txt = document.getElementById('wr-input').value.trim();
  var wc  = txt ? txt.split(/\s+/).length : 0;
  var el  = document.getElementById('wr-wc');
  if (el) el.textContent = wc + ' word' + (wc !== 1 ? 's' : '');
}

function clearWriting() {
  document.getElementById('wr-input').value = '';
  document.getElementById('wr-output').innerHTML = '<span style="color:var(--ink4);font-family:var(--mono);font-size:10px">Output will appear here...</span>';
  document.getElementById('wr-status').textContent = 'Ready';
  updateWordCount();
}

function copyOutput() {
  var out = document.getElementById('wr-output');
  if (!out) return;
  var text = out.innerText || out.textContent;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      var btn = document.getElementById('wr-copy-btn');
      if (btn) { btn.textContent = 'Copied!'; setTimeout(function(){ btn.textContent = 'Copy'; }, 1500); }
    });
  }
}

function runWriting() {
  var input = document.getElementById('wr-input').value.trim();
  if (!input) {
    document.getElementById('wr-error').textContent = 'Paste some text first.';
    document.getElementById('wr-error').style.display = 'block';
    return;
  }

  var mode = WRITE_MODES[_writeMode];
  if (!mode) return;

  document.getElementById('wr-error').style.display   = 'none';
  document.getElementById('wr-spinner').style.display = 'inline';
  document.getElementById('wr-run-btn').disabled      = true;
  document.getElementById('wr-status').textContent    = 'Calling Gemini...';
  document.getElementById('wr-output').innerHTML      = '<span style="color:var(--ink4);font-family:var(--mono);font-size:10px">Processing...</span>';

  var prompt = mode.prompt + input;
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_KEY;

  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;
    document.getElementById('wr-spinner').style.display = 'none';
    document.getElementById('wr-run-btn').disabled      = false;

    if (xhr.status === 200) {
      var resp = JSON.parse(xhr.responseText);
      var text = resp.candidates &&
                 resp.candidates[0] &&
                 resp.candidates[0].content &&
                 resp.candidates[0].content.parts &&
                 resp.candidates[0].content.parts[0].text;
      if (text) {
        document.getElementById('wr-output').textContent = text;
        document.getElementById('wr-status').textContent = 'Done — ' + text.split(/\s+/).length + ' words';
      } else {
        document.getElementById('wr-error').textContent = 'Empty response from Gemini.';
        document.getElementById('wr-error').style.display = 'block';
        document.getElementById('wr-status').textContent = 'Error';
      }
    } else {
      var errMsg = 'API error ' + xhr.status;
      try {
        var errObj = JSON.parse(xhr.responseText);
        if (errObj.error && errObj.error.message) errMsg = errObj.error.message;
      } catch(e) {}
      document.getElementById('wr-error').textContent = errMsg;
      document.getElementById('wr-error').style.display = 'block';
      document.getElementById('wr-status').textContent = 'Error';
    }
  };

  xhr.send(JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
  }));
}

