// a mid-century scene ground: one colour plane and a floor band
function stage(g, S, wall, floor, floorY) {
  paperGround(g, S, wall); world(g, S);
  if (floor) { g.fillStyle = floor; g.fillRect(-0.7, floorY, 1.4, 2); inked({ ...g, __proto__: g }, 0, 0, () => {}, 0); }
}
// a dimension arrow with end ticks, drawn on from the middle out
function dimArrow(g, t, x, y0, y1, k, salt) {
  if (k <= 0) return; const m = (y0 + y1) / 2, e = EASE.out(clamp(k)), a = lerp(m, y0, e), b = lerp(m, y1, e);
  inked(g, t, salt, (g) => { g.moveTo(x, a); g.lineTo(x, b); g.moveTo(x - 0.022, y0); g.lineTo(x + 0.022, y0); g.moveTo(x - 0.022, y1); g.lineTo(x + 0.022, y1); }, 0.0045);
  if (e > 0.6) for (const [yy, d] of [[a, 1], [b, -1]]) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x - 0.013, yy + d * 0.022); g.lineTo(x + 0.013, yy + d * 0.022); g.closePath(); g.fillStyle = PALETTE.ink; g.fill(); }
}
function grassStrip(g, t, y, h, color, n = 60, salt = 1, x0 = -0.62, x1 = 0.62) {
  g.beginPath(); g.moveTo(x0, y + 0.3);
  for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n), sw = 0.004 * Math.sin(twos(t) * 3 + i + salt); g.lineTo(x + sw, y - h * (0.55 + 0.45 * hash1(i * 7 + salt))); g.lineTo(x + (x1 - x0) / n / 2, y); }
  g.lineTo(x1, y + 0.3); g.closePath(); g.fillStyle = color; g.fill();
}

