// Forsiden: App Store-knapperne, launchmåneden, gitteret i baggrunden (parallax og gitterlys), rolig fremtoning ved scroll
// og trinrækken. Ventelisten er fjernet 29. okt (site/uden-venteliste): siden går online samme dag som appen.
(() => {
  // ---------- Ret her ----------
  // >>> PÅ LAUNCHDAGEN (Marcus/Thomas): indsæt appens App Store-link i STORE herunder. Det er den eneste linje, der skal rettes.
  //     Fx  const STORE = "https://apps.apple.com/app/gaffergrid/id0000000000";
  //     Så bliver alle knapperne "Download on the Mac App Store" / "Hent i Mac App Store" og peger dertil, overlinjen siger
  //     "Out now", og "Get in touch" ved siden af forsvinder. Tom = knapperne viser "Coming to the Mac App Store in November".
  // 4. nov: kontakten ligger nu i launch.mjs (siden bygges færdig med den); her læses den fra <html data-store>
  const STORE = document.documentElement.dataset.store || "";
  // Marcus 27. okt: kun måneden, ingen dato og ingen nedtælling (bruges i overlinjen, så længe STORE er tom).
  const LAUNCH_MONTH = { da: "november 2026", en: "November 2026" };

  const DA = document.documentElement.lang.startsWith("da");
  const T = DA ? { soon: (d) => `Lancering ${d} · Mac App Store`, out: "Ude nu på Mac App Store" }
    : { soon: (d) => `Launching ${d} · Mac App Store`, out: "Out now on the Mac App Store" };
  const $ = (q, el = document) => el.querySelector(q), $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Overlinjen i hero ----------
  const label = $("[data-launch-label]");
  if (label) label.textContent = STORE ? T.out : T.soon(LAUNCH_MONTH[DA ? "da" : "en"]);

  // ---------- App Store-knapperne: siden er bygget med "kommer"-udgaven; med STORE bliver de rigtige links ----------
  if (STORE) {
    $$("[data-store]").forEach((el) => { // 4. nov: knappen er allerede et link; kun adressen og teksten til skærmlæsere skifter
      el.href = STORE; el.rel = "noopener"; el.setAttribute("aria-label", `${el.dataset.pre} Mac App Store`);
    });
    $$("[data-store-touch]").forEach((el) => el.remove());
  }

  // ---------- Knappen i toppen ("Mac App Store"): til App Store-knappen i hero, eller direkte til App Store ----------
  $$("[data-join]").forEach((a) => {
    if (STORE) { a.href = STORE; a.rel = "noopener"; return; }
    a.addEventListener("click", (e) => {
      const hero = $("#join"); if (!hero) return;
      e.preventDefault();
      if (window.GGScroll) GGScroll.to(hero); else hero.scrollIntoView({ block: "start" });
    });
  });

  // ---------- Gitteret i baggrunden: glider lidt langsommere end siden, og prikkerne lyser op, hvor markøren går (gitterlys.js) ----------
  const bg = $(".bg");
  if (bg && !still()) {
    let py = 0, raf = 0;
    const tick = () => { raf = 0; py = -scrollY * 0.12; bg.style.setProperty("--py", py.toFixed(1) + "px"); };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true }); tick();
    if (window.GitterLys) {
      const lit = () => getComputedStyle(bg).getPropertyValue("--dot-lit").trim() || "rgb(241,217,168)";
      // .bg-grid ligger 140 px over skærmen (parallax), og prikken sidder 1 px inde i hvert felt på 26 px
      const gl = GitterLys.start({ host: bg, cell: 26, offset: () => ({ x: 1, y: -139 + py }), color: lit() });
      document.addEventListener("gg-theme", () => gl.setColor(lit()));
      matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => gl.setColor(lit()));
    }
  }

  // ---------- Spørgsmålene (Marcus 4. nov): åbner og lukker blødt, og det forrige lukker, når man åbner et nyt ----------
  const faqs = $$(".faq details"), want = new Map(faqs.map((d) => [d, d.open])), run = new Map();
  function slide(d, open) {
    if (still()) { d.open = open; return; }
    const s = d.querySelector("summary"), from = d.getBoundingClientRect().height; run.get(d)?.cancel();
    d.open = true; d.style.overflow = "hidden";
    const to = open ? d.getBoundingClientRect().height : s.getBoundingClientRect().height + 1; // + kanten forneden
    const a = d.animate({ height: [from + "px", to + "px"] }, { duration: 380, easing: "cubic-bezier(.22, 1, .36, 1)" }); run.set(d, a);
    a.onfinish = () => { run.delete(d); d.style.overflow = ""; if (!open) d.open = false; };
  }
  faqs.forEach((d) => d.querySelector("summary").addEventListener("click", (e) => {
    e.preventDefault(); const open = !want.get(d); want.set(d, open); slide(d, open);
    if (open) faqs.forEach((o) => { if (o !== d && want.get(o)) { want.set(o, false); slide(o, false); } });
  }));

  // ---------- Den svævende knap (29. okt): vises, når man har scrollet forbi hero, og skjules ved priserne, FAQ'en og
  // tilmeldingen nederst, så den aldrig dækker formularen eller prisen. Ingen bjælke, kun en lille pille. ----------
  const fl = $("[data-float]"); // fjernet fra forsiden 29. okt (site/clean); koden bliver, hvis den skal tilbage
  if (fl && "IntersectionObserver" in window) {
    const watch = ["#join", "#founding", "#faq", "#join-end", ".foot"].map((q) => $(q)).filter(Boolean), vis = new Set();
    const upd = () => fl.classList.toggle("on", vis.size === 0 && scrollY > 200);
    const io2 = new IntersectionObserver((es) => { es.forEach((x) => (x.isIntersecting ? vis.add(x.target) : vis.delete(x.target))); upd(); }, { rootMargin: "0px 0px -10% 0px" });
    watch.forEach((el) => io2.observe(el));
  }

  // ---------- Rolig fremtoning ved scroll ----------
  if ("IntersectionObserver" in window && !still()) {
    const els = $$(".step, .journey .head, .rail, .sec .head, .plans");
    document.documentElement.classList.add("anim");
    const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => io.observe(el));
  }
  // ---------- Trinrækken (29. okt): en tynd streg under det aktive trin glider med, mens man ruller gennem trinene ----------
  const rail = $(".rail");
  if (rail) {
    const links = $$("a[href^=\"#\"]", rail), steps = links.map((a) => document.getElementById(a.hash.slice(1)));
    const mark = document.createElement("span"); mark.className = "rail-mark"; mark.setAttribute("aria-hidden", "true"); rail.appendChild(mark);
    let cur = -1, raf = 0;
    const place = () => {
      if (document.documentElement.classList.contains("deck-on")) { mark.classList.remove("on"); return; } // slides.js markerer trinnet
      links.forEach((a, i) => (i === cur ? a.setAttribute("aria-current", "step") : a.removeAttribute("aria-current")));
      mark.classList.toggle("on", cur >= 0); if (cur < 0) return;
      const a = links[cur], lab = a.querySelector("span:last-child") || a, r = rail.getBoundingClientRect(), b = a.getBoundingClientRect(), q = lab.getBoundingClientRect();
      mark.style.width = (q.right - b.left) + "px"; mark.style.transform = `translate(${b.left - r.left}px, ${b.bottom - r.top}px)`;
    };
    const pick = () => {
      raf = 0; if (window.GGScroll?.busy) return; // under en automatisk scroll står stregen på målet
      if (document.documentElement.classList.contains("deck-on")) return; // rejsen som slides (slides.js) markerer selv trinnet
      const line = innerHeight * 0.45; let k = -1;
      steps.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= line) k = i; });
      const endEl = $("#founding"); if (endEl && endEl.getBoundingClientRect().top <= line) k = -1;
      if (k !== cur) { cur = k; place(); }
    };
    rail.addEventListener("click", (e) => { const a = e.target.closest("a"); if (!a) return; const i = links.indexOf(a); if (i >= 0) { cur = i; place(); } });
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(pick); }, { passive: true });
    addEventListener("gg-scroll-end", pick); addEventListener("resize", place); pick();
  }
})();

// Founding-prisens nedtælling (Marcus 4. nov): "Slutter 31. dec. 2026 · 57 dage tilbage". Efter datoen står kun slutdatoen.
(() => {
  document.querySelectorAll("[data-until]").forEach((el) => {
    const end = new Date(el.dataset.until + "T23:59:59"), d = Math.ceil((end - Date.now()) / 864e5);
    if (d > 0 && d <= 400) { const b = document.createElement("b"); b.textContent = ` · ${d} ${d === 1 ? el.dataset.left1 : el.dataset.left}`; el.append(b); }
  });
})();

// Priserne fører til App Store (Marcus 4. nov): med STORE bliver hver plan et klikbart kort, der åbner appens side.
(() => {
  const btn = document.querySelector("[data-store]"), url = btn && /^https?:/.test(btn.getAttribute("href") || "") ? btn.href : "";
  if (!url) return;
  document.querySelectorAll(".plans .plan").forEach((p) => {
    p.classList.add("go"); p.tabIndex = 0; p.setAttribute("role", "link");
    const go = () => window.open(url, "_blank", "noopener");
    p.addEventListener("click", go); p.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
  });
})();
