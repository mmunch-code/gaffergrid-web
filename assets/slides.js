// Rejsen gennem fanerne som slides (Marcus 3. nov: "super clean og lige hvad jeg forestillede mig – bare hvor det interaktive"):
// samme stil som appens intro-slides (gaffergrid-ft/web/intro.js): ét trin ad gangen, centreret, en lille etiket ("2 · Light"),
// én overskrift, én linje og en levende demo. Trinbjælken (.rail) hænger øverst, mens man er i rejsen, markerer trinnet og hopper
// ved klik. Nederst: Tilbage (rund ikon-knap), prikkerne og Næste (lys knap). ← → og swipe skifter trin; hvert trin har sit link (#light …).
// Uden JS står trinene under hinanden som før.
(function () {
  const steps = [...document.querySelectorAll("section.step")];
  const journey = document.getElementById("how");
  if (steps.length < 2 || !journey) return;
  const DA = document.documentElement.lang === "da";
  const T = DA ? { back: "Tilbage", next: "Næste", end: "Se priserne", go: (n) => `Gå til trin ${n}`, nav: "Trin" }
    : { back: "Back", next: "Next", end: "See pricing", go: (n) => `Go to step ${n}`, nav: "Steps" };
  const ids = steps.map((s) => s.id);
  const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("deck-on");

  // Bunden: Tilbage · prikker · Næste
  const BACK = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 4.5 L6.5 10 L12 15.5"/></svg>';
  const nav = document.createElement("nav");
  nav.className = "deck-nav"; nav.setAttribute("aria-label", T.nav);
  nav.innerHTML = `<button type="button" class="deck-back" aria-label="${T.back}" title="${T.back}">${BACK}</button>` +
    `<span class="deck-dots">${steps.map((s, i) => `<button type="button" class="deck-dot" data-go="${i}" aria-label="${T.go(i + 1)}"></button>`).join("")}</span>` +
    `<button type="button" class="btn solid deck-next">${T.next}</button>`;
  steps[steps.length - 1].after(nav);

  let cur = Math.max(0, ids.indexOf(location.hash.slice(1)));
  function go(i, opt = {}) {
    i = Math.max(0, Math.min(steps.length - 1, i));
    const dir = i >= cur ? 1 : -1; cur = i;
    steps.forEach((s, k) => { const on = k === i; s.classList.toggle("on", on); s.toggleAttribute("inert", !on); s.setAttribute("aria-hidden", String(!on)); if (on && !still()) { s.classList.remove("in-l", "in-r"); void s.offsetWidth; s.classList.add(dir > 0 ? "in-r" : "in-l"); } });
    nav.querySelectorAll(".deck-dot").forEach((d, k) => (k === i ? d.setAttribute("aria-current", "step") : d.removeAttribute("aria-current")));
    journey.querySelectorAll(".rail a").forEach((a, k) => (k === i ? a.setAttribute("aria-current", "step") : a.removeAttribute("aria-current")));
    nav.querySelector(".deck-back").hidden = i === 0;
    nav.querySelector(".deck-next").textContent = i === steps.length - 1 ? T.end : T.next;
    if (opt.hash !== false) history.replaceState(null, "", "#" + ids[i]);
    // Rul kun, hvis trinnet ikke allerede står i billedet (4. nov: ellers hopper siden ved hvert skift)
    if (opt.scroll) { const r = steps[i].getBoundingClientRect(); if (r.top < 0 || r.top > innerHeight * 0.35) steps[i].scrollIntoView({ behavior: still() ? "auto" : "smooth", block: "start" }); }
    // Demoerne, der hører til trinnet, tegnes om (fx Levering med dit kamera, dine lamper og dine faser)
    document.dispatchEvent(new CustomEvent("gg-step", { detail: { id: ids[i], i } }));
    window.dispatchEvent(new Event("resize")); // demoerne måler deres bredde, når de bliver synlige
  }
  const next = () => (cur === steps.length - 1 ? document.getElementById("founding")?.scrollIntoView({ behavior: still() ? "auto" : "smooth" }) : go(cur + 1, { scroll: true }));
  nav.addEventListener("click", (e) => {
    const d = e.target.closest("[data-go]"); if (d) return go(+d.dataset.go, { scroll: true });
    if (e.target.closest(".deck-back")) return go(cur - 1, { scroll: true });
    if (e.target.closest(".deck-next")) return next();
  });
  // Trinbjælken og alle links til et trin (#frame, #light …) skifter trin i stedet for at rulle
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.('a[href^="#"]'); if (!a) return;
    const k = ids.indexOf(a.getAttribute("href").slice(1)); if (k < 0) return;
    e.preventDefault(); go(k, { scroll: true });
  });
  window.addEventListener("hashchange", () => { const k = ids.indexOf(location.hash.slice(1)); if (k >= 0 && k !== cur) go(k, { scroll: true, hash: false }); });
  // ← → når rejsen er i billedet (og man ikke skriver i et felt eller trækker i en demo med piletasterne)
  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    if (e.target.closest?.("input, textarea, select, [contenteditable], svg, [data-cam-demo], [data-light-demo], [data-power-demo]")) return;
    const r = journey.getBoundingClientRect(), rs = steps[cur].getBoundingClientRect();
    if (rs.bottom < 80 || r.top > innerHeight * 0.6) return;
    e.preventDefault(); go(cur + (e.key === "ArrowRight" ? 1 : -1));
  });
  // Swipe: kun på overskriften og bunden, så trækket i demoerne (kamera, lampe) stadig virker
  let sx = null, sy = 0;
  const zone = (t) => t.closest?.(".step-head, .deck-nav");
  document.addEventListener("touchstart", (e) => { if (e.touches.length !== 1 || !zone(e.target)) { sx = null; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  document.addEventListener("touchend", (e) => {
    if (sx == null) return; const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // Trinbjælken hænger øverst, mens man er i rejsen
  // Bunden og den hængende trinbjælke kun, mens man er i rejsen (ikke over toppen af siden eller priserne)
  // 4. nov: afgøres af rejsens placering ved hvert rul (IntersectionObserver gik glip af hop, fx et link direkte til priserne)
  const inJourney = () => { const r = steps[cur].getBoundingClientRect(), m = innerHeight / 2; const on = r.top < m && r.bottom > m * 0.6; journey.classList.toggle("pinned", on); document.documentElement.classList.toggle("deck-in", on); };
  let rq = 0; const tick = () => { if (!rq) rq = requestAnimationFrame(() => { rq = 0; inJourney(); }); };
  addEventListener("scroll", tick, { passive: true }); addEventListener("resize", tick); document.addEventListener("gg-step", tick);

  // Alle trin får samme højde som det højeste (4. nov, Marcus): bunden med Næste står samme sted, så man kan klikke sig igennem
  function measure() {
    const root = document.documentElement; root.style.removeProperty("--deck-h");
    if (!matchMedia("(min-width: 980px)").matches) return;
    let m = 0;
    steps.forEach((st) => {
      const on = st.classList.contains("on");
      if (!on) { st.style.cssText = "display:block;visibility:hidden;position:absolute;left:0;right:0;animation:none"; st.classList.add("on"); }
      m = Math.max(m, st.offsetHeight);
      if (!on) { st.classList.remove("on"); st.style.cssText = ""; }
    });
    if (m) root.style.setProperty("--deck-h", m + "px");
  }
  let mq = 0; const remeasure = () => { clearTimeout(mq); mq = setTimeout(measure, 150); };
  addEventListener("resize", remeasure); document.fonts?.ready.then(measure); addEventListener("load", measure); document.addEventListener("gg-shots", remeasure);
  go(cur, { hash: ids.includes(location.hash.slice(1)) });
  if (ids.includes(location.hash.slice(1))) requestAnimationFrame(() => steps[cur].scrollIntoView({ block: "start" }));
})();