function deckLifts(g, k, t, S) {
  // slow push 4 %, 3.5 s, ease-in-out, on the mower deck; the lever is pulled and the deck rises to 5 cm
  stage(g, S, '#E8D7A2', null, 0);
  const push = lerp(1.0, 1.04, EASE.inOut(k)); g.scale(push, push);
  const lift = MOTION.anticipate(MOTION.at(t, CUES.s2 + 0.6, 0.45), 0.2, 0.3), up = clamp(lift) * 0.07;   // deck height: 3 cm → 5 cm
  const GY = 0.3;                                                                   // the ground line
  // far: a hint of the villa wall and an olive crown against the wall plane
  cel(g, t, 300, rr(-0.7, -0.2, 1.4, 0.18, 0), '#F4EEDF'); inked(g, t, 301, (g) => { g.moveTo(-0.7, -0.2); g.lineTo(0.7, -0.2); g.moveTo(-0.7, -0.02); g.lineTo(0.7, -0.02); }, 0.003);
  cel(g, t, 302, (g) => { g.arc(-0.33, -0.3, 0.12, 0, TAU); g.moveTo(-0.13, -0.27); g.arc(-0.2, -0.27, 0.08, 0, TAU); }, PALETTE.olive); inked(g, t, 303, (g) => { g.arc(-0.33, -0.3, 0.12, 0, TAU); }, 0.003);
  // ground: soil band and uncut grass behind
  g.fillStyle = '#8C6B45'; g.fillRect(-0.7, GY, 1.4, 1.2);
  for (let i = 0; i < 30; i++) dot(g, S, -0.6 + hash1(i) * 1.2, GY + 0.05 + hash1(i + 50) * 0.5, 0.006 + hash1(i + 9) * 0.008, '#74583A', 0.8);
  grassStrip(g, t, GY, 0.11, PALETTE.lawnDry, 70, 3);
  // the cut height under the deck: blades stand at the deck's height, longer as it rises
  const deckX = 0.02, deckW = 0.5, deckY = GY - 0.085 - up;
  grassStrip(g, t, GY, 0.05 + up * 0.95, mixHex(PALETTE.lawnDry, PALETTE.lawn, 0.4), 40, 9, deckX - deckW / 2, deckX + deckW / 2);
  inked(g, t, 304, (g) => { g.moveTo(-0.7, GY); g.lineTo(0.7, GY); }, 0.004);
  // mower: deck shell, wheels below, the handle up to the left with the height lever
  const shell = (g) => { g.moveTo(deckX - deckW / 2, deckY + 0.05); g.lineTo(deckX - deckW / 2 + 0.03, deckY - 0.07); g.lineTo(deckX + deckW / 2 - 0.05, deckY - 0.08); g.quadraticCurveTo(deckX + deckW / 2 + 0.01, deckY - 0.06, deckX + deckW / 2, deckY + 0.05); g.closePath(); };
  dropShadow(g, shell, 0.016, 0.02, 0.22);
  cel(g, t, 305, shell, '#6E8F8C');
  g.save(); g.beginPath(); shell(g); g.clip(); g.fillStyle = 'rgba(20,40,40,0.18)'; g.fillRect(deckX - 0.3, deckY + 0.0, 0.6, 0.06); g.fillStyle = 'rgba(255,255,240,0.18)'; g.fillRect(deckX - 0.3, deckY - 0.08, 0.6, 0.025); g.restore();
  inked(g, t, 306, shell, 0.004);
  text(g, S, 'EGE', deckX + 0.03, deckY - 0.02, 0.04, '#F4EEDF', 1, 0.1, { role: 'display', weight: 400 });
  for (const wx of [deckX - deckW / 2 + 0.07, deckX + deckW / 2 - 0.08]) {
    const wy = GY - 0.045, spin = t * 3;
    // wheel axle drops below the deck as it rises
    inked(g, t, 307, (g) => { g.moveTo(wx, deckY + 0.04); g.lineTo(wx, wy); }, 0.006);
    dropShadow(g, disc(wx, wy, 0.045), 0.008, 0.01, 0.3);
    cel(g, t, 308, disc(wx, wy, 0.045), '#2F3533'); cel(g, t, 309, disc(wx, wy, 0.02), '#B9C2BC'); inked(g, t, 310, disc(wx, wy, 0.045), 0.003);
    g.beginPath(); g.moveTo(wx + Math.cos(spin) * 0.03, wy + Math.sin(spin) * 0.03); g.lineTo(wx - Math.cos(spin) * 0.03, wy - Math.sin(spin) * 0.03); g.strokeStyle = '#5B6461'; g.lineWidth = 0.004; g.stroke();
  }
  const hx = deckX - deckW / 2 + 0.05, hy = deckY - 0.06;
  inked(g, t, 311, (g) => { g.moveTo(hx, hy); g.lineTo(hx - 0.2, hy - 0.42); g.lineTo(hx - 0.26, hy - 0.44); }, 0.009);
  // the height lever: pulled back by the gloved hand, then settles
  const lev = lerp(-0.5, 0.35, clamp(lift)), lx = hx + 0.06, ly = deckY - 0.075;
  g.save(); g.translate(lx, ly); g.rotate(lev);
  inked(g, t, 312, (g) => { g.moveTo(0, 0); g.lineTo(0, -0.14); }, 0.008, PALETTE.terra);
  const glove = (g) => { g.ellipse(0, -0.15, 0.03, 0.026, 0, 0, TAU); for (let f = 0; f < 4; f++) { g.moveTo(0.03, -0.17 + f * 0.012); g.ellipse(0.024, -0.172 + f * 0.012, 0.014, 0.006, 0, 0, TAU); } };
  cel(g, t, 313, glove, PALETTE.mustard); inked(g, t, 314, glove, 0.003);
  g.restore();
  // a sleeve coming in from the left edge to the glove
  // dimension arrow, popping on the cue: blade tip to ground = 5 cm
  dimArrow(g, t, deckX + deckW / 2 + 0.07, GY, GY - 0.05 - up * 0.95, MOTION.at(t, CUES.arrow, 0.35), 315);
  const ak = MOTION.at(t, CUES.arrow + 0.2, 0.3);
  if (ak > 0) { g.save(); g.translate(deckX + deckW / 2 + 0.07, GY - 0.24); const s = MOTION.back(ak, 2.2); g.scale(s, s);
    cel(g, t, 316, rr(-0.085, -0.045, 0.17, 0.09, 0.02), '#FBF6EA'); inked(g, t, 317, rr(-0.085, -0.045, 0.17, 0.09, 0.02), 0.003);
    text(g, S, '5 cm', 0, 0, 0.052, PALETTE.ink, 1, 0, { role: 'display', weight: 400 }); g.restore(); }
  // a few cut clippings jump off the blades as the deck rises
  for (let i = 0; i < 8; i++) { const ph = clamp((t - CUES.s2 - 0.9 - i * 0.04) / 0.6); if (ph <= 0 || ph >= 1) continue;
    const x = deckX - 0.2 + i * 0.05, y = GY - 0.06 - ph * 0.12 + ph * ph * 0.16; dot(g, S, x + ph * 0.05, y, 0.006, '#9CB352', 1 - ph); }
  g.setTransform(S.u, 0, 0, S.u, S.W / 2, S.H / 2);
  medallion(g, t, -0.38, -0.56, 0.05, 1, MOTION.at(t, CUES.s2 + 0.15, 0.3));
  tag(g, t, 'Biçme boyu 5 cm', 0.06, -0.56, 0.042, MOTION.at(t, CUES.s2 + 0.35, 0.3), 320);
}

