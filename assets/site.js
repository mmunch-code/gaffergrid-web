// Fælles for alle sider: knappen mørk/lys i toppen. Følger systemet, til man selv vælger; valget huskes kun i browseren.
(() => {
  const root = document.documentElement, mq = matchMedia("(prefers-color-scheme: dark)");
  const now = () => root.dataset.theme || (mq.matches ? "dark" : "light");
  const show = () => { root.dataset.themeNow = now(); document.querySelectorAll("meta[name=theme-color]").forEach((m) => { if (root.dataset.theme) m.content = now() === "dark" ? "#0c0d0f" : "#fbfbfc"; }); };
  show(); mq.addEventListener?.("change", show);
  document.querySelectorAll("[data-theme-toggle]").forEach((b) => b.addEventListener("click", () => {
    root.dataset.theme = now() === "dark" ? "light" : "dark";
    try { localStorage.setItem("gg-site-theme", root.dataset.theme); } catch (e) {}
    show(); document.dispatchEvent(new CustomEvent("gg-theme"));
  }));
})();

// Blød scroll (Marcus 29. okt): interne #-links, trinrækken og logoet glider roligt fra det ene sted til det næste (ease-in-out,
// 600–900 ms efter afstanden), så man mærker rækkefølgen. Bjælken i toppen står stille under en automatisk scroll (dukker aldrig
// op midt i den). Hjul, touch, taster eller et klik afbryder. Med "reducér bevægelse" hopper siden direkte.
// window.GGScroll.to(mål, { done }) bruges også af launch.js (knappen "Mac App Store" i toppen).
(() => {
  const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let raf = 0, onEnd = null;
  const S = { busy: false };
  const end = () => { S.busy = false; document.documentElement.classList.remove("gg-autoscroll"); dispatchEvent(new Event("gg-scroll-end")); };
  const stop = () => { if (!S.busy) return; cancelAnimationFrame(raf); raf = 0; end(); onEnd = null; };
  const yOf = (el) => {
    if (typeof el === "number") return el;
    const pad = parseFloat(getComputedStyle(el).scrollMarginTop) || parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    return el.getBoundingClientRect().top + scrollY - pad;
  };
  S.to = (target, o = {}) => {
    stop();
    const max = document.documentElement.scrollHeight - innerHeight, y1 = Math.max(0, Math.min(max, Math.round(yOf(target)))), y0 = scrollY, dy = y1 - y0;
    if (still() || Math.abs(dy) < 2) { scrollTo({ top: y1, behavior: "instant" }); dispatchEvent(new Event("gg-scroll-end")); o.done?.(); return; }
    const dur = Math.min(900, 600 + Math.sqrt(Math.abs(dy)) * 4.5), t0 = performance.now();
    S.busy = true; onEnd = o.done || null; document.documentElement.classList.add("gg-autoscroll");
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      scrollTo({ top: y0 + dy * ease(k), behavior: "instant" });
      if (k < 1) raf = requestAnimationFrame(step);
      else { raf = 0; end(); const f = onEnd; onEnd = null; f?.(); }
    };
    raf = requestAnimationFrame(step);
  };
  const cut = () => stop();
  ["wheel", "touchstart", "pointerdown", "keydown"].forEach((ev) => addEventListener(ev, cut, { passive: true, capture: true }));
  // Alle interne #-links på samme side (ikke dem, der har deres egen handling, fx [data-join])
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.('a[href*="#"]'); if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.hasAttribute("data-join")) return;
    const u = new URL(a.href, location.href); if (u.pathname !== location.pathname || u.origin !== location.origin || !u.hash) return;
    const el = document.getElementById(decodeURIComponent(u.hash.slice(1))); if (!el) return;
    e.preventDefault();
    if (u.hash !== location.hash) history.pushState(null, "", u.hash);
    S.to(el, { done: () => { if (el.matches("main, section")) { el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); } } });
  });
  window.GGScroll = S;
})();

// Toppen: glas-pillen (4. nov); glider væk, når man ruller ned, og kommer tilbage, når man ruller op.
// Under en automatisk scroll (GGScroll) står bjælken stille. Logoet på forsiden glider tilbage til toppen med samme bevægelse.
(() => {
  const top = document.querySelector(".top"); if (!top) return;
  // 4. nov (Marcus): glas-pillen hele tiden, og den følger altid med (skjules aldrig ved rul eller i rejsen)
  top.classList.add("glass");
  // Rul ned: væk; rul op (eller øverst på siden): tilbage. Under en automatisk scroll (GGScroll) står den stille.
  let last = scrollY, raf = 0;
  const upd = () => {
    raf = 0; const y = scrollY;
    if (window.GGScroll?.busy) { last = y; return; }
    if (y < 40 || y < last - 4) top.classList.remove("gone");
    else if (y > last + 4) top.classList.add("gone");
    if (Math.abs(y - last) > 4 || y < 40) last = y;
  };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
  top.addEventListener("focusin", () => top.classList.remove("gone"));
  document.querySelectorAll(".brand").forEach((brand) => brand.addEventListener("click", (e) => {
    if (new URL(brand.href, location.href).pathname !== location.pathname) return;
    e.preventDefault(); brand.blur();
    if (location.hash) history.pushState(null, "", location.pathname);
    window.GGScroll.to(0);
  }));
})();
