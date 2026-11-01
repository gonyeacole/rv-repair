// Accessibility toolbar: a button at the bottom left opens a panel of display and reading adjustments.
// Choices are remembered in this browser only (localStorage).
(function () {
  "use strict";
  var KEY = "oc-a11y-v1";
  var doc = document.documentElement;
  var state = { fs: 0, lh: 0, f: {} };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved && typeof saved === "object") state = { fs: +saved.fs || 0, lh: +saved.lh || 0, f: saved.f || {} }; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  var FS = [90, 100, 112, 125, 150, 175], FS_DEFAULT = 1;   // index 0..5, default is 100%
  var LH = [0, 1.6, 1.9, 2.2];                              // 0 = site default
  var FLAGS = ["links", "titles", "readable", "cursor", "spacing", "left", "bold", "dark", "contrast", "mono", "lowsat", "line", "mask", "noimg", "noanim", "reading"];
  var PROFILES = {
    vision: { name: "Vision Impaired Mode", sub: "Larger text, high contrast, readable font", set: { fs: 3, flags: ["contrast", "readable"] } },
    seizure: { name: "Seizure Safe Profile", sub: "Stops motion and reduces color", set: { fs: null, flags: ["noanim", "lowsat"] } },
    adhd: { name: "ADHD Friendly Mode", sub: "Focus mask and no motion", set: { fs: null, flags: ["mask", "noanim"] } }
  };

  var I = {
    person: '<circle cx="12" cy="4.5" r="2.2"/><path d="M4 8.5l8 1.6 8-1.6M12 10.1v4.4M12 14.5l-3.4 6M12 14.5l3.4 6"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    title: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
    font: '<circle cx="12" cy="12" r="9"/><path d="M8.5 16L12 7l3.5 9M9.7 13.5h4.6"/>',
    cursor: '<path d="M6 3l12 8-5.2 1.2L16 19l-2.4 1-3.2-6.6L6 17z"/>',
    spacing: '<path d="M5 4v6M9 4v6M13 4v6M17 4v6M4 15h16M4 15l3-2.5M4 15l3 2.5M20 15l-3-2.5M20 15l-3 2.5"/>',
    left: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>',
    bold: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9.5 7.5h3.2a2.2 2.2 0 0 1 0 4.4H9.5zM9.5 11.9h3.8a2.3 2.3 0 0 1 0 4.6H9.5z"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    contrast: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor"/>',
    mono: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M5.5 8h13M5.5 16h13"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    line: '<rect x="3.5" y="7" width="17" height="10" rx="2" stroke-dasharray="3 3"/>',
    mask: '<path d="M4 7h16M4 17h16M4 12h16" stroke-dasharray="0.1 0"/><path d="M4 4h16M4 20h16"/>',
    read: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
    img: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 16l5-5 4 4 3-3 5 5M4 4l16 16"/>',
    stop: '<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v4.5h4.5"/>'
  };
  function icon(name, size) { return '<svg viewBox="0 0 24 24" width="' + (size || 26) + '" height="' + (size || 26) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[name] + "</svg>"; }

  // ----- apply -----
  var fontLink = null, lineEl, maskTop, maskBot, speaking = false;
  function ensureFont() {
    if (fontLink) return;
    fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap";
    document.head.appendChild(fontLink);
  }
  function apply() {
    FLAGS.forEach(function (k) { doc.classList.toggle("a11y-" + k, !!state.f[k]); });
    var pct = FS[Math.max(0, Math.min(FS.length - 1, FS_DEFAULT + state.fs))];
    doc.classList.toggle("a11y-fs", pct !== 100);
    doc.style.setProperty("--a11y-fs", pct + "%");
    var lh = LH[Math.max(0, Math.min(LH.length - 1, state.lh))];
    doc.classList.toggle("a11y-lh", !!lh);
    if (lh) doc.style.setProperty("--a11y-lh", lh);
    if (state.f.readable) ensureFont();
    var fl = [];
    if (state.f.dark) fl.push("invert(1) hue-rotate(180deg)");
    if (state.f.contrast) fl.push("contrast(1.45)");
    if (state.f.mono) fl.push("grayscale(1)");
    if (state.f.lowsat) fl.push("saturate(.35)");
    // Filters go on the page sections, not on <html>, so the fixed button and panel keep their place.
    doc.classList.toggle("a11y-filter", fl.length > 0);
    if (fl.length) doc.style.setProperty("--a11y-filter", fl.join(" ")); else doc.style.removeProperty("--a11y-filter");
    if (lineEl) lineEl.hidden = !state.f.line;
    if (maskTop) { maskTop.hidden = maskBot.hidden = !state.f.mask; }
    syncUI();
  }
  function placeReading(y) {
    if (lineEl && state.f.line) lineEl.style.top = y - 2 + "px";
    if (maskTop && state.f.mask) { var band = 64; maskTop.style.height = Math.max(0, y - band) + "px"; maskBot.style.top = y + band + "px"; }
  }

  // ----- UI -----
  var btn, panel, closeBtn, tiles = {}, stepFs, stepLh;
  function build() {
    var root = document.createElement("div");
    root.className = "a11y-root";
    root.innerHTML =
      '<button type="button" class="a11y-btn" aria-label="Accessibility options" aria-haspopup="dialog" aria-expanded="false">' + icon("person", 30) + "</button>" +
      '<div class="a11y-panel" role="dialog" aria-modal="true" aria-labelledby="a11y-title" hidden>' +
        '<div class="a11y-head"><button type="button" class="a11y-x" aria-label="Close accessibility options">' + icon("close", 22) + "</button>" +
          '<div class="a11y-badge">' + icon("person", 30) + '</div><h2 id="a11y-title">Accessibility Adjustments</h2>' +
          '<button type="button" class="a11y-reset">' + icon("reset", 16) + " Reset all</button></div>" +
        '<div class="a11y-body">' +
          '<section class="a11y-card"><h3>Accessibility profiles</h3><div class="a11y-profiles"></div></section>' +
          '<section class="a11y-card"><h3>Content adjustments</h3>' +
            '<div class="a11y-stepper" data-k="fs"><span class="a11y-sl">Font Size</span><div><button type="button" class="a11y-step" data-d="1" aria-label="Increase font size">' + icon("plus", 22) + '</button><output aria-live="polite"></output><button type="button" class="a11y-step" data-d="-1" aria-label="Decrease font size">' + icon("minus", 22) + "</button></div></div>" +
            '<div class="a11y-stepper" data-k="lh"><span class="a11y-sl">Line Height</span><div><button type="button" class="a11y-step" data-d="1" aria-label="Increase line height">' + icon("plus", 22) + '</button><output aria-live="polite"></output><button type="button" class="a11y-step" data-d="-1" aria-label="Decrease line height">' + icon("minus", 22) + "</button></div></div>" +
            '<div class="a11y-grid" data-g="content"></div></section>' +
          '<section class="a11y-card"><h3>Color adjustments</h3><div class="a11y-grid" data-g="color"></div></section>' +
          '<section class="a11y-card"><h3>Orientation</h3><div class="a11y-grid" data-g="orient"></div></section>' +
          '<p class="a11y-note">Your choices are saved on this device only. If something on this site is hard to use, call or text (715) 308-1833 and we will help.</p>' +
        "</div></div>";
    document.body.appendChild(root);
    btn = root.querySelector(".a11y-btn"); panel = root.querySelector(".a11y-panel"); closeBtn = root.querySelector(".a11y-x");
    stepFs = root.querySelector('[data-k="fs"] output'); stepLh = root.querySelector('[data-k="lh"] output');

    var groups = {
      content: [["links", "link", "Highlight Links"], ["titles", "title", "Highlight Titles"], ["readable", "font", "Readable Font"], ["cursor", "cursor", "Big Cursor"], ["spacing", "spacing", "Letter Spacing"], ["left", "left", "Align Text Left"], ["bold", "bold", "Bold Text"]],
      color: [["dark", "moon", "Dark Contrast"], ["contrast", "contrast", "High Contrast"], ["mono", "mono", "Monochrome"], ["lowsat", "drop", "Low Saturation"]],
      orient: [["line", "line", "Reading Line"], ["mask", "mask", "Reading Mask"], ["reading", "read", "Read Page"], ["noimg", "img", "Hide Images"], ["noanim", "stop", "Stop Animations"]]
    };
    Object.keys(groups).forEach(function (g) {
      var host = root.querySelector('[data-g="' + g + '"]');
      groups[g].forEach(function (t) {
        if (t[0] === "reading" && !("speechSynthesis" in window)) return;
        var b = document.createElement("button");
        b.type = "button"; b.className = "a11y-tile"; b.setAttribute("aria-pressed", "false"); b.dataset.k = t[0];
        b.innerHTML = '<span class="a11y-ic">' + icon(t[1], 26) + "</span><span>" + t[2] + "</span>";
        host.appendChild(b); tiles[t[0]] = b;
      });
    });
    var ph = root.querySelector(".a11y-profiles");
    Object.keys(PROFILES).forEach(function (k) {
      var p = PROFILES[k], b = document.createElement("button");
      b.type = "button"; b.className = "a11y-prof"; b.setAttribute("role", "switch"); b.setAttribute("aria-checked", "false"); b.dataset.p = k;
      b.innerHTML = "<span><b>" + p.name + "</b><small>" + p.sub + '</small></span><i class="a11y-sw" aria-hidden="true"></i>';
      ph.appendChild(b); tiles["p_" + k] = b;
    });

    lineEl = document.createElement("div"); lineEl.className = "a11y-line"; lineEl.hidden = true;
    maskTop = document.createElement("div"); maskTop.className = "a11y-mask a11y-mask-t"; maskTop.hidden = true;
    maskBot = document.createElement("div"); maskBot.className = "a11y-mask a11y-mask-b"; maskBot.hidden = true;
    document.body.appendChild(lineEl); document.body.appendChild(maskTop); document.body.appendChild(maskBot);
    placeReading(window.innerHeight * 0.4);

    btn.addEventListener("click", function () { open(true); });
    closeBtn.addEventListener("click", function () { open(false); });
    root.querySelector(".a11y-reset").addEventListener("click", reset);
    panel.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t) return;
      if (t.dataset.k) toggle(t.dataset.k);
      else if (t.dataset.p) profile(t.dataset.p);
      else if (t.classList.contains("a11y-step")) { var k = t.closest(".a11y-stepper").dataset.k, d = +t.dataset.d; step(k, d); }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) open(false); });
    document.addEventListener("pointermove", function (e) { placeReading(e.clientY); }, { passive: true });
    document.addEventListener("touchmove", function (e) { if (e.touches[0]) placeReading(e.touches[0].clientY); }, { passive: true });
  }
  function open(on) {
    panel.hidden = !on; btn.setAttribute("aria-expanded", String(on));
    document.documentElement.classList.toggle("a11y-open", on);
    if (on) closeBtn.focus(); else btn.focus();
  }
  function syncUI() {
    Object.keys(tiles).forEach(function (k) {
      if (k.indexOf("p_") === 0) { var on = !!state.f["p_" + k.slice(2)]; tiles[k].setAttribute("aria-checked", String(on)); tiles[k].classList.toggle("on", on); }
      else { var on2 = !!state.f[k]; tiles[k].setAttribute("aria-pressed", String(on2)); tiles[k].classList.toggle("on", on2); }
    });
    if (stepFs) stepFs.textContent = state.fs === 0 ? "Default" : (state.fs > 0 ? "+" : "") + state.fs;
    if (stepLh) stepLh.textContent = state.lh === 0 ? "Default" : "Level " + state.lh;
  }
  function toggle(k) {
    state.f[k] = !state.f[k];
    if (k === "reading") { if (state.f.reading) readPage(); else stopReading(); }
    save(); apply();
  }
  function step(k, d) {
    if (k === "fs") state.fs = Math.max(-FS_DEFAULT, Math.min(FS.length - 1 - FS_DEFAULT, state.fs + d));
    else state.lh = Math.max(0, Math.min(LH.length - 1, state.lh + d));
    save(); apply();
  }
  function profile(k) {
    var p = PROFILES[k], on = !state.f["p_" + k];
    state.f["p_" + k] = on;
    p.set.flags.forEach(function (f) { state.f[f] = on; });
    if (p.set.fs !== null) state.fs = on ? p.set.fs : 0;
    save(); apply();
  }
  function reset() {
    stopReading(); state = { fs: 0, lh: 0, f: {} }; save(); apply();
  }
  function readPage() {
    if (!("speechSynthesis" in window)) return;
    stopReading(true);
    var main = document.querySelector("main") || document.body;
    var text = (main.innerText || "").replace(/\s+\n/g, "\n");
    var parts = text.split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
    speaking = true;
    parts.forEach(function (s, i) {
      var u = new SpeechSynthesisUtterance(s); u.lang = "en-US";
      if (i === parts.length - 1) u.onend = function () { speaking = false; state.f.reading = false; save(); apply(); };
      window.speechSynthesis.speak(u);
    });
  }
  function stopReading(keep) { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); speaking = false; }

  function start() { build(); apply(); if (state.f.reading) { state.f.reading = false; save(); apply(); } }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