function soilAerated(g, k, t, S) {
  // truck right, 4.5 s, ease-in-out, with the aerator roller; then the seed spreader pours into the holes
  stage(g, S, '#DCE3C8', null, 0);
  const GY = -0.02, cam = lerp(-0.1, 0.12, EASE.inOut(k)); g.translate(-cam, 0);
  // the soil cross-section: grass on top, two soil layers, roots and stones
  g.fillStyle = '#9C7A52'; g.fillRect(-0.9, GY, 1.9, 0.5); g.fillStyle = '#7E5F3E'; g.fillRect(-0.9, GY + 0.32, 1.9, 1.2);
  inked(g, t, 400, (g) => { g.moveTo(-0.9, GY + 0.32); for (let i = 0; i <= 20; i++) g.lineTo(-0.9 + i * 0.095, GY + 0.32 + 0.012 * Math.sin(i * 1.7)); }, 0.0028);
  for (let i = 0; i < 40; i++) { const x = -0.85 + hash1(i + 400) * 1.8, y = GY + 0.08 + hash1(i + 440) * 0.65; dot(g, S, x, y, 0.006 + hash1(i + 480) * 0.01, i % 3 ? '#6B4F33' : '#B49A74', 0.9); }
  for (let i = 0; i < 26; i++) { const x = -0.85 + i * 0.072; inked(g, t, 410 + i, (g) => { g.moveTo(x, GY); g.quadraticCurveTo(x + 0.02, GY + 0.06, x - 0.01, GY + 0.1 + 0.04 * hash1(i)); }, 0.002, '#E9DDBF'); }
  // the aerator roller travels right and leaves plug holes behind it
  const rx = lerp(-0.55, 0.62, EASE.inOut(MOTION.at(t, CUES.s3 + 0.1, 2.2)));
  const holes = 16;
  for (let i = 0; i < holes; i++) {
    const hx = -0.62 + i * 0.075; if (hx > rx - 0.03) continue;
    const seedIn = clamp((t - CUES.s3 - 2.6 - i * 0.07) / 0.5);
    cel(g, t, 430 + i, rr(hx - 0.012, GY - 0.005, 0.024, 0.11, 0.012), '#4E3826');
    if (seedIn > 0) { for (let j = 0; j < 3; j++) dot(g, S, hx - 0.006 + j * 0.006, GY + 0.08 - j * 0.02 * seedIn, 0.0055, PALETTE.mustard, 1); }
    const sprout = clamp((t - CUES.s3 - 3.6 - i * 0.04) / 0.5);
    if (sprout > 0) inked(g, t, 450 + i, (g) => { g.moveTo(hx, GY + 0.02); g.quadraticCurveTo(hx + 0.012, GY - 0.03 * sprout, hx + 0.005, GY - 0.06 * sprout); }, 0.004, '#5E9A33');
  }
  grassStrip(g, t, GY, 0.07, mixHex(PALETTE.lawnDry, PALETTE.lawn, 0.3), 80, 5, -0.9, 1.0);
  inked(g, t, 401, (g) => { g.moveTo(-0.9, GY); g.lineTo(1.0, GY); }, 0.004);
  // the roller with spikes, spinning as it rolls
  const RY = GY - 0.07, R = 0.085, spin = rx / R;
  dropShadow(g, disc(rx, RY, R), 0.012, 0.016, 0.25);
  for (let i = 0; i < 10; i++) { const a = spin + i * TAU / 10; inked(g, t, 460, (g) => { g.moveTo(rx + Math.cos(a) * R, RY + Math.sin(a) * R); g.lineTo(rx + Math.cos(a) * (R + 0.04), RY + Math.sin(a) * (R + 0.04)); }, 0.007); }
  cel(g, t, 461, disc(rx, RY, R), PALETTE.terra); cel(g, t, 462, disc(rx, RY, R * 0.35), '#F4EEDF'); inked(g, t, 463, disc(rx, RY, R), 0.004);
  inked(g, t, 464, (g) => { g.moveTo(rx, RY); g.lineTo(rx - 0.22, RY - 0.4); g.lineTo(rx - 0.29, RY - 0.41); }, 0.008);
  // the seed spreader: a hopper above the holes, seeds falling in a fan on the second half
  const sk = MOTION.at(t, CUES.s3 + 2.3, 0.4);
  if (sk > 0) {
    const sx = lerp(-0.7, -0.2, EASE.out(MOTION.at(t, CUES.s3 + 2.3, 1.8))) + 0.0, sy = -0.42;
    const hop = (g) => { g.moveTo(sx - 0.09, sy - 0.08); g.lineTo(sx + 0.09, sy - 0.08); g.lineTo(sx + 0.03, sy + 0.04); g.lineTo(sx - 0.03, sy + 0.04); g.closePath(); };
    g.save(); g.globalAlpha = clamp(sk * 2); dropShadow(g, hop, 0.012, 0.016, 0.25); cel(g, t, 470, hop, PALETTE.mustard); inked(g, t, 471, hop, 0.0035);
    text(g, S, 'TOHUM', sx, sy - 0.035, 0.024, PALETTE.ink, 1, 0.1, { role: 'text', weight: 600 }); g.restore();
    for (let i = 0; i < 40; i++) { const ph = (t * 1.8 + hash1(i + 500)) % 1, x = sx + (hash1(i + 520) - 0.5) * 0.12 * (0.4 + ph) * 2.4, y = sy + 0.05 + ph * (GY - sy - 0.05);
      dot(g, S, x, y, 0.005, '#C99A2E', clamp(sk * 2) * (1 - ph * 0.3)); }
  }
  g.setTransform(S.u, 0, 0, S.u, S.W / 2, S.H / 2);
  medallion(g, t, -0.38, -0.56, 0.05, 2, MOTION.at(t, CUES.s3 + 0.25, 0.3));
  tag(g, t, 'Havalandır, tohumla', 0.06, -0.56, 0.042, MOTION.at(t, CUES.s3 + 0.45, 0.3), 480);
}

