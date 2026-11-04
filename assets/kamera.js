// "Find framingen først": kamerabilledet som stregskitse, der følger kameraet live (29. okt nat).
// Geometri og look er appens shots-udkast (frameSVG, analyze, planSVG), tilpasset sitet: en tegning oppefra af et køkken
// (4,4 × 3,6 m, bord, køkkenbord, Maya sidder, Leo står i døren) og tre kameraer 12A–12C. Træk kameraet, drej det i prikken
// (eller piletaster / Shift+←→), og billedet, aflæsningen (størrelse, afstand, hvem der er i billedet) og filmstrimlen følger.
// Optik: Super 35 i 16:9 (24,9 × 14,0 mm). Personer i rigtige mål (stående 1,75 m, siddende 1,30 m). Intet lys og ingen 3D.
(() => {
  const host = document.querySelector("[data-cam-demo]");
  const DA = document.documentElement.lang.startsWith("da"), LOC = DA ? "da-DK" : "en-GB";
  const T = DA ? {
    table: "bord", counter: "køkkenbord", sit: "sidder", size: "Størrelse", dist: (n) => `afstand til ${n}`, inF: "I billedet",
    none: "Ingen. Det bliver et insert.", nobody: "Ingen personer", hint: "Træk kameraet · drej i prikken", lens: "Brændvidde",
    plan: "Tegning oppefra af et køkken på 4,4 × 3,6 m med et bord, Maya, der sidder, Leo i døren og tre kameraer. Træk det valgte kamera, eller brug piletasterne; Shift og venstre/højre drejer det.",
    frame: "Kamerabilledet som stregskitse", cam: (c) => `Kamera ${c}. Piletaster flytter, Shift og venstre/højre drejer.`, strip: "Filmstrimmel med shots", add: "Tilføj kamera", addA: "Tilføj et kamera og et shot", look: matchMedia("(pointer: coarse)").matches ? "Træk i billedet" : "Træk i billedet · rul for zoom", hgt: "Højde", up: "Højere", down: "Lavere",
  } : {
    table: "table", counter: "counter", sit: "seated", size: "Size", dist: (n) => `distance to ${n}`, inF: "In frame",
    none: "Nobody. It's an insert.", nobody: "Nobody", hint: "Drag the camera · turn it by the dot", lens: "Focal length",
    plan: "An overhead plan of a 4.4 by 3.6 m kitchen with a table, Maya seated, Leo in the doorway and three cameras. Drag the selected camera, or use the arrow keys; Shift with left or right turns it.",
    frame: "The camera view as a line sketch", cam: (c) => `Camera ${c}. Arrow keys move it, Shift with left or right turns it.`, strip: "Film strip with the shots", add: "Add camera", addA: "Add a camera and a shot", look: matchMedia("(pointer: coarse)").matches ? "Drag the frame" : "Drag the frame · scroll to zoom", hgt: "Height", up: "Higher", down: "Lower",
  };
  const SW = 24.9, SH = 14.0, rad = (d) => (d * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI, tanH = (f) => SW / (2 * f);
  const fm = (n, d = 2) => n.toLocaleString(LOC, { minimumFractionDigits: d, maximumFractionDigits: d });
  const SIZES = [["WS", 3.0, "Wide shot"], ["FS", 1.7, "Full shot"], ["MS", 0.95, "Medium shot"], ["MCU", 0.55, "Medium close-up"], ["CU", 0.28, "Close-up"], ["ECU", 0, "Extreme close-up"]];
  const sizeOf = (hv) => (SIZES.find((s) => hv > s[1]) || SIZES[5])[0];
  const NAME = { ...Object.fromEntries(SIZES.map((s) => [s[0], s[2]])), EWS: "Extreme wide", MWS: "Medium wide" };
  const ROOM = { w: 4.4, d: 3.6, door: { a: 0.5, b: 1.4 }, furn: [{ x: 1.9, y: 1.5, w: 1.4, h: 0.8, ht: 0.75, l: T.table }, { x: 3.3, y: 0, w: 1.1, h: 0.6, ht: 0.9, l: T.counter }] };
  // Leo kigger direkte på Maya (Marcus 4. nov): 7° fra døren mod hende
  const CAST = { Maya: { x: 2.6, y: 1.2, face: 90, pose: "sit", g: "k" }, Leo: { x: 0.55, y: 0.95, face: 7, pose: "stand", g: "m" } };
  // Kameraerne står helt inde i rummet med lidt luft til væggen (Marcus 4. nov: 12B stod delvis i væggen); 12B er rykket 25 cm frem
  // og har 24 mm i stedet for 28 mm, så framingen er den samme
  // Linserne pr. bogstav (Marcus 4. nov): A = 24 mm (wide), B = 50 mm (medium, og lysfanens billede), C = 85 mm (close). Det er
  // standarder, ikke låse: brændvidden kan stadig skiftes, og lysfanen følger 12B, uanset hvad den står på. 12C er rykket lidt tilbage
  // (samme retning mod Maya), så 85 mm giver et close-up og ikke et extreme close-up.
  // Marcus 4. nov (senere): det første shot er heroens 50 mm (samme framing som øverst på siden og i Lys), så et wide og et close-up
  const SHOTS = [{ c: "12A", x: 2.6, y: 3.2, a: -90, f: 50, h: 1.2, t: -4 }, { c: "12B", x: 3.95, y: 3.15, a: -146, f: 24, h: 1.5 }, { c: "12C", x: 3.2, y: 3.05, a: -108, f: 85, h: 1.2 }];
  const LENSES = [18, 24, 35, 50, 85];
  SHOTS.forEach((s) => (s.t = s.t || 0)); // 12A (50 mm) tilter 4° ned: mindre headroom (Marcus 4. nov)
  let sel = 0, n = 1; // n = antal kameraer i demoen (de andre ligger klar og tilføjes med +)
  const live = () => SHOTS.slice(0, n);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // ---------- aflæsning ----------
  const rel = (sh, x, y) => { const a = rad(sh.a), dx = x - sh.x, dy = y - sh.y; return { depth: dx * Math.cos(a) + dy * Math.sin(a), lat: -dx * Math.sin(a) + dy * Math.cos(a) }; };
  let analyze = function (sh) {
    const t = tanH(sh.f), inF = [];
    for (const [n, p] of Object.entries(CAST)) { const r = rel(sh, p.x, p.y); if (r.depth > 0.35 && Math.abs(r.lat) - 0.2 < r.depth * t) inF.push({ n, p, ...r }); }
    inF.sort((a, b) => a.depth - b.depth);
    const centred = inF.filter((o) => Math.abs(o.lat) < o.depth * t * 0.7);
    let subj = centred[0] || inF[0], ots = false;
    if (inF.length > 1 && Math.abs(inF[0].lat) > inF[0].depth * t * 0.45 && centred.length && centred[0] !== inF[0]) { subj = centred[0]; ots = inF[0].depth < subj.depth * 0.7; }
    if (!subj) return { inF, size: "INS", dist: null, ots: false };
    return { inF, subj, size: sizeOf((subj.depth * SH) / sh.f), dist: subj.depth, ots };
  }
  const sizeLabel = (a) => (a.size === "INS" ? "Insert" : a.size + (a.ots ? " · OTS" : ""));
  function exitDist(x, y, a) {
    const c = Math.cos(rad(a)), s = Math.sin(rad(a)); let t = 1e9;
    if (c > 1e-6) t = Math.min(t, (ROOM.w - x) / c); if (c < -1e-6) t = Math.min(t, -x / c);
    if (s > 1e-6) t = Math.min(t, (ROOM.d - y) / s); if (s < -1e-6) t = Math.min(t, -y / s);
    return Math.max(t, 0.4);
  }

  // ---------- kamerabilledet (stregtegning, 160 × 90) ----------
  const FIG = {
    stand: "M-.07,1.52 L-.21,1.45 Q-.26,1.42 -.26,1.34 L-.24,.95 L-.2,.9 L-.15,.02 L-.04,.02 L0,.8 L.04,.02 L.15,.02 L.2,.9 L.24,.95 L.26,1.34 Q.26,1.42 .21,1.45 L.07,1.52 Z",
    sit: "M-.07,1.07 L-.21,1 Q-.26,.97 -.26,.89 L-.24,.48 L.24,.48 L.26,.89 Q.26,.97 .21,1 L.07,1.07 Z",
  };
  let frameSVG = function (sh, o = {}) {
    const W = 160, H = 90, t = tanH(sh.f), K = (d) => W / 2 / (d * t), X = (lat, d) => W / 2 + ((lat / d) * (W / 2)) / t, ct = Math.cos(rad(sh.t || 0)), stl = Math.sin(rad(sh.t || 0)), Y = (z, d) => { const dz = z - sh.h, zc = dz * ct - d * stl, dc = Math.max(0.05, d * ct + dz * stl); return H / 2 - ((zc / dc) * (W / 2)) / t; };
    const tw = exitDist(sh.x, sh.y, sh.a), yF = Y(0, tw), yC = Y(2.6, tw);
    let s = `<rect width="${W}" height="${H}" class="f-ceil"/><rect y="${yC.toFixed(2)}" width="${W}" height="${Math.max(0, yF - yC).toFixed(2)}" class="f-wall"/><rect y="${yF.toFixed(2)}" width="${W}" height="${H}" class="f-floor"/>` +
      `<line x2="${W}" y1="${yF.toFixed(2)}" y2="${yF.toFixed(2)}" class="f-edge"/><line x2="${W}" y1="${yC.toFixed(2)}" y2="${yC.toFixed(2)}" class="f-edge2"/>`;
    const objs = [];
    for (const fu of ROOM.furn) {
      const C = [[fu.x, fu.y], [fu.x + fu.w, fu.y], [fu.x + fu.w, fu.y + fu.h], [fu.x, fu.y + fu.h]].map(([x, y]) => rel(sh, x, y));
      if (C.some((c) => c.depth < 0.25)) continue;
      const P = (c, z) => X(c.lat, c.depth).toFixed(1) + "," + Y(z, c.depth).toFixed(1);
      const sides = [0, 1, 2, 3].map((i) => { const a = C[i], b = C[(i + 1) % 4]; return { d: (a.depth + b.depth) / 2, p: [P(a, 0), P(b, 0), P(b, fu.ht), P(a, fu.ht)] }; }).sort((a, b) => b.d - a.d);
      let g = sides.map((sd) => `<polygon points="${sd.p.join(" ")}" class="f-side"/>`).join("");
      g += `<polygon points="${C.map((c) => P(c, fu.ht)).join(" ")}" class="f-top"/>`;
      objs.push({ d: C.reduce((a, c) => a + c.depth, 0) / 4, g });
    }
    for (const [n, p] of Object.entries(CAST)) {
      const r = rel(sh, p.x, p.y); if (r.depth < 0.3) continue;
      const k = K(r.depth), cx = X(r.lat, r.depth), by = Y(0, r.depth); if (Math.abs(cx - W / 2) > W) continue;
      const top = p.pose === "sit" ? 1.3 : 1.75, hy = p.pose === "sit" ? 1.18 : 1.63;
      let g = `<g transform="translate(${cx.toFixed(2)} ${by.toFixed(2)}) scale(${k.toFixed(3)} ${(-k).toFixed(3)})"><path d="${FIG[p.pose]}" class="f-fig"/><circle cy="${hy}" r=".11" class="f-fig"/></g>`;
      if (o.labels !== false) { const ly = Y(top + 0.06, r.depth) - 2; if (ly > 6) g += `<text x="${cx.toFixed(1)}" y="${ly.toFixed(1)}" class="f-name" style="font-size:${o.fs || 4.5}px">${esc(n)}</text>`; }
      objs.push({ d: r.depth, g });
    }
    objs.sort((a, b) => b.d - a.d).forEach((x) => (s += x.g));
    s += `<g class="f-thirds"><line x1="53.3" x2="53.3" y2="90"/><line x1="106.7" x2="106.7" y2="90"/><line y1="30" y2="30" x2="160"/><line y1="60" y2="60" x2="160"/></g>`;
    return s;
  }

  // ---------- tegningen oppefra (meter) ----------
  const BOX = [-0.9, -0.9, ROOM.w + 1.8, ROOM.d + 2.3]; // ekstra plads forneden til hint-pillen
  const chip = (x, y, txt, z, cls = "") => { const w = (String(txt).length * 0.112 + 0.24) * z, h = 0.3 * z; return `<g class="p-chip ${cls}"><rect x="${(x - w / 2).toFixed(3)}" y="${(y - h / 2).toFixed(3)}" width="${w.toFixed(3)}" height="${h.toFixed(3)}" rx="${0.05 * z}"/><text x="${x.toFixed(3)}" y="${(y + 0.072 * z).toFixed(3)}" style="font-size:${(0.2 * z).toFixed(3)}px">${esc(txt)}</text></g>`; };
  // Rummet (gitter, vægge, dør, mål, møbler) og personerne deles med de andre trin på forsiden (assets/rejse.js via window.GGScene)
  function roomSVG(z) {
    const W = ROOM.w, D = ROOM.d, dr = ROOM.door; let s = '<g class="p-grid">';
    for (let x = 0; x <= W; x += 1) s += `<line x1="${x}" x2="${x}" y2="${D}"/>`;
    for (let y = 0; y <= D; y += 1) s += `<line y1="${y}" y2="${y}" x2="${W}"/>`;
    s += "</g>";
    s += `<rect width="${W}" height="${D}" class="p-floor"/><path d="M0,${dr.a} L0,0 L${W},0 L${W},${D} L0,${D} L0,${dr.b}" class="p-wall"/>`;
    const dl = dr.b - dr.a; s += `<path d="M0,${dr.a} L${dl},${dr.a} A${dl},${dl} 0 0 1 0,${dr.b}" class="p-door"/>`;
    const fs = (0.17 * z).toFixed(3), y0 = -0.45, x0 = W + 0.45;
    s += `<g class="p-dim"><path d="M0,${y0} H${W} M0,${y0 - 0.08} V${y0 + 0.08} M${W},${y0 - 0.08} V${y0 + 0.08} M${x0},0 V${D} M${x0 - 0.08},0 H${x0 + 0.08} M${x0 - 0.08},${D} H${x0 + 0.08}"/>` +
      `<rect x="${W / 2 - 0.36 * z}" y="${y0 - 0.12 * z}" width="${0.72 * z}" height="${0.24 * z}" class="p-mask"/><text x="${W / 2}" y="${y0 + 0.065 * z}" style="font-size:${fs}px">${fm(W, 1)} m</text>` +
      `<g transform="translate(${x0} ${D / 2}) rotate(90)"><rect x="${-0.36 * z}" y="${-0.12 * z}" width="${0.72 * z}" height="${0.24 * z}" class="p-mask"/><text y="${0.065 * z}" style="font-size:${fs}px">${fm(D, 1)} m</text></g></g>`;
    for (const fu of ROOM.furn) s += `<rect x="${fu.x}" y="${fu.y}" width="${fu.w}" height="${fu.h}" rx=".03" class="p-furn"/>${flabel(fu, fu.l, z)}`;
    return s;
  }
  // at(navn, i) (valgfri, heroen): { k: 0–1 hvor langt personen er kommet frem, da: grader personen mangler at dreje }
  // Møblets navn i nederste venstre hjørne af møblet (gennemgang 4. nov: midt i lå det under lamperne og pendlen) og mindre, hvis
  // ordet ellers er for langt til møblet ("køkkenbord")
  // Møblets navn lille i nederste højre hjørne inde i møblet (Marcus 4. nov), mindre, hvis ordet er for langt til møblet
  function flabel(fu, l, z) { const fs = Math.min(0.12 * z, (fu.w - 0.12) / (String(l).length * 0.56));
    return `<text x="${fu.x + fu.w - 0.06}" y="${fu.y + fu.h - 0.07}" class="p-flabel" style="font-size:${fs.toFixed(3)}px;text-anchor:end">${l}</text>`; }
  function castSVG(z, at) {
    let s = "";
    Object.entries(CAST).forEach(([n, p], i) => {
      const o = at ? at(n, i) : null; if (o && o.k <= 0) return;
      const r = 0.2, f = p.face + (o?.da || 0);
      let q = `<circle cx="${p.x}" cy="${p.y}" r="${r}" class="p-person"/><line x1="${p.x}" y1="${p.y}" x2="${p.x + r * 1.35 * Math.cos(rad(f))}" y2="${p.y + r * 1.35 * Math.sin(rad(f))}" class="p-nose"/>`;
      if (p.pose === "sit") q += `<circle cx="${p.x}" cy="${p.y}" r="${r * 0.45}" class="p-seat"/>`;
      q += chip(p.x, p.y - r - 0.24 * z, n + (p.pose === "sit" ? " · " + T.sit : ""), z, "who");
      s += o && o.k < 1 ? `<g opacity="${o.k.toFixed(3)}" transform="translate(${p.x} ${p.y}) scale(${(0.6 + 0.4 * o.k).toFixed(3)}) translate(${-p.x} ${-p.y})">${q}</g>` : q;
    });
    return s;
  }
  function planSVG(z) {
    const W = ROOM.w, D = ROOM.d; let s = roomSVG(z);
    s += `<clipPath id="cam-rc"><rect x="-.04" y="-.04" width="${W + 0.08}" height="${D + 0.08}"/></clipPath>`;
    const order = live().map((sh, i) => i).sort((a, b) => (a === sel) - (b === sel));
    for (const i of order) {
      const sh = SHOTS[i], on = i === sel, ha = deg(Math.atan(tanH(sh.f))), an = analyze(sh);
      const L = on ? Math.min(exitDist(sh.x, sh.y, sh.a), 8) : Math.min(an.dist ? an.dist + 0.4 : 1.6, exitDist(sh.x, sh.y, sh.a)) * 0.9;
      const p1 = [sh.x + L * Math.cos(rad(sh.a - ha)), sh.y + L * Math.sin(rad(sh.a - ha))], p2 = [sh.x + L * Math.cos(rad(sh.a + ha)), sh.y + L * Math.sin(rad(sh.a + ha))];
      s += `<polygon clip-path="url(#cam-rc)" data-pick="${i}" points="${sh.x},${sh.y} ${p1} ${p2}" class="p-fov${on ? " on" : ""}"/>`;
      if (on && an.dist) s += `<line clip-path="url(#cam-rc)" x1="${sh.x}" y1="${sh.y}" x2="${sh.x + an.dist * Math.cos(rad(sh.a))}" y2="${sh.y + an.dist * Math.sin(rad(sh.a))}" class="p-axis"/>`;
      s += `<g transform="translate(${sh.x} ${sh.y}) rotate(${sh.a})" class="p-cam${on ? " on" : ""}"${on ? ` tabindex="0" role="button" aria-label="${T.cam(sh.c)}" data-key` : ""}>`;
      if (on) s += `<line x1=".17" x2=".72" class="p-arm"/><circle cx=".78" r=".085" class="p-rot"/><circle data-rot="${i}" cx=".78" r=".3" class="p-hit"/>`;
      s += `<circle data-cam="${i}" r=".38" class="p-hit"/><rect data-cam="${i}" x="-.24" y="-.15" width=".3" height=".3" rx=".04" class="p-body"/><path data-cam="${i}" d="M.06,-.09 L.17,-.13 L.17,.13 L.06,.09 Z" class="p-body"/>`;
      if (on) s += `<circle r=".42" class="p-focus"/>`;
      s += "</g>" + `<g data-pick="${i}">${chip(sh.x, sh.y + 0.4 * Math.max(z, 0.8), sh.c, z, on ? "on" : "")}</g>`;
    }
    return s + castSVG(z);
  }
  // ---------- appens eget kamerabillede (4. nov) ----------
  // Billederne tegnes af appens camview.js (assets/app/viewer.min.js, bygget af tools/app-viewer.mjs): Kamera-fanens stregbillede
  // her og i shotlisterne, og lysviewerens 3D-ler under Lys (rejse.js). Motoren hentes, når siden er færdig og ledig (eller ved
  // første tryk i en demo), så den aldrig står i vejen for det første billede. Indtil den er hentet, tegnes skitsen ovenfor.
  // Leret (assets/app/clay.min.js) hentes først, når man når Lys.
  const APP = { p: null, clay: null };
  const getJS = (src) => new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.async = true; s.onload = ok; s.onerror = no; document.head.append(s); });
  const app = () => (window.GGApp && APP.on ? window.GGApp : null);
  function loadApp() {
    // Appens motor har sin egen tema-kode, der sætter <html data-theme> (gennemgang 4. nov: lyst tema blev mørkt). Sidens eget valg
    // (site.js, sendes som gg-theme) er det, der gælder; alt andet sættes straks tilbage.
    if (!APP.guard) { const root = document.documentElement; let own = root.getAttribute("data-theme"); APP.guard = true;
      document.addEventListener("gg-theme", () => (own = root.getAttribute("data-theme")));
      new MutationObserver(() => { const v = root.getAttribute("data-theme"); if (v !== own) own == null ? root.removeAttribute("data-theme") : root.setAttribute("data-theme", own); }).observe(root, { attributes: true, attributeFilter: ["data-theme"] }); }
    return (APP.p ||= getJS("/assets/app/viewer.min.js").then(() => {
      GGApp.scene({ room: ROOM, furn: ROOM.furn.map((f, i) => ({ ...f, type: i ? "counter" : "table" })), cast: Object.fromEntries(Object.entries(CAST).map(([n, p]) => [n, { ...p, gender: p.g }])) });
      APP.on = true; document.dispatchEvent(new CustomEvent("gg-app-ready"));
    }).catch(() => {}));
  }
  const loadClay = () => (APP.clay ||= loadApp().then(() => (window.GGApp ? getJS("/assets/app/clay.min.js") : null)).catch(() => {}));
  // Appens <svg> (W × H) lagt ind i sitets 160 × 90-rammer
  const appSVG = (s) => s.replace(/^<svg ([^>]*?)width="[\d.]+" height="[\d.]+"/, '<svg $1x="0" y="0" width="160" height="90" preserveAspectRatio="xMidYMid slice"');
  const frame0 = frameSVG, analyze0 = analyze;
  frameSVG = (sh, o = {}) => { const A = app(); if (!A) return frame0(sh, o); A.cams(live()); return appSVG(A.line(sh, Math.max(160, Math.round(o.w || 320)), { names: o.labels !== false })); };
  // Aflæsningen som i appen (camViewRead): størrelse, afstand til ansigtet og hvem der er i billedet
  analyze = (sh) => {
    const A = app(); if (!A) return analyze0(sh);
    A.cams(live()); const R = A.read(sh), inF = R.who.filter((n) => CAST[n]).map((n) => ({ n, p: CAST[n] }));
    return { inF, subj: R.subj ? { n: R.subj, p: CAST[R.subj] } : null, size: R.size || "INS", dist: R.dist, ots: R.ots };
  };
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 300));
  // Motoren hentes først, når åbningsbølgen er færdig (Marcus 4. nov: bølgen hakkede, mens siden arbejdede)
  const afterIntro = (f) => (document.documentElement.classList.contains("gg-intro") && !window.GG_INTRO_DONE ? document.addEventListener("gg-intro-done", f, { once: true }) : f());
  const start = () => afterIntro(() => idle(loadApp, { timeout: 2500 }));
  if (document.readyState === "complete") start(); else addEventListener("load", start, { once: true });
  window.GGScene = { live: () => live(), ROOM, CAST, SHOTS, BOX, chip, roomSVG, castSVG, flabel, frameSVG: (sh, o) => frameSVG(sh, o), analyze: (sh) => analyze(sh), sizeLabel, esc, fm, rad, deg, app, loadApp, loadClay, appSVG };
  if (!host) return;

  // ---------- opbygning ----------
  const NS = "http://www.w3.org/2000/svg";
  host.innerHTML = `
    <figure class="stage cam-plan" role="group" aria-label="${T.plan}"><svg class="pl" viewBox="${BOX.join(" ")}"></svg><figcaption class="hint">${T.hint}</figcaption></figure>
    <div class="cam-view">
      <figure class="cam-frame" aria-label="${T.frame}"><svg class="fr" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true"></svg><span class="cam-code"></span><span class="cam-look" aria-hidden="true">${T.look}</span><span class="cam-hgt"><button type="button" data-h="-1" aria-label="${T.down}">−</button><b></b><button type="button" data-h="1" aria-label="${T.up}">+</button></span></figure>
      <div class="facts cam-facts" aria-live="polite"></div>
      <div class="cam-lens"><span>${T.lens}</span><div class="seg" role="group" aria-label="${T.lens}">${LENSES.map((f) => `<button type="button" data-f="${f}">${f} mm</button>`).join("")}</div></div>
    </div>
    <div class="cam-strip" role="group" aria-label="${T.strip}">${SHOTS.map((sh, i) => `<button type="button" class="cam-shot" data-i="${i}"><svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true"></svg><span class="cap"><b>${sh.c}</b><em></em><i></i></span><span class="who"></span></button>`).join("")}<button type="button" class="cam-add" data-add aria-label="${T.addA}"><span class="plus" aria-hidden="true">+</span><span>${T.add}</span></button></div>`;
  const stage = host.querySelector(".cam-plan"), pl = host.querySelector(".pl"), fr = host.querySelector(".fr"), facts = host.querySelector(".cam-facts"), code = host.querySelector(".cam-code");
  const shots = [...host.querySelectorAll(".cam-shot")];
  const z = () => { const ppm = pl.clientWidth / BOX[2] || 60; return Math.max(0.62, Math.min(1.15, 64 / ppm)); };
  const ffs = () => Math.max(3.4, Math.min(6, (11 * 160) / (fr.clientWidth || 300)));

  function render(stripAll = true) {
    const sh = SHOTS[sel], a = analyze(sh);
    pl.innerHTML = planSVG(z());
    fr.innerHTML = frameSVG(sh, { fs: ffs(), w: fr.clientWidth });
    code.textContent = `${sh.c} · ${sh.f} mm${sh.t ? ` · tilt ${sh.t > 0 ? "+" : "−"}${Math.abs(sh.t)}°` : ""}`;
    host.querySelector(".cam-hgt b").textContent = `${T.hgt} ${fm(sh.h, 1)} m`;
    const who = a.inF.length ? a.inF.map((o) => `<span class="tape">${esc(o.n)}</span>`).join("") : `<span class="none">${T.none}</span>`;
    facts.innerHTML = `<div class="fact"><b title="${NAME[a.size] || "Insert"}">${sizeLabel(a)}</b><span>${T.size}</span></div>` +
      `<div class="fact"><b>${a.dist ? fm(a.dist) : "–"}<small>m</small></b><span>${a.subj ? T.dist(a.subj.n) : "&nbsp;"}</span></div>` +
      `<div class="fact who"><b>${who}</b><span>${T.inF}</span></div>`;
    host.querySelectorAll("[data-f]").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.f === sh.f)));
    shots.forEach((b, i) => { b.hidden = i >= n; });
    host.querySelector("[data-add]").hidden = n >= SHOTS.length;
    shots.forEach((b, i) => {
      if (i >= n || (!stripAll && i !== sel)) return;
      const s2 = SHOTS[i], a2 = analyze(s2);
      b.setAttribute("aria-pressed", String(i === sel));
      b.querySelector("svg").innerHTML = frameSVG(s2, { labels: false, w: b.querySelector("svg").clientWidth });
      b.querySelector("em").textContent = sizeLabel(a2); b.querySelector("i").textContent = `${s2.f} mm`;
      b.querySelector(".who").textContent = a2.inF.map((o) => o.n).join(", ") || T.nobody;
    });
  }
  const used = () => stage.classList.add("used");
  // Kameraet holdes fri af væggene: kameraets krop (ca. 0,3 × 0,3 m med optikken, halv diagonal ca. 0,28 m), halvdelen af væggens
  // tykkelse (0,035 m) og lidt luft
  const CAM_GAP = 0.36, clampCam = (sh) => { sh.x = Math.min(ROOM.w - CAM_GAP, Math.max(CAM_GAP, sh.x)); sh.y = Math.min(ROOM.d - CAM_GAP, Math.max(CAM_GAP, sh.y)); };
  const pt = (e) => { const p = pl.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(pl.getScreenCTM().inverse()); };
  let drag = null;
  pl.addEventListener("pointerdown", (e) => {
    const t = e.target.closest("[data-cam],[data-rot],[data-pick]"); if (!t) return;
    const i = +(t.dataset.cam ?? t.dataset.rot ?? t.dataset.pick);
    if (i !== sel) { sel = i; render(); if (!t.dataset.cam) return; }
    if (t.dataset.pick !== undefined) return;
    const sh = SHOTS[sel], p = pt(e);
    drag = { mode: t.dataset.rot !== undefined ? "rot" : "move", ox: p.x - sh.x, oy: p.y - sh.y };
    pl.setPointerCapture(e.pointerId); e.preventDefault(); used();
  });
  pl.addEventListener("pointermove", (e) => {
    if (!drag) return; const sh = SHOTS[sel], p = pt(e);
    if (drag.mode === "move") { sh.x = p.x - drag.ox; sh.y = p.y - drag.oy; clampCam(sh); } else sh.a = Math.round(deg(Math.atan2(p.y - sh.y, p.x - sh.x)));
    render(false);
  });
  const end = () => { if (drag) { drag = null; render(); pl.querySelector("[data-key]")?.focus({ preventScroll: true }); } };
  // På touch: kameraet og prikken må ikke rulle siden (resten af tegningen ruller som normalt)
  pl.addEventListener("touchstart", (e) => { if (e.target.closest?.("[data-cam],[data-rot]")) e.preventDefault(); }, { passive: false });
  pl.addEventListener("pointerup", end); pl.addEventListener("pointercancel", end);
  pl.addEventListener("keydown", (e) => {
    if (!e.target.closest("[data-key]")) return;
    const sh = SHOTS[sel], k = e.key, st = 0.1;
    if (e.shiftKey && (k === "ArrowLeft" || k === "ArrowRight")) sh.a += k === "ArrowLeft" ? -5 : 5;
    else if (k === "ArrowLeft") sh.x -= st; else if (k === "ArrowRight") sh.x += st; else if (k === "ArrowUp") sh.y -= st; else if (k === "ArrowDown") sh.y += st;
    else return;
    e.preventDefault(); clampCam(sh); used(); render(false); pl.querySelector("[data-key]")?.focus({ preventScroll: true });
  });
  host.querySelector(".cam-lens").addEventListener("click", (e) => { const b = e.target.closest("[data-f]"); if (!b) return; SHOTS[sel].f = +b.dataset.f; used(); render(false); });
  host.querySelector(".cam-strip").addEventListener("click", (e) => {
    if (e.target.closest("[data-add]")) { if (n < SHOTS.length) { n++; sel = n - 1; used(); render(); document.dispatchEvent(new CustomEvent("gg-shots")); pl.querySelector("[data-key]")?.focus({ preventScroll: true }); } return; }
    const b = e.target.closest(".cam-shot"); if (!b) return; sel = +b.dataset.i; render();
  });
  // Kameraet justeres i billedet som i appen: træk vandret = pan, lodret = tilt; rul = zoom (brændvidde); ± = højde
  const frEl = host.querySelector(".cam-frame");
  let look = null;
  frEl.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    const sh = SHOTS[sel]; look = { x: e.clientX, y: e.clientY, a: sh.a, t: sh.t || 0 }; frEl.setPointerCapture(e.pointerId); frEl.classList.add("looking"); e.preventDefault(); used();
  });
  frEl.addEventListener("pointermove", (e) => {
    if (!look) return; const sh = SHOTS[sel], perPx = (2 * deg(Math.atan(tanH(sh.f)))) / (frEl.clientWidth || 300);
    sh.a = Math.round(look.a + (e.clientX - look.x) * perPx); sh.t = Math.max(-30, Math.min(30, Math.round(look.t - (e.clientY - look.y) * perPx))); render(false);
  });
  const lookEnd = () => { if (look) { look = null; frEl.classList.remove("looking"); render(); } };
  frEl.addEventListener("pointerup", lookEnd); frEl.addEventListener("pointercancel", lookEnd);
  frEl.addEventListener("touchstart", (e) => { if (!e.target.closest("button")) e.preventDefault(); }, { passive: false });
  frEl.addEventListener("wheel", (e) => {
    e.preventDefault(); const sh = SHOTS[sel];
    sh.f = Math.max(12, Math.min(135, Math.round(sh.f * Math.exp(-e.deltaY * 0.0015)))); used(); render(false);
  }, { passive: false });
  frEl.addEventListener("click", (e) => { const b = e.target.closest("[data-h]"); if (!b) return; const sh = SHOTS[sel]; sh.h = Math.max(0.3, Math.min(2.5, Math.round((sh.h + 0.1 * +b.dataset.h) * 10) / 10)); used(); render(false); });
  render();
  new ResizeObserver(() => render()).observe(host);
  document.addEventListener("gg-app-ready", () => render());
  host.addEventListener("pointerdown", loadApp, { once: true }); // trykker man, før motoren er hentet: hent den nu
})();
