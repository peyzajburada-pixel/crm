// Cues on the 120 BPM grid (a beat = 0.5 s, a bar = 2 s): every cut and hit lands on a beat.
const CUES = { s1: 0, med1: 2.5, s2: 3.0, arrow: 4.5, s3: 6.5, plug: 7.5, s4: 10.0, s5: 13.5, dial: 14.5, s6: 16.5, green: 16.5, logo: 17.0, end: DURATION };

// Narration (sıcak belgesel, Turkish): filled from the measured WAVs once the voice is picked.
const VO = [];
const CAPTIONS = null;
const CAPTION_STYLE = { role: 'display', accentRole: 'display', size: 0.062, caps: false, ink: PALETTE.ink, hi: PALETTE.ink, accent: PALETTE.accent, punch: 0.07 };

const SCENES = [
  { from: CUES.s1, to: CUES.s2, draw: trailBegins, action: 'the gardener mows on and the ink trail curves across the autumn lawn', amb: { kind: 'air', gain: 0.05 } },
  { from: CUES.s2, to: CUES.s3, draw: laterScene, action: 'the mower deck lifts to 5 cm', in: { type: 'iris', dur: 0.5, at: [0.5, 0.5] }, amb: { kind: 'air', gain: 0.04 } },
  { from: CUES.s3, to: CUES.s4, draw: laterScene, action: 'the aerator plugs the soil and seeds pour in', in: { type: 'wipe', dur: 0.4, dir: 'up' }, amb: { kind: 'air', gain: 0.04 } },
  { from: CUES.s4, to: CUES.s5, draw: laterScene, action: 'the rake sweeps the leaves off the lawn', amb: { kind: 'air', gain: 0.05 } },
  { from: CUES.s5, to: CUES.s6, draw: rainTurnsDial, action: 'rain falls and the gloved hand turns the sprinkler dial to off', amb: { kind: 'water', gain: 0.10 } },
  { from: CUES.s6, to: CUES.end, draw: laterScene, action: 'the whole trail turns green and ends at the gate on the logo', amb: { kind: 'air', gain: 0.04 } },
];

const SFX = [];
const ROOM = { secs: 1.6, decay: 3.0, tone: 5200 };
const ARRANGEMENT = [
  { section: 'autumn', from: 0, to: CUES.s5, parts: [] },
  { section: 'rain', from: CUES.s5, to: CUES.s6, parts: [] },
  { section: 'spring', from: CUES.s6, to: CUES.end, parts: [] },
];