const RAKE_LEAVES = lazy(() => { const r = rng(21); return Array.from({ length: 70 }, () => ({ x: -0.5 + r() * 1.0, y: -0.45 + r() * 0.85, a: r() * TAU, s: 0.018 + r() * 0.014, c: r() < 0.55 ? 'mustard' : 'terra' })); });
function leavesRaked(g, k, t, S) {
  // cut on the beat; tilt down with the rake, 2.5 s: the rake sweeps leaves into a pile and the lawn under them greens
  stage(g, S, PALETTE.lawnDry, null, 0);
  const tilt = lerp(0.06, -0.04, EASE.out(k)); g.translate(0, tilt);
  const sweep = EASE.inOut(MOTION.at(t, CUES.s4 + 0.15, 1.9));          // 0..1: the swept band moves down the frame
  const bandY = lerp(-0.6, 0.45, sweep);
  // lawn close: big blade tufts; the swept part (above the rake) turns green
  g.save(); g.beginPath(); g.rect(-0.7, -1.2, 1.4, bandY + 1.2); g.fillStyle = mixHex(PALETTE.lawnDry, PALETTE.lawn, 0.85); g.fill(); g.restore();
  for (let i = 0; i < 160; i++) { const x = -0.55 + hash1(i + 600) * 1.1, y = -0.8 + hash1(i + 640) * 1.6, sw = 0.006 * Math.sin(twos(t) * 3 + i);
    inked(g, t, 600, (g) => { g.moveTo(x, y); g.lineTo(x + sw - 0.006, y - 0.03); g.moveTo(x + 0.006, y); g.lineTo(x + sw + 0.01, y - 0.026); }, 0.0024, y < bandY ? '#3F6B2A' : 'rgba(43,38,34,0.45)'); }
  // leaves: those the rake has reached ride with it into the pile at the bottom right
  const pileX = 0.22, pileY = 0.52;
  for (const L of RAKE_LEAVES()) {
    let x = L.x, y = L.y, a = L.a;
    if (L.y < bandY) { const q = clamp((bandY - L.y) / 0.25); x = lerp(L.x, pileX + (L.x - pileX) * 0.25, q); y = lerp(L.y, Math.min(bandY + 0.02, pileY + (L.y - pileY) * 0.12), q); a += q * 2; }
    g.save(); g.translate(x, y); g.rotate(a); dropShadow(g, (g) => g.ellipse(0, 0, L.s, L.s * 0.55, 0, 0, TAU), 0.006, 0.008, 0.25);
    g.beginPath(); g.moveTo(-L.s, 0); g.quadraticCurveTo(0, -L.s * 0.9, L.s, 0); g.quadraticCurveTo(0, L.s * 0.9, -L.s, 0); g.fillStyle = PALETTE[L.c]; g.fill();
    g.beginPath(); g.moveTo(-L.s, 0); g.lineTo(L.s, 0); g.strokeStyle = 'rgba(43,38,34,0.5)'; g.lineWidth = 0.0018; g.stroke(); g.restore();
  }
  // the rake: a fan of tines across the frame on the band, its handle up to the top
  const rakeX = lerp(-0.1, 0.12, sweep), wob = 0.02 * Math.sin(t * 9) * (sweep > 0 && sweep < 1 ? 1 : 0);
  g.save(); g.translate(rakeX + wob, bandY);
  inked(g, t, 610, (g) => { for (let i = 0; i <= 12; i++) { const a = (-150 + i * 10) * Math.PI / 180; g.moveTo(0, -0.04); g.lineTo(Math.cos(a) * 0.2, 0.02 + Math.abs(Math.sin(a)) * 0.0); } }, 0.004);
  inked(g, t, 611, (g) => { g.moveTo(-0.2, 0.02); g.quadraticCurveTo(0, -0.05, 0.2, 0.02); }, 0.005);
  dropShadow(g, rr(-0.012, -1.2, 0.024, 1.16, 0.01), 0.012, 0.0, 0.2);
  cel(g, t, 612, rr(-0.012, -1.2, 0.024, 1.16, 0.01), '#B98A52'); inked(g, t, 613, rr(-0.012, -1.2, 0.024, 1.16, 0.01), 0.003);
  g.restore();
  g.setTransform(S.u, 0, 0, S.u, S.W / 2, S.H / 2);
  medallion(g, t, -0.38, -0.56, 0.05, 3, MOTION.at(t, CUES.s4 + 0.1, 0.3));
  tag(g, t, 'Yaprakları topla', 0.06, -0.56, 0.042, MOTION.at(t, CUES.s4 + 0.3, 0.3), 620);
}

