// Gitterlys: prikkerne i et gitter lyser op i varm hvid, hvor markøren bevæger sig hen, og falmer langsomt bagefter som et spor.
// Ingen stor glød, kun gitteret selv. På touch lyser det, hvor man trykker. Med "reducér bevægelse" gør det ingenting.
// Selvstændigt modul uden afhængigheder, så det kan genbruges i appen:
//   const gl = GitterLys.start({ host, cell: 26, offset: () => ({ x: 1, y: 1 }), color: "rgba(241,217,168,1)" });
//   gl.setColor(farve)   gl.stop()
// host: elementet, lærredet lægges i (position: fixed/absolute, fylder host). cell: gitterets afstand i px.
// offset(): hvor den første prik ligger (px, i hosts koordinater), så lyset rammer de prikker, CSS'en tegner.
(function () {
  function start(o = {}) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return { stop() {}, setColor() {} };
    const host = o.host || document.body, cell = o.cell || 26, R = o.radius || 92, LIFE = o.life || 1400, MAXA = o.alpha ?? 0.9;
    const offset = o.offset || (() => ({ x: 1, y: 1 }));
    let color = o.color || "rgb(241,217,168)";
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    host.appendChild(cv);
    const cx = cv.getContext("2d");
    let W = 0, H = 0, dpr = 1, pts = [], raf = 0, last = null;
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = host.clientWidth; H = host.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const ro = new ResizeObserver(size); ro.observe(host);
    const add = (x, y, s = 1) => { const r = host.getBoundingClientRect(); pts.push({ x: x - r.left, y: y - r.top, t: performance.now(), s }); if (pts.length > 60) pts.shift(); if (!raf) raf = requestAnimationFrame(draw); };
    function draw(now) {
      raf = 0; cx.clearRect(0, 0, W, H);
      pts = pts.filter((p) => now - p.t < LIFE * p.s);
      if (!pts.length) return;
      const off = offset(), lit = new Map();
      for (const p of pts) {
        const age = (now - p.t) / (LIFE * p.s), fade = (1 - age) * (1 - age), rr = R * p.s;
        const i0 = Math.ceil((p.x - rr - off.x) / cell), i1 = Math.floor((p.x + rr - off.x) / cell);
        const j0 = Math.ceil((p.y - rr - off.y) / cell), j1 = Math.floor((p.y + rr - off.y) / cell);
        for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
          const dx = off.x + i * cell - p.x, dy = off.y + j * cell - p.y, d = Math.hypot(dx, dy) / rr;
          if (d >= 1) continue;
          const v = (1 - d) * (1 - d) * fade, k = i + "," + j;
          if (v > (lit.get(k) || 0)) lit.set(k, v);
        }
      }
      cx.fillStyle = color;
      for (const [k, v] of lit) {
        const [i, j] = k.split(",").map(Number);
        cx.globalAlpha = Math.min(1, v) * MAXA;
        cx.beginPath(); cx.arc(off.x + i * cell, off.y + j * cell, 0.9 + 0.9 * v, 0, Math.PI * 2); cx.fill();
      }
      cx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    const move = (e) => {
      if (e.pointerType === "touch") return;
      if (last && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 5) return;
      last = { x: e.clientX, y: e.clientY }; add(e.clientX, e.clientY);
    };
    const down = (e) => { if (e.pointerType === "touch") add(e.clientX, e.clientY, 1.5); };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down, { passive: true });
    return {
      setColor(c) { color = c; },
      stop() { removeEventListener("pointermove", move); removeEventListener("pointerdown", down); ro.disconnect(); cancelAnimationFrame(raf); cv.remove(); },
    };
  }
  window.GitterLys = { start };
})();