// ---------- the film's own drawing kit (mid-century print: off-register cels, broken breathing ink) ----------
const twos = (t) => Math.floor(t * 12) / 12;                       // drawings change on twos
const world = (g, S) => g.setTransform(S.u, 0, 0, S.u, S.W / 2, S.H / 2);
const HH = () => S.H / S.u / 2;                                     // half frame height in world units (0.889 at 9:16)
function jit(t, salt, a = 0.0022) { const r = rng(salt * 977 + Math.round(twos(t) * 12)); return [(r() - 0.5) * a, (r() - 0.5) * a]; }
// a fill printed a little down-right of its line, the offset re-rolled on twos
function cel(g, t, salt, path, fill, alpha = 1) {
  const j = jit(t, salt); g.save(); g.translate(0.0035 + j[0], 0.0035 + j[1]);
  g.beginPath(); path(g); g.globalAlpha = alpha; g.fillStyle = fill; g.fill(); g.restore();
}
// a broken ink line whose width breathes on twos
function inked(g, t, salt, path, w = 0.0032, color = PALETTE.ink) {
  const r = rng(salt * 131 + Math.round(twos(t) * 12));
  g.save(); g.beginPath(); path(g); g.lineWidth = w * (0.8 + 0.4 * r()); g.strokeStyle = color; g.lineCap = 'round'; g.lineJoin = 'round';
  g.setLineDash([0.07 + 0.03 * hash1(salt), 0.007, 0.03, 0.005 + 0.004 * r()]); g.lineDashOffset = hash1(salt + 7) * 0.1;
  g.stroke(); g.restore();
}
// the sun sits upper left: every object drops a copy of itself down-right
function dropShadow(g, path, dx = 0.012, dy = 0.016, a = 0.22) {
  g.save(); g.translate(dx, dy); g.beginPath(); path(g); g.fillStyle = `rgba(70,52,30,${a})`; g.fill(); g.restore();
}
const rr = (x, y, w, h, r) => (g) => g.roundRect(x, y, w, h, r);
const disc = (x, y, r) => (g) => g.arc(x, y, r, 0, TAU);
function mixHex(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, '0')).join('');
}
// a number medallion: ink disc, mustard plate offset, a slab numeral; pops in with a back ease
function medallion(g, t, x, y, r, n, k) {
  if (k <= 0) return; const s = MOTION.back(clamp(k), 2.2);
  g.save(); g.translate(x, y); g.scale(s, s);
  dropShadow(g, disc(0, 0, r), 0.006, 0.008, 0.25);
  cel(g, t, 40 + n, disc(0, 0, r), PALETTE.mustard);
  inked(g, t, 41 + n, disc(0, 0, r * 0.98), r * 0.09);
  inked(g, t, 42 + n, disc(0, 0, r * 0.78), r * 0.035);
  text(g, S, String(n), 0, 0, r * 1.05, PALETTE.ink, 1, 0, { role: 'display', weight: 400 });
  g.restore();
}
// a paper tag with a star bullet, popping beside the action
function tag(g, t, str, x, y, size, k, salt = 60) {
  if (k <= 0) return; const s = MOTION.back(clamp(k), 1.7);
  g.save(); g.translate(x, y + (1 - clamp(k * 1.4)) * 0.02); g.scale(s, s);
  setType(g, TYPE, 'text', size * 100, { short: 100, weight: 600 });
  const w = g.measureText(str).width / 100 + size * 2.2, h = size * 1.9;
  dropShadow(g, rr(-w / 2, -h / 2, w, h, h * 0.3), 0.006, 0.008, 0.2);
  cel(g, t, salt, rr(-w / 2, -h / 2, w, h, h * 0.3), '#FBF6EA');
  inked(g, t, salt + 1, rr(-w / 2, -h / 2, w, h, h * 0.3), 0.0026);
  star4(g, -w / 2 + size * 0.75, 0, size * 0.32, PALETTE.terra, t * 2);
  g.save(); g.scale(0.01, 0.01); g.fillStyle = PALETTE.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
  setType(g, TYPE, 'text', size * 100, { short: 100, weight: 600 }); g.fillText(str, size * 0.35 * 100, size * 0.06 * 100); g.restore();
  g.restore();
}
function star4(g, x, y, r, color, spin = 0) {
  g.save(); g.translate(x, y); g.rotate(spin); g.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, q = i % 2 ? r * 0.28 : r; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); }
  g.closePath(); g.fillStyle = color; g.fill(); g.restore();
}
function paperGround(g, S, color) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = color; g.fillRect(0, 0, S.W, S.H); g.restore(); }

// ---------- the villa plan (world units, plan origin = the lawn's centre) ----------
const TRAIL_PTS = [[-0.27, -0.25], [0.0, -0.23], [0.27, -0.17], [0.32, -0.02], [0.12, 0.07], [-0.2, 0.12], [-0.33, 0.27],
  [-0.12, 0.37], [0.2, 0.42], [0.31, 0.56], [0.12, 0.66], [0.0, 0.74], [0.0, 0.83]];