function springArrives(g, k, t, S) {
  // pull-back settle, 0.5 s, then the trail greens end to end; iris-out onto the gate and the end card holds still
  const greenS = EASE.inOut(MOTION.at(t, CUES.green, 0.55)), lawnGreen = lerp(0.15, 1, EASE.inOut(MOTION.at(t, CUES.green + 0.1, 0.5)));
  const irisK = EASE.in(MOTION.at(t, CUES.logo + 0.1, 0.45)), gate = { x: 0, y: 0.86 };
  // the end card under everything: lawn green ground, sunburst, the name
  paperGround(g, S, PALETTE.lawn); world(g, S);
  const card = MOTION.at(t, CUES.logo + 0.35, 0.35);
  g.save(); g.rotate(t * 0.04); for (let i = 0; i < 30; i++) { const a = i * TAU / 30; g.beginPath(); g.moveTo(0, -0.08); g.arc(0, -0.08, 1.4, a, a + TAU / 60); g.closePath(); g.fillStyle = 'rgba(240,248,200,0.10)'; g.fill(); } g.restore();
  if (card > 0) {
    const s = MOTION.back(card, 1.6);
    g.save(); g.translate(0, -0.1); g.scale(s, s);
    g.save(); g.translate(0.007, 0.007); text(g, S, 'Ege Peyzaj', 0, 0, 0.13, PALETTE.mustard, 1, 0, { role: 'display', weight: 400 }); g.restore();
    text(g, S, 'Ege Peyzaj', 0, 0, 0.13, '#FBF6EA', 1, 0, { role: 'display', weight: 400 });
    g.restore();
    // the trail motif under the name: rails with sleepers, ending in a dot
    const lk = EASE.out(MOTION.at(t, CUES.logo + 0.5, 0.5));
    inked(g, t, 700, (g) => { g.moveTo(-0.3, 0.04); g.lineTo(lerp(-0.3, 0.3, lk), 0.04); g.moveTo(-0.3, 0.07); g.lineTo(lerp(-0.3, 0.3, lk), 0.07); }, 0.004, '#FBF6EA');
    for (let i = 0; i < 13; i++) { const x = -0.29 + i * 0.048; if (x > lerp(-0.3, 0.3, lk)) break; inked(g, t, 701 + i, (g) => { g.moveTo(x, 0.035); g.lineTo(x, 0.075); }, 0.004, '#FBF6EA'); }
    if (lk >= 1) dot(g, S, 0.31, 0.055, 0.016, PALETTE.mustard);
    const tl = MOTION.at(t, CUES.logo + 0.8, 0.4);
    g.save(); g.globalAlpha = clamp(tl); g.translate(0, 0.17 + (1 - clamp(tl)) * 0.02);
    text(g, S, 'Baharda yeşili siz görün.', 0, 0, 0.048, '#FBF6EA', 1, 0, { role: 'text', weight: 600 }); g.restore();
  }
  // the plan on top, inside the closing iris
  const r = lerp(2.2, 0, irisK);
  if (r > 0.002) {
    g.save(); const cx = lerp(0, gate.x, irisK), cy = lerp(0.05, gate.y, irisK);
    g.beginPath(); g.arc(gate.x * 1 - 0.0, gate.y - 0.05, r, 0, TAU); g.clip();
    paperGround(g, S, PALETTE.bg); world(g, S);
    g.beginPath(); g.arc(gate.x, gate.y - 0.05, r, 0, TAU); g.clip();
    g.translate(0, -0.05);
    drawPlan(g, t, { headS: 1, greenS, lawnGreen, showMed: [1, 1, 1, 1] });
    const p = trailAt(0.995); gardenerTop(g, t, p.x, p.y - 0.03, -Math.PI / 2, 1);
    // a ring of spring sparkles that travels down the trail with the green
    for (let i = 0; i < 6; i++) { const q = trailAt(clamp(greenS - i * 0.02)); if (greenS > 0 && greenS < 1) star4(g, q.x + 0.03 * Math.cos(i * 2), q.y + 0.03 * Math.sin(i * 2), 0.014, '#FBF6EA', t * 4 + i); }
    g.restore();
    world(g, S);
    if (r < 2) inked(g, t, 720, disc(gate.x, gate.y - 0.05 - 0.05 + 0.05, r), 0.006);
  }
}

