// Åbningen ved hver indlæsning (29. okt nat; hver gang fra 4. nov): bølger løber gennem prikgitteret fra midten af skærmen og ud, og bølgefronten afslører siden.
// Siden ligger klar under hele tiden (et lag ovenpå, der aldrig fanger klik, så LCP ikke venter). Ved hver indlæsning
// (sat af scriptet i <head>, se build.mjs; også ved et dybt link #…), ca. 1,4 s, et klik, en tast eller rul springer over.
// Med "reducér bevægelse" sker intet. Ingen musespor. ?intro i adressen viser den igen.
// Virker scriptet ikke, fader CSS'en laget væk efter 1,9 s (launch.css under "Åbningen").
(() => {
  const root = document.documentElement, box = document.querySelector(".intro");
  if (!box || !root.classList.contains("gg-intro")) { box?.remove(); return; }
  const cover = box.querySelector(".intro-cover"), cv = box.querySelector("canvas"), cx = cv.getContext("2d");
  const dark = (root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";
  const COL = dark ? "241,217,168" : "122,104,74";
  const CELL = 26, OX = 1, OY = -139; // samme prikker som .bg-grid (launch.css)
  const DELAY = 90, WAVE = 1050, FADE = 320;
  let W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Bølgen starter altid midt på skærmen (Marcus 4. nov), uanset layout og hvor man står på siden
  const X0 = W / 2, Y0 = H / 2;
  const RMAX = Math.max(Math.hypot(X0, Y0), Math.hypot(W - X0, Y0), Math.hypot(X0, H - Y0), Math.hypot(W - X0, H - Y0)) + 320;
  cover.style.setProperty("--cx", X0 + "px"); cover.style.setProperty("--cy", Y0 + "px");
  const RIP = [[0, 1], [-120, 0.5], [-240, 0.24]], BW = 30;
  const easeOut = (p) => 1 - Math.pow(1 - p, 2.2);
  let t0 = 0, raf = 0, ending = 0;
  function frame(now) {
    if (!t0) t0 = now;
    const t = now - t0, p = Math.min(1, Math.max(0, (t - DELAY) / WAVE)), r = easeOut(p) * RMAX;
    // Siden toner blødt frem bag bølgen (Marcus 4. nov): en bred overgang (280 px, launch.css) i stedet for et skarpt hul, så midten
    // ikke viser tilfældige stumper af siden
    cover.style.setProperty("--r", (r - 300).toFixed(1) + "px");
    cx.clearRect(0, 0, W, H);
    const fade = t > DELAY + WAVE ? Math.max(0, 1 - (t - DELAY - WAVE) / FADE) : 1;
    if (fade > 0) {
      cx.fillStyle = `rgb(${COL})`;
      const rIn = r + RIP[RIP.length - 1][0] - BW * 2, rOut = r + BW * 2;
      for (let j = Math.floor((-OY) / CELL) - 0; ; j++) {
        const y = OY + j * CELL; if (y > H + 2) break; if (y < -2) continue;
        for (let i = 0; ; i++) {
          const x = OX + i * CELL; if (x > W + 2) break;
          const d = Math.hypot(x - X0, y - Y0); if (d < rIn || d > rOut) continue;
          let v = 0; for (const [o, a] of RIP) { const k = (d - (r + o)) / BW; v += a * Math.exp(-k * k); }
          v = Math.min(1, v) * fade * (1 - 0.35 * (d / RMAX)); if (v < 0.03) continue;
          cx.globalAlpha = v * (dark ? 0.95 : 0.8); cx.beginPath(); cx.arc(x, y, 0.8 + 1.3 * v, 0, 6.2832); cx.fill();
        }
      }
      cx.globalAlpha = 1;
    }
    if (t < DELAY + WAVE + FADE && !ending) raf = requestAnimationFrame(frame); else finish();
  }
  function finish(fast) {
    if (ending) return; ending = 1; cancelAnimationFrame(raf);
    box.style.transition = `opacity ${fast ? 180 : 120}ms ease`; box.style.opacity = "0";
    setTimeout(() => { box.remove(); root.classList.remove("gg-intro"); window.GG_INTRO_DONE = true; document.dispatchEvent(new CustomEvent("gg-intro-done")); }, fast ? 200 : 140);
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach((n) => removeEventListener(n, skip, true));
  }
  const skip = () => finish(true);
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach((n) => addEventListener(n, skip, { capture: true, passive: true }));
  raf = requestAnimationFrame(frame);
})();