// the trail as a dense polyline with its arc length, Catmull-Rom through the points
const TRAIL = lazy(() => {
  const P = TRAIL_PTS, out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 0; j < 40; j++) {
      const u = j / 40, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * u3)));
    }
  }
  out.push(P[P.length - 1]);
  const L = [0]; for (let i = 1; i < out.length; i++) L.push(L[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  return { pts: out, len: L, total: L[L.length - 1] };
});
function trailAt(s) {                                     // point and heading at arc-length share s (0..1)
  const T = TRAIL(), d = clamp(s) * T.total; let i = 1; while (i < T.len.length - 1 && T.len[i] < d) i++;
  const a = T.pts[i - 1], b = T.pts[i], k = (d - T.len[i - 1]) / Math.max(1e-6, T.len[i] - T.len[i - 1]);
  return { x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k), ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
}
const STATIONS = [0.22, 0.47, 0.70, 0.90];
const OLIVES = [[0.13, 0.25, 0.085, 1], [-0.2, 0.56, 0.075, 2], [0.36, 0.22, 0.06, 3], [-0.38, -0.08, 0.065, 4]];
const GRASS = lazy(() => { const r = rng(5); return Array.from({ length: 900 }, () => [-0.42 + r() * 0.84, -0.3 + r() * 1.05, r(), r()]); });
const LEAVES = lazy(() => { const r = rng(9); return Array.from({ length: 46 }, (_, i) => ({ x: -0.45 + r() * 0.9, y: -0.35 + r() * 1.15, t0: r() * 3, fall: 1.4 + r() * 1.6, spin: (r() - 0.5) * 5, c: r() < 0.6 ? 'mustard' : 'terra', s: 0.011 + r() * 0.008, drift: (r() - 0.5) * 0.12 })); });

