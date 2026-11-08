// Sumiro touch controls.
// Loaded only on touch-first devices (see index.html). The game already reads a
// standard gamepad, so this file presents the on-screen controls as a virtual
// gamepad (move stick + buttons) and turns right-thumb drags into mouse-look.
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

  // ---- UI ------------------------------------------------------------------
  var css = '' +
    '#tc{position:fixed;inset:0;z-index:50;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;display:none}' +
    '#tc.on{display:block}' +
    '#tc .zone{position:absolute;top:0;bottom:0}' +
    '#tc .move{left:0;width:45%}' +
    '#tc .look{right:0;width:55%}' +
    '#tc .stick{position:absolute;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;border:1.5px solid rgba(42,38,34,.45);background:rgba(177,160,128,.18);display:none;pointer-events:none}' +
    '#tc .stick.on{display:block}' +
    '#tc .knob{position:absolute;left:50%;top:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:rgba(42,38,34,.5)}' +
    '#tc .hint{position:absolute;left:calc(22% - 60px);bottom:calc(18% + env(safe-area-inset-bottom));width:120px;height:120px;border-radius:50%;border:1.5px dashed rgba(42,38,34,.3);pointer-events:none}' +
    '#tc .stick.on ~ .hint{display:none}' +
    '#tc button{position:absolute;border-radius:50%;border:1.5px solid rgba(42,38,34,.55);background:rgba(177,160,128,.35);color:#2a2622;font:italic 13px Georgia,serif;letter-spacing:.03em;padding:0;touch-action:none;-webkit-tap-highlight-color:transparent}' +
    '#tc button.down{background:rgba(42,38,34,.55);color:#efe6d2}' +
    '#tc .b-attack{width:76px;height:76px;right:calc(28px + env(safe-area-inset-right));bottom:calc(30px + env(safe-area-inset-bottom));font-size:15px}' +
    '#tc .b-jump{width:60px;height:60px;right:calc(118px + env(safe-area-inset-right));bottom:calc(22px + env(safe-area-inset-bottom))}' +
    '#tc .b-dodge{width:60px;height:60px;right:calc(36px + env(safe-area-inset-right));bottom:calc(118px + env(safe-area-inset-bottom))}' +
    '#tc .b-parry{width:54px;height:54px;right:calc(118px + env(safe-area-inset-right));bottom:calc(100px + env(safe-area-inset-bottom))}' +
    '#tc .b-use{width:50px;height:50px;right:calc(190px + env(safe-area-inset-right));bottom:calc(30px + env(safe-area-inset-bottom))}' +
    '#tc button.locked{display:none}' +
    '#tc-rotate{display:none;position:fixed;inset:0;z-index:2000;background:#b1a080;color:#2a2622;place-items:center;text-align:center;padding:24px;box-sizing:border-box;font:17px/1.5 Georgia,serif;touch-action:none}' +
    '#tc-rotate div{display:grid;gap:18px;justify-items:center;max-width:300px}' +
    '#tc-rotate svg{width:64px;height:64px;animation:tc-turn 2.4s ease-in-out infinite}' +
    '#tc-rotate h2{margin:0;font:italic 28px Georgia,serif;letter-spacing:.04em}' +
    '#tc-rotate p{margin:0}' +
    '@keyframes tc-turn{0%,20%{transform:rotate(0)}50%,80%{transform:rotate(-90deg)}100%{transform:rotate(0)}}' +
    '@media (prefers-reduced-motion:reduce){#tc-rotate svg{animation:none;transform:rotate(-90deg)}}' +
    '@media (orientation:portrait){#tc-rotate{display:grid}}' +
    '#tc .b-pause{width:44px;height:44px;right:calc(16px + env(safe-area-inset-right));top:calc(14px + env(safe-area-inset-top));border-radius:8px;font-size:16px;font-style:normal}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var root = document.createElement('div');
  root.id = 'tc';
  root.innerHTML =
    '<div class="zone move"></div><div class="zone look"></div>' +
    '<div class="stick"><div class="knob"></div></div><div class="hint"></div>' +
    '<button class="b-attack" data-b="2" aria-label="Attack">Strike</button>' +
    '<button class="b-jump" data-b="0" aria-label="Jump">Jump</button>' +
    '<button class="b-dodge" data-b="1" aria-label="Ink step">Step</button>' +
    '<button class="b-parry" data-b="4" aria-label="Parry">Parry</button>' +
    '<button class="b-use" data-b="3" aria-label="Interact or drink">Use</button>' +
    '<button class="b-pause" data-b="9" aria-label="Pause">II</button>';
  document.body.appendChild(root);

  // Landscape only: in portrait, cover everything with a "turn your phone" screen.
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

  // Strike/Parry need the sword (Chapter Four) and Step needs the ink step
  // (after Chapter One). Until then the game ignores them, so hide the buttons.
  var CHAPTERS = ['ch1_climb', 'ch2_pass', 'ch3_pines', 'ch4_temple', 'ch5_sea', 'ch6_summit'];
  var btnSword = root.querySelectorAll('.b-attack, .b-parry');
  var btnStep = root.querySelector('.b-dodge');
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
    var ink = document.querySelector('#ink-ui .ink.on'); // HUD shows this once the ink step is earned
    if (ink) ab.inkStep = true;
    return ab;
  }
  var lastAbilityCheck = -1e9;
  function updateLocks(now) {
    if (now - lastAbilityCheck < 1000) return;
    lastAbilityCheck = now;
    var ab = readAbilities();
    Array.prototype.forEach.call(btnSword, function (el) { el.classList.toggle('locked', !ab.sword); });
    btnStep.classList.toggle('locked', !ab.inkStep);
  }

  var stick = root.querySelector('.stick');
  var knob = root.querySelector('.knob');
  var STICK_R = 50;

  // Buttons
  Array.prototype.forEach.call(root.querySelectorAll('button'), function (el) {
    var b = +el.getAttribute('data-b');
    var ids = {};
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      ids[e.pointerId] = 1;
      holds[b] = (holds[b] || 0) + 1;
      releaseAt[b] = performance.now() + MIN_PRESS_MS;
      el.classList.add('down');
      if (navigator.vibrate) { try { navigator.vibrate(8); } catch (_) {} }
    });
    function up(e) {
      if (!ids[e.pointerId]) return;
      delete ids[e.pointerId];
      holds[b] = Math.max(0, (holds[b] || 0) - 1);
      if (!holds[b]) el.classList.remove('down');
    }
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  });

  // Move stick: appears wherever the left thumb lands.
  var moveId = null, ox = 0, oy = 0;
  root.querySelector('.move').addEventListener('pointerdown', function (e) {
    e.preventDefault();
    if (moveId !== null) return;
    moveId = e.pointerId;
    try { e.target.setPointerCapture(e.pointerId); } catch (_) {}
    ox = e.clientX; oy = e.clientY;
    stick.style.left = ox + 'px';
    stick.style.top = oy + 'px';
    knob.style.transform = '';
    stick.classList.add('on');
  });
  function moveStick(e) {
    if (e.pointerId !== moveId) return;
    var dx = e.clientX - ox, dy = e.clientY - oy;
    var d = Math.hypot(dx, dy);
    if (d > STICK_R) { dx *= STICK_R / d; dy *= STICK_R / d; }
    knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    pad.axes[0] = dx / STICK_R;
    pad.axes[1] = dy / STICK_R;
  }
  function endStick(e) {
    if (e.pointerId !== moveId) return;
    moveId = null;
    pad.axes[0] = pad.axes[1] = 0;
    stick.classList.remove('on');
  }
  var moveZone = root.querySelector('.move');
  moveZone.addEventListener('pointermove', moveStick);
  moveZone.addEventListener('pointerup', endStick);
  moveZone.addEventListener('pointercancel', endStick);

  // Look: drag the right thumb; forwarded as mouse movement.
  var LOOK_GAIN = 1.6;
  var lookId = null, lx = 0, ly = 0;
  var lookZone = root.querySelector('.look');
  lookZone.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    if (lookId !== null) return;
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

  // ---- Show controls only while playing --------------------------------------
  // Menus, credits and the ending are tapped directly, so hide controls then.
  function releaseAll() {
    moveId = lookId = null;
    pad.axes[0] = pad.axes[1] = 0;
    stick.classList.remove('on');
    holds = {};
    Array.prototype.forEach.call(root.querySelectorAll('button.down'), function (el) { el.classList.remove('down'); });
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

  var wasPortrait = false;
  function tick(now) {
    now = now || performance.now();
    fitCheck(now);
    updateLocks(now);
    // Turning to portrait mid-play pauses the game, so nothing happens unseen.
    var portrait = portraitMq.matches;
    if (portrait && !wasPortrait && root.classList.contains('on')) {
      releaseAll();
      releaseAt[9] = now + MIN_PRESS_MS;
    }
    wasPortrait = portrait;
    var ui = document.getElementById('ink-ui');
    var blocking = !ui || ui.querySelector('.menu.on, .credits.on, .closing.on');
    var boot = document.getElementById('boot');
    var booting = boot && boot.isConnected && getComputedStyle(boot).display !== 'none' && getComputedStyle(boot).opacity !== '0';
    var show = !blocking && !booting;
    if (show !== root.classList.contains('on')) {
      root.classList.toggle('on', show);
      if (!show) releaseAll();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  window.addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', function () { if (document.hidden) releaseAll(); });
})();
