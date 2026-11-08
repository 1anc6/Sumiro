// Sumiro touch controls.
// Loaded only on touch-first devices (see index.html). The game already reads a
// standard gamepad, so this file presents the on-screen controls as a virtual
// gamepad (move stick + buttons) and turns right-thumb drags into mouse-look.
// Players can move, resize and fade every control; the layout is saved on the device.
(function () {
  if (!window.__sumiroTouch) return;

  // ---- Virtual gamepad -----------------------------------------------------
  // Standard mapping indices the game reads:
  // 0 jump/confirm, 1 ink step/back, 2 attack, 3 interact/drink, 4 parry, 9 pause.
  var pad = {
    id: 'Sumiro touch controls',
    index: 0,
    connected: true,
    mapping: 'standard',
    timestamp: 0,
    axes: [0, 0, 0, 0],
    buttons: []
  };
  for (var i = 0; i < 17; i++) pad.buttons.push({ pressed: false, touched: false, value: 0 });
  var holds = {};      // button index -> number of fingers holding it
  var releaseAt = {};  // button index -> earliest time a quick tap may read as released
  var MIN_PRESS_MS = 70; // the game samples at 60 Hz; keep taps visible for a few steps

  function syncButtons() {
    var now = performance.now();
    for (var b = 0; b < pad.buttons.length; b++) {
      var on = (holds[b] || 0) > 0 || now < (releaseAt[b] || 0);
      pad.buttons[b].pressed = on;
      pad.buttons[b].touched = on;
      pad.buttons[b].value = on ? 1 : 0;
    }
    pad.timestamp = now;
  }

  var realGetGamepads = navigator.getGamepads ? navigator.getGamepads.bind(navigator) : null;
  try {
    Object.defineProperty(navigator, 'getGamepads', {
      configurable: true,
      value: function () {
        var real = realGetGamepads ? realGetGamepads() : [];
        if (real && real[0]) return real; // a real controller wins
        syncButtons();
        return [pad, null, null, null];
      }
    });
  } catch (e) { /* leave gamepad support as it was */ }

  // Pointer lock doesn't exist for touch. If a browser grants and then drops it,
  // the game would read that as "player left" and pause, so turn it off here.
  try {
    Element.prototype.requestPointerLock = function () { return Promise.resolve(); };
  } catch (e) {}

  // ---- Layout ----------------------------------------------------------------
  // Each control has a base size and a default centre, measured in px from the
  // screen edges (plus the notch safe area). A saved layout stores centres as a
  // fraction of the screen so it carries across phones and rotations.
  var CONTROLS = [
    { id: 'stick',  label: 'Move',   size: 100, def: { l: 104, b: 92 } },
    { id: 'attack', label: 'Strike', size: 76,  def: { r: 66,  b: 68 },  btn: 2 },
    { id: 'jump',   label: 'Jump',   size: 60,  def: { r: 148, b: 52 },  btn: 0 },
    { id: 'dodge',  label: 'Step',   size: 60,  def: { r: 66,  b: 148 }, btn: 1 },
    { id: 'parry',  label: 'Parry',  size: 54,  def: { r: 145, b: 127 }, btn: 4 },
    { id: 'use',    label: 'Use',    size: 54,  def: { r: 218, b: 56 },  key: 'KeyE', k: 'e' }, // rest, read, ring, take
    { id: 'drink',  label: 'Drink',  size: 46,  def: { r: 214, b: 124 }, key: 'KeyF', k: 'f' }, // drink from the gourd
    { id: 'pause',  label: 'II',     size: 44,  def: { r: 38,  t: 36 },  btn: 9 }
  ];
  var LAYOUT_KEY = 'sumiro.touchLayout.v1';
  var DEFAULT_OPACITY = 0.9;

  function loadLayout() {
    try {
      var l = JSON.parse(localStorage.getItem(LAYOUT_KEY) || 'null');
      if (l && typeof l === 'object' && l.c) return l;
    } catch (e) {}
    return { opacity: DEFAULT_OPACITY, c: {} };
  }
  function saveLayout(l) {
    try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(l)); } catch (e) {}
  }
  function cloneLayout(l) { return JSON.parse(JSON.stringify(l)); }
  var layout = loadLayout();

  // ---- UI ------------------------------------------------------------------
  var css = '' +
    '#tc{position:fixed;inset:0;z-index:50;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;display:none;--op:.9}' +
    '#tc.on{display:block}' +
    '#tc .zone{position:absolute;top:0;bottom:0}' +
    '#tc .move{left:0;width:45%}' +
    '#tc .look{right:0;width:55%}' +
    '#tc .ctl{position:absolute;box-sizing:border-box;opacity:var(--op)}' +
    '#tc .stick{border-radius:50%;border:2.5px solid rgba(42,38,34,.6);background:rgba(177,160,128,.3);box-shadow:inset 0 0 0 1px rgba(239,230,210,.35);pointer-events:none;transition:opacity .15s}' +
    '#tc .stick:not(.active){opacity:calc(var(--op) * .8)}' +
    '#tc .knob{position:absolute;left:50%;top:50%;width:44%;height:44%;border-radius:50%;background:rgba(42,38,34,.5);transform:translate(-50%,-50%)}' +
    '#tc button.ctl{border-radius:50%;border:1.5px solid rgba(42,38,34,.55);background:rgba(177,160,128,.35);color:#2a2622;font-family:Georgia,serif;font-style:italic;letter-spacing:.03em;padding:0;touch-action:none;-webkit-tap-highlight-color:transparent}' +
    '#tc button.ctl.down{background:rgba(42,38,34,.55);color:#efe6d2}' +
    '#tc button.ctl.hot{border-color:#c8402c;box-shadow:0 0 0 2px rgba(200,64,44,.55);animation:tc-hot 1.4s ease-in-out infinite}' +
    '@keyframes tc-hot{50%{box-shadow:0 0 0 6px rgba(200,64,44,.15)}}' +
    '@media (prefers-reduced-motion:reduce){#tc button.ctl.hot{animation:none}}' +
    '#tc .c-pause{border-radius:8px!important;font-style:normal!important}' +
    '#tc .locked{display:none}' +
    // Editing
    '#tc.editing{z-index:3000;background:rgba(20,18,16,.35)}' +
    '#tc.editing .zone{pointer-events:none}' +
    '#tc.editing .ctl{display:block;pointer-events:auto;outline:2px dashed rgba(239,230,210,.75);outline-offset:3px;cursor:grab}' +
    '#tc.editing .stick{opacity:var(--op)}' +
    '#tc.editing .ctl.sel{outline:2.5px solid #c8402c}' +
    '#tc.editing .stick::after{content:"Move";position:absolute;left:0;right:0;top:calc(100% + 6px);text-align:center;font:italic 12px Georgia,serif;color:#efe6d2}' +
    '#tc-panel{display:none;position:fixed;left:50%;top:calc(10px + env(safe-area-inset-top));transform:translateX(-50%);z-index:3001;background:#b1a080;color:#2a2622;border:1px solid #2a2622;padding:10px 14px;box-sizing:border-box;width:min(560px,calc(100% - 24px));font:14px/1.35 Georgia,serif;display:none;gap:8px;touch-action:none}' +
    '#tc-panel.on{display:grid}' +
    '#tc-panel .row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}' +
    '#tc-panel .tip{font-style:italic;opacity:.85}' +
    '#tc-panel label{display:flex;align-items:center;gap:8px;flex:1 1 180px;min-width:0}' +
    '#tc-panel label span{white-space:nowrap}' +
    '#tc-panel input[type=range]{flex:1;min-width:0;accent-color:#2a2622;height:28px}' +
    '#tc-panel input:disabled{opacity:.4}' +
    '#tc-panel .acts{justify-content:flex-end}' +
    '#tc-panel button,#tc-editbtn{font:italic 15px Georgia,serif;color:#2a2622;background:none;border:1px solid #2a2622;padding:6px 16px;min-height:40px;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    '#tc-panel button.primary{background:#2a2622;color:#efe6d2}' +
    '#tc-editbtn{display:none;position:fixed;z-index:60;right:calc(16px + env(safe-area-inset-right));bottom:calc(14px + env(safe-area-inset-bottom));background:rgba(177,160,128,.85)}' +
    '#tc-editbtn.on{display:block}' +
    // Portrait cover
    '#tc-rotate{display:none;position:fixed;inset:0;z-index:4000;background:#b1a080;color:#2a2622;place-items:center;text-align:center;padding:24px;box-sizing:border-box;font:17px/1.5 Georgia,serif;touch-action:none}' +
    '#tc-rotate div{display:grid;gap:18px;justify-items:center;max-width:300px}' +
    '#tc-rotate svg{width:64px;height:64px;animation:tc-turn 2.4s ease-in-out infinite}' +
    '#tc-rotate h2{margin:0;font:italic 28px Georgia,serif;letter-spacing:.04em}' +
    '#tc-rotate p{margin:0}' +
    '@keyframes tc-turn{0%,20%{transform:rotate(0)}50%,80%{transform:rotate(-90deg)}100%{transform:rotate(0)}}' +
    '@media (prefers-reduced-motion:reduce){#tc-rotate svg{animation:none;transform:rotate(-90deg)}}' +
    '@media (orientation:portrait){#tc-rotate{display:grid}}' +
    // Reads the notch safe area so JS can place controls clear of it.
    '#tc-safe{position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var root = document.createElement('div');
  root.id = 'tc';
  var html = '<div class="zone move"></div><div class="zone look"></div>' +
    '<div class="ctl stick c-stick"><div class="knob"></div></div>';
  CONTROLS.forEach(function (c) {
    if (c.id === 'stick') return;
    html +='<button type="button" class="ctl c-' + c.id + '" data-id="' + c.id + '" aria-label="' +
      (c.id === 'pause' ? 'Pause' : c.label) + '">' + c.label + '</button>';
  });
  root.innerHTML = html;
  document.body.appendChild(root);

  var safeProbe = document.createElement('div');
  safeProbe.id = 'tc-safe';
  document.body.appendChild(safeProbe);

  var els = {};
  CONTROLS.forEach(function (c) { els[c.id] = root.querySelector('.c-' + c.id); });
  var stick = els.stick;
  var knob = stick.querySelector('.knob');

  function safe() {
    var s = getComputedStyle(safeProbe);
    return { t: parseFloat(s.paddingTop) || 0, r: parseFloat(s.paddingRight) || 0,
             b: parseFloat(s.paddingBottom) || 0, l: parseFloat(s.paddingLeft) || 0 };
  }
  function scaleOf(c) { var s = layout.c[c.id] && layout.c[c.id].s; return s > 0 ? s : 1; }
  function homeOf(c) {
    var W = window.innerWidth, H = window.innerHeight, cu = layout.c[c.id];
    if (cu && typeof cu.x === 'number') return { x: cu.x * W, y: cu.y * H };
    var sa = safe(), d = c.def;
    return {
      x: d.l !== undefined ? sa.l + d.l : W - sa.r - d.r,
      y: d.t !== undefined ? sa.t + d.t : H - sa.b - d.b
    };
  }
  function place(c, x, y) {
    var el = els[c.id], px = c.size * scaleOf(c);
    el.style.width = el.style.height = px + 'px';
    el.style.left = (x - px / 2) + 'px';
    el.style.top = (y - px / 2) + 'px';
    if (c.id !== 'stick') el.style.fontSize =Math.round((c.id === 'pause' ? 16 : c.id === 'attack' ? 15 : 13) * scaleOf(c)) + 'px';
  }
  var stickActive = false;
  function applyLayout() {
    root.style.setProperty('--op', String(layout.opacity || DEFAULT_OPACITY));
    CONTROLS.forEach(function (c) {
      if (c.id === 'stick' && stickActive) return; // don't yank it from under the thumb
      var h = homeOf(c);
      place(c, h.x, h.y);
    });
  }
  applyLayout();
  window.addEventListener('resize', function () { setTimeout(applyLayout, 50); });

  // ---- Buttons ---------------------------------------------------------------
  // Gamepad buttons go through the virtual pad. Use and Drink are sent as the
  // E and F keys: on a gamepad the game puts both on one button, which would
  // drink a gourd every time you rest or read.
  var editing = false;
  var keysDown = {};
  var buttonResets = [];
  function sendKey(c, down) {
    if (!!keysDown[c.key] === down) return;
    keysDown[c.key] = down;
    window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code: c.key, key: c.k, bubbles: true }));
  }
  function releaseKeys() {
    CONTROLS.forEach(function (c) { if (c.key) sendKey(c, false); });
  }
  CONTROLS.forEach(function (c) {
    if (c.id === 'stick') return;
    var el = els[c.id], b = c.btn, ids = {}, count = 0;
    buttonResets.push(function () { ids = {}; count = 0; });
    el.addEventListener('pointerdown', function (e) {
      if (editing) return;
      e.preventDefault();
      e.stopPropagation();
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      ids[e.pointerId] = 1;
      count++;
      if (c.key) sendKey(c, true);
      else {
        holds[b] = (holds[b] || 0) + 1;
        releaseAt[b] = performance.now() + MIN_PRESS_MS;
      }
      el.classList.add('down');
      if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) {
        try { navigator.vibrate(8); } catch (_) {}
      }
    });
    function up(e) {
      if (!ids[e.pointerId]) return;
      delete ids[e.pointerId];
      count = Math.max(0, count - 1);
      if (c.key) { if (!count) sendKey(c, false); }
      else holds[b] = Math.max(0, (holds[b] || 0) - 1);
      if (!count) el.classList.remove('down');
    }
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  });

  // ---- Move stick ------------------------------------------------------------
  // The ring rests at its home spot. A touch on (or near) it uses it in place;
  // a touch elsewhere on the left side brings the ring to the thumb, and it
  // returns home on release.
  var moveId = null, ox = 0, oy = 0, stickR = 40;
  var moveZone = root.querySelector('.move');
  moveZone.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    if (moveId !== null || editing) return;
    moveId = e.pointerId;
    try { moveZone.setPointerCapture(e.pointerId); } catch (_) {}
    var c = CONTROLS[0], h = homeOf(c), size = c.size * scaleOf(c);
    stickR = size * 0.4;
    if (Math.hypot(e.clientX - h.x, e.clientY - h.y) <= size * 0.75) { ox = h.x; oy = h.y; }
    else { ox = e.clientX; oy = e.clientY; }
    stickActive = true;
    place(c, ox, oy);
    stick.classList.add('active');
    moveStick(e);
  });
  function moveStick(e) {
    if (e.pointerId !== moveId) return;
    var dx = e.clientX - ox, dy = e.clientY - oy;
    var d = Math.hypot(dx, dy);
    if (d > stickR) { dx *= stickR / d; dy *= stickR / d; }
    knob.style.transform = 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px))';
    pad.axes[0] = dx / stickR;
    pad.axes[1] = dy / stickR;
  }
  function endStick(e) {
    if (e.pointerId !== moveId) return;
    resetStick();
  }
  function resetStick() {
    moveId = null;
    pad.axes[0] = pad.axes[1] = 0;
    stickActive = false;
    knob.style.transform = '';
    stick.classList.remove('active');
    var h = homeOf(CONTROLS[0]);
    place(CONTROLS[0], h.x, h.y);
  }
  moveZone.addEventListener('pointermove', moveStick);
  moveZone.addEventListener('pointerup', endStick);
  moveZone.addEventListener('pointercancel', endStick);

  // ---- Look ----------------------------------------------------------------
  // Drag the right thumb; forwarded as mouse movement.
  var LOOK_GAIN = 1.6;
  var lookId = null, lx = 0, ly = 0;
  var lookZone = root.querySelector('.look');
  lookZone.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    if (lookId !== null || editing) return;
    lookId = e.pointerId;
    try { lookZone.setPointerCapture(e.pointerId); } catch (_) {}
    lx = e.clientX; ly = e.clientY;
  });
  lookZone.addEventListener('pointermove', function (e) {
    if (e.pointerId !== lookId) return;
    var dx = (e.clientX - lx) * LOOK_GAIN, dy = (e.clientY - ly) * LOOK_GAIN;
    lx = e.clientX; ly = e.clientY;
    if (!dx && !dy) return;
    var ev = new MouseEvent('mousemove', { movementX: dx, movementY: dy });
    // Some browsers ignore movementX/Y in the constructor; set them directly.
    try {
      Object.defineProperty(ev, 'movementX', { value: dx });
      Object.defineProperty(ev, 'movementY', { value: dy });
    } catch (_) {}
    window.dispatchEvent(ev);
  });
  function endLook(e) { if (e.pointerId === lookId) lookId = null; }
  lookZone.addEventListener('pointerup', endLook);
  lookZone.addEventListener('pointercancel', endLook);

  function releaseAll() {
    resetStick();
    lookId = null;
    holds = {};
    releaseKeys();
    buttonResets.forEach(function (f) { f(); });
    Array.prototype.forEach.call(root.querySelectorAll('button.down'), function (el) { el.classList.remove('down'); });
  }

  // ---- Layout editor ---------------------------------------------------------
  // Opened from the "Touch controls" button shown while a game menu is open.
  var editBtn = document.createElement('button');
  editBtn.id = 'tc-editbtn';
  editBtn.type = 'button';
  editBtn.textContent = 'Touch controls';
  document.body.appendChild(editBtn);

  var panel = document.createElement('div');
  panel.id = 'tc-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Customise touch controls');
  panel.innerHTML =
    '<div class="row tip">Drag a control to move it. Tap one to resize it.</div>' +
    '<div class="row">' +
      '<label><span class="sz-name">Size</span><input type="range" class="sz" min="60" max="160" step="5" disabled></label>' +
      '<label><span>Opacity</span><input type="range" class="op" min="25" max="100" step="5"></label>' +
    '</div>' +
    '<div class="row acts">' +
      '<button type="button" class="reset">Reset</button>' +
      '<button type="button" class="cancel">Cancel</button>' +
      '<button type="button" class="save primary">Save</button>' +
    '</div>';
  document.body.appendChild(panel);
  var szInput = panel.querySelector('.sz'), opInput = panel.querySelector('.op'), szName = panel.querySelector('.sz-name');
  // Keep panel touches from reaching the game underneath.
  ['pointerdown', 'pointermove', 'pointerup', 'mousedown', 'click'].forEach(function (t) {
    panel.addEventListener(t, function (e) { e.stopPropagation(); });
  });

  var savedLayout = null, selected = null;
  function select(c) {
    selected = c;
    CONTROLS.forEach(function (o) { els[o.id].classList.toggle('sel', o === c); });
    szInput.disabled = !c;
    szName.textContent = c ? c.label === 'II' ? 'Pause size' : c.label + ' size' : 'Size';
    if (c) szInput.value = Math.round(scaleOf(c) * 100);
  }
  function openEditor() {
    if (editing) return;
    releaseAll();
    editing = true;
    savedLayout = cloneLayout(layout);
    root.classList.add('on', 'editing');
    panel.classList.add('on');
    editBtn.classList.remove('on');
    opInput.value = Math.round((layout.opacity || DEFAULT_OPACITY) * 100);
    select(null);
    applyLayout();
  }
  function closeEditor(keep) {
    if (!keep) layout = savedLayout;
    else saveLayout(layout);
    editing = false;
    select(null);
    root.classList.remove('editing');
    panel.classList.remove('on');
    applyLayout();
    lastShow = null; // let tick decide visibility again
  }
  editBtn.addEventListener('click', function (e) { e.stopPropagation(); openEditor(); });
  editBtn.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
  editBtn.addEventListener('mousedown', function (e) { e.stopPropagation(); });
  panel.querySelector('.save').addEventListener('click', function () { closeEditor(true); });
  panel.querySelector('.cancel').addEventListener('click', function () { closeEditor(false); });
  panel.querySelector('.reset').addEventListener('click', function () {
    layout = { opacity: DEFAULT_OPACITY, c: {} };
    opInput.value = Math.round(DEFAULT_OPACITY * 100);
    applyLayout();
    select(selected);
  });
  szInput.addEventListener('input', function () {
    if (!selected) return;
    var cu = layout.c[selected.id] || (layout.c[selected.id] = {});
    cu.s = +szInput.value / 100;
    applyLayout();
  });
  opInput.addEventListener('input', function () {
    layout.opacity = +opInput.value / 100;
    applyLayout();
  });

  // Drag controls while editing.
  var drag = null;
  root.addEventListener('pointerdown', function (e) {
    if (!editing) return;
    var target = e.target.closest ? e.target.closest('.ctl') : null;
    if (!target) { select(null); return; }
    e.preventDefault();
    e.stopPropagation();
    var c = null;
    CONTROLS.forEach(function (o) { if (els[o.id] === target) c = o; });
    if (!c) return;
    select(c);
    var h = homeOf(c);
    drag = { c: c, id: e.pointerId, dx: e.clientX - h.x, dy: e.clientY - h.y };
    try { root.setPointerCapture(e.pointerId); } catch (_) {}
  }, true);
  root.addEventListener('pointermove', function (e) {
    if (!editing || !drag || e.pointerId !== drag.id) return;
    var W = window.innerWidth, H = window.innerHeight;
    var half = drag.c.size * scaleOf(drag.c) / 2;
    var x = Math.min(Math.max(e.clientX - drag.dx, half), W - half);
    var y = Math.min(Math.max(e.clientY - drag.dy, half), H - half);
    var cu = layout.c[drag.c.id] || (layout.c[drag.c.id] = {});
    cu.x = x / W; cu.y = y / H;
    place(drag.c, x, y);
  }, true);
  function endDrag(e) { if (drag && e.pointerId === drag.id) drag = null; }
  root.addEventListener('pointerup', endDrag, true);
  root.addEventListener('pointercancel', endDrag, true);

  // ---- Landscape only --------------------------------------------------------
  var rotate = document.createElement('div');
  rotate.id = 'tc-rotate';
  rotate.setAttribute('role', 'dialog');
  rotate.setAttribute('aria-label', 'Turn your phone sideways');
  rotate.innerHTML =
    '<div><svg viewBox="0 0 64 64" fill="none" stroke="#2a2622" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">' +
    '<rect x="20" y="6" width="24" height="52" rx="4"/><path d="M29 51h6"/></svg>' +
    '<h2>Sumiro</h2><p>Turn your phone sideways to play.</p></div>';
  document.body.appendChild(rotate);
  var portraitMq = matchMedia('(orientation:portrait)');

  // ---- Earned moves ----------------------------------------------------------
  // Strike/Parry need the sword (Chapter Four) and Step needs the ink step
  // (after Chapter One). Until then the game ignores them, so hide the buttons.
  var CHAPTERS = ['ch1_climb', 'ch2_pass', 'ch3_pines', 'ch4_temple', 'ch5_sea', 'ch6_summit'];
  function readAbilities() {
    var ab = {};
    try {
      var s = JSON.parse(localStorage.getItem('sumiro.save.v1') || localStorage.getItem('ink_wanderer.save.v1') || 'null');
      if (s) {
        var a = s.abilities || {};
        var ch = CHAPTERS.indexOf(s.chapter);
        ab.sword = !!a.sword || ch > 3;      // chapters after the temple always have it
        ab.inkStep = !!a.inkStep || ch > 0;
      }
    } catch (e) {}
    if (document.querySelector('#ink-ui .ink.on')) ab.inkStep = true; // HUD shows this once earned
    return ab;
  }
  var lastAbilityCheck = -1e9;
  function updateLocks(now) {
    if (now - lastAbilityCheck < 1000) return;
    lastAbilityCheck = now;
    var ab = readAbilities();
    els.attack.classList.toggle('locked', !ab.sword);
    els.parry.classList.toggle('locked', !ab.sword);
    els.dodge.classList.toggle('locked', !ab.inkStep);
  }

  // ---- Keep the game sized to the screen ----------------------------------
  // The game resizes only on window "resize". On phones that event can fire
  // mid-rotation (or while entering fullscreen) with the old size, leaving the
  // canvas at its portrait width. Re-send it whenever the canvas doesn't match.
  var lastFix = 0;
  function fitCheck(now) {
    if (now - lastFix < 250) return;
    var c = document.querySelector('body > canvas');
    if (!c) return;
    if (Math.abs(c.clientWidth - window.innerWidth) > 2 || Math.abs(c.clientHeight - window.innerHeight) > 2) {
      lastFix = now;
      window.dispatchEvent(new Event('resize'));
    }
  }
  function nudgeResize() {
    [80, 300, 800].forEach(function (ms) {
      setTimeout(function () { window.dispatchEvent(new Event('resize')); }, ms);
    });
  }
  window.addEventListener('orientationchange', nudgeResize);
  document.addEventListener('fullscreenchange', nudgeResize);
  document.addEventListener('webkitfullscreenchange', nudgeResize);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', nudgeResize);

  // ---- Hints in mobile terms ---------------------------------------------------
  // The game's prompts name keyboard keys ("E  rest at the lantern"). Rewrite
  // them with the on-screen button names, and light up that button.
  var HINT_RULES = [
    [/^A D move along it\. W climb/, '[Stick left/right] move along it. [Stick up] climb'],
    [/Left mouse or E\b/, '[Use]'],
    [/J or Left mouse\b/, '[Strike]'],
    [/Right mouse\b/, '[Parry]'],
    [/W A S D\b/, '[Stick]'],
    [/Hold D \+ Space\b/, '[Hold stick right + Jump]'],
    [/\bD \+ Space\b/, '[Stick right + Jump]'],
    [/\bA \+ Space\b/, '[Stick left + Jump]'],
    [/\bS \+ Space\b/, '[Stick down + Jump]'],
    [/(^|\. )Shift\b/, '$1[Full stick]'],
    [/(^|\. )Space\b/, '$1[Jump]'],
    [/(^|\. )E\b/, '$1[Use]'],
    [/(^|\. )F\b/, '$1[Drink]'],
    [/(^|\. )Q\b/, '$1[Step]'],
    [/(^|\. )J\b/, '$1[Strike]'],
    [/(^|\. )K\b/, '$1[Parry]']
  ];
  var LABEL_TO_CONTROL = { Use: 'use', Drink: 'drink', Jump: 'jump', Step: 'dodge', Strike: 'attack', Parry: 'parry' };
  function esc(s) { return s.replace(/[&<>]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]; }); }
  function translateHint(text) {
    var t = text.replace(/\s+/g, ' ').trim(), hit = false;
    if (t.indexOf('[') !== -1) return null;
    HINT_RULES.forEach(function (r) {
      if (r[0].test(t)) { t = t.replace(r[0], r[1]); hit = true; }
    });
    if (!hit) return null;
    var keys = [];
    var html = esc(t).replace(/\[([^\]]+)\]/g, function (_, k) {
      Object.keys(LABEL_TO_CONTROL).forEach(function (l) { if (new RegExp('\\b' + l + '\\b').test(k)) keys.push(LABEL_TO_CONTROL[l]); });
      return '<b>' + k + '</b>';
    });
    return { html: '<span>' + html + '</span>', keys: keys };
  }
  function translateLines() {
    var lines = document.querySelectorAll('#ink-ui .line');
    for (var n = 0; n < lines.length; n++) {
      var el = lines[n];
      if (el.innerHTML === el.getAttribute('data-tc-out')) continue;
      var tr = translateHint(el.textContent || '');
      if (tr) {
        el.innerHTML = tr.html;
        el.setAttribute('data-tc-keys', tr.keys.join(' '));
      } else {
        el.removeAttribute('data-tc-keys');
      }
      el.setAttribute('data-tc-out', el.innerHTML);
    }
    // Glow the button the current prompt asks for.
    var prompt = document.querySelector('#ink-ui .line.prompt.on');
    var hot = prompt ? (prompt.getAttribute('data-tc-keys') || '').split(' ') : [];
    CONTROLS.forEach(function (c) {
      if (c.id !== 'stick') els[c.id].classList.toggle('hot', hot.indexOf(c.id) !== -1);
    });
  }

  // The pause menu's Controls page lists keyboard keys; show the touch controls.
  function controlsPoems() {
    var ab = readAbilities();
    var p = [[
      '<b>Stick</b> move. A light push walks, all the way sprints',
      '<b>Drag the right side</b> look around',
      '<b>Jump</b> jump, leap, climb',
      '<b>Use</b> rest, read, ring, take',
      '<b>Drink</b> drink from the gourd',
      '<b>II</b> pause'
    ], [
      'Hanging from a ledge:',
      '<b>Stick up</b> climb, <b>left or right</b> shimmy, <b>down</b> let go',
      '<b>Stick down + Jump</b> leap back off the wall',
      '<b>Stick left or right + Jump</b> hop to the next hold'
    ]];
    if (ab.inkStep) p.push(['<b>Step</b> Ink Step: a dodge on the ground, a dash in the air']);
    if (ab.sword) p.push(['<b>Strike</b> strike, three in a row', '<b>Parry</b> parry as the blow falls']);
    p.push(['<b>Touch controls</b> (bottom right of this menu) moves and resizes the buttons']);
    return p.map(function (lines) { return '<div class="poem">' + lines.join('<br>') + '</div>'; }).join('');
  }
  function translateControlsPage() {
    var menu = document.querySelector('#ink-ui .menu.on');
    if (!menu) return;
    var h = menu.querySelector('.head h1');
    if (!h || h.textContent !== 'Controls') return;
    var poems = menu.querySelector('.poems');
    if (!poems || poems.getAttribute('data-tc') === '1') return;
    poems.innerHTML = controlsPoems();
    poems.setAttribute('data-tc', '1');
  }

  // ---- Main loop: visibility, pause on portrait --------------------------------
  // Menus, credits and the ending are tapped directly, so hide controls then.
  var wasPortrait = false, lastShow = null;
  function tick(now) {
    // Always schedule the next frame first, so one bad frame can't stop the loop.
    requestAnimationFrame(tick);
    try { step(now || performance.now()); } catch (e) { console.error('[touch]', e); }
  }
  function step(now) {
    fitCheck(now);
    translateLines();
    translateControlsPage();
    updateLocks(now);
    var portrait = portraitMq.matches;
    // Turning to portrait mid-play pauses the game, so nothing happens unseen.
    if (portrait && !wasPortrait && root.classList.contains('on') && !editing) {
      releaseAll();
      releaseAt[9] = now + MIN_PRESS_MS;
    }
    wasPortrait = portrait;

    if (!editing) {
      var ui = document.getElementById('ink-ui');
      var menuOpen = !!(ui && ui.querySelector('.menu.on'));
      var blocking = !ui || menuOpen || ui.querySelector('.credits.on, .closing.on');
      var show = !blocking;
      if (show !== lastShow) {
        lastShow = show;
        root.classList.toggle('on', show);
        if (!show) releaseAll();
      }
      editBtn.classList.toggle('on', menuOpen);
    }
  }
  requestAnimationFrame(tick);

  window.addEventListener('blur', function () { if (!editing) releaseAll(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && !editing) releaseAll(); });
})();
