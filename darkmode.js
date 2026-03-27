
(function() {
  var STORAGE_KEY = 'plc-dark-mode';

  // Dark mode CSS variables and overrides
  var DARK_CSS = [
    /* Global resets */
    'body { background:#0d0d0d !important; color:#e0e0e0 !important; }',
    'a { color:#7faaff !important; }',
    'a:hover { color:#cc0000 !important; }',

    /* Cards, panels, boxes */
    '.card, .opp-card, .signal-card, .metric-box, .result-box, .result-panel { background:#161616 !important; border-color:#2a2a2a !important; color:#e0e0e0 !important; }',
    '.card-desc, .opp-what, .section-intro, .opp-how { color:#bbb !important; }',

    /* Nav bars */
    'nav, .nav, .sticky-nav, .nav-bar { background:#111 !important; border-color:#222 !important; }',
    '.nav a, .nav-bar a { color:#aaa !important; }',
    '.nav a:hover { color:#fff !important; }',

    /* Inputs and selects */
    'input, select, textarea { background:#1a1a1a !important; color:#e0e0e0 !important; border-color:#333 !important; }',
    'input:focus, select:focus { border-color:#888 !important; box-shadow:inset 0 0 0 1px #888 !important; }',
    'input::placeholder { color:#555 !important; }',

    /* Tables */
    '.data-table th { background:#1a1a1a !important; color:#fff !important; }',
    '.data-table td { border-color:#222 !important; color:#ccc !important; }',
    '.data-table tr:hover td { background:#1f1f1f !important; }',
    'table th { background:#1a1a1a !important; color:#ccc !important; border-color:#333 !important; }',
    'table td { border-color:#222 !important; color:#bbb !important; }',

    /* Buttons */
    '.btn-primary { background:#e0e0e0 !important; color:#000 !important; }',
    '.btn-primary:hover { background:#fff !important; }',
    '.btn-export { background:#1a1a1a !important; color:#e0e0e0 !important; border-color:#555 !important; }',
    '.btn-export:hover { background:#222 !important; }',

    /* Sidebar */
    '.sidebar-item { background:#111 !important; border-color:#2a2a2a !important; color:#888 !important; }',
    '.sidebar-item:hover { background:#1a1a1a !important; color:#e0e0e0 !important; }',
    '.sidebar-item.active { background:#e0e0e0 !important; color:#000 !important; }',
    '.sidebar-sub { color:#666 !important; }',
    '.sidebar-item.active .sidebar-sub { color:#444 !important; }',

    /* Result panels (dark already) */
    '.result-header { background:#1a1a1a !important; }',
    '.metrics-strip { background:#111 !important; }',
    '.metric { background:#161616 !important; }',

    /* Formula boxes */
    '.formula-box { background:#161616 !important; border-color:#2a2a2a !important; color:#aaa !important; }',

    /* Company buttons */
    '.co-btn { background:#161616 !important; border-color:#2a2a2a !important; color:#aaa !important; }',
    '.co-btn:hover { background:#222 !important; border-color:#888 !important; color:#fff !important; }',
    '.co-btn.active { background:#e0e0e0 !important; color:#000 !important; border-color:#e0e0e0 !important; }',

    /* Tab bars */
    '.tab-bar, .cat-nav { background:#0d0d0d !important; border-color:#222 !important; }',
    '.tab, .cat-btn { background:#0d0d0d !important; color:#666 !important; }',
    '.tab:hover, .cat-btn:hover { color:#e0e0e0 !important; }',
    '.tab.active, .cat-btn.active { background:#e0e0e0 !important; color:#000 !important; }',

    /* Misc */
    '.outer { background:#0d0d0d !important; }',
    '.hdr { border-color:#333 !important; }',
    '.hdr h1, .hdr p { color:#e0e0e0 !important; }',
    '.form-section-label::after { background:#2a2a2a !important; }',
    '.form-section-label { color:#666 !important; }',
    'hr { border-color:#222 !important; }',
    '.result-note { background:#161616 !important; border-color:#333 !important; color:#888 !important; }',
    '.result-note strong { color:#bbb !important; }',

    /* Edge page */
    '.opp-card-header:hover { background:#1a1a1a !important; }',
    '.opp-body { background:#0d0d0d !important; }',
    '.opp-risk { background:#1a0a0a !important; border-color:#440000 !important; }',
    '.opp-stat { border-color:#222 !important; background:#161616 !important; }',
    '.score-table th { border-color:#333 !important; color:#888 !important; }',
    '.score-table td { border-color:#1a1a1a !important; }',

    /* Search overlay */
    '.gs-box { background:#111 !important; border-color:#333 !important; }',
    '.gs-input { background:#111 !important; color:#e0e0e0 !important; }',
    '.gs-result { background:#111 !important; color:#e0e0e0 !important; border-color:#1a1a1a !important; }',
    '.gs-result:hover { background:#1a1a1a !important; }',
    '.gs-group-label { background:#0d0d0d !important; color:#666 !important; }',
    '.gs-footer { background:#111 !important; border-color:#222 !important; }',
    '.gs-title { color:#e0e0e0 !important; }',
    '.gs-bar { border-color:#222 !important; }',
    '.gs-close { color:#666 !important; }',
    '.gs-close:hover { color:#e0e0e0 !important; }',

    /* plc-capital specific */
    '.page { background:#0d0d0d !important; }',
    '.inner { background:#0d0d0d !important; }',
    '.section-body { background:#111 !important; border-color:#222 !important; }',

    /* Force link colors in dark */
    '.home-link { color:#7faaff !important; }',
    '.home-link:hover { color:#cc0000 !important; }',
  ].join('\n');

  var _styleEl = null;

  function isDark() {
    return localStorage.getItem(STORAGE_KEY) === '1';
  }

  function apply(dark) {
    if (dark) {
      if (!_styleEl) {
        _styleEl = document.createElement('style');
        _styleEl.id = 'plc-dark-style';
        document.head.appendChild(_styleEl);
      }
      _styleEl.textContent = DARK_CSS;
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      if (_styleEl) { _styleEl.textContent = ''; }
      document.documentElement.removeAttribute('data-theme');
    }
    // Update toggle button
    var btn = document.getElementById('dark-toggle');
    if (btn) btn.innerHTML = dark ? '&#9728; Light' : '&#9790; Dark';
    btn = document.getElementById('dark-toggle-fixed');
    if (btn) btn.innerHTML = dark ? '&#9728;' : '&#9790;';
  }

  function toggle() {
    var next = !isDark();
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    apply(next);
  }

  function injectButton() {
    // Try to find the nav bar
    var dark = isDark();

    // Inject into sticky nav if it exists (plc-capital style)
    var nav = document.getElementById('sticky-nav') || document.querySelector('[id$="-nav"]') || document.querySelector('nav');

    // Always add a fixed floating button as fallback (small, corner)
    var fixed = document.createElement('button');
    fixed.id = 'dark-toggle-fixed';
    fixed.innerHTML = dark ? '&#9728;' : '&#9790;';
    fixed.title = 'Toggle dark mode';
    fixed.setAttribute('style',
      'position:fixed;bottom:56px;right:20px;z-index:9998;'
      + 'width:36px;height:36px;border-radius:50%;'
      + 'background:#000;color:#fff;border:1px solid #444;'
      + 'font-size:16px;cursor:pointer;line-height:1;'
      + 'box-shadow:0 2px 8px rgba(0,0,0,0.4);'
    );
    fixed.onclick = toggle;
    document.body.appendChild(fixed);

    // Also add inline button to nav if found
    if (nav) {
      var btn = document.createElement('button');
      btn.id = 'dark-toggle';
      btn.innerHTML = dark ? '&#9728; Light' : '&#9790; Dark';
      btn.onclick = toggle;
      btn.setAttribute('style',
        'background:none;border:1px solid #555;color:#888;'
        + 'font-size:10px;font-family:Arial;padding:4px 10px;'
        + 'cursor:pointer;letter-spacing:.5px;text-transform:uppercase;margin-left:8px;'
      );
      nav.appendChild(btn);
    }
  }

  // Apply immediately (before DOM ready, to avoid flash)
  if (isDark()) {
    // Pre-apply to avoid FOUC
    var preStyle = document.createElement('style');
    preStyle.id = 'plc-dark-pre';
    preStyle.textContent = 'html { background:#0d0d0d !important; } body { background:#0d0d0d !important; color:#e0e0e0 !important; }';
    if (document.head) {
      document.head.appendChild(preStyle);
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        document.head.appendChild(preStyle);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      apply(isDark());
      injectButton();
    });
  } else {
    apply(isDark());
    injectButton();
  }

  window._plcToggleDark = toggle;
})();