// Music: West-Coast cool jazz in code, 120 BPM, swung: walking bass, brushes, vibraphone chords (one per station),
// flute-like lead on the payoff, up a step at 16.0 (F → G), ending on a held major seventh.
function score(ctx, out) {
  const prog = ['Fmaj7', 'Dm7', 'Gm7', 'C7'], progUp = ['Gmaj7', 'Em7', 'Am7', 'D7'];
  const chordOf = (t) => (t < CUES.s6 ? chordAt(prog, t, 1, 0) : chordAt(progUp, t, 1, CUES.s6));
  // walking bass: four notes a bar from the chord tones, pizzicato-like (short, low-passed)
  for (const t of beats('bass')) {
    const c = chord(chordOf(t), 2), n = Math.round((t - BEAT0) * BPM / 60) % 4, f = [c[0], c[1], c[2], c[1] * 1.06][n];
    bass(ctx, out, t, 0.42, f, 0.32, { cutoff: 700, q: 1.2 });
  }
  // brushes: a swung soft hat on the ride pattern, a brush swish on 2 and 4
  for (const s of grid('brush', 'x..x.xx..x.x', { swing: 0 })) hat(ctx, out, s.t, s.accent ? 0.06 : 0.04, {});
  for (const t of beats('brush', 1.0)) snare(ctx, out, t + 0.5, 0.05, {});
  // vibraphone: a plucked chord on each station's cue, arpeggio between
  const vib = (t, f, g) => { pluck(ctx, out, t, f, g); pluck(ctx, out, t + 0.002, f * 2.0, g * 0.18); };
  for (const t of [CUES.s1, CUES.s2, CUES.s3, CUES.s4, CUES.s5]) chord(chordOf(t + 0.01), 4).forEach((f, i) => vib(t + i * 0.035, f, 0.12));
  for (const t of beats('vibes', 0.5)) { const c = chord(chordOf(t), 4); const n = Math.round(t * 2) % c.length; vib(t, c[n], 0.05); }
  // rain: the band thins to bass and soft vibes, the brushes drop out (ARRANGEMENT)
  pad(ctx, out, CUES.s5, CUES.s6 - CUES.s5, chord('Dm7', 3), 0.035);
  // payoff: a flute-like line over the step up, landing on the logo
  const mel = [['B4', 0.0, 0.5], ['D5', 0.5, 0.5], ['F#5', 1.0, 0.5], ['A5', 1.5, 1.0], ['G5', 2.5, 1.5]];
  for (const [n, at, d] of mel) lead(ctx, out, CUES.s6 + at, hz(n), d, 0.07, 2200);
  pad(ctx, out, CUES.s6, CUES.end - CUES.s6, chord('Gmaj7', 3, { open: true }), 0.05);
  chord('Gmaj7', 4).forEach((f, i) => vib(CUES.logo + 0.35 + i * 0.05, f, 0.1));
}
