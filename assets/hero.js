// Hero-billedet (Marcus 4. nov aften): et app-vindue, hvor køkkenet fra rejsen bygges op fra bunden, som når man bruger appen:
//   1 tomt gitter → væggene tegnes (rummet med mål)   2 døren, vinduet, bordet og køkkenbordet kommer på   3 Maya (sidder) og Leo i døren
//   4 kameraet sættes → billedfeltet, og vinduet deles: tegningen til venstre, appens stregbillede til højre (før fylder tegningen det hele)   5 key, fill og baglys → strålerne på tegningen, og til højre
//   appens lys-ler tæt på Maya (lamperne ses ikke i billedet)   6 tavlen i gangen, kablerne langs væggene, og til højre strøm-oversigten:
//   L1–L3 fyldes op til OK
//   7 den færdige scene står et par sekunder, toner ud og begynder forfra.
// Alt er en funktion af tiden t (ms), så man kan hoppe: trinnene under vinduet (Rum · Personer · Kamera · Lys · Strøm) viser, hvor
// man er, og hopper dertil. Tegningen er sitets egne plan-dele i rejsens mål; billederne er appens (window.GGApp, hentet af kamera.js,
// når siden er ledig; indtil da sitets skitse). Leret hentes, når lyset kommer første gang (G.loadClay); indtil da stregbilledet.
// Står stille, når vinduet ikke ses, eller fanen er skjult. Med "reducér bevægelse": den færdige scene, og trinnene skifter uden bevægelse.
// Vinduet står let på skrå (launch.css) og retter sig op ved hover og fokus. Vinduet på tegningen findes kun her (natscene: intet lys ind).
(() => {
  const host = document.querySelector("[data-show]"), G = window.GGScene; if (!host || !G) return;
  const DA = document.documentElement.lang.startsWith("da"), LOC = DA ? "da-DK" : "en-GB";
  const { ROOM, CAST, SHOTS, castSVG, chip, rad, deg } = G;
  const T = DA
    ? { title: "Køkken nat · Scene 12", power: "Strøm", distro: "CEE 16 A · 3 faser", ok: "OK · alle faser under 80 %", wait: "Kablerne er ikke lagt", steps: ["Scene", "Kamera", "Lys", "Strøm"], laying: "Kablerne lægges …", total: "I alt", play: "Afspil igen", nav: "Vis et trin i opbygningen", table: "bord", counter: "køkkenbord", mm: "mm" }
    : { title: "Kitchen night · Scene 12", power: "Power", distro: "CEE 16 A · 3-phase", ok: "OK · every phase under 80%", wait: "No cables laid yet", steps: ["Scene", "Camera", "Light", "Power"], laying: "Laying the cables …", total: "Total", play: "Play again", nav: "Show a step of the build", table: "table", counter: "counter", mm: "mm" };
  const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const f1 = (n) => n.toLocaleString(LOC, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const W0 = ROOM.w, D0 = ROOM.d, dr = ROOM.door, A = CAST.Maya, B = SHOTS[0], z = 0.9; // det første shot (12A, 50 mm)
  // Tidslinjen (ms). Trinnene under vinduet samler faserne: Rum = væggene + åbningerne + møblerne (Marcus 4. nov: bord og
  // køkkenbord hører til rummet), Personer = personerne.
  // Kamera = kameraet sættes (cam) og justeres (adj: brændvidden skiftes 24 → 35 → 50 mm, og kameraet drejes, så Maya kommer i
  // midten; Marcus 4. nov: man skal kunne se, at det er let og hurtigt). Lys holder derefter præcis samme frame (12B).
// SP: tempoet (Marcus 4. nov: lidt langsommere gennem fanerne, siden en anelse hurtigere igen: 1,2); alle tider og forsinkelser ganges med det
  const SP = 1.2, PH = Object.fromEntries(Object.entries({ walls: [0, 1800], open: [1800, 1200], furn: [2600, 900], people: [3600, 2400], cam: [6200, 1700], adj: [7900, 2300], light: [10200, 5300], power: [15500, 2600] }).map(([k, v]) => [k, v.map((x) => x * SP)]));
  // Slutningen (Marcus 6. nov: overgangen fra Strøm til starten skal være smooth og clean): den færdige scene står, toner så
  // blødt ud i ét (tegning og panel sammen), og først når alt er væk, samles vinduet igen i stilhed (REST), før rummet tegnes forfra.
  const BUILT = 18100 * SP, HOLD = 3600, FADE = 1400, REST = 1100, TOTAL = BUILT + HOLD + FADE + REST;
  const ADJ_F = [24, 35], ADJ_A = -14; // brændvidderne før 12B's egen, og hvor langt kameraet står drejet, før det rettes ind
  // Glidende (Marcus 4. nov: "ikke hakkende"): brændvidden zoomer jævnt fra 24 mm til 12B's egen (log-skala, som en zoom), og
  // drejningen starter halvvejs i zoomet og glider ud. Linserækken markerer den nærmeste brændvidde.
  const camAt = (t) => { const u = (t - PH.adj[0]) / SP, kz = ease((u - 150) / 1400), ka = ease((u - 800) / 1400);
    const f = ADJ_F[0] * Math.pow(B.f / ADJ_F[0], kz), lens = [...ADJ_F, B.f].reduce((m, x) => (Math.abs(Math.log(x / f)) < Math.abs(Math.log(m / f)) ? x : m));
    return { ...B, f: kz >= 1 ? B.f : f, lens, a: B.a + ADJ_A * (1 - ka), turning: ka > 0 && ka < 1 }; };
  const STEPS = [0, PH.cam[0], PH.light[0], PH.power[0]]; // som appens faner: Scene (rum og personer), Kamera, Lys, Strøm (Marcus 5. nov)
  // Lys (Marcus 4. nov): billedet går først i sort, og så tændes lamperne én ad gangen (key, fill, baglys), hver med en blød fade
  // Marcus 4. nov: "endnu langsommere", og man skal nå at se Maya helt mørk (kun rummets svage lys), før key tændes
  const LIT_DARK = 700, LIT_SEE = 600, LIT_HOLD = 700, LIT_STEP = 1100, LIT_FADE = 1000, LIT_ON = LIT_DARK + LIT_SEE + LIT_HOLD;
  const kLamp = (t, i) => ease((t - PH.light[0] - (LIT_ON + i * LIT_STEP) * SP) / (LIT_FADE * SP));
  // Lag j i billedet: 0 = Maya uden lamper, 1–3 = de første j lamper
  const kLayer = (t, j) => (j ? kLamp(t, j - 1) : ease((t - PH.light[0] - LIT_DARK * SP) / (LIT_SEE * SP)));
  const layerAt = (j) => PH.light[0] + (j ? LIT_ON + (j - 1) * LIT_STEP : LIT_DARK) * SP;
  const p = (t, k, d = 0) => ease((t - PH[k][0] - d * SP) / (PH[k][1] - d * SP)); // fremgang 0–1 i en fase (d: forsinkelse)
  // Lamperne (Rembrandt fra Lys, rejse.js: G.lys) og pendlen; faserne: største lampe først på den mindst belastede, 230 V
  const PRAC = { id: "prac", w: 60, x: 2.6, y: 1.9, prac: true };
  // Lys (Marcus 4. nov): standard 3-punkt hele vejen, intet skift af look
  const lamps = (t) => (G.lys ? G.lys.look("three") : [{ id: "key", w: 300, x: 1.35, y: 2.45, mode: "led" }, { id: "fill", w: 150, x: 3.95, y: 2.4, mode: "led" }, { id: "back", w: 650, x: 1.55, y: 0.3, mode: "led" }]);
  const phases = (L) => { const amp = [0, 0, 0], ph = {}; [...L, PRAC].sort((a, b) => b.w - a.w).forEach((l) => { const k = amp.indexOf(Math.min(...amp)); ph[l.id] = k; amp[k] += l.w / 230; }); return { amp, ph }; };
  const route = (l, i) => {
    const o = i * 0.05, x0 = -0.72 + o, yDoor = 1.32 - o, xIn = 0.1 + o, pts = [[x0, 2.05], [x0, yDoor], [xIn, yDoor]];
    if (l.y < yDoor || l.prac) { const yw = 0.1 + o; pts.push([xIn, yw], [l.x, yw], [l.x, l.y]); } else { const yw = D0 - 0.1 - o; pts.push([xIn, yw], [l.x, yw], [l.x, l.y]); }
    return "M" + pts.map((q) => q.map((v) => v.toFixed(3)).join(",")).join(" L");
  };
  const aim = (l) => deg(Math.atan2(A.y - l.y, A.x - l.x));
  const VB = [-1.05, -0.75, W0 + 1.6, D0 + 1.25];

  // ---------- opbygning ----------
  const dots = '<span class="hs-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
  let grid = '<g class="p-grid">';
  for (let x = Math.ceil(VB[0] * 2) / 2; x <= VB[0] + VB[2]; x += 0.5) grid += `<line x1="${x}" x2="${x}" y1="${VB[1]}" y2="${VB[1] + VB[3]}"/>`;
  for (let y = Math.ceil(VB[1] * 2) / 2; y <= VB[1] + VB[3]; y += 0.5) grid += `<line y1="${y}" y2="${y}" x1="${VB[0]}" x2="${VB[0] + VB[2]}"/>`;
  grid += "</g>";
  host.classList.add("hs3"); host.setAttribute("role", "group");
  host.innerHTML = `
    <div class="hs3-stage"><div class="hs-win hs3-win" aria-hidden="true">
      <div class="hs-bar">${dots}<span class="hs-title">${T.title}</span></div>
      <div class="hs3-main"><div class="hs3-boot" aria-hidden="true"><svg viewBox="0 0 32 32" overflow="visible"><defs><linearGradient id="hs3-bm" gradientUnits="userSpaceOnUse" x1="1" y1="1" x2="31" y2="31"><stop offset="0" stop-color="#fbfbfc"/><stop offset=".38" stop-color="#c9ccd1"/><stop offset=".5" stop-color="#f2f3f5"/><stop offset=".72" stop-color="#a9adb3"/><stop offset="1" stop-color="#e6e8eb"/></linearGradient><mask id="hs3-b0" maskUnits="userSpaceOnUse" x="-2" y="-2" width="36" height="36"><path class="b-draw" pathLength="100" d="M24.465 5.165A13.75 13.75 0 1 0 29.604 14H16" fill="none" stroke="#fff" stroke-width="6"/></mask><mask id="hs3-b1" maskUnits="userSpaceOnUse" x="-2" y="-2" width="36" height="36"><path class="b-draw" pathLength="100" d="M21.695 8.711A9.25 9.25 0 1 0 25.031 18H16" fill="none" stroke="#fff" stroke-width="6"/></mask></defs><path d="M25.235 4.18A15 15 0 1 0 30.644 12.75H17.25V15.25H28.477A12.5 12.5 0 1 1 23.696 6.15Z" fill="url(#hs3-bm)" mask="url(#hs3-b0)"/><path d="M22.464 7.726A10.5 10.5 0 1 0 26.473 16.75H17.25V19.25H23.31A8 8 0 1 1 20.925 9.696Z" fill="url(#hs3-bm)" mask="url(#hs3-b1)"/></svg></div>
        <svg class="pl hs3-plan" viewBox="${VB.join(" ")}"><defs><clipPath id="hs3-rc"><rect width="${W0}" height="${D0}"/></clipPath></defs>${grid}<g class="g-dyn"></g></svg>
        <div class="hs3-view"><svg class="v v-line" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice"></svg>${[0, 1, 2, 3].map((j) => `<svg class="v v-lit l${j}" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice"></svg>`).join("")}<span class="hs3-tag"></span><span class="hs3-lens" aria-hidden="true">${[...ADJ_F, B.f].map((f) => `<i data-lf="${f}">${f}</i>`).join("")}<em>${T.mm}</em></span>
          <div class="hs3-pw"><p class="pw-st"><i></i><b></b></p><p class="pw-sub">${T.distro}</p><div class="phases">${[0, 1, 2].map((i) => `<div class="ph" data-ph="${i}"><span class="ph-n">L${i + 1}</span><span class="ph-bar"><i></i><em></em></span><span class="ph-a"></span></div>`).join("")}</div><p class="pw-tot"></p></div></div>
      </div>
    </div></div>
    <div class="hs3-moments" role="group" aria-label="${T.nav}">${T.steps.map((n, i) => `<button type="button" data-step="${i}" aria-pressed="${i === 0}">${n}</button>`).join("")}<button type="button" class="hs3-play" data-play hidden aria-label="${T.play}" title="${T.play}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5.2 L15 10 L7 14.8 Z"/></svg></button></div>`;
  const win = host.querySelector(".hs3-win"), dyn = host.querySelector(".g-dyn"), view = host.querySelector(".hs3-view"), vLine = host.querySelector(".v-line"), vLits = [...host.querySelectorAll(".v-lit")], vLit = { set innerHTML(v) { vLits.forEach((e) => (e.innerHTML = v)); } }, tag = host.querySelector(".hs3-tag");
  const phEls = [...host.querySelectorAll(".hs3-pw .ph")], okEl = host.querySelector(".pw-st"), totEl = host.querySelector(".pw-tot"), stepBtns = [...host.querySelectorAll("[data-step]")];

  // ---------- tegningen til tiden t ----------
  const op = (v) => `opacity="${Math.max(0, Math.min(1, v)).toFixed(3)}"`;
  const pop = (x, y, k, inner) => (k <= 0 ? "" : `<g ${op(k)} transform="translate(${x} ${y}) scale(${(0.6 + 0.4 * k).toFixed(3)}) translate(${-x} ${-y})">${inner}</g>`);
  function planAt(t, L, P) {
    const C = camAt(t);
    const w = p(t, "walls"), dm = p(t, "walls", 900), o1 = p(t, "open"), o2 = p(t, "open", 400), fu = p(t, "furn"), pe = p(t, "people"), ca = p(t, "cam"), li = p(t, "light"), pw = p(t, "power");
    let s = "";
    if (w > 0) {
      s += `<rect width="${W0}" height="${D0}" class="p-floor" ${op(w)}/><path d="M0,${dr.a} L0,0 L${W0},0 L${W0},${D0} L0,${D0} L0,${dr.b}" pathLength="1" class="p-wall" style="stroke-dasharray:1;stroke-dashoffset:${(1 - w).toFixed(4)}"/>`;
      const fs = (0.17 * z).toFixed(3), y0 = -0.45, x0 = W0 + 0.45;
      if (dm > 0) s += `<g class="p-dim" ${op(dm)}><path d="M0,${y0} H${W0} M0,${y0 - 0.08} V${y0 + 0.08} M${W0},${y0 - 0.08} V${y0 + 0.08} M${x0},0 V${D0} M${x0 - 0.08},0 H${x0 + 0.08} M${x0 - 0.08},${D0} H${x0 + 0.08}"/>` +
        `<rect x="${W0 / 2 - 0.36 * z}" y="${y0 - 0.12 * z}" width="${0.72 * z}" height="${0.24 * z}" class="p-mask"/><text x="${W0 / 2}" y="${y0 + 0.065 * z}" style="font-size:${fs}px">${G.fm(W0, 1)} m</text>` +
        `<g transform="translate(${x0} ${D0 / 2}) rotate(90)"><rect x="${-0.36 * z}" y="${-0.12 * z}" width="${0.72 * z}" height="${0.24 * z}" class="p-mask"/><text y="${0.065 * z}" style="font-size:${fs}px">${G.fm(D0, 1)} m</text></g></g>`;
    }
    // Døren (svinget) og vinduet i højre væg
    const dl = dr.b - dr.a;
    if (o1 > 0) s += `<path d="M0,${dr.a} L${dl},${dr.a} A${dl},${dl} 0 0 1 0,${dr.b}" class="p-door" ${op(o1)}/>`;
    if (o2 > 0) s += `<g class="w-win" ${op(o2)} transform="translate(0 ${((1 - o2) * -0.25).toFixed(3)})"><rect x="${W0 - 0.06}" y="1.55" width=".12" height="1.1"/><line x1="${W0}" x2="${W0}" y1="1.55" y2="2.65"/></g>`;
    // Møblerne og personerne
    ROOM.furn.forEach((f, i) => { const k = p(t, "furn", i * 250); s += pop(f.x + f.w / 2, f.y + f.h / 2, k, `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" rx=".03" class="p-furn"/>${G.flabel(f, i ? T.counter : T.table, z)}`); });
    // Stråler og kabler under personerne, lamperne og kameraet over
    if (li > 0) L.forEach((l, i) => { const k = kLamp(t, i); if (k <= 0) return; const a = aim(l), ha = l.id === "key" ? 26 : 32, R = 5, q1 = [l.x + R * Math.cos(rad(a - ha)), l.y + R * Math.sin(rad(a - ha))], q2 = [l.x + R * Math.cos(rad(a + ha)), l.y + R * Math.sin(rad(a + ha))];
      s += `<radialGradient id="hs3-g-${l.id}" gradientUnits="userSpaceOnUse" cx="${l.x}" cy="${l.y}" r="4.2"><stop offset="0" stop-color="#e9ecf0" stop-opacity="${(0.34 * k).toFixed(3)}"/><stop offset=".3" stop-color="#e9ecf0" stop-opacity="${(0.1 * k).toFixed(3)}"/><stop offset="1" stop-color="#e9ecf0" stop-opacity="0"/></radialGradient><polygon clip-path="url(#hs3-rc)" points="${l.x},${l.y} ${q1} ${q2}" fill="url(#hs3-g-${l.id})"/>`; });
    if (ca > 0) { const ha = deg(Math.atan(24.9 / (2 * C.f))), R = 4.6 * ca, p1 = [B.x + R * Math.cos(rad(C.a - ha)), B.y + R * Math.sin(rad(C.a - ha))], p2 = [B.x + R * Math.cos(rad(C.a + ha)), B.y + R * Math.sin(rad(C.a + ha))];
      s += `<polygon clip-path="url(#hs3-rc)" points="${B.x},${B.y} ${p1} ${p2}" class="p-fov on" ${op(Math.min(1, ca * 1.5))}/>`; }
    if (pw > 0) { s += `<g class="g-distro" ${op(Math.min(1, pw * 3))}><rect x="-.8" y="2.05" width=".5" height=".34" rx=".04"/><path d="M-.7,2.22 h.3"/></g>`;
      [...L, PRAC].forEach((l, i) => { const k = p(t, "power", 350 + i * 300); if (k > 0) s += `<path d="${route(l, i)}" pathLength="1" class="p-cable ph${P.ph[l.id]}" style="stroke-dasharray:1;stroke-dashoffset:${(1 - k).toFixed(4)}"/>`; }); }
    // Personerne én ad gangen (Marcus 4. nov): Maya, så Leo; hver kommer frem og drejer sig på plads
    if (pe > 0) s += castSVG(z, (n, i) => { const u = (t - PH.people[0]) / SP - i * 950; return { k: ease(u / 600), da: 75 * (1 - ease((u - 450) / 800)) }; });
    if (li > 0) L.forEach((l, i) => { const k = kLamp(t, i); const a = aim(l);
      s += pop(l.x, l.y, k, `<g class="p-lamp ${l.id === "key" ? "on" : "on2"}" transform="translate(${l.x} ${l.y}) rotate(${a.toFixed(1)})"><rect x="-.2" y="-.13" width=".26" height=".26" rx=".03"/><path d="M.06,-.11 L.16,-.17 V.17 L.06,.11"/></g>`); });
    if (li > 0) s += pop(PRAC.x, PRAC.y, kLamp(t, 2), `<g class="p-lamp prac dim" transform="translate(${PRAC.x} ${PRAC.y})"><circle r=".11"/><circle r=".04" class="core"/></g>`);
    if (ca > 0) s += pop(B.x, B.y, Math.min(1, ca * 2), `<g transform="translate(${B.x} ${B.y}) rotate(${C.a.toFixed(2)})" class="p-cam on"><rect x="-.24" y="-.15" width=".3" height=".3" rx=".04" class="p-body"/><path d="M.06,-.09 L.17,-.13 L.17,.13 L.06,.09 Z" class="p-body"/></g>${chip(B.x - 0.62, B.y - 0.05, B.c, z, "on")}`);
    return s;
  }

  // ---------- billedet til højre ----------
  // Tomt, til kameraet står; så appens stregbillede fra 12B; under Lys appens lys-ler tæt på Maya (G.lys), uden lamper i billedet
  let rendered = { line: false, lit: false };
  const VW = () => Math.round(vLine.clientWidth || 480);
  // Stregbilledet tegnes igen, når brændvidden eller vinklen ændres (kun da)
  function drawLine(C = B) { const k = `${C.f.toFixed(2)}|${C.a.toFixed(2)}`; if (rendered.line === k) return; vLine.innerHTML = G.frameSVG(C, { w: VW(), labels: true }); rendered.line = k; }
  // Lag j: lyset fra de første j lamper (ingen; key; key + fill; alle tre). Lagene tones op oven på hinanden, når lamperne tændes.
  function drawLit(L, i) {
    const Ap = G.app(); if (!Ap || !Ap.hasClay?.() || !G.lys) return false;
    const c = G.lys.cam(); Ap.lights(G.lys.spec(i ? L.slice(0, i) : L.map((l) => ({ ...l, dim: 0.02 })))); // lag 0: lamperne næsten slukket (uden lamper tegner appen en reserve-figur) Ap.cams([c]);
    vLits[i].innerHTML = G.appSVG(G.lys.noGear(Ap.lit(c, VW(), "hi", { names: false }))); (rendered.lit ||= [])[i] = true; return true;
  }

  // ---------- et billede til tiden t ----------
  let T0 = 0, raf = 0, live = false, pausedAt = 0, tNow = 0, clayAsked = false;
  function render(t) {
    tNow = t; const L = lamps(Math.min(t, BUILT)), P = phases(L), fade = 1 - ease((t - BUILT - HOLD) / FADE), rest = t >= BUILT + HOLD + FADE;
    dyn.innerHTML = planAt(Math.min(t, BUILT), L, P); dyn.setAttribute("opacity", fade.toFixed(3));
    const ca = p(t, "cam", 500), li = p(t, "light", 700), pw = p(t, "power", 600);
    const C = camAt(Math.min(t, BUILT)); if (ca > 0) drawLine(C);
    win.classList.toggle("adj", t >= PH.adj[0] - 200 && Math.min(t, BUILT) < PH.light[0]); win.classList.toggle("turn", !!C.turning);
    host.querySelectorAll("[data-lf]").forEach((e) => e.classList.toggle("on", +e.dataset.lf === (C.lens ?? C.f)));
    // Leret hentes allerede under Kamera, så det er klar, når lyset tændes; hvert lag tegnes lige før sin lampe
    if (ca > 0.5 && !clayAsked) { clayAsked = true; G.loadClay?.(); }
    const tb = Math.min(t, BUILT), dark = ease((tb - PH.light[0]) / (LIT_DARK * SP));
    [0, 1, 2, 3].forEach((j) => { if (tb >= layerAt(j) - 250 * SP && !(rendered.lit && rendered.lit[j])) drawLit(L, j);
      vLits[j].style.opacity = (rendered.lit && rendered.lit[j] ? kLayer(tb, j) * fade : 0).toFixed(3); });
    view.style.setProperty("--v", (Math.min(1, ca) * fade).toFixed(3));
    view.style.opacity = t > BUILT + HOLD ? fade.toFixed(3) : ""; // hele billedet/strøm-panelet toner ud sammen med tegningen
    win.classList.toggle("lit", dark > 0 && !rest); view.style.setProperty("--dark", (rest ? 0 : dark).toFixed(3));
    tag.textContent = dark > 0.5 && G.lys ? `${B.c} · ${G.lys.name("three")} · ${G.lys.cam().f} ${T.mm}` : ca > 0 ? `${B.c} · ${Math.round(C.f)} ${T.mm}` : "";
    // Vinduet deles, når kameraet sættes (tegningen glider til venstre, billedet kommer ind), og samles igen, når det begynder forfra
    // (først i pausen efter udtoningen, så intet glider eller skifter, mens det ses)
    win.classList.toggle("split", ca > 0 && !rest);
    // Strøm: billedet bliver til strøm-oversigten (som appens strøm-panel): status, tavlen, L1–L3 (A af 16 A, 80 %-mærket) og i alt kW
    win.classList.toggle("pw", pw > 0.05 && !rest);
    const k = Math.max(0, Math.min(1, (pw - 0.3) / 0.7));
    phEls.forEach((el, i) => { const a = P.amp[i] * k; el.querySelector(".ph-bar i").style.width = `${Math.min(100, (a / 16) * 100).toFixed(1)}%`; el.querySelector(".ph-a").textContent = `${f1(a)} / 16 A`; });
    const ok = pw >= 1; okEl.querySelector("b").textContent = ok ? T.ok : T.laying; okEl.classList.toggle("on", ok); win.classList.toggle("pw-good", ok && !rest); // ikke "pw-ok": den klasse findes i strøm-demoen
    totEl.textContent = `${T.total} ${f1((P.amp.reduce((a, b) => a + b, 0) * 230 * k) / 1000)} kW`;
    const st = rest ? 0 : STEPS.reduce((k, s0, i) => (Math.min(t, BUILT) >= s0 ? i : k), 0); // t er altid inden for det valgte trin, når man står stille
    stepBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(i === st)));
  }
  function loop(now) {
    raf = 0; if (!live) return;
    let t = now - T0; if (t >= TOTAL) { T0 = now; t = 0; rendered = { line: false, lit: false }; vLine.innerHTML = ""; vLit.innerHTML = ""; }
    render(t); raf = requestAnimationFrame(loop);
  }
  // held: man har valgt et trin; så står det stille på trinnets færdige billede (ingen fortsættelse, ingen ny runde, heller ikke ved
  // hover eller rul), til man trykker ▶ (Afspil igen)
  let held = false;
  const playBtn = host.querySelector("[data-play]");
  const play = () => { if (live || still() || held) return; live = true; if (pausedAt) T0 += performance.now() - pausedAt; pausedAt = 0; raf = requestAnimationFrame(loop); };
  const pause = () => { if (live) pausedAt = performance.now(); live = false; cancelAnimationFrame(raf); raf = 0; };
  // Et trin: hop dertil (med "reducér bevægelse": trinnet færdigt)
  host.querySelector(".hs3-moments").addEventListener("click", (e) => {
    if (e.target.closest("[data-play]")) { held = false; playBtn.hidden = true; rendered = { line: false, lit: false }; vLine.innerHTML = ""; vLit.innerHTML = ""; T0 = performance.now(); render(0); if (vis && !document.hidden) play(); return; }
    const b = e.target.closest("[data-step]"); if (!b) return; const i = +b.dataset.step;
    if (b.dataset.play !== undefined) return;
    // Trinnets færdige billede: lige før det næste trin begynder (Strøm: den færdige scene)
    const t = i < STEPS.length - 1 ? STEPS[i + 1] - 1 : BUILT;
    held = true; pause(); pausedAt = 0; playBtn.hidden = still();
    rendered = { line: false, lit: false }; vLine.innerHTML = ""; vLit.innerHTML = ""; render(t);
  });
  let vis = true;
  // Heroen starter først, når åbningsbølgen er færdig, så bølgen har maskinen for sig selv (Marcus 4. nov: den hakkede)
  let introDone = !document.documentElement.classList.contains("gg-intro") || !!window.GG_INTRO_DONE;
  // Opstartsskærmen i vinduet (Marcus 4. nov, som i appen): første gang vinduet ses, tegnes metal-G'et op og navnet toner frem,
  // mens siden henter; så toner den ud, og rummet bygges op. Kun én gang pr. indlæsning; springes over med "reducér bevægelse".
  let booted = still(), booting = false;
  const go = () => { if (booted) return play(); if (booting) return; booting = true;
    setTimeout(() => { win.classList.add("booted"); booted = true; T0 = performance.now() + 350; pausedAt = 0; if (vis && !document.hidden) play(); }, 200); }; // Marcus 4. nov: G'et står allerede under bølgen, så det går hurtigt i gang
  if (!introDone) document.addEventListener("gg-intro-done", () => { introDone = true; T0 = performance.now(); if (vis && !document.hidden) go(); }, { once: true });
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; vis && !document.hidden && introDone ? go() : pause(); }).observe(host);
  document.addEventListener("visibilitychange", () => (vis && !document.hidden && introDone ? go() : pause()));
  // Motoren og leret: billedet tegnes om, når de er hentet
  document.addEventListener("gg-app-ready", () => { rendered = { line: false, lit: false }; render(tNow); });
  document.addEventListener("gg-clay", () => { rendered.lit = false; render(tNow); });
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener?.("change", () => (still() ? (pause(), render(BUILT)) : vis && play()));
  new ResizeObserver(() => { rendered = { line: false, lit: false }; render(tNow); }).observe(view);
  host._t = (t) => { pause(); render(t); }; // til test og skærmbilleder: stå stille på tiden t (ms)
  if (still()) render(BUILT); else { T0 = performance.now(); render(0); }
})();