// green = how far spring has reached along the trail (0..1, the payoff); autumn = dry tone strength
function drawPlan(g, t, o = {}) {
  const { headS = 0, greenS = 0, showMed = [0, 0, 0, 0] } = o;
  // sea beyond the villa: turquoise band with travelling wave marks
  g.fillStyle = PALETTE.sea; g.fillRect(-0.8, -1.4, 1.6, 0.66);
  for (let i = 0; i < 26; i++) {
    const x = -0.6 + ((i * 0.137 + t * 0.012) % 1.2), y = -0.98 + (i % 6) * 0.045;
    g.beginPath(); g.arc(x, y, 0.018, Math.PI * 1.1, Math.PI * 1.9); g.strokeStyle = '#8FD0D2'; g.lineWidth = 0.003; g.stroke();
  }
  // stone terrace and boundary plot
  cel(g, t, 3, rr(-0.5, -0.74, 1.0, 1.62, 0.02), PALETTE.stone);
  // lawn: dry autumn plate that turns green where spring has reached
  const lawnPath = rr(-0.43, -0.31, 0.86, 1.08, 0.05);
  cel(g, t, 4, lawnPath, mixHex(PALETTE.lawnDry, PALETTE.lawn, o.lawnGreen ?? 0.15));
  // mowing stripes, lighter and darker plates
  g.save(); g.beginPath(); lawnPath(g); g.clip();
  for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? 'rgba(255,248,220,0.07)' : 'rgba(60,70,20,0.05)'; g.fillRect(-0.45, -0.31 + i * 0.09, 0.9, 0.09); }
  for (const [x, y, a, b] of GRASS()) {                     // grass ticks: short ink flicks, sway on twos
    const sw = 0.004 * Math.sin(twos(t) * 3 + b * 6);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + sw + (a - 0.5) * 0.006, y - 0.009 - b * 0.006);
    g.strokeStyle = 'rgba(43,38,34,0.28)'; g.lineWidth = 0.0016; g.stroke();
  }
  g.restore();
  inked(g, t, 5, lawnPath, 0.0034);
  // the trail: two rails (mower wheel lines) and sleepers (cut stripes) drawn up to the gardener; spring green behind greenS
  const T = TRAIL(), dHead = headS * T.total;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 1; i < T.pts.length && T.len[i] <= dHead; i++) {
    const a = T.pts[i - 1], b = T.pts[i], s = T.len[i] / T.total, nx = -(b[1] - a[1]), ny = b[0] - a[0], nl = Math.hypot(nx, ny) || 1;
    const green = s <= greenS;
    g.fillStyle = 'rgba(0,0,0,0)';
    g.strokeStyle = green ? '#8FBF4E' : '#9C8B45'; g.lineWidth = 0.034;
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    for (const side of [-1, 1]) {
      g.strokeStyle = PALETTE.ink; g.lineWidth = 0.0026;
      g.beginPath(); g.moveTo(a[0] + side * nx / nl * 0.017, a[1] + side * ny / nl * 0.017); g.lineTo(b[0] + side * nx / nl * 0.017, b[1] + side * ny / nl * 0.017); g.stroke();
    }
    if (i % 5 === 0) {                                      // sleepers: a short cross stripe every few steps
      g.strokeStyle = green ? '#5E8A2E' : 'rgba(43,38,34,0.55)'; g.lineWidth = 0.004;
      g.beginPath(); g.moveTo(b[0] - nx / nl * 0.015, b[1] - ny / nl * 0.015); g.lineTo(b[0] + nx / nl * 0.015, b[1] + ny / nl * 0.015); g.stroke();
    }
  }
  g.restore();
  // stepping stones from the pool to the gate along the right
  for (let i = 0; i < 7; i++) {
    const x = 0.395 + 0.008 * Math.sin(i * 2.1), y = -0.22 + i * 0.13;
    dropShadow(g, rr(x - 0.022, y - 0.016, 0.044, 0.032, 0.012), 0.004, 0.006, 0.2);
    cel(g, t, 70 + i, rr(x - 0.022, y - 0.016, 0.044, 0.032, 0.012), '#E6DCC6'); inked(g, t, 80 + i, rr(x - 0.022, y - 0.016, 0.044, 0.032, 0.012), 0.002);
  }
  // villa: terracotta hip roof with tile rows; pool with coping and ripples
  const RX = -0.36, RY = -0.66, RW = 0.44, RHt = 0.3;
  dropShadow(g, rr(RX, RY, RW, RHt, 0.004), 0.02, 0.026, 0.25);
  cel(g, t, 10, rr(RX, RY, RW, RHt, 0.004), PALETTE.terra);
  const ridgeY = RY + RHt / 2, inset = RHt / 2;
  g.save(); g.beginPath(); g.moveTo(RX + inset, ridgeY); g.lineTo(RX + RW - inset, ridgeY); g.lineTo(RX + RW, RY + RHt); g.lineTo(RX, RY + RHt); g.closePath();
  g.fillStyle = 'rgba(90,30,10,0.22)'; g.fill(); g.restore();                     // the lower plane faces away from the sun
  g.save(); g.beginPath(); g.moveTo(RX + RW - inset, ridgeY); g.lineTo(RX + RW, RY); g.lineTo(RX + RW, RY + RHt); g.closePath(); g.fillStyle = 'rgba(90,30,10,0.12)'; g.fill(); g.restore();
  g.save(); g.beginPath(); rr(RX, RY, RW, RHt, 0.004)(g); g.clip();
  for (let i = 1; i < 14; i++) { const y = RY + i * RHt / 14; g.beginPath(); g.moveTo(RX, y); g.lineTo(RX + RW, y); g.strokeStyle = 'rgba(70,25,10,0.28)'; g.lineWidth = 0.0018; g.stroke(); }
  g.restore();
  inked(g, t, 11, (g) => { g.moveTo(RX, RY + RHt); g.lineTo(RX + inset, ridgeY); g.lineTo(RX + RW - inset, ridgeY); g.lineTo(RX + RW, RY + RHt);
    g.moveTo(RX, RY); g.lineTo(RX + inset, ridgeY); g.moveTo(RX + RW, RY); g.lineTo(RX + RW - inset, ridgeY); }, 0.0028);
  inked(g, t, 12, rr(RX, RY, RW, RHt, 0.004), 0.0036);
  // chimney
  dropShadow(g, rr(RX + 0.07, RY + 0.05, 0.035, 0.035, 0.004), 0.008, 0.01, 0.3);
  cel(g, t, 13, rr(RX + 0.07, RY + 0.05, 0.035, 0.035, 0.004), '#F4EEDF'); inked(g, t, 14, rr(RX + 0.07, RY + 0.05, 0.035, 0.035, 0.004), 0.0024);
  const PX = 0.13, PY = -0.64, PW = 0.27, PH = 0.2;
  cel(g, t, 15, rr(PX - 0.018, PY - 0.018, PW + 0.036, PH + 0.036, 0.03), '#F4EEDF');
  cel(g, t, 16, rr(PX, PY, PW, PH, 0.022), PALETTE.sea);
  g.save(); g.beginPath(); rr(PX, PY, PW, PH, 0.022)(g); g.clip();
  for (let i = 0; i < 9; i++) {
    const x = PX + 0.03 + (i % 3) * 0.085 + 0.01 * Math.sin(t * 1.3 + i), y = PY + 0.04 + Math.floor(i / 3) * 0.06 + 0.006 * Math.cos(t * 1.1 + i);
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 0.02, y - 0.012, x + 0.04, y); g.strokeStyle = '#A8E0DF'; g.lineWidth = 0.003; g.stroke();
  }
  g.restore();
  inked(g, t, 17, rr(PX, PY, PW, PH, 0.022), 0.003); inked(g, t, 18, rr(PX - 0.018, PY - 0.018, PW + 0.036, PH + 0.036, 0.03), 0.0024);
  // white boundary wall with the gate gap at the bottom
  g.save(); g.strokeStyle = '#FBF7EC'; g.lineWidth = 0.022; g.lineCap = 'butt';
  g.beginPath(); g.moveTo(-0.055, 0.86); g.lineTo(-0.48, 0.86); g.lineTo(-0.48, -0.72); g.moveTo(0.48, -0.72); g.lineTo(0.48, 0.86); g.lineTo(0.055, 0.86); g.stroke(); g.restore();
  inked(g, t, 19, (g) => { g.moveTo(-0.055, 0.871); g.lineTo(-0.491, 0.871); g.lineTo(-0.491, -0.72); g.moveTo(0.491, -0.72); g.lineTo(0.491, 0.871); g.lineTo(0.055, 0.871); }, 0.003);
  // cypress row along the right wall, swaying a touch
  for (let i = 0; i < 9; i++) {
    const y = -0.4 + i * 0.145, sw = 0.003 * Math.sin(t * 1.6 + i);
    dropShadow(g, disc(0.452 + sw, y, 0.024), 0.008, 0.011, 0.25); cel(g, t, 90 + i, disc(0.452 + sw, y, 0.024), '#3F5E36'); inked(g, t, 100 + i, disc(0.452 + sw, y, 0.024), 0.0022);
  }
  // olive trees: grey-green clusters, a lit plane upper left
  for (const [x, y, r, id] of OLIVES) {
    const blobs = [[0, 0, 1], [-0.45, -0.3, 0.62], [0.45, -0.25, 0.6], [0.38, 0.4, 0.58], [-0.4, 0.38, 0.6]];
    const outline = (g) => { for (const [bx, by, br] of blobs) { g.moveTo(x + bx * r + br * r * 0.7, y + by * r); g.arc(x + bx * r, y + by * r, br * r * 0.7, 0, TAU); } };
    dropShadow(g, outline, 0.022, 0.03, 0.24);
    cel(g, t, 120 + id, outline, PALETTE.olive);
    g.save(); g.beginPath(); outline(g); g.clip(); g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.8, 0, TAU); g.fillStyle = 'rgba(230,235,190,0.22)'; g.fill(); g.restore();
    for (let i = 0; i < 10; i++) { const a = hash1(id * 20 + i) * TAU, d = hash1(id * 30 + i) * r * 0.8; dot(g, S, x + Math.cos(a) * d, y + Math.sin(a) * d, 0.004, '#5C6B3E', 0.7); }
    inked(g, t, 130 + id, outline, 0.0026);
  }
  // station medallions along the trail
  STATIONS.forEach((s, i) => { const p = trailAt(s); medallion(g, t, p.x + 0.055, p.y - 0.05, 0.034, i + 1, showMed[i]); });
}
// the gardener seen from above: straw-hat disc, terracotta shoulders, arms to the mower handle; held body, arms on twos
function gardenerTop(g, t, x, y, ang, sc = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(sc, sc);
  const push = 0.004 * Math.sin(twos(t) * TAU * 1.5);
  // mower ahead of him
  dropShadow(g, rr(0.03 + push, -0.024, 0.048, 0.048, 0.008), 0.006, 0.008, 0.3);
  cel(g, t, 150, rr(0.03 + push, -0.024, 0.048, 0.048, 0.008), '#6E8F8C'); inked(g, t, 151, rr(0.03 + push, -0.024, 0.048, 0.048, 0.008), 0.0024);
  dot(g, S, 0.054 + push, 0, 0.011, '#3B4A48');
  inked(g, t, 152, (g) => { g.moveTo(0.012, -0.012); g.lineTo(0.03 + push, -0.016); g.moveTo(0.012, 0.012); g.lineTo(0.03 + push, 0.016); }, 0.0025);
  // arms
  cel(g, t, 153, (g) => { g.ellipse(0.016, -0.016, 0.012, 0.006, 0, 0, TAU); g.moveTo(0.028, 0.016); g.ellipse(0.016, 0.016, 0.012, 0.006, 0, 0, TAU); }, PALETTE.terra);
  // shoulders and hat
  dropShadow(g, (g) => g.ellipse(0, 0, 0.016, 0.026, 0, 0, TAU), 0.008, 0.011, 0.3);
  cel(g, t, 154, (g) => g.ellipse(0, 0, 0.016, 0.026, 0, 0, TAU), PALETTE.terra); inked(g, t, 155, (g) => g.ellipse(0, 0, 0.016, 0.026, 0, 0, TAU), 0.0024);
  cel(g, t, 156, disc(-0.002, 0, 0.019), '#E9D08E'); inked(g, t, 157, disc(-0.002, 0, 0.019), 0.0024);
  inked(g, t, 158, disc(-0.002, 0, 0.009), 0.002, '#8A5A2B');
  g.restore();
}
function fallingLeaves(g, t, span = 3) {
  for (const L of LEAVES()) {
    const ph = ((t - L.t0) % L.fall + L.fall) % L.fall / L.fall, h = 1 - ph;           // h = height above the lawn
    const x = L.x + L.drift * ph + 0.01 * Math.sin(t * 3 + L.t0 * 5), y = L.y + 0.05 * ph;
    const s = L.s * (1 + 0.5 * h), rot = L.spin * t + L.t0;
    g.save(); g.translate(x + 0.03 * h, y + 0.04 * h); g.rotate(rot); g.scale(1, 0.5); g.beginPath(); g.arc(0, 0, s, 0, TAU); g.fillStyle = `rgba(70,52,30,${0.12 + 0.1 * ph})`; g.fill(); g.restore();
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s * Math.abs(Math.cos(t * 4 + L.t0 * 3)) * 0.6 + s * 0.3);
    g.beginPath(); g.moveTo(-1, 0); g.quadraticCurveTo(0, -1, 1, 0); g.quadraticCurveTo(0, 1, -1, 0); g.restore();
    g.fillStyle = PALETTE[L.c]; g.fill();
  }
}

