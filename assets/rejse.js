// Rejsen på forsiden (29. okt): trin 2–5 i samme rækkefølge som appens faner, med den samme lille scene hele vejen
// (køkkenet fra trin 1, assets/kamera.js, delt via window.GGScene): Maya ved bordet, Leo i døren.
//   2 Lys        – Maya tæt på (appens lysviewer, ler i lampernes lys) og tre looks (Rembrandt, Split, Rim), der sætter
//                  key, fill og baglys; lamperne kan trækkes, og et klik på en lampe viser LED/Bounce/Negativ, dimmer og Kelvin.
//   3 Strøm      – de samme lamper (key fra trin 2) på tegningen. "Læg kabler" lægger kablerne langs væggene fra tavlen
//                  i gangen ud til lamperne én ad gangen, og L1–L3 fyldes op (fuld styrke ved 230 V, største lampe først på
//                  den mindst belastede fase, grænse 80 % af 16 A = 12,8 A).
//   4 Produktion – scenerne fra manuskriptet og en pakkeliste, der bygges af lamperne og kablerne, og som kan vinges af.
//   5 Levering   – dokumenterne, der kan eksporteres (kun det, der er med i 1.0).
// Ingen biblioteker. Med "reducér bevægelse" springes animationerne over; alt kan stadig trækkes og trykkes.
(() => {
  const G = window.GGScene; if (!G) return;
  const DA = document.documentElement.lang.startsWith("da"), LOC = DA ? "da-DK" : "en-GB";
  const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { ROOM, CAST, BOX, chip, roomSVG, castSVG, esc, rad, deg } = G;
  const f = (n, d = 1) => n.toLocaleString(LOC, { minimumFractionDigits: d, maximumFractionDigits: d });
  const $ = (q, el = document) => el.querySelector(q), $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const T = DA ? {
    key: "Key", fill: "Fill", back: "Baglys", prac: "Pendel", onAnna: "på Maya", tstop: "EI 800 · 1/50", lampFace: "lampe til ansigt",
    left: "Venstre", right: "Højre", side: "Key-side", reset: "Nulstil", tooMany: "Prøv en lampe for meget:", dragL: "Træk i key, fill og baglys",
    planL: "Tegning oppefra af køkkenet med key, fill og baglys rettet mod Maya. Træk lamperne, eller brug piletasterne.", lampA: (r) => `${r}. Piletaster flytter den.`, ratio: "kontrast", dim: "Dimmer", fk: { led: "Direkte", bounce: "Bounce", neg: "Negativ" }, fn: { into: "i bounce", neg: "Floppy 1×1 m" }, stop: "stop", toFace: (r) => `${r} til ansigt`,
    lay: "Læg kabler", relay: "Læg kablerne igen", notYet: "Kablerne er ikke lagt endnu", ok: "OK · alle faser under 80 %", over: (p) => `${p} er over 80 % · brug 32 A`,
    total: "i alt", most: (p) => `mest på ${p}`, free: "fri før 80 %", add: "Tilføj", distro: "16 A CEE · 3 faser", hall: "gang",
    planP: "Tegning oppefra af køkkenet med lamperne og tavlen i gangen. Tryk Læg kabler.",
    packed: (a, b) => `${a} af ${b} pakket`, cstand: "C-stand", combo: "Combo-stativ", bag: "Sandsæk 12 kg", cable: (n) => `Kabel 16 A, 10 m`, distroL: "CEE 16 A-tavle, 3 faser",
    cam: "Kamera, 18–85 mm", dolly: "Slider 1 m", tape: "Gaffertape", kit: "Fra pakken Køkken nat",
    exp: "Eksportér det hele", expd: "Klar", pdf: "PDF",
    shotsH: "Shotliste · scene 12", dayH: "Dagen", call: "Call", rig: "Lys og kamera op", lunch: "Frokost", wrap: "Wrap", next13: "Scene 13 · Opgangen", noShots: "Ingen shots endnu", min: "min", d0: "Grejliste", d1: "Pakkeliste", d2: "Shotliste", d3: "Sceneoversigt", scene12: "Scene 12 · Køkken nat", film: "3 scener · 2 locations", gLight: "Lys", gGrip: "Grip", gPower: "Strøm",
  } : {
    key: "Key", fill: "Fill", back: "Back light", prac: "Pendant", onAnna: "on Maya", tstop: "EI 800 · 1/50", lampFace: "lamp to face",
    left: "Left", right: "Right", side: "Key side", reset: "Reset", tooMany: "Now try one lamp too many:", dragL: "Drag the key, fill and back light",
    planL: "An overhead plan of the kitchen with the key, fill and back light aimed at Maya. Drag the lamps, or use the arrow keys.", lampA: (r) => `${r}. Arrow keys move it.`, ratio: "contrast", dim: "Dimmer", fk: { led: "Direct", bounce: "Bounce", neg: "Negative" }, fn: { into: "into bounce", neg: "Floppy 1×1 m" }, stop: "stops", toFace: (r) => `${r} to face`,
    lay: "Lay cables", relay: "Lay them again", notYet: "No cables laid yet", ok: "OK · every phase under 80%", over: (p) => `${p} is over 80% · use 32 A`,
    total: "in total", most: (p) => `most on ${p}`, free: "free before 80%", add: "Add", distro: "16 A CEE · 3-phase", hall: "hall",
    planP: "An overhead plan of the kitchen with the lamps and the distro in the hall. Press Lay cables.",
    packed: (a, b) => `${a} of ${b} packed`, cstand: "C-stand", combo: "Combo stand", bag: "Sandbag 12 kg", cable: (n) => `Cable 16 A, 10 m`, distroL: "CEE 16 A distro, 3-phase",
    cam: "Camera, 18–85 mm", dolly: "Slider 1 m", tape: "Gaffer tape", kit: "From the Kitchen night kit",
    exp: "Export it all", expd: "Ready", pdf: "PDF",
    shotsH: "Shot list · scene 12", dayH: "The day", call: "Call", rig: "Light and camera up", lunch: "Lunch", wrap: "Wrap", next13: "Scene 13 · Stairwell", noShots: "No shots yet", min: "min", d0: "Gear list", d1: "Pack list", d2: "Shot list", d3: "Scene overview", scene12: "Scene 12 · Kitchen night", film: "3 scenes · 2 locations", gLight: "Light", gGrip: "Grip", gPower: "Power",
  };
  const ANNA = CAST.Maya, FACE_H = 1.2, LAMP_H = 2.0, CD = 3200;
  // Scenens lamper (delt mellem lys, strøm og pakkeliste). Key flyttes i trin 2; tilføjede lamper kommer fra trin 3.
  const KEY0 = { x: 1.35, y: 2.45 };
  const S = {
    lamps: [
      { id: "key", role: T.key, n: "LED 300 W", w: 300, x: KEY0.x, y: KEY0.y, stand: "c" },
      { id: "fill", role: T.fill, n: "LED 150 W", w: 150, x: 3.95, y: 2.4, stand: "c" },
      { id: "back", role: T.back, n: "Tungsten 650 W", w: 650, x: 1.55, y: 0.3, stand: "c", lab: [1.05, 0] },
      { id: "prac", role: T.prac, n: `${T.prac} 60 W`, w: 60, x: 2.6, y: 1.9, prac: true },
    ],
  };
  const EXTRA = [
    { n: DA ? "HMI 1,8 kW" : "HMI 1.8 kW", w: 1800, stand: "combo" }, { n: "Tungsten 2 kW", w: 2000, stand: "combo" },
  ];
  const SPOTS = [[2.45, 3.15, 0, -0.42], [3.95, 1.3], [0.6, 2.05, 0.95, 0], [3.25, 0.95], [1.1, 3.2, 0, -0.42], [4.0, 3.1, -0.95, 0]]; // x, y og evt. hvor etiketten sidder
  const changed = () => document.dispatchEvent(new CustomEvent("gg-lamps"));
  const z = (svg) => { const ppm = svg.clientWidth / BOX[2] || 60; return Math.max(0.62, Math.min(1.15, 64 / ppm)); };
  const pt = (svg, e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  const lampG = (l, a, cls = "") => l.prac
    ? `<g class="p-lamp prac ${cls}" transform="translate(${l.x} ${l.y})"><circle r=".11"/><circle r=".04" class="core"/></g>`
    : `<g class="p-lamp ${cls}" transform="translate(${l.x} ${l.y}) rotate(${a.toFixed(1)})"><rect x="-.2" y="-.13" width=".26" height=".26" rx=".03"/><path d="M.06,-.11 L.16,-.17 V.17 L.06,.11"/></g>`;
  const aimAt = (l, p = ANNA) => deg(Math.atan2(p.y - l.y, p.x - l.x));

  // ---------- 2. Lys ----------
  // 4. nov (Marcus): key, fill og baglys kan trækkes, og billedet viser lyset fra dem samlet. Den valgte lampe kan dæmpes
  // (dimmer 0–100 %). Hver lampe kan byttes (Marcus 4. nov): direkte, Bounce (lampen skyder ind i en 1×1 m bounce: blødt,
  // ca. 25 % af lyset, bruger stadig strøm) eller Negativ (en sort floppy i stedet for lampen, der tager rummets lys væk fra
  // den side; ingen strøm). Rummets eget lys er ca. 30 lx, 10 lx på en side med negativ.
  // Candela: LED 300 W spot, LED 150 W gennem diffusion, Tungsten 650 W fresnel.
  const CDS = { key: CD, fill: 700, back: 2600 };
  // Lamperne i appens motor (assets/app/viewer.min.js): key en LED-spot 300 W bicolor i en Light Dome (90 cm softbox), fill en LED-spot
  // 100 W i en lantern (65 cm), baglys en tungsten-fresnel 650 W på 50° med ND 0.9 (3 stop, i stedet for en scrim). Dimmerne starter, hvor en gaffer
  // ville sætte dem til køkkenet om natten ved EI 800 og T2.8: Maya ca. et stop over, fill ca. tre stop under key, kanten som key.
  const APPFX = { key: { id: "aputure-ls-300x", mod: "ld2", dim: 0.7 }, fill: { id: "amaran-100x-s", mod: "lantern65", dim: 1 }, back: { id: "arri-650-plus", beam: 50, nd: "ND 0.9", dim: 1 } };
  const TINT = { key: [241, 217, 168], fill: [222, 226, 232], back: [246, 210, 160], bounce: [236, 228, 210] };
  const AMB = 30, AMB_NEG = 10, WB = 5600;
  const kRGB = (K) => { const t = K / 100; let r, g, b;
    if (t <= 66) { r = 255; g = 99.47 * Math.log(t) - 161.12; b = t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04; }
    else { r = 329.7 * Math.pow(t - 60, -0.1332); g = 288.12 * Math.pow(t - 60, -0.0755); b = 255; }
    return [r, g, b].map((v) => Math.max(0, Math.min(255, v))); };
  const SKIN = [238, 216, 190], WBC = kRGB(WB);
  const skinTint = (K) => { const c = kRGB(K), m = Math.max(...c.map((v, i) => v / WBC[i])); return SKIN.map((v, i) => Math.round(Math.min(255, (v * (c[i] / WBC[i])) / m))); };
  const planTint = (K) => { const c = kRGB(K), m = Math.max(...c.map((v, i) => v / WBC[i])); return c.map((v, i) => Math.round(255 - (255 - (255 * (v / WBC[i])) / m) * 0.75)); };
  // 4. nov aften (Marcus): "Ansigt + 4 looks". Billedet starter tæt på Mayas ansigt (som appens lysviewer i Ansigt: samme sted som
  // kamera 12B, drejet mod ansigtet med en lang brændvidde, så lamperne er uden for billedet). Tre looks (Rembrandt, Split og
  // Rim; Blødt er taget ud) sætter key, fill og baglys som på settet og glider lamperne på plads på tegningen (ca. 400 ms). Lamperne kan stadig
  // trækkes; så er ingen look markeret. Dimmer, Kelvin og LED/Bounce/Negativ kommer først frem, når man klikker på en lampe.
  const LOOKS = [
    // θ: vinklen fra kameraets retning set fra Maya (+ mod kameraets venstre), d: afstand i meter (vandret), m: lampe, bounce eller negativ,
    // lh: lampens højde (standard 2 m), mod: lysformer (null = den bare lampe, hårdt lys; ellers lampens egen, APPFX). Baglyset står bag
    // Maya til højre, ved siden af køkkenbordet, og uden for billedet.
    // 3-punkt (Marcus 4. nov: standard): key i sin softbox ca. 45° til kameraets venstre og lidt over øjenhøjde, fill på den anden
    // side ca. 45° og svagere (ca. 1,5 stop under key), baglys bag Maya modsat key og uden for billedet. Udgangspunktet i Lys og i heroen.
    // 3-punkt: key ca. 55° og fill ca. 2 stop under (Marcus 4. nov: fill skal kunne ses, men der skal stadig være en skyggeside)
    { id: "three", n: DA ? "3-punkt" : "3-point", key: { th: 70, d: 1.5, m: "led", dim: 0.45, lh: 2.3 }, fill: { th: -40, d: 1.4, m: "led", dim: 0.6 }, back: { th: -130, d: 1.3, m: "led", dim: 0.4, k: 4300 } }, // baglyset: halv CTB og dæmpet (Marcus 4. nov: key så svagere ud, når et kraftigt 3200 K-baglys farvede hele billedet orange)
    { id: "rembrandt", n: "Rembrandt", key: { th: 55, d: 1.4, m: "led", dim: 0.12, mod: null, lh: 2.5 }, fill: { th: -30, d: 1.6, m: "led", dim: 0.35 }, back: { th: -115, d: 1.25, m: "led", dim: 1 } },
    { id: "split", n: "Split", key: { th: 90, d: 1.5, m: "led", dim: 0.12, mod: null, lh: 1.6 }, fill: { th: -90, d: 0.8, m: "neg" }, back: { th: -115, d: 1.25, m: "led", dim: 0.6 } },
    // Rim er taget ud (Marcus 4. nov): 3-punkt, Rembrandt og Split
    // { id: "rim", n: "Rim", key: { th: 135, d: 1.3, m: "led", dim: 0.15, mod: null }, fill: { th: -30, d: 1.5, m: "bounce", dim: 0.15 }, back: { th: -115, d: 1.25, m: "led", dim: 1 } },
    // Blødt er taget ud igen (Marcus 4. nov): tre looks, Rembrandt, Split og Rim
  ];
  const TL = DA
    ? { looks: "Looks", face: "Tæt på", hint: "Klik på en lampe for at dæmpe, skifte farve eller gøre den til en bounce", close: "Luk", edit: (r) => `Juster ${r}` }
    : { looks: "Looks", face: "Close-up", hint: "Click a lamp to dim it, change its colour or turn it into a bounce", close: "Close", edit: (r) => `Adjust ${r}` };
  function light(host) {
    host.innerHTML = `
      <figure class="stage cam-plan" role="group" aria-label="${T.planL}"><svg class="pl" viewBox="${BOX.join(" ")}"></svg><figcaption class="hint">${T.dragL}</figcaption></figure>
      <div class="cam-view">
        <figure class="cam-frame lit-frame"><svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice"></svg><span class="cam-code lit-cams"></span></figure>
        <div class="lit-looks" role="group" aria-label="${TL.looks}">${LOOKS.map((L) => `<button type="button" data-look="${L.id}" aria-pressed="false">${L.n}</button>`).join("")}</div>
        <div class="facts" aria-live="polite"></div>
        <div class="lit-panel">
          <p class="lit-hint">${TL.hint}</p>
          <div class="lit-edit" role="group" hidden>
            <div class="cam-lens lit-ctl"><b data-modelab></b><div class="seg" role="group">${["led", "bounce", "neg"].map((m) => `<button type="button" data-fill="${m}">${T.fk[m]}</button>`).join("")}</div><button type="button" class="lit-x" data-close aria-label="${TL.close}" title="${TL.close}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 5.5 L14.5 14.5 M14.5 5.5 L5.5 14.5"/></svg></button></div>
            <label class="cam-lens lit-dim"><span data-dimlab></span><input type="range" min="0" max="100" step="5" data-dim><b data-dimv></b></label>
            <label class="cam-lens lit-dim lit-k"><span data-klab></span><input type="range" min="2700" max="6500" step="100" data-k><b data-kv></b></label>
          </div>
        </div>
      </div>`;
    const svg = $(".pl", host), fr = $(".lit-frame svg", host), facts = $(".facts", host), stage = $(".stage", host), edit = $(".lit-edit", host), hint = $(".lit-hint", host);
    const dimIn = $("[data-dim]", host), dimLab = $("[data-dimlab]", host), dimV = $("[data-dimv]", host), dimRow = $(".lit-dim", host);
    const LAMPS = ["key", "fill", "back"].map((id) => S.lamps.find((l) => l.id === id));
    const key = LAMPS[0], byId = (id) => LAMPS.find((l) => l.id === id) || key;
    const ORDER = S.lamps.slice();
    LAMPS.forEach((l) => { l.dim = APPFX[l.id].dim; l.mode = "led"; l.n0 = l.n; l.w0 = l.w; l.k = /tungsten/i.test(l.n) ? 3200 : 5600; });
    const kIn = $("[data-k]", host), kLab = $("[data-klab]", host), kV = $("[data-kv]", host), kRow = $(".lit-k", host);
    let sel = key, open = false, look = "three";
    // Kameraet (Marcus 4. nov): lysfanen viser præcis samme billede som kamera 12B i trin 1 (plads, retning, tilt, højde og brændvidde,
    // som standard 50 mm). Lysfanen har intet eget kamera, så det, man lyser, er det, der kommer på film.
    const FACE_Z = 0.69 * 1.68; // siddende kvinde (appens faceH)
    const camOf = () => { const b = G.SHOTS[0]; return { c: b.c, x: b.x, y: b.y, h: b.h, a: b.a, t: b.t || 0, f: b.f }; };
    // Fra tegningen til billedet: x til højre i billedet, z mod kameraet (bruges af skitsen, før motoren er hentet)
    const toCam = (vx, vy) => { const c = camOf(), a = rad(c.a), dx = Math.cos(a), dy = Math.sin(a); return { x: -vx * dy + vy * dx, z: -(vx * dx + vy * dy) }; };
    const passive = (l) => l.mode === "neg";
    // Et sted set fra Maya: θ grader fra retningen mod kameraet (+ mod kameraets venstre), d meter væk
    const spot = (th, d) => { const c = camOf(), u = { x: c.x - ANNA.x, y: c.y - ANNA.y }, L = Math.hypot(u.x, u.y) || 1, a = rad(th), cx = u.x / L, cy = u.y / L;
      return { x: Math.min(ROOM.w - 0.2, Math.max(0.2, ANNA.x + d * (cx * Math.cos(a) - cy * Math.sin(a)))), y: Math.min(ROOM.d - 0.2, Math.max(0.2, ANNA.y + d * (cx * Math.sin(a) + cy * Math.cos(a)))) }; };
    // Negativ: floppyen tæt på Maya (ca. 0,8 m) på lampens side, vinkelret på kameraet, som på settet; langt væk gør den næsten intet
    const negSpot = (l) => { const c = camOf(), ca = rad(c.a), rx = -Math.sin(ca), ry = Math.cos(ca), side = Math.sign((l.x - ANNA.x) * rx + (l.y - ANNA.y) * ry) || 1; return { x: ANNA.x + rx * side * 0.8, y: ANNA.y + ry * side * 0.8 }; };
    // En negativ er grip, ikke en lampe: den forsvinder fra strømmen og pakkelistens lamper. En bounce bruger stadig lampen.
    function setMode(l, m, move = true) {
      if (m === "neg" && move) Object.assign(l, negSpot(l));
      l.mode = m; l.n = m === "neg" ? T.fn.neg : l.n0; l.w = m === "neg" ? 0 : l.w0;
      S.lamps = ORDER.filter((x) => x.mode !== "neg").concat(S.lamps.filter((x) => !ORDER.includes(x)));
      S.grip = { bounce: LAMPS.filter((x) => x.mode === "bounce").length, neg: LAMPS.filter((x) => x.mode === "neg").length };
      changed();
    }
    const geo = (l) => { const dh = Math.hypot(l.x - ANNA.x, l.y - ANNA.y); return { dh, d: Math.hypot(dh, (l.lh || LAMP_H) - FACE_Z) }; };
    const lux = (l) => {
      const { d } = geo(l);
      if (l.mode === "neg") return 0;
      return (CDS[l.id] * l.dim * (l.mode === "bounce" ? 0.25 : 1)) / (d * d);
    };
    const panelA = (l) => aimAt(l); // pladen vender mod Maya
    const beam = (l, on) => {
      if (l.mode === "neg") return "";
      const a = aimAt(l), L = 6, ha = l.mode === "bounce" ? 42 : l.id === "fill" ? 34 : 24, c = planTint(l.k).join(",");
      const p1 = [l.x + L * Math.cos(rad(a - ha)), l.y + L * Math.sin(rad(a - ha))], p2 = [l.x + L * Math.cos(rad(a + ha)), l.y + L * Math.sin(rad(a + ha))];
      const k = (on ? 1 : 0.55) * Math.max(0.15, l.dim) * (l.mode === "bounce" ? 0.6 : 1);
      return `<radialGradient id="lys-g-${l.id}" gradientUnits="userSpaceOnUse" cx="${l.x}" cy="${l.y}" r="4.5"><stop offset="0" stop-color="rgb(${c})" stop-opacity="${0.55 * k}"/><stop offset=".12" stop-color="rgb(${c})" stop-opacity="${0.32 * k}"/><stop offset=".3" stop-color="rgb(${c})" stop-opacity="${0.12 * k}"/><stop offset="1" stop-color="rgb(${c})" stop-opacity="0"/></radialGradient>` +
        `<polygon clip-path="url(#lys-rc)" points="${l.x},${l.y} ${p1} ${p2}" fill="url(#lys-g-${l.id})"/>`;
    };
    const shape = (l, on) => l.mode !== "led"
      ? `<g class="p-flag ${l.mode === "neg" ? "neg" : "bnc"}${on ? " on" : ""}" transform="translate(${l.x} ${l.y}) rotate(${panelA(l).toFixed(1)})"><rect x="-.05" y="-.48" width=".1" height=".96" rx=".02"/></g>`
      : lampG(l, aimAt(l), on ? "on" : "on2");
    // Lamperne i appens lysberegning (GGApp.lights): rigtige lamper med lysformer, i 2 m højde, rettet mod Mayas ansigt.
    // Bounce: en hvid 1 × 1 m bounce, hvor lampen stod, vendt mod Maya, og lampen (uden lysformer, spredt til 60°, så lyset fylder
    // bounce'en) 0,9 m foran den, skråt, rettet ind i den (én refleksion). Lampen står på den side, der vender væk fra kameraet.
    // Negativ: en sort floppy 1 × 1 m i stedet for lampen (appens negativ fill tager rummets lys fra den side).
    const tiltTo = (x, y, z0, tx, ty, tz) => deg(Math.atan2(tz - z0, Math.hypot(tx - x, ty - y)));
    function appLights(LS = LAMPS) {
      const out = [], c = camOf();
      for (const l of LS) {
        const fx = APPFX[l.id], a = aimAt(l);
        if (l.mode === "neg") { out.push({ id: l.id, kind: "flag", material: "floppy", x: l.x, y: l.y, rot: a, size: 1, fh: 1, zh: 1.2 }); continue; }
        const lh = l.lh || LAMP_H, base = { id: l.id, fixtureId: fx.id, mod: l.mod === undefined ? fx.mod : l.mod, beam: fx.beam, nd: fx.nd, dim: Math.round(l.dim * 100), k: l.k, lh };
        if (l.mode === "led") { out.push({ ...base, x: l.x, y: l.y, rot: a, tilt: tiltTo(l.x, l.y, lh, ANNA.x, ANNA.y, FACE_Z) }); continue; }
        out.push({ id: l.id + "-bnc", kind: "flag", material: "bounce", x: l.x, y: l.y, rot: a, size: 1, fh: 1, zh: 1.45 });
        const cand = [55, -55].map((s) => ({ x: Math.min(ROOM.w - 0.15, Math.max(0.15, l.x + 0.9 * Math.cos(rad(a + s)))), y: Math.min(ROOM.d - 0.15, Math.max(0.15, l.y + 0.9 * Math.sin(rad(a + s)))) }));
        const { x: px, y: py } = cand.sort((p, q) => Math.hypot(q.x - c.x, q.y - c.y) - Math.hypot(p.x - c.x, p.y - c.y))[0]; // den, der står længst fra kameraet
        out.push({ ...base, mod: null, beam: 60, x: px, y: py, lh: 1.6, rot: deg(Math.atan2(l.y - py, l.x - px)), tilt: tiltTo(px, py, 1.6, l.x, l.y, 1.45) });
      }
      return out;
    }
    // Kamerabilledet som i appens lysviewer: busten i ler i lampernes lys. Under et træk (og mens et look glider på plads) tegnes det
    // groft og højst én gang pr. billede, i fuld kvalitet, når man slipper.
    let raf = 0, hiT = 0;
    // Lamperne ses aldrig i billedet (Marcus 4. nov): appens hoveder, stativer, rammer, bounces og flare fjernes fra billedet; lyset fra dem bliver
    const noGear = (s) => s.replace(/<path class="cv-(?:stand|lamp|flag)[^"]*"[^>]*\/>/g, "").replace(/<g class="cv-flag[^"]*">[\s\S]*?<\/g>/g, "")
      .replace(/<radialGradient id="cvg[^"]*">[\s\S]*?<\/radialGradient><circle class="cv-glow"[^>]*\/>/g, "");
    function paint(busy) {
      const A = G.app(); if (!A) return false;
      const draw = (q) => { const c = camOf(); A.lights(appLights()); A.cams([c]); A.perf(q === "lo"); try { fr.innerHTML = G.appSVG(noGear(A.lit(c, Math.round(fr.clientWidth || 640), q, { names: false }))); } finally { A.perf(false); } };
      clearTimeout(hiT);
      if (busy) { if (!raf) raf = requestAnimationFrame(() => { raf = 0; draw("lo"); }); hiT = setTimeout(() => paint(false), 180); }
      else { cancelAnimationFrame(raf); raf = 0; draw("hi"); }
      return true;
    }
    function render(busy) {
      const zz = z(svg);
      let s = roomSVG(zz) + `<defs><clipPath id="lys-rc"><rect width="${ROOM.w}" height="${ROOM.d}"/></clipPath></defs>`;
      for (const l of LAMPS) if (l !== sel) s += beam(l, false);
      s += beam(sel, true);
      const { d } = geo(sel);
      // Afstanden lidt til siden for linjen, og navnet på den side, der vender væk fra Maya (også når den står bag hende)
      const hd = Math.hypot(sel.x - ANNA.x, sel.y - ANNA.y) || 1, ux = (sel.x - ANNA.x) / hd, uy = (sel.y - ANNA.y) / hd;
      let px = -uy, py = ux; if (py > 0.05 || (Math.abs(py) <= 0.05 && px < 0)) { px = -px; py = -py; }
      const mx = ANNA.x + (sel.x - ANNA.x) * 0.6 + px * 0.28, my = ANNA.y + (sel.y - ANNA.y) * 0.6 + py * 0.28;
      const behind = sel.y < ANNA.y - 0.2, lab = sel.mode === "neg" ? `${T.fk.neg} · ${T.fn.neg}` : `${sel.role} · ${sel.n}${sel.mode === "bounce" ? " " + T.fn.into : ""}` /* negativ hedder Negativ på tegningen (Marcus 4. nov) */, lw = (lab.length * 0.112 + 0.24) * zz / 2;
      let lbx = sel.x, lby = sel.y + (behind ? -1 : 1) * 0.42 * Math.max(zz, 0.8);
      const acy = ANNA.y - 0.2 - 0.24 * zz, aw = ((`Maya · ${DA ? "sidder" : "seated"}`).length * 0.112 + 0.24) * zz / 2;
      if (Math.abs(lbx - ANNA.x) < lw + aw && Math.abs(lby - acy) < 0.32 * zz) lby = acy - 0.33 * zz;
      s += `<line x1="${sel.x}" y1="${sel.y}" x2="${ANNA.x}" y2="${ANNA.y}" class="p-axis warm"/>`;
      for (const l of S.lamps) if (l.prac && !l.added) s += lampG(l, 0, "dim");
      s += castSVG(zz);
      for (const l of LAMPS) {
        const on = l === sel;
        s += `<g class="p-drag" tabindex="0" role="button" aria-label="${T.lampA(l.role)}" aria-pressed="${on && open}" data-lid="${l.id}">${shape(l, on)}<circle cx="${l.x}" cy="${l.y}" r=".42" class="p-hit" data-lamp="${l.id}"/><circle cx="${l.x}" cy="${l.y}" r=".38" class="p-focus"/></g>`;
        if (!on) { const up = l.y < ANNA.y - 0.2, cy = l.y + (up ? -1 : 1) * 0.36 * Math.max(zz, 0.8); if (Math.abs(cy - lby) < 0.3 * zz && Math.abs(l.x - lbx) < lw + 0.4) continue; s += chip(l.x, cy, (l.mode === "neg" ? T.fk.neg : l.mode === "bounce" ? `${l.role} · bounce` : l.role), zz, "lampc"); }
      }
      const clash = (Math.abs(mx - ANNA.x) < 1 && Math.abs(my - (ANNA.y - 0.42)) < 0.3) || (Math.abs(mx - lbx) < 0.95 && Math.abs(my - lby) < 0.3);
      if (!clash) s += chip(mx, my, `${f(d, 2)} m`, zz, "dimc");
      s += chip(Math.max(lw, Math.min(ROOM.w - lw, lbx)), lby, lab, zz, "lampc");
      const c = camOf();
      s += `<line x1="${c.x}" y1="${c.y}" x2="${ANNA.x}" y2="${ANNA.y}" class="p-axis lit-cam-axis"/><g class="p-cam lit-cam" transform="translate(${c.x} ${c.y}) rotate(${c.a})"><rect x="-.2" y="-.12" width=".24" height=".24" rx=".03" class="p-body"/><path d="M.04,-.07 L.13,-.1 L.13,.1 L.04,.07 Z" class="p-body"/></g>` + chip(c.x, c.y + 0.34 * Math.max(zz, 0.8), c.c, zz, "lampc");
      svg.innerHTML = s;
      $(".lit-cams", host).innerHTML = `<span>${c.c} · ${LOOKS.find((q) => q.id === look)?.n || G.sizeLabel(G.analyze(G.SHOTS[0]))} · ${c.f} mm</span><span>· WB ${WB.toLocaleString(LOC)} K</span>`;
      $$("[data-look]", host).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.look === look)));
      const Es = LAMPS.map(lux), A = G.app();
      if (!paint(busy)) { const kv = toCam(key.x - ANNA.x, key.y - ANNA.y), kh = Math.hypot(kv.x, kv.z) || 1;
        const img = shade(LAMPS.map((l, i) => ({ ...(() => { const v = toCam(l.x - ANNA.x, l.y - ANNA.y); return { lx: v.x, lz: v.z }; })(), ly: LAMP_H - FACE_H, w: Math.min(1.25, Math.sqrt(Es[i] / 850)), c: skinTint(l.k), soft: l.mode === "bounce" })).filter((q) => q.w > 0.001),
          { w: 0.22, negs: LAMPS.filter(passive).map((l) => { const v = toCam(l.x - ANNA.x, l.y - ANNA.y); return { lx: v.x, ly: 0, lz: v.z }; }) });
        const bk = Math.max(0.08, Math.min(1, Math.log2(Math.max(1, Es[0]) / 40) / Math.log2(3200 / 40))), front = Math.max(0, kv.z / kh), right = kv.x > 0;
        const fig = `<path d="${TORSO}"/><ellipse cx="80" cy="38" rx="13" ry="16.5"/>`;
        fr.innerHTML = `<defs><radialGradient id="wall-lit" cx="${right ? 0.85 : 0.15}" cy=".35" r=".6"><stop offset="0" stop-color="#f1d9a8" stop-opacity="${(0.11 * bk * (0.3 + 0.7 * front)).toFixed(3)}"/><stop offset="1" stop-color="#f1d9a8" stop-opacity="0"/></radialGradient></defs>` +
          `<rect width="160" height="90" class="f-wall"/><rect width="160" height="90" fill="url(#wall-lit)"/>` +
          `<g class="f-fig">${fig}</g><image href="${img}" x="0" y="0" width="160" height="90" preserveAspectRatio="none"/>` +
          `<g class="f-thirds"><line x1="53.3" x2="53.3" y2="90"/><line x1="106.7" x2="106.7" y2="90"/><line y1="30" y2="30" x2="160"/><line y1="60" y2="60" x2="160"/></g>`; }
      // Tallene og den valgte afstand. Med appens motor: lyset på Maya, som appens lysmåler regner det (faceReport): lux på ansigtet
      // (kalotten mod kameraet) og kontrasten som på settet: (key + skyggesiden) : skyggesiden, hvor skyggesiden er alt andet lys forfra
      let onFace, stops;
      if (A) { const F = A.face("Maya"), k = F?.key?.lux || 0, rest = Math.max(0.5, (F?.front || 0) - k); onFace = F?.tot || 0; stops = k > 0 ? Math.log2((k + rest) / rest) : 0; }
      // Før motoren er hentet: key + fill + rummet, kontrasten som på settet ((key + skyggesiden) : skyggesiden)
      else { const amb = LAMPS.some(passive) ? AMB_NEG : AMB, shadow = Es[1] + amb; onFace = Es[0] + shadow; stops = Math.log2(onFace / shadow); }
      facts.innerHTML = [[Math.round(onFace).toLocaleString(LOC), "lx", T.onAnna], [f(stops, 1), T.stop, T.ratio], [f(d, 2), "m", T.toFace(sel.role)]]
        .map(([v, u, w]) => `<div class="fact"><b>${v}${u ? `<small>${u}</small>` : ""}</b><span>${w}</span></div>`).join("");
      // Den klikkede lampe: navn, LED/Bounce/Negativ, dimmer og Kelvin (en bounce eller floppy er en passiv plade: ingen dimmer, ingen Kelvin)
      edit.hidden = !open; hint.hidden = open; edit.setAttribute("aria-label", TL.edit(sel.role));
      $$("[data-fill]", host).forEach((b2) => b2.setAttribute("aria-pressed", String(b2.dataset.fill === sel.mode)));
      $("[data-modelab]", host).textContent = sel.role; $("[data-fill=\"led\"]", host).textContent = (sel.n0 || "").split(" ")[0] || T.fk.led; $(".lit-ctl .seg", host).setAttribute("aria-label", sel.role); // lampens type: LED, Tungsten, HMI (Marcus 4. nov)
      dimRow.classList.toggle("off", (sel.mode !== "led"));
      dimLab.textContent = `${T.dim} · ${sel.role}`; dimIn.value = Math.round(sel.dim * 100); dimV.textContent = `${Math.round(sel.dim * 100)} %`;
      dimIn.setAttribute("aria-label", `${T.dim} ${sel.role}`); dimIn.disabled = (sel.mode !== "led");
      kRow.classList.toggle("off", (sel.mode !== "led")); kIn.disabled = (sel.mode !== "led"); kIn.value = sel.k; kLab.textContent = `Kelvin · ${sel.role}`; kV.textContent = `${sel.k.toLocaleString(LOC)} K`; kIn.setAttribute("aria-label", `Kelvin ${sel.role}`);
      host.dataset.sel = sel.id; host.dataset.modes = LAMPS.map((l) => l.mode).join(","); host.dataset.activeLook = look || ""; host.dataset.edit = String(open); // ikke data-fill/data-look: de navne bruger knapperne (closest)
    }
    const set = (l, x, y) => {
      l.x = Math.min(ROOM.w - 0.2, Math.max(0.2, x)); l.y = Math.min(ROOM.d - 0.2, Math.max(0.2, y));
      const dx = l.x - ANNA.x, dy = l.y - ANNA.y, dd = Math.hypot(dx, dy);
      if (dd < 0.55) { l.x = ANNA.x + (dx / (dd || 1)) * 0.55; l.y = ANNA.y + (dy / (dd || 1)) * 0.55; }
      render(!!drag); changed();
    };
    // Et look: modes og dimmere med det samme, lamperne glider på plads (ca. 400 ms; med "reducér bevægelse" springer de)
    let tween = 0;
    function applyLook(id, animate = true) {
      const L = LOOKS.find((q) => q.id === id); if (!L) return;
      cancelAnimationFrame(tween); look = id;
      const from = LAMPS.map((l) => ({ x: l.x, y: l.y })), to = LAMPS.map((l) => { const q = L[l.id], p = spot(q.th, q.d); return q.m === "neg" ? negSpot(p) : p; });
      LAMPS.forEach((l) => { const q = L[l.id]; setMode(l, q.m, false); if (q.dim != null) l.dim = q.dim; l.k = q.k || (/tungsten/i.test(l.n0) ? 3200 : 5600); l.lh = q.lh; l.mod = q.mod; });
      if (!animate || still()) { LAMPS.forEach((l, i) => Object.assign(l, to[i])); render(); changed(); return; }
      const t0 = performance.now(), ease = (t) => 1 - Math.pow(1 - t, 3);
      const step = (now) => { const t = Math.min(1, (now - t0) / 400), e = ease(t);
        LAMPS.forEach((l, i) => { l.x = from[i].x + (to[i].x - from[i].x) * e; l.y = from[i].y + (to[i].y - from[i].y) * e; });
        if (t < 1) { render(true); tween = requestAnimationFrame(step); } else { render(); changed(); } };
      tween = requestAnimationFrame(step);
    }
    const custom = () => { look = null; };
    let drag = null;
    svg.addEventListener("pointerdown", (e) => {
      const h = e.target.closest("[data-lamp]"); if (!h) return;
      cancelAnimationFrame(tween); sel = byId(h.dataset.lamp);
      const p = pt(svg, e); drag = { ox: p.x - sel.x, oy: p.y - sel.y, sx: e.clientX, sy: e.clientY, moved: false }; svg.setPointerCapture(e.pointerId); e.preventDefault(); stage.classList.add("used"); render();
    });
    svg.addEventListener("pointermove", (e) => {
      if (!drag) return; if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4) return;
      drag.moved = true; custom(); const p = pt(svg, e); set(sel, p.x - drag.ox, p.y - drag.oy);
    });
    // Et klik (uden træk) på en lampe åbner dens indstillinger
    const end = () => { if (drag) { if (!drag.moved) open = true; drag = null; render(); } };
    svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
    svg.addEventListener("touchstart", (e) => { if (e.target.closest?.("[data-lamp]")) e.preventDefault(); }, { passive: false });
    svg.addEventListener("keydown", (e) => {
      const g = e.target.closest("[data-lid]"); if (!g) return;
      const l = byId(g.dataset.lid);
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sel = l; open = true; render(); $(`[data-lid="${l.id}"]`, svg)?.focus({ preventScroll: true }); return; }
      if (e.key === "Escape" && open) { e.preventDefault(); open = false; render(); return; }
      const m = { ArrowLeft: [-0.1, 0], ArrowRight: [0.1, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] }[e.key]; if (!m) return;
      e.preventDefault(); stage.classList.add("used"); sel = l; custom(); set(l, l.x + m[0], l.y + m[1]); $(`[data-lid="${l.id}"]`, svg)?.focus({ preventScroll: true });
    });
    kIn.addEventListener("input", () => { if (sel.mode !== "led") return; sel.k = +kIn.value; custom(); stage.classList.add("used"); render(true); });
    dimIn.addEventListener("input", () => { if (sel.mode !== "led") return; sel.dim = +dimIn.value / 100; custom(); stage.classList.add("used"); render(true); });
    host.addEventListener("keydown", (e) => { if (e.key === "Escape" && open && e.target.closest?.(".lit-edit")) { open = false; render(); $(`[data-lid="${sel.id}"]`, svg)?.focus({ preventScroll: true }); } });
    host.addEventListener("click", (e) => {
      const lb = e.target.closest("[data-look]"); if (lb) { stage.classList.add("used"); applyLook(lb.dataset.look); return; }
      if (e.target.closest("[data-close]")) { open = false; render(); $(`[data-lid="${sel.id}"]`, svg)?.focus({ preventScroll: true }); return; }
      const fb = e.target.closest("[data-fill]");
      if (fb) { custom(); setMode(sel, fb.dataset.fill); stage.classList.add("used"); render(); }
    });
    host._set = (x, y, id = "key") => { sel = byId(id); custom(); set(sel, x, y); }; // til test og skærmbilleder
    host._fill = (m, id = "fill") => { sel = byId(id); custom(); setMode(sel, m); render(); };
    host._look = (id) => applyLook(id, false);
    // Til hero-billedet (assets/hero.js): de samme looks, det samme nærbillede og de samme lamper i appens lys, uden at røre demoen
    G.lys = {
      cam: camOf, noGear, spec: (lamps) => appLights(lamps), name: (id) => LOOKS.find((q) => q.id === id)?.n || "",
      look: (id) => { const L = LOOKS.find((q) => q.id === id) || LOOKS[0];
        return LAMPS.map((l) => { const q = L[l.id], p = spot(q.th, q.d), pos = q.m === "neg" ? negSpot(p) : p;
          return { id: l.id, role: l.role, n0: l.n0, w: l.w0, x: pos.x, y: pos.y, mode: q.m, dim: q.dim ?? APPFX[l.id].dim, lh: q.lh, mod: q.mod, k: q.k || (/tungsten/i.test(l.n0) ? 3200 : 5600) }; }); },
    };
    document.dispatchEvent(new CustomEvent("gg-lys"));
    applyLook("three", false);
    document.addEventListener("gg-shots", () => render());
    // Leret hentes først her (G.loadClay); indtil da tegner appen sin glatte buste
    const reached = () => { G.loadClay(); render(); };
    document.addEventListener("gg-step", (e) => { if (e.detail?.id === "light") reached(); });
    if (location.hash === "#light") reached();
    document.addEventListener("gg-app-ready", () => render()); document.addEventListener("gg-clay", () => render());
    render(); new ResizeObserver(() => render()).observe(host);
  }

  // Figuren i kamerabilledet (160 × 90): skuldrene og hovedet. shade() regner lyset pr. pixel på et lærred (3× opløsning) for hver
  // lampe og lægger dem sammen: normalen fra en ellipsoide (hoved: centrum 80,38, 13 × 16,5; krop: 80,100, 37 × 42), Lambert n·L og
  // en kant-maske, der lyser op langs konturen på den side, lyset kommer fra, når lampen står bagved. Farven blandes efter bidragene.
  // Rummets lys (amb) kommer fra alle sider; en negativ fill (amb.neg) tager det væk på sin side af ansigtet.
  const TORSO = "M44,90 C46,70 58,64 70,61 L74,57 L86,57 L90,61 C102,64 114,70 116,90 Z";
  const AMB_C = [196, 201, 208];
  let cv = null;
  function shade(lights, amb) {
    const K = 3, W = 160 * K, H = 90 * K;
    if (!cv) { cv = document.createElement("canvas"); cv.width = W; cv.height = H; }
    const c = cv.getContext("2d"), im = c.createImageData(W, H), d = im.data;
    const dir = (l) => { const n0 = Math.hypot(l.lx, l.ly, l.lz) || 1; return [l.lx / n0, -l.ly / n0, l.lz / n0]; }; // y nedad i billedet; lampen sidder over ansigtet
    const Ls = lights.map((l) => { const [Lx, Ly, Lz] = dir(l); return { Lx, Ly, Lz, back: Math.max(0, -Lz), lxy: Math.hypot(Lx, Ly) || 1, w: l.w, c: l.c, soft: !!l.soft }; });
    const NS = (amb.negs || []).map(dir);
    const parts = [[80, 38, 13, 16.5], [80, 100, 37, 42]];
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
      const X = (px + 0.5) / K, Y = (py + 0.5) / K;
      let nx = 0, ny = 0;
      for (const q of parts) { nx = (X - q[0]) / q[2]; ny = (Y - q[1]) / q[3]; if (nx * nx + ny * ny < 1) break; }
      const r2 = nx * nx + ny * ny; if (r2 > 1) { if (r2 > 1.5) continue; const r = Math.sqrt(r2); nx /= r; ny /= r; } // uden for ellipsoiden, men inden for skuldrene: kanten
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)), edge = Math.pow(1 - nz, 2.6), nh = Math.hypot(nx, ny) || 1;
      let V = 0, R = 0, G2 = 0, B = 0;
      for (const L of Ls) {
        const dot = nx * L.Lx + ny * L.Ly + nz * L.Lz, dif = L.soft ? Math.max(0, (dot + 0.45) / 1.45) * 0.9 : Math.max(0, dot); // en bounce er en stor kilde: lyset går længere rundt om ansigtet
        const side = Math.max(0, (nx * L.Lx + ny * L.Ly) / L.lxy / nh);
        const rim = edge * L.back * (side * (1 - 0.5 * L.back * L.back) + 0.5 * L.back * L.back) * 1.7;
        const v = (dif * 0.95 + rim) * L.w; if (v <= 0) continue;
        V += v; R += L.c[0] * v; G2 += L.c[1] * v; B += L.c[2] * v;
      }
      let va = amb.w * 0.7; for (const N of NS) va *= 1 - 0.92 * Math.max(0, nx * N[0] + ny * N[1] + nz * N[2]);
      V += va; R += AMB_C[0] * va; G2 += AMB_C[1] * va; B += AMB_C[2] * va;
      const i = (py * W + px) * 4, a = Math.min(0.92, (Math.min(1, V) + 0.02) * 0.9);
      if (V > 0) { d[i] = R / V; d[i + 1] = G2 / V; d[i + 2] = B / V; } else { d[i] = AMB_C[0]; d[i + 1] = AMB_C[1]; d[i + 2] = AMB_C[2]; }
      d[i + 3] = Math.round(255 * a);
    }
    c.putImageData(im, 0, 0);
    // Klip til figurens kontur (blød kant), så lyset ikke går uden for skuldrene
    c.globalCompositeOperation = "destination-in"; c.save(); c.scale(K, K);
    const m = new Path2D(TORSO); m.ellipse(80, 38, 13, 16.5, 0, 0, Math.PI * 2); c.fill(m); c.restore(); c.globalCompositeOperation = "source-over";
    return cv.toDataURL();
  }

  // ---------- 3. Strøm ----------
  function power(host) {
    host.innerHTML = `
      <figure class="stage cam-plan pw-plan" role="group" aria-label="${T.planP}"><svg class="pl" viewBox="${BOX.slice(0, 3).join(" ")} ${ROOM.d + 1.8}"></svg></figure>
      <div class="pw-side">
        <div class="pw-panel">
          <p class="pw-t"><b>${T.distroL}</b></p>
          <div class="phases">${[1, 2, 3].map((i) => `<div class="ph" data-ph="${i - 1}"><span class="ph-n">L${i}</span><span class="ph-bar"><i></i><em></em></span><span class="ph-a">0,0 / 16 A</span></div>`).join("")}</div>
          <p class="pw-ok" aria-live="polite">${T.notYet}</p>
        </div>
        <div class="facts pw-facts"></div>
        <div class="pw-tools"><button type="button" class="btn solid sm" data-lay>${T.lay}</button><button type="button" class="chip ghost" data-reset>${T.reset}</button><span class="pw-add"><span class="pw-try">${T.tooMany}</span>${EXTRA.map((x, i) => `<button type="button" class="chip" data-add="${i}">+ ${x.n}</button>`).join("")}</span></div>
      </div>`;
    const svg = $(".pl", host), okEl = $(".pw-ok", host), factsEl = $(".pw-facts", host), lay = $("[data-lay]", host);
    let laid = false, shown = new Set(), timers = [];
    const assign = () => {
      const amp = [0, 0, 0], ph = {};
      [...S.lamps].sort((a, b) => b.w - a.w).forEach((l) => { const k = amp.indexOf(Math.min(...amp)); ph[l.id] = k; amp[k] += l.w / 230; });
      return { amp, ph };
    };
    const D = ROOM.d;
    const route = (l, i) => {
      const o = i * 0.05, x0 = -0.72 + o, yDoor = 1.32 - o, xIn = 0.1 + o;
      const pts = [[x0, 2.05], [x0, yDoor], [xIn, yDoor]];
      if (l.x < 0.75 && Math.abs(l.y - yDoor) < 2.6) pts.push([xIn, l.y], [l.x, l.y]);
      else if (l.y < yDoor || l.prac) { const yw = 0.1 + o; pts.push([xIn, yw], [l.x, yw], [l.x, l.y]); }
      else { const yw = D - 0.1 - o; pts.push([xIn, yw], [l.x, yw], [l.x, l.y]); }
      return "M" + pts.map((p) => p.map((v) => v.toFixed(3)).join(",")).join(" L");
    };
    // På en smal skærm: mindre etiketter og kun watt + fase ("2 kW · L1"), så de ikke ligger oven i hinanden
    const short = (l) => (l.w >= 1000 ? f(l.w / 1000) + " kW" : l.w + " W");
    function render(animate) {
      const narrow = svg.clientWidth < 520, zz = z(svg) * (narrow ? 0.82 : 1), { amp, ph } = assign();
      let s = roomSVG(zz);
      // Tavlen i gangen, uden for døren
      s += `<g class="p-distro"><rect x="-.8" y="2.05" width=".5" height=".34" rx=".04"/><path d="M-.7,2.22 h.3"/></g>` + chip(-0.55, 2.68, "16 A", zz, "lampc");
      const order = S.lamps.map((l, i) => [l, i]);
      // Den lampe, der tippede en fase over 80 %: den sidst tilføjede på fasen. Den og dens kabel bliver tydeligt røde, de andre
      // på fasen får en svag rød tone (CSS .pl.ov0–2), når fasen fyldes over grænsen. "Læg kablerne igen" og Nulstil fjerner det, når det holder.
      const cul = {}; S.lamps.forEach((l) => { if (amp[ph[l.id]] > 12.8) cul[ph[l.id]] = l.id; });
      const isCul = (l) => cul[ph[l.id]] === l.id;
      let k = 0;
      for (const [l, i] of order) {
        if (!laid) break;
        const fresh = animate && !shown.has(l.id), delay = fresh ? k++ * 0.32 : 0;
        s += `<path d="${route(l, i)}" pathLength="1" class="p-cable ph${ph[l.id]}${isCul(l) ? " cul" : ""}${fresh && !still() ? " draw" : ""}" style="animation-delay:${delay}s"/>`;
      }
      s += castSVG(zz).replace(/class="p-chip who"/g, 'class="p-chip who faint"');
      for (const l of S.lamps) {
        const lp = laid ? ` lp${ph[l.id]}${isCul(l) ? " cul" : ""}` : "";
        s += lampG(l, aimAt(l), "on2" + lp);
        const [dx, dy] = l.lab || [0, (l.prac ? 0.3 : 0.4) * Math.max(zz, 0.8)];
        const nm = narrow ? short(l) : l.n;
        const cx = l.x + dx * (narrow ? 0.75 : 1), cy = l.y + dy;
        if (laid && isCul(l)) s += chip(cx, cy, `${nm} · L${ph[l.id] + 1}`, zz, `lampc cul-off${lp}`) + chip(cx, cy, `${nm} · L${ph[l.id] + 1} !`, zz, `lampc hot cul-on${lp}`);
        else s += chip(cx, cy, laid ? `${nm} · L${ph[l.id] + 1}` : nm, zz, "lampc");
      }
      svg.innerHTML = s;
      // Faserne fyldes op, efterhånden som kablerne når frem
      const delays = {}; let kk = 0;
      for (const l of S.lamps) { const fresh = animate && laid && !shown.has(l.id); delays[l.id] = fresh && !still() ? kk++ * 320 + 420 : 0; }
      timers.forEach(clearTimeout); timers = [];
      const cur = [0, 0, 0];
      const paint = () => {
        const over = cur.findIndex((a) => a > 12.8);
        $$(".ph", host).forEach((row, i) => {
          $("i", row).style.width = Math.min(100, (cur[i] / 16) * 100) + "%";
          row.classList.toggle("over", cur[i] > 12.8);
          $(".ph-a", row).textContent = `${f(cur[i])} / 16 A`;
        });
        okEl.textContent = !laid ? T.notYet : over >= 0 ? T.over("L" + (over + 1)) : T.ok;
        [0, 1, 2].forEach((i) => svg.classList.toggle("ov" + i, laid && cur[i] > 12.8));
        okEl.className = "pw-ok" + (!laid ? "" : over >= 0 ? " bad" : " good");
      };
      if (!laid) paint();
      else {
        for (const l of S.lamps) {
          const add = () => { cur[ph[l.id]] += l.w / 230; paint(); };
          if (delays[l.id]) timers.push(setTimeout(add, delays[l.id])); else add();
        }
        S.lamps.forEach((l) => shown.add(l.id));
      }
      const total = S.lamps.reduce((a, l) => a + l.w, 0), worst = amp.indexOf(Math.max(...amp)), bad = amp[worst] > 12.8;
      factsEl.innerHTML = [[f(total / 1000), "kW", T.total], [f(amp[worst]), "A", T.most("L" + (worst + 1)), bad ? "bad" : ""], [f(Math.max(0, 12.8 - amp[worst])), "A", T.free, bad ? "bad" : ""]]
        .map(([v, u, w, c]) => `<div class="fact${c ? " " + c : ""}"><b>${v}<small>${u}</small></b><span>${w}</span></div>`).join("");
      lay.textContent = laid ? T.relay : T.lay;
      $$("[data-add]", host).forEach((b) => (b.disabled = S.lamps.filter((l) => l.added).length >= SPOTS.length));
    }
    lay.addEventListener("click", () => { laid = true; shown.clear(); render(true); });
    host.addEventListener("click", (e) => {
      const a = e.target.closest("[data-add]");
      if (a) { const x = EXTRA[+a.dataset.add], n = S.lamps.filter((l) => l.added).length; if (n >= SPOTS.length) return; const [sx, sy, lx, ly] = SPOTS[n]; S.lamps.push({ ...x, id: "x" + Date.now(), role: "", x: sx, y: sy, added: true, ...(lx !== undefined ? { lab: [lx, ly] } : {}) }); render(true); changed(); }
      if (e.target.closest("[data-reset]")) { S.lamps = S.lamps.filter((l) => !l.added); laid = false; shown.clear(); render(); changed(); }
    });
    document.addEventListener("gg-lamps", () => render(laid));
    render(); new ResizeObserver(() => render()).observe(host);
  }

  // ---------- 4. Produktion: pakkelisten ----------
  // Pakkelisten deles mellem trin 4 (ving af) og pakkelistens ark i trin 5
  const PACK = { done: null };
  function packRows() {
    const n = (k) => S.lamps.filter((l) => !l.prac && (l.stand || "c") === k).length;
    const lampRows = Object.entries(S.lamps.reduce((m, l) => ((m[l.n] = (m[l.n] || 0) + 1), m), {})).map(([nm, q]) => [q, nm]);
    const stands = n("c"), combos = n("combo");
    return [...lampRows, ...(stands ? [[stands, T.cstand]] : []), ...(combos ? [[combos, T.combo]] : []), [stands + combos, T.bag], ...(S.grip?.bounce ? [[S.grip.bounce, "Bounce 1×1 m"]] : []), ...(S.grip?.neg ? [[S.grip.neg, T.fn.neg]] : []),
      [S.lamps.length, T.cable()], [1, T.distroL], [1, T.cam], [1, T.dolly], [2, T.tape]];
  }
  // Pakkelisten starter tom (Marcus 4. nov): "0 af N pakket", og man sætter selv fluebenene i trin 4
  PACK.done = new Set();

  function pack(host) {
    const done = PACK.done, rows = packRows;
    function render() {
      const r = rows(), keys = r.map((x) => x[1]);
      [...done].forEach((k) => { if (!keys.includes(k)) done.delete(k); });
      const got = r.filter((x) => done.has(x[1])).length;
      host.innerHTML = `<div class="pk-head"><b>${T.packed(got, r.length)}</b><span class="pk-bar"><i style="width:${(got / r.length) * 100}%"></i></span></div>` +
        `<ul class="pk">${r.map(([q, nm]) => `<li><button type="button" role="checkbox" aria-checked="${done.has(nm)}" data-k="${esc(nm)}"><span class="box"></span><span class="q">${q} ×</span><span class="nm">${esc(nm)}</span></button></li>`).join("")}</ul>` +
        `<p class="fine pk-kit">${T.kit}</p>`;
    }
    host.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b) return; const k = b.dataset.k; done.has(k) ? done.delete(k) : done.add(k); render(); document.dispatchEvent(new CustomEvent("gg-pack")); host.querySelector(`[data-k="${CSS.escape(k)}"]`)?.focus({ preventScroll: true }); });
    document.addEventListener("gg-lamps", render);
    render();
  }


  // ---------- 4. Produktion: dine shots og dagen (4. nov) ----------
  // Shotlisten er shotsene fra trin 1 (G.live()), med stregbillede, størrelse, brændvidde og hvem der er i billedet. Tidsplanen:
  // call 07:30, lys og kamera op 60 min, så ét slot pr. shot (første 45 min, de næste 35 min, fordi lyset kun justeres),
  // frokost og scene 13. Tegnes igen, når man kommer til trinnet eller tilføjer et kamera.
  function prodShots(host) {
    const hm = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    function render() {
      const shots = G.live ? G.live() : G.SHOTS;
      const cards = shots.map((sh) => { const a = G.analyze(sh); return `<li class="ps-card"><svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${G.frameSVG(sh, { labels: false, w: 240 })}</svg><span class="cap"><b>${sh.c}</b><em>${G.sizeLabel(a)}</em><i>${sh.f} mm</i></span><span class="who">${esc(a.inF.map((o) => o.n).join(", ") || T.noShots)}</span></li>`; }).join("");
      let t = 7 * 60 + 30; const rows = [[hm(t), T.call, ""]]; t += 30;
      rows.push([hm(t), T.rig, `60 ${T.min}`]); t += 60;
      shots.forEach((sh, i) => { const d = i ? 35 : 45; rows.push([hm(t), `${sh.c} · ${G.sizeLabel(G.analyze(sh))} · ${sh.f} mm`, `${d} ${T.min}`, true]); t += d; });
      t = Math.max(t, 11 * 60 + 30); rows.push([hm(t), T.lunch, `30 ${T.min}`]); t += 30; rows.push([hm(t), T.next13, ""]);
      host.innerHTML = `<h3>${T.shotsH}</h3><ol class="ps">${cards}</ol><h3>${T.dayH}</h3><ol class="day">${rows.map(([tm, w, d, sh]) => `<li${sh ? ' class="sh"' : ""}><b>${tm}</b><span>${esc(w)}</span><i>${d}</i></li>`).join("")}</ol>`;
    }
    document.addEventListener("gg-shots", render);
    document.addEventListener("gg-step", (e) => { if (e.detail?.id === "production") render(); }); document.addEventListener("gg-app-ready", () => render());
    render();
  }

  // ---------- 5. Levering: fire ark viftet ud, som pæne miniaturer af de rigtige PDF'er ----------
  // Grejliste (Lys/Grip/Strøm med antal), Pakkeliste (afkrydsning fra trin 4), Shotliste (12A–12C med stregbilleder, størrelse,
  // optik) og Sceneoversigt. Data fra den røde tråd: lamperne fra trin 2–3, pakkelisten fra trin 4 og shots fra trin 1.
  // Et klik (eller hover) løfter et ark frem; "Eksportér det hele" sætter PDF ✓ på hvert og folder dem ned i en mappe.
  function deliver(host) {
    const btn = $("[data-export]", host); if (!btn) return;
    const fan = $(".fan", host), leaves = $$(".leaf", host), scenes = JSON.parse(host.dataset.scenes || "[]");
    const head = (t, sub) => `<span class="pp-h"><b>${t}</b><small>${sub}</small></span>`;
    const foot = `<span class="pp-f"><span class="gg-word">Gaffer<span>Grid</span></span><span>1/1</span></span>`;
    const rowsG = (title, items) => items.length ? `<span class="pp-g">${title}</span>` + items.map(([q, n]) => `<span class="pp-r"><i>${q} ×</i><span>${esc(n)}</span></span>`).join("") : "";
    function render() {
      const lampRows = Object.entries(S.lamps.reduce((m, l) => ((m[l.n] = (m[l.n] || 0) + 1), m), {})).map(([nm, q]) => [q, nm]);
      const n = (k) => S.lamps.filter((l) => !l.prac && (l.stand || "c") === k).length, stands = n("c"), combos = n("combo");
      const grip = [...(stands ? [[stands, T.cstand]] : []), ...(combos ? [[combos, T.combo]] : []), [stands + combos, T.bag]];
      const pow = [[1, T.distroL], [S.lamps.length, T.cable()]];
      const pr = packRows();
      const docs = [
        head(T.d0, T.scene12) + rowsG(T.gLight, lampRows) + rowsG(T.gGrip, grip) + rowsG(T.gPower, pow) + foot,
        // Arket i Levering er altid en tom liste, klar til print (Marcus 4. nov): ingen flueben, heller ikke dem fra trin 4
        head(T.d1, T.scene12) +
          pr.map(([q, nm]) => `<span class="pp-r pp-ck"><s></s><i>${q} ×</i><span>${esc(nm)}</span></span>`).join("") + foot,
        head(T.d2, T.scene12) + (G.live ? G.live() : G.SHOTS).map((sh) => { const a = G.analyze(sh); return `<span class="pp-shot"><svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${G.frameSVG(sh, { labels: false, w: 200 })}</svg><span><b>${sh.c}</b><small>${G.sizeLabel(a)} · ${sh.f} mm</small><small>${a.inF.map((o) => o.n).join(", ") || "–"}</small></span></span>`; }).join("") + foot,
        head(T.d3, T.film) + scenes.map(([no, sl, who, sh]) => `<span class="pp-sc"><b>${no}</b><span><span>${esc(sl)}</span><small>${esc(who)} · ${esc(sh)}</small></span></span>`).join("") + foot,
      ];
      $$("[data-doc]", host).forEach((el) => (el.innerHTML = docs[+el.dataset.doc]));
      // "Dine ændringer følger med" (Marcus 3. nov): én linje under mappen med det, du har lavet i trinene (shots og brændvidder fra
      // Frame, lamperne fra Light/Power, den mest belastede fase). Intet gemmes eller sendes; det lever kun i fanen.
      let sum = $("[data-plansum]", host); if (!sum) { sum = document.createElement("p"); sum.className = "plan-sum fine"; sum.dataset.plansum = ""; $(".deliver-cta", host)?.prepend(sum); }
      const amp = [0, 0, 0]; [...S.lamps].sort((a, b) => b.w - a.w).forEach((l) => { const k = amp.indexOf(Math.min(...amp)); amp[k] += l.w / 230; });
      const pk = amp.indexOf(Math.max(...amp)), pct = Math.round((amp[pk] / 16) * 100), mm = [...new Set((G.live ? G.live() : G.SHOTS).map((s) => s.f))].join("/");
      const nl = S.lamps.length, ns = (G.live ? G.live() : G.SHOTS).length;
      sum.textContent = DA ? `Din plan: ${ns} ${ns === 1 ? "shot" : "shots"} · ${mm} mm · ${nl} ${nl === 1 ? "lampe" : "lamper"} · L${pk + 1} ${pct} %` : `Your plan: ${ns} ${ns === 1 ? "shot" : "shots"} · ${mm} mm · ${nl} ${nl === 1 ? "lamp" : "lamps"} · L${pk + 1} ${pct}%`;
    }
    const lift = (leaf) => leaves.forEach((l) => { const on = l === leaf && l.getAttribute("aria-pressed") !== "true"; l.classList.toggle("up", on); l.setAttribute("aria-pressed", String(on)); });
    leaves.forEach((l) => l.addEventListener("click", (e) => { e.stopPropagation(); if (fan.classList.contains("folded")) { unfold(); return; } lift(l); }));
    document.addEventListener("click", (e) => { if (!e.target.closest?.(".fan")) lift(null); });
    host.addEventListener("keydown", (e) => { if (e.key === "Escape") lift(null); });
    let tm = [];
    const unfold = () => { tm.forEach(clearTimeout); fan.classList.remove("folded"); btn.textContent = host.dataset.exp; };
    $(".folder", host).addEventListener("click", unfold);
    btn.addEventListener("click", () => {
      if (fan.classList.contains("folded")) { unfold(); return; }
      lift(null); tm.forEach(clearTimeout); tm = [];
      leaves.forEach((l) => l.classList.remove("ready"));
      const step = still() ? 0 : 180;
      leaves.forEach((l, i) => tm.push(setTimeout(() => l.classList.add("ready"), still() ? 0 : 160 + i * step)));
      tm.push(setTimeout(() => { fan.classList.add("folded"); btn.textContent = host.dataset.fold; }, still() ? 0 : 160 + leaves.length * step + 650));
    });
    document.addEventListener("gg-lamps", render); document.addEventListener("gg-step", render); document.addEventListener("gg-shots", render); document.addEventListener("gg-app-ready", render);
    render();
  }

  const run = (sel, fn) => { const el = document.querySelector(sel); if (el) try { fn(el); } catch (e) { console.error(e); } };
  run("[data-light-demo]", light);
  run("[data-power-demo]", power);
  run("[data-pack]", pack);
  run("[data-prod-shots]", prodShots);
  run("[data-deliver]", deliver);
})();