function trailBegins(g, k, t, S) {
  // pull-back with counter-rotation, 3 s, ease-out (fastest at frame 0), from the gardener to the whole villa plan
  paperGround(g, S, PALETTE.bg); world(g, S);
  const e = EASE.out(k), headS = lerp(0.07, 0.205, k), p = trailAt(headS);
  const zoom = lerp(3.0, 1.0, e), roll = lerp(25, 0, e) * Math.PI / 180;
  const cx = lerp(p.x, 0, e), cy = lerp(p.y, 0.05, e);
  g.save(); g.rotate(roll); g.scale(zoom, zoom); g.translate(-cx, -cy);
  drawPlan(g, t, { headS, lawnGreen: 0.12, showMed: [MOTION.at(t, CUES.med1, 0.3), 0, 0, 0] });
  gardenerTop(g, t, p.x, p.y, p.ang, 1);
  fallingLeaves(g, t);
  g.restore();
  world(g, S);
  tag(g, t, 'Sonbahar, Ege', 0, -0.62, 0.042, MOTION.at(t, 0.9, 0.3), 62);
}

function rainTurnsDial(g, k, t, S) {
  // split frame, still, 3 s: top = rain on the grass, bottom = the sprinkler dial turned to off
  paperGround(g, S, PALETTE.bg); world(g, S);
  const hh = HH(), drop = MOTION.back(MOTION.at(t, CUES.s5, 0.3), 1.2);
  // top panel: blue-grey sky plane slides down from the top edge
  g.save(); g.translate(0, (drop - 1) * hh);
  g.fillStyle = PALETTE.rain; g.fillRect(-0.6, -hh - 0.1, 1.2, hh + 0.12);
  // a cloud with an ink outline
  const cl = (g) => { for (const [cx, cy, r] of [[-0.12, -0.62, 0.09], [0.0, -0.66, 0.12], [0.13, -0.61, 0.085], [0.24, -0.6, 0.06]]) { g.moveTo(cx + r, cy); g.arc(cx, cy, r, 0, TAU); } };
  g.save(); g.translate(0.01 * Math.sin(t), 0); cel(g, t, 200, cl, '#E9EEEC'); inked(g, t, 201, cl, 0.003); g.restore();
  // grass band (close): zigzag blades, darkened by the wet
  const gy = -0.06;
  g.beginPath(); g.moveTo(-0.6, 0.02);
  for (let i = 0; i <= 48; i++) { const x = -0.6 + i * 0.025, sw = 0.004 * Math.sin(t * 2 + i); g.lineTo(x + sw, gy - (i % 2 ? 0.07 : 0.03) - 0.02 * hash1(i)); }
  g.lineTo(0.6, 0.02); g.closePath(); g.fillStyle = mixHex(PALETTE.lawn, '#3D5E2A', 0.35); g.fill();
  inked(g, t, 202, (g) => { g.moveTo(-0.6, gy); for (let i = 0; i <= 48; i++) { const x = -0.6 + i * 0.025, sw = 0.004 * Math.sin(t * 2 + i); g.lineTo(x + sw, gy - (i % 2 ? 0.07 : 0.03) - 0.02 * hash1(i)); } }, 0.0028);
  // rain: diagonal lines at 24 fps, each lands on the grass with a splash ring
  for (let i = 0; i < 70; i++) {
    const sp = 1.6 + hash1(i) * 0.6, ph = ((t * sp + hash1(i + 99)) % 1), x0 = -0.55 + hash1(i + 7) * 1.1;
    const y = lerp(-0.55, gy - 0.05, ph), x = x0 - 0.12 * ph;
    if (ph < 0.92) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 0.012, y - 0.05); g.strokeStyle = '#F2F5F2'; g.lineWidth = 0.0032; g.stroke(); }
    else { const q = (ph - 0.92) / 0.08; g.beginPath(); g.ellipse(x, gy - 0.05, 0.004 + q * 0.018, 0.002 + q * 0.006, 0, Math.PI, TAU); g.strokeStyle = `rgba(242,245,242,${1 - q})`; g.lineWidth = 0.0025; g.stroke(); }
  }
  g.restore();
  // the split line
  inked(g, t, 203, (g) => { g.moveTo(-0.6, 0.02); g.lineTo(0.6, 0.02); }, 0.005);
  // bottom panel: the sprinkler dial, mid-century appliance drawing
  const DX = 0, DY = 0.24, R = 0.16;
  const turn = MOTION.anticipate(MOTION.at(t, CUES.dial, 0.35), 0.18, 0.3), ang = lerp(-50, 50, clamp(turn)) * Math.PI / 180;
  dropShadow(g, disc(DX, DY, R * 1.18), 0.014, 0.018, 0.22);
  cel(g, t, 210, disc(DX, DY, R * 1.18), '#7FA9AE'); inked(g, t, 211, disc(DX, DY, R * 1.18), 0.0042);
  cel(g, t, 212, disc(DX, DY, R), '#FBF6EA'); inked(g, t, 213, disc(DX, DY, R), 0.003);
  for (let i = 0; i <= 10; i++) { const a = (-140 + i * 10) * Math.PI / 180 + Math.PI / 2 - Math.PI; }
  for (let i = 0; i <= 12; i++) { const a = (-60 + i * 10 - 90) * Math.PI / 180; g.beginPath(); g.moveTo(DX + Math.cos(a) * R * 0.86, DY + Math.sin(a) * R * 0.86); g.lineTo(DX + Math.cos(a) * R * (i % 6 ? 0.78 : 0.7), DY + Math.sin(a) * R * (i % 6 ? 0.78 : 0.7)); g.strokeStyle = PALETTE.ink; g.lineWidth = 0.0024; g.stroke(); }
  g.save(); g.translate(DX, DY);
  g.save(); g.scale(0.01, 0.01); setType(g, TYPE, 'text', 3.0, { short: 100, weight: 600 }); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = PALETTE.sea; g.fillText('AÇIK', -R * 0.56 * 100, -R * 0.34 * 100); g.fillStyle = PALETTE.terra; g.fillText('KAPALI', R * 0.52 * 100, -R * 0.34 * 100); g.restore();
  // the pointer knob turns with anticipation and settles
  g.rotate(ang);
  dropShadow(g, rr(-0.022, -R * 0.82, 0.044, R * 1.0, 0.02), 0.008, 0.01, 0.25);
  cel(g, t, 214, rr(-0.022, -R * 0.82, 0.044, R * 1.0, 0.02), PALETTE.terra); inked(g, t, 215, rr(-0.022, -R * 0.82, 0.044, R * 1.0, 0.02), 0.003);
  cel(g, t, 216, disc(0, 0, 0.04), PALETTE.ink);
  // the gloved hand on the knob: one mustard glove, four cartoon fingers
  const glove = (g) => { g.ellipse(0.0, -R * 0.42, 0.05, 0.038, 0, 0, TAU); for (let f = 0; f < 4; f++) { g.moveTo(-0.042 + f * 0.028 + 0.012, -R * 0.42 - 0.03); g.ellipse(-0.042 + f * 0.028, -R * 0.42 - 0.036, 0.012, 0.022, 0, 0, TAU); } };
  cel(g, t, 217, glove, PALETTE.mustard); inked(g, t, 218, glove, 0.003);
  g.restore();
  // the sprinkler head at the right: a fan of droplets that stops when the dial reaches off
  const on = 1 - clamp(MOTION.at(t, CUES.dial + 0.3, 0.25));
  const SX = 0.33, SY = 0.42;
  cel(g, t, 220, rr(SX - 0.02, SY - 0.03, 0.04, 0.05, 0.008), '#6E8F8C'); inked(g, t, 221, rr(SX - 0.02, SY - 0.03, 0.04, 0.05, 0.008), 0.0026);
  for (let i = 0; i < 26; i++) {
    const ph = (t * 1.4 + hash1(i + 300)) % 1, a = (-150 + hash1(i + 310) * 120) * Math.PI / 180, d = ph * 0.2;
    if (ph > on) continue;
    dot(g, S, SX + Math.cos(a) * d, SY - 0.03 + Math.sin(a) * d + 0.25 * d * d, 0.005, PALETTE.sea, 0.9 * (1 - ph));
  }
  medallion(g, t, -0.36, 0.1, 0.04, 4, MOTION.at(t, CUES.s5 + 0.2, 0.3));
  tag(g, t, 'Yağmurda sulamayı azalt', 0, 0.48, 0.04, MOTION.at(t, CUES.dial + 0.5, 0.3), 230);
}

// scenes still to be written in the next pass (only the two test scenes are drawn now)
function laterScene(g, k, t, S) { paperGround(g, S, PALETTE.bg); }

// Music: written for this film in the next pass (STATE.md Music: code).
function score(ctx, out) {}
