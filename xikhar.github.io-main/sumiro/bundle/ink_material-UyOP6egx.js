import{F as e,G as t,J as n,L as r,M as i,O as a,T as o,Y as s,Z as c,a as l,ct as u,g as d,lt as f,ot as p,u as m,ut as h,v as g,w as _,y as v,z as y}from"./index-VEMJneSs.js";import{n as b,t as x}from"./constants-BjlLV5tN.js";var S=`
uniform highp sampler3D tInkNoise;
float vnoise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return texture(tInkNoise, (i + f + 0.5) / 64.0).r;
}
float fbm3(vec3 p) {
  return 0.5333 * vnoise(p) + 0.2667 * vnoise(p * 2.03 + 11.7) + 0.2 * vnoise(p * 4.01 + 3.1);
}
// Noise whose features stay lambdaPx wide on screen at any distance. Octaves cross-fade, so it
// never aliases into speckle and never pops. mpp is metres per reference pixel. World-locked, static.
// An octave keeps its offset whichever side of the fade it is on, or every change of octave is a seam, a line at one distance from the
// camera that travels over the stone as he moves. A half-way blend of two noises is flatter than either, which would leave a pale band,
// empty of marks, travelling with it: so the contrast is held level across the fade, at what the blend averaged before.
float pxNoise(vec3 p, vec3 stretch, float lambdaPx, float mpp, float seed) {
  float l = log2(max(lambdaPx * mpp, 1e-4));
  float k = floor(l);
  float f = l - k;
  vec3 q = p * stretch;
  float a = vnoise(q / pow(2.0, k) + seed + 5.7 * mod(k, 2.0));
  float b = vnoise(q / pow(2.0, k + 1.0) + seed + 5.7 * mod(k + 1.0, 2.0));
  return 0.5 + (mix(a, b, f) - 0.5) * 0.82 / sqrt(f * f + (1.0 - f) * (1.0 - f));
}
// Broad fields decide where a wash stops, and that edge is a hard threshold. If a field morphs as the camera comes closer, the edge
// slides over the stone as a pale stripe. So within playing distance a broad field stays one size in metres, locked to the stone,
// the size it had at 12 m. Past 64 m, where little moves on screen, it holds a size on screen instead.
const float INK_LOCK_K = 12.0 / 64.0;
float inkLockMpp(float dist, float pxToRad) { return max(dist, 64.0) * pxToRad; }
`,C=`
uniform vec3  uSunDir;
uniform vec3  uShadowMul;
uniform float uWrap;
uniform float uSkyFill;
uniform float uWashFreq;
uniform float uWashWarp;
uniform float uCavityK;
uniform float uDryAmt;
uniform float uDryFreq;
uniform float uGrainAmp;
uniform float uGrainFreq;
uniform float uBlotchAmp;
uniform float uBlotchFreq;
uniform float uStreakAmp;
uniform float uUseRamp;
uniform float uLookMap;
uniform float uFlat;
uniform float uRampBias;
uniform float uRampScale;
uniform float uPoolAmt;
uniform float uStep;
uniform float uBrushEdge;
uniform float uHueAmt;
uniform float uFacetAmt;
uniform float uFacetFreq;
uniform float uFacetStretch;
uniform float uCrackAmt;
uniform float uCrackW;
uniform float uCrackGate;
uniform float uFacetBevel;
uniform float uBrushAmt;
uniform float uBrushLean;
uniform float uPitAmt;
uniform float uScumble;
uniform float uStainAmt;
uniform float uStainFreq;
uniform float uSpeckAmt;
uniform float uPxScale;
uniform float uPxToRad;
uniform float uGouge;
uniform mat3  uNoiseFrame;
uniform vec3  uTint;
uniform vec3  uShadeTint;
uniform vec3  uDryCol;
uniform vec3  uPoolCol;
uniform vec3  uPoolDeep;
uniform vec3  uInkLine;
uniform float uLineWeight;
uniform float uLitClean;
uniform float uZones;
uniform float uZoneA;
uniform float uZoneB;
uniform float uZoneWander;
uniform float uZoneSoft;
uniform vec3  uZoneVals;
uniform float uDryDirect;
uniform float uPoolTear;
uniform float uCoolDark;
uniform float uInkBold;
uniform float uBoldMat;
uniform float uInkShape;

// style.md section 5, widened at both ends by eye: darks a little bluer and lights a little higher,
// as the stone in the reference runs near paper on lit edges and into slate in shadow. t = 1 lands
// on the 178 stop, and only t above 1, such as a pale look map on sunlit stone, reaches the last.
const int RAMP_N = 10;
const vec3 RAMP[RAMP_N] = vec3[RAMP_N](
  vec3(13.0, 16.0, 20.0) / 255.0,
  vec3(25.0, 33.0, 40.0) / 255.0,
  vec3(45.0, 52.0, 58.0) / 255.0,
  vec3(69.0, 72.0, 73.0) / 255.0,
  vec3(90.0, 90.0, 87.0) / 255.0,
  vec3(110.0, 109.0, 104.0) / 255.0,
  vec3(132.0, 131.0, 124.0) / 255.0,
  vec3(155.0, 154.0, 146.0) / 255.0,
  vec3(178.0, 177.0, 168.0) / 255.0,
  vec3(203.0, 202.0, 193.0) / 255.0
);

vec3 rampLookup(float t) {
  float x = clamp(t * 8.0, 0.0, 9.0);
  int i = int(floor(x));
  int j = min(i + 1, RAMP_N - 1);
  return mix(RAMP[i], RAMP[j], smoothstep(0.0, 1.0, x - float(i)));
}

vec3 inkHash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

// Distance to the nearest cell border in lattice units, plus that cell's random vector.
float inkVoronoi(vec3 p, out vec3 cell) {
  vec3 i = floor(p), f = fract(p);
  vec3 near = vec3(0.0), r0 = vec3(0.0);
  float best = 8.0;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec3 g = vec3(float(x), float(y), float(z));
    vec3 r = g + inkHash33(i + g) - f;
    float d = dot(r, r);
    if (d < best) { best = d; r0 = r; near = g; }
  }
  float border = 8.0;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec3 g = near + vec3(float(x), float(y), float(z));
    vec3 r = g + inkHash33(i + g) - f;
    vec3 diff = r - r0;
    float len2 = dot(diff, diff);
    if (len2 > 1e-5) border = min(border, dot(0.5 * (r0 + r), diff) / sqrt(len2));
  }
  cell = inkHash33(i + near + 91.7);
  return border;
}

#ifdef INK_SNOW
// Snow as an ink painting has it: the paper left bare, cool washes laid in the hollows, a dry brush down the slopes and a few
// pen marks. It lies on rock as a mask, in COLOR_0's G with a threshold at 0.5, so a cap's edge is drawn here, not cut in a mesh.
uniform float uSnowCover;
uniform vec4  uFoot;

// The wind lays its drifts along this heading, and everything on flat snow is drawn with it. Fixed, so the paint never moves.
const vec2 SNOW_WIND = vec2(0.86, 0.51);
const vec2 SNOW_LIGHT = vec2(0.77, 0.64);

vec3 snowFrame(vec3 P) {
  return vec3(dot(P.xz, SNOW_WIND), P.y, dot(P.xz, vec2(-SNOW_WIND.y, SNOW_WIND.x)));
}

// Swells 18 m long and 5 across, and smaller ones lying on them. W is in the wind's frame.
float snowDrift(vec3 W, float warp) {
  float big = vnoise(W * vec3(0.055, 0.2, 0.2) + warp * 1.3 + 301.0);
  float mid = vnoise(W * vec3(0.17, 0.5, 0.6) + warp * 0.7 + 317.0);
  return big * 0.64 + mid * 0.36;
}

// Noise made in the shader, not read from the 8-bit texture: its slope is smooth, so a line drawn along it has no teeth.
float snowHash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
float snowSmooth(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(snowHash(i), snowHash(i + vec2(1.0, 0.0)), f.x), mix(snowHash(i + vec2(0.0, 1.0)), snowHash(i + vec2(1.0, 1.0)), f.x), f.y);
}

// Long strokes: lying along the wind on flat snow, and down the fall line on anything steep.
float snowStroke(vec3 W, float steep, float lambdaPx, float mpp, float seed) {
  float a = steep < 0.99 ? pxNoise(W, vec3(0.09, 1.0, 1.0), lambdaPx, mpp, seed) : 0.0;
  float b = steep > 0.01 ? pxNoise(W, vec3(1.0, 0.1, 1.0), lambdaPx, mpp, seed + 3.0) : 0.0;
  return mix(a, b, steep);
}

// How much snow lies here, 0 to 1, and the mask its edge is drawn on.
float snowCoverage(vec3 P, vec3 N, float g, float mpp, out float mask) {
  mask = g;
  if (g >= 0.999) return 1.0;
  if (g <= 0.001) return 0.0;
  mask += (vnoise(P * vec3(0.7, 0.9, 0.7) + 331.0) - 0.5) * 0.3 + (vnoise(P * vec3(2.4, 2.0, 2.4) + 337.0) - 0.5) * 0.12 + (N.y - 0.5) * 0.12;
  // The brush drags down over the rock, in fingers, so a cap melts into it.
  float fine = pxNoise(P, vec3(1.0, 0.09, 1.0), 3.2, mpp, 341.0);
  float wide = pxNoise(P, vec3(1.0, 0.12, 1.0), 16.0, mpp, 347.0);
  return smoothstep(0.49, 0.53, mask + (fine - 0.5) * 0.025 + (wide - 0.5) * 0.07);
}

vec3 snowColour(vec3 P, vec3 N, float hollow, float shadow, float mpp) {
  vec3 W = snowFrame(P);
  // Marks lie on the ground, so they foreshorten with it: sized by the pixel's area, not its longest side, or they turn to dashes across the view.
  float mppArea = max(sqrt(length(cross(dFdx(P), dFdy(P)))) * uPxScale, mpp * 0.3);
  float warp = vnoise(W * vec3(0.035, 0.16, 0.14) + 293.0) - 0.5;
  float d0 = snowDrift(W, warp);
  // The ground is lit from one side, so a drift has a bright face and a shaded one, wherever the mesh is flat.
  float d1 = snowDrift(snowFrame(P + vec3(SNOW_LIGHT.x, 0.0, SNOW_LIGHT.y) * 1.2), warp);
  float steep = 1.0 - smoothstep(0.5, 0.85, abs(N.y));
  float flat_ = 1.0 - steep;

  // Real form, from the real normal. On flat ground this is nothing.
  float light = mix(clamp((dot(N, uSunDir) + uWrap) / (1.0 + uWrap), 0.0, 1.0), N.y * 0.5 + 0.5, uSkyFill);
  // Near flat counts as flat, so a gentle slope has no tone of its own where it meets level ground.
  float form = max(0.86 - light, 0.0) * (0.45 + 0.9 * d0) * (1.0 - smoothstep(0.76, 0.92, N.y));

  // How much wash it wants. Under 0.14 the paper is left bare.
  float v = form * 0.72 + steep * 0.13 + (0.5 - d0) * 1.25 + (d1 - d0) * 2.6 * flat_ + (1.0 - hollow) * 0.9;

  // On a steep face the brush is calmer: fall lines over the whole of a rim read as a curtain.
  float drag = snowStroke(W, steep, 3.6, mppArea, 351.0);
  float dragW = snowStroke(W, steep, 11.0, mppArea, 355.0);
  float e = v + ((dragW - 0.5) * 0.17 + (drag - 0.5) * 0.08) * (1.0 - 0.6 * steep);
  float wash0 = smoothstep(-0.14, 0.02, e);
  float wash1 = smoothstep(0.1, 0.25, e);
  float wash2 = smoothstep(0.25, 0.42, e);
  float wash3 = smoothstep(0.5, 0.68, e);
  // Dry brush: where the brush runs out of ink the strokes skip and the paper shows.
  float skip = smoothstep(0.54, 0.68, drag * 0.6 + dragW * 0.4) * (1.0 - 0.7 * steep);

  float cool = 0.52 + 0.48 * pxNoise(P, vec3(1.0, 0.5, 1.0), 60.0, mpp, 361.0);
  vec3 col = vec3(0.925, 0.915, 0.885);
  // Hardly a tone at all, but it gives the bare paper a shape to be bare in.
  col *= mix(vec3(1.0), vec3(0.955, 0.96, 0.975), wash0 * (1.0 - skip * 0.7));
  col *= mix(vec3(1.0), vec3(0.885, 0.9, 0.93), wash1 * (1.0 - skip * 0.4));
  col *= mix(vec3(1.0), mix(vec3(0.88, 0.89, 0.91), vec3(0.83, 0.86, 0.915), cool), wash2 * (1.0 - skip * 0.3));
  col *= mix(vec3(1.0), vec3(0.84, 0.85, 0.885), wash3 * (1.0 - skip * 0.25));

  // Marks fade with distance: near, you see the pen. Far, only the washes.
  float near = 1.0 - smoothstep(0.018, 0.07, mppArea);
  if (near > 0.001) {
    // Wind's scratches, gathered in patches, and the pen's stipple, gathered where the wash is.
    float patch_ = smoothstep(0.56, 0.74, pxNoise(W, vec3(0.3, 1.0, 1.0), 46.0, mppArea, 379.0));
    float scratch = smoothstep(0.72, 0.82, snowStroke(W, steep, 2.2, mppArea, 373.0));
    col *= 1.0 - 0.1 * scratch * patch_ * near;
    float gather = smoothstep(0.5, 0.82, wash1 * 0.5 + pxNoise(P, vec3(1.0), 30.0, mppArea, 383.0) * 0.55);
    float dots = smoothstep(0.68, 0.78, pxNoise(P, vec3(1.0), 1.5, mppArea, 389.0));
    col *= 1.0 - 0.09 * dots * gather * near * hollow;
  }

  // Whatever lies in a hollow takes the cool of the shade: a print or a trench is blue, never dirty.
  col *= mix(vec3(1.0), vec3(0.74, 0.8, 0.92), smoothstep(0.0, 0.65, 1.0 - hollow));

  // The paper itself: its tooth, slow mottling and a few long fibres, at a steady size on screen.
  float tooth = 0.65 * pxNoise(P, vec3(1.0), 2.0, mpp, 29.0) + 0.35 * pxNoise(P, vec3(1.0), 4.3, mpp, 31.0);
  float mottle = pxNoise(P, vec3(1.0), 48.0, mpp, 393.0);
  float fibre = smoothstep(0.68, 0.84, pxNoise(W, vec3(0.08, 1.0, 1.0), 1.6, mpp, 397.0));
  col *= 1.0 + (tooth - 0.5) * 0.085 + (mottle - 0.5) * 0.045 - fibre * 0.028;

  // A cast shadow is one more wash, cool, with the brush skipping at its edge.
  float sEdge = shadow * (1.0 - shadow) * 4.0;
  float s = smoothstep(0.22, 0.78, clamp(shadow + (dragW - 0.5) * 0.5 * sEdge + (drag - 0.5) * 0.3 * sEdge, 0.0, 1.0));
  col *= mix(vec3(0.6, 0.65, 0.76) * (1.0 + skip * 0.08), vec3(1.0), s);

  // Where he stands, the snow takes a soft dark pool.
  vec3 dF = P - uFoot.xyz;
  float r2 = dot(dF.xz, dF.xz);
  if (uFoot.w > 0.001 && r2 < 1.6 && abs(dF.y) < 0.4 && N.y > 0.55) {
    float c = exp(-r2 / 0.14) * uFoot.w * smoothstep(0.55, 0.85, N.y) * (1.0 - smoothstep(0.14, 0.4, abs(dF.y)));
    float b = smoothstep(0.06, 0.62, c + (drag - 0.5) * 0.16 * c + (dragW - 0.5) * 0.2 * c);
    col = mix(col, col * vec3(0.5, 0.54, 0.63), b * 0.9);
    col = mix(col, col * vec3(0.6, 0.62, 0.68), smoothstep(0.62, 1.0, c));
  }
  return col;
}
#endif

// paint is COLOR_0 (environment.md 3.1): R cavity and value, G dry brush, B ink pool, A line.
vec3 inkSurface(vec3 P, vec3 N, vec3 albedo, vec4 paint, float shadow) {
  if (uFlat > 0.5) return albedo * mix(uShadowMul, vec3(1.0), shadow);

  // Metres per reference pixel: everything that must hold a steady size on screen reads this.
  // Small marks use a noise frame. On ground seen at a grazing angle it squeezes the view axis,
  // so a pit is round on screen and not a dash lying across the view.
  vec3 Pq = uNoiseFrame * P;
  float mpp = max(max(length(dFdx(Pq)), length(dFdy(Pq))), 1e-4) * uPxScale;
  float mppB = inkLockMpp(length(P - cameraPosition), uPxToRad);
  #define BROAD(q, stretch, lambda, seed) pxNoise(q, stretch, (lambda) * INK_LOCK_K, mppB, seed)

  #ifdef INK_SNOW
    // A painted mark (no line weight) stops where it stops being a hollow, so it can't show paler than what it lies on.
    if (uSnowCover > 0.5 && paint.a < 0.02 && paint.r > 0.985) discard;
    float snowMask = 0.0;
    float snowCover = snowCoverage(P, N, max(paint.g, uSnowCover), mpp, snowMask);
    vec3 snowCol = snowCover > 0.001 ? snowColour(P, N, paint.r, shadow, mpp) : vec3(0.0);
    if (snowCover > 0.999) return snowCol;
    paint.g = 0.0; // here G is the snow's, not the dry brush's
  #endif

  float bristle = pxNoise(Pq, vec3(1.0, 0.2, 1.0), 2.3, mpp, 3.0);
  float bristleWide = pxNoise(Pq, vec3(1.0, 0.3, 1.0), 6.5, mpp, 11.0);
  float blotch = 0.6 * BROAD(Pq, vec3(1.0), 13.0, 17.0) + 0.4 * BROAD(Pq, vec3(1.0), 27.0, 23.0);
  float grain = 0.65 * pxNoise(Pq, vec3(1.0), 2.0, mpp, 29.0) + 0.35 * pxNoise(Pq, vec3(1.0), 4.3, mpp, 31.0);

  // Planes. Any mesh gets hewn, by tilting the normal per warped Voronoi cell. The tilt eases
  // to nothing at a border, so one plane rolls into the next as a soft edge, not a toon step.
  float borderPx = 1e3;
  vec3 cell = vec3(0.5);
  vec3 NF = N;
  if (uFacetAmt > 0.001 || uCrackAmt > 0.001) {
    vec3 sp = P * vec3(1.0, uFacetStretch, 1.0) * uFacetFreq;
    vec3 warp = vec3(vnoise(sp * 0.9 + 3.0), vnoise(sp * 0.9 + 13.0), vnoise(sp * 0.9 + 23.0)) - 0.5;
    vec3 warp2 = vec3(vnoise(sp * 3.7 + 33.0), vnoise(sp * 3.7 + 43.0), vnoise(sp * 3.7 + 53.0)) - 0.5;
    float border = inkVoronoi(sp + warp * 0.95 + warp2 * 0.22, cell);
    borderPx = border / (uFacetFreq * mpp);
    NF = normalize(N + (cell - 0.5) * 2.0 * uFacetAmt * smoothstep(0.0, uFacetBevel, border));
  }

  float ndl = dot(NF, uSunDir);
  float wrapped = clamp((ndl + uWrap) / (1.0 + uWrap), 0.0, 1.0);
  float sky = NF.y * 0.5 + 0.5;
  float light = mix(wrapped, sky, uSkyFill);

  // Wash warps the terminator. Stretched vertically so bleeds run downhill.
  vec3 wp = vec3(P.x, P.y * 0.45, P.z) * uWashFreq;
  float warpW = vnoise(wp * 0.53 + 7.0) - 0.5;
  float wash = fbm3(wp + warpW * 1.4);
  float t = light + (wash - 0.5) * uWashWarp;
  float tBase = t;

  // Ink on paper: value is decided in big shapes, so the even all-over tooth is turned well down.
  float bold = uInkBold * uBoldMat;
  float calm = 1.0 - 0.55 * bold;

  // Soft blotches: rock texture energy peaks at 8 to 16 px (style.md section 5).
  t += (blotch - 0.5) * uBlotchAmp * 2.0 * calm;

  // Fall-line streaks fade out on flat tops, where they would turn to speckle.
  float steep = 1.0 - smoothstep(0.55, 0.92, abs(N.y));
  t += (bristleWide - 0.5) * uStreakAmp * 2.0 * steep * calm;

  // Brush strokes. Each cell has its own frame: on steep planes strokes lean off the fall line,
  // on flat ones they lie at the cell's own heading. The frame is constant inside a cell, so the
  // strokes stay locked to the stone and there is no per-pixel swirl.
  float s1 = 0.5, s2 = 0.5, s3 = 0.5;
  if (uBrushAmt > 0.001) {
    vec3 lean = vec3(cell.x - 0.5, 0.0, cell.z - 0.5) * uBrushLean;
    vec3 a = normalize(vec3(lean.x, 1.0, lean.z));
    vec3 b = normalize(cross(a, vec3(0.31, 0.2, 0.93)));
    vec3 c = cross(a, b);
    float az = cell.y * 6.283;
    vec3 a2 = vec3(cos(az), 0.0, sin(az));
    vec3 b2 = vec3(-a2.z, 0.0, a2.x);
    vec3 qSteep = vec3(dot(Pq, a) * 0.13, dot(Pq, b), dot(Pq, c));
    vec3 qFlat = vec3(dot(Pq, a2) * 0.2, Pq.y, dot(Pq, b2));
    float sw = smoothstep(0.62, 0.88, abs(N.y));
    if (sw < 0.999) {
      s1 = pxNoise(qSteep, vec3(1.0), 2.8, mpp, 41.0);
      s2 = pxNoise(qSteep, vec3(1.0), 8.0, mpp, 47.0);
      s3 = pxNoise(qSteep, vec3(1.0), 1.9, mpp, 83.0);
    }
    if (sw > 0.001) {
      s1 = mix(s1, pxNoise(qFlat, vec3(1.0), 2.8, mpp, 41.0), sw);
      s2 = mix(s2, pxNoise(qFlat, vec3(1.0), 8.0, mpp, 47.0), sw);
      s3 = mix(s3, pxNoise(qFlat, vec3(1.0), 1.9, mpp, 83.0), sw);
    }
    t += ((s2 - 0.5) * 0.62 + (s1 - 0.5) * 0.4) * uBrushAmt * calm;
  }

  // Big soft stains, world-locked. On pale ground they are what makes it read as stained paper.
  float stainMask = 0.0;
  if (uStainAmt > 0.001) {
    vec3 st = P * uStainFreq;
    float swarp = vnoise(st * 0.61 + 91.0) - 0.5;
    float big = fbm3(st + swarp * 1.8 + 77.0);
    float mid = fbm3(st * 2.9 + swarp * 2.4 + 37.0);
    stainMask = smoothstep(0.44, 0.66, big * 0.7 + mid * 0.3);
    t -= stainMask * uStainAmt * 0.2;
    t -= (mid - 0.5) * uStainAmt * 0.12;
  }

  // Lit planes stay nearly clean. Surface noise belongs to the shade, where it reads as pigment.
  float litClean = uLitClean * smoothstep(0.3, 0.72, tBase);
  t = mix(t, tBase, litClean);

  vec3 look = vec3(0.5, 0.0, 0.0);
  if (uLookMap > 0.5) {
    look = albedo;
    t += (look.r - 0.5) * 1.1;
  }

  // Ink pools in cavities.
  t *= mix(1.0, paint.r, uCavityK);

  vec3 col;
  if (uUseRamp > 0.5) {
    // A continuous wash, with a few wandering wet edges where a glaze stopped. These are irregular
    // and uneven in strength, so they read as bleeds and not as a run of equal toon bands.
    float v = t * uRampScale + uRampBias;
    float wet = smoothstep(0.38, 0.72, vnoise(P * uWashFreq * 2.1 + 41.0));
    float q = 0.11;
    float wetEdge = 0.0;
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      float th = 0.22 + fi * 0.2 + (fract(fi * 0.73 + 0.41) - 0.5) * 0.07;
      float n = mix(bristle, bristleWide, fract(fi * 0.381 + 0.17)) - 0.5;
      float wander = (wash - 0.5) * 0.3 + (blotch - 0.5) * 0.9;
      float edge = mix(0.09, 0.2, wet * fract(fi * 0.618 + 0.3));
      float cov = smoothstep(th - edge, th + edge, v + n * uBrushEdge + wander * uBrushEdge * 1.6);
      q += 0.22 * cov;
      wetEdge += cov * (1.0 - cov) * 4.0 * (1.0 - wet) * fract(fi * 0.37 + 0.2);
    }
    float stepped = q + (v - q) * 0.45 - wetEdge * 0.016;

    // Border bleed: a dark side and a pale lip on each stroke, which chisels the plane.
    float crackFade = 1.0 - smoothstep(0.12, 0.3, mpp * uFacetFreq);
    if (uCrackAmt > 0.001) {
      float bleed = exp(-borderPx / 6.0) * crackFade * (0.45 + (s2 - 0.5) * 1.8);
      stepped += bleed * (cell.y > 0.5 ? -0.07 : 0.05) * uCrackAmt;
    }
    float vw = mix(v, stepped, uStep);

    // Wash zones: pale top, a mid wash, a cool dark. Each boundary is where a glaze stopped, hard in
    // one place and bleeding in the next. A little of the continuous ramp stays inside each zone.
    if (uZones > 0.001) {
      float slow = BROAD(P, vec3(1.0, 0.5, 1.0), 46.0, 151.0);
      float wetZ = smoothstep(0.32, 0.68, BROAD(P, vec3(1.0), 70.0, 157.0));
      float wan = ((slow - 0.5) * 0.34 + (wash - 0.5) * 0.3 + (bristleWide - 0.5) * 0.05) * uZoneWander;
      float ea = mix(0.03, uZoneSoft, wetZ);
      float eb = mix(uZoneSoft, 0.035, wetZ);
      float zDark = smoothstep(uZoneA - ea, uZoneA + ea, v + wan);
      float zPale = smoothstep(uZoneB - eb, uZoneB + eb, v + wan);
      float zoned = mix(mix(uZoneVals.x, uZoneVals.y, zDark), uZoneVals.z, zPale);
      zoned += (v - mix(mix(0.5 * uZoneA, 0.5 * (uZoneA + uZoneB), zDark), 0.5 * (uZoneB + 1.0), zPale)) * 0.3;
      vw = mix(vw, zoned, uZones);
    }

    // Notan: lit faces go to pale paper and shade drops to slate, across one wandering wet edge, in
    // place of a smooth 3D gradient through mid grey.
    if (bold > 0.001) {
      float slowN = BROAD(P, vec3(1.0, 0.4, 1.0), 60.0, 171.0);
      float wanN = (slowN - 0.5) * 0.3 + (wash - 0.5) * 0.3 + (bristleWide - 0.5) * 0.05;
      float wetN = smoothstep(0.35, 0.65, BROAD(P, vec3(1.0), 90.0, 177.0));
      float eN = mix(0.015, 0.07, wetN);
      float paperN = smoothstep(0.46 - eN, 0.46 + eN, vw + wanN);
      float shade = 0.08 + 0.42 * smoothstep(0.0, 0.46, vw);
      // Lit stone keeps big soft washes, or it reads as a blank card.
      // They are laid by a brush, so each stops at a dragged edge instead of fading out like an airbrush.
      float washN = (wash - 0.5) * 0.22 + (slowN - 0.5) * 0.34;
      float dragN = washN + ((bristleWide - 0.5) * 0.5 + (bristle - 0.5) * 0.4 + (blotch - 0.5) * 0.3) * 0.17;
      float laid = 0.085 * (smoothstep(-0.075, -0.05, dragN) + smoothstep(0.035, 0.06, dragN) - 1.0);
      float pale = 0.75 + 0.2 * smoothstep(0.55, 1.05, vw) + mix(washN, laid, 0.8);
      vw = mix(vw, mix(shade, pale, paperN), 0.85 * bold);
    }
    col = rampLookup(vw) * uTint;
    // The lit stone is the paper showing through: warm, not neutral grey.
    col = mix(col, col * vec3(1.035, 1.012, 0.97), bold * smoothstep(0.62, 0.95, vw));

    // Shadow goes to slate. The ramp's own darks are only faintly blue, and a warm tint cancels them.
    col *= mix(vec3(1.0), vec3(0.88, 0.98, 1.12), (1.0 - smoothstep(0.1, 0.6, vw)) * uCoolDark);

    // Pigment drifts warm and blue-grey in big patches.
    float hue = vnoise(P * uWashFreq * 0.8 + 61.0) - 0.5 + (blotch - 0.5) * 0.5;
    col *= 1.0 + max(hue, -0.16) * vec3(0.07, 0.0, -0.08) * uHueAmt;

    // Pale scumble: the brush skips over lit planes and leaves dragged, broken flecks.
    if (uScumble > 0.001) {
      float scum = smoothstep(0.585, 0.70, s1 * 0.6 + s3 * 0.4 + (v - 0.68) * 0.34) * (1.0 - litClean * 0.8);
      col = mix(col, uDryCol, scum * uScumble);
    }

    // Dry brush from the mask. Strokes feather its edge: a low mask gives sparse dragged flecks and
    // a high mask pale stone, with no one outline around the whole patch.
    float dryMask = max(paint.g, look.g);
    if (dryMask > 0.01) {
      float strokes = (uBrushAmt > 0.001 ? s1 * 0.45 + s2 * 0.2 + bristleWide * 0.35 : bristle * 0.62 + bristleWide * 0.38);
      float dry = smoothstep(0.47, 0.67, strokes + (dryMask - 0.5) * 0.8) * smoothstep(0.02, 0.22, dryMask);
      // A look map that paints its own torn edges does not want bristles laid over them, which read as hatching.
      dry = mix(dry, dryMask, uDryDirect);
      // Bare stone still carries its grain, or a painted tear reads as a flat label.
      vec3 dryTex = uDryCol * (1.0 + uDryDirect * ((blotch - 0.5) * 0.26 + (grain - 0.5) * 0.2));
      col = mix(col, dryTex, dry * mix(uDryAmt, 0.95, smoothstep(0.55, 1.0, dryMask)));
    }

    // Blue-black pools with a torn edge (environment.md 3.1). The edge is thresholded
    // against noise, so a soft mask paints as a brush mark and not a gradient.
    float poolMask = max(paint.b * uPoolAmt, look.b);
    if (poolMask > 0.001) {
      #ifdef INK_SNOW
      // Ink on snow rock runs down from under the snow, in fingers: a soft wet bleed, and a dark core only where it is loaded.
      float runX = P.x + P.z * 0.73;
      float runFine = snowSmooth(vec2(runX * 2.1, P.y * 0.075) + 431.0);
      float runWide = snowSmooth(vec2(runX * 0.6, P.y * 0.03) + 437.0);
      float inkM = poolMask + ((runFine * 0.5 + runWide * 0.5) - 0.5) * 1.15 * smoothstep(0.02, 0.5, poolMask) + (bristleWide - 0.5) * 0.07 * smoothstep(0.02, 0.2, poolMask);
      float bleedM = smoothstep(0.14, 0.42, inkM);
      float coreM = smoothstep(0.44, 0.62, inkM);
      col = mix(col, col * vec3(0.44, 0.48, 0.54), bleedM * 0.92);
      col = mix(col, vec3(0.062, 0.072, 0.09), coreM * (0.97 - 0.34 * smoothstep(0.56, 0.72, s1 * 0.5 + bristle * 0.5)));
      #else
      float tear = (blotch - 0.5) * 0.9 + (bristle - 0.5) * 0.65 + (s2 - 0.5) * 0.5;
      // A slow gradient against fine noise is what breaks into speckle, so a bold edge takes less of it.
      // Thresholds only drop for a fully bold chapter: on chapter 1's thin painted masks a lower one turns to leopard spots.
      float boldP = smoothstep(0.5, 1.0, bold);
      // On a wall a full mask is too big a shape for solid black: it pulls in and goes to slate, dry at the edges.
      float wallP = boldP * (1.0 - smoothstep(0.35, 0.65, abs(N.y)));
      poolMask = max(poolMask - wallP * (0.16 + (bristleWide - 0.5) * 0.3), 0.0);
      float pool = smoothstep(mix(0.42, 0.3, boldP), mix(0.56, 0.37, boldP), poolMask + tear * 0.5 * uPoolTear * mix(1.0, 0.3, bold));
      col *= 1.0 - 0.5 * boldP * smoothstep(0.08, 0.34, poolMask + (blotch - 0.5) * 0.1);
      // A thin mask paints a translucent wash, a full one goes down as solid ink.
      float load = smoothstep(0.15, 0.9, poolMask);
      vec3 inkCol = mix(mix(uPoolCol, uPoolDeep, smoothstep(0.7, 0.92, poolMask)), vec3(0.035, 0.04, 0.045), bold * 0.9);
      // Painted crack lines sit at the very top of the mask and are warm black, unlike wash.
      inkCol = mix(inkCol, vec3(0.085, 0.105, 0.13), wallP);
      float lineInk = smoothstep(0.78, 0.86, look.b);
      inkCol = mix(inkCol, uInkLine, lineInk);
      pool = mix(pool, smoothstep(0.78, 0.95, look.b), lineInk);
      col = mix(col, inkCol, pool * mix(mix(0.55, 0.98, load), 0.97, bold) * (1.0 - wallP * 0.4 * smoothstep(0.54, 0.7, s1 * 0.5 + bristle * 0.5)));
      #endif
    }

    // Big ink shapes on anything steep: long falling bands, as a loaded brush draws down a cliff, gathered
    // where the face is turned from the light. A soft wet bleed, then a core of real black inside it.
    float inkAmt = bold * bold * uInkShape * (1.0 - smoothstep(0.42, 0.72, abs(N.y)));
    if (inkAmt > 0.001) {
      vec3 qi = vec3(P.x, P.y * 0.055, P.z) * 0.42;
      float warpI = vnoise(qi * 0.7 + 201.0) - 0.5;
      float bandI = fbm3(qi + warpI * 1.3 + 211.0);
      // From the true normal: a facet's tilt here would cut the shape into the cell mosaic.
      float lightI = mix(clamp((dot(N, uSunDir) + uWrap) / (1.0 + uWrap), 0.0, 1.0), N.y * 0.5 + 0.5, uSkyFill);
      float mI = bandI + (0.5 - lightI) * 0.3 + (paint.r - 1.0) * 0.3 + (vnoise(vec3(P.x, P.y * 0.05, P.z) * 3.4 + 221.0) - 0.5) * 0.07;
      // The field moves slowly on a near wall: fine noise here would make felt, not a torn edge.
      float bleedI = smoothstep(0.53, 0.64, mI + (blotch - 0.5) * 0.03);
      float coreI = smoothstep(0.665, 0.685, mI + (blotch - 0.5) * 0.05 + (bristleWide - 0.5) * 0.03);
      col = mix(col, col * vec3(0.36, 0.43, 0.5), bleedI * inkAmt * 0.85);
      // Slate, not black, with the dry brush skipping in it: the black belongs to the lines.
      col = mix(col, vec3(0.085, 0.105, 0.13), coreI * inkAmt * (0.97 - 0.4 * smoothstep(0.54, 0.7, s1 * 0.5 + bristle * 0.5)));
    }

    // Gouges: where two planes meet, ink sometimes runs into the seam as a short tapered notch. The
    // width comes from a slow field, so a notch swells and thins out to nothing along the border.
    if (uGouge > 0.001) {
      float reach = smoothstep(0.58, 0.82, BROAD(Pq, vec3(1.0, 0.6, 1.0), 19.0, 97.0));
      float gw = 0.6 + 3.4 * reach;
      float gouge = (1.0 - smoothstep(gw * 0.5, gw, borderPx + (bristle - 0.5) * 2.0)) * reach;
      gouge *= step(0.5, cell.z);
      col = mix(col, mix(uPoolCol, uPoolDeep, reach), gouge * uGouge);
    }

    // Granite: a pen's stipple gathers in loose patches and toward the shade, with bare stone between them.
    if (bold > 0.001) {
      float gather = smoothstep(0.38, 0.68, BROAD(Pq, vec3(1.0), 34.0, 191.0) + (0.55 - vw) * 0.5);
      float dot1 = smoothstep(0.6, 0.7, pxNoise(Pq, vec3(1.0), 1.7, mpp, 193.0));
      float dot2 = smoothstep(0.62, 0.74, pxNoise(Pq, vec3(1.0), 3.4, mpp, 197.0));
      col *= 1.0 - bold * gather * (0.26 * dot1 + 0.2 * dot2);
      // The brush skipped a little on the lit stone, too.
      col = mix(col, col * vec3(1.13, 1.12, 1.09), bold * smoothstep(0.66, 0.78, s3) * (1.0 - gather) * 0.55);
    }

    // Pits and chisel ticks, in loose clusters. Dark and small, and they follow the plane.
    if (uPitAmt > 0.001) {
      float cluster = smoothstep(0.38, 0.64, BROAD(Pq, vec3(1.0), 22.0, 53.0));
      float tick = smoothstep(0.69, 0.79, s3) * cluster;
      float pit = smoothstep(0.70, 0.82, pxNoise(Pq, vec3(1.0), 2.4, mpp, 59.0)) * mix(0.3, 1.0, cluster);
      col *= 1.0 - uPitAmt * (0.42 * tick + 0.42 * pit) * (1.0 - litClean);
    }

    // Ink specks settle in the stains.
    if (uSpeckAmt > 0.001) {
      float speck = smoothstep(0.73, 0.84, pxNoise(Pq, vec3(1.0), 2.1, mpp, 73.0));
      speck *= smoothstep(0.42, 0.68, BROAD(Pq, vec3(1.0), 38.0, 79.0) + stainMask * 0.22);
      col = mix(col, vec3(0.2, 0.19, 0.17), speck * uSpeckAmt * 0.62);
    }

    // Cracks: long strokes on the cell borders, with pressure along them. Only some borders carry
    // one, gated on a slow field, and pressure takes each down to nothing before it ends.
    if (uCrackAmt > 0.001) {
      float pressure = BROAD(Pq, vec3(1.0, 0.3, 1.0), 42.0, 67.0);
      float wPx = uCrackW * smoothstep(0.32, 0.8, pressure);
      float gate = smoothstep(uCrackGate - 0.03, uCrackGate + 0.03, vnoise(P * uFacetFreq * vec3(0.8, 0.8 * uFacetStretch, 0.8) + 71.0));
      float crack = 1.0 - smoothstep(max(wPx * 0.5 - 0.6, 0.0), wPx * 0.5 + 0.6, borderPx);
      crack *= gate * crackFade * smoothstep(0.12, 0.9, wPx);
      col = mix(col, uInkLine, crack * uCrackAmt);
    }
  } else {
    float lit = smoothstep(0.10, 0.62, t + (bristleWide - 0.5) * 0.08);
    col = albedo * mix(uShadeTint, vec3(1.0), lit);
    col *= mix(1.0, 1.25, smoothstep(0.82, 1.0, t));
  }

  // Cast shadow, multiplied. A brush lays it, so its edge breaks up instead of tracing the map.
  float sEdge = shadow * (1.0 - shadow) * 4.0;
  float s = smoothstep(0.3, 0.7, clamp(shadow + (bristleWide - 0.5) * 0.7 * sEdge + (blotch - 0.5) * 0.5 * sEdge, 0.0, 1.0));
  // On a bold chapter it is cool slate with the brush skipping through it, not a flat brown pane.
  float boldS = uInkBold * uBoldMat * step(0.5, uUseRamp);
  float skip = smoothstep(0.54, 0.7, bristleWide * 0.55 + blotch * 0.45);
  col *= mix(uShadowMul * mix(vec3(1.0), vec3(0.74, 0.82, 0.96) * (1.0 + skip * 0.34), boldS), vec3(1.0), s);

  // Granulation and world-locked tooth, luminance only. Pigment settles in the darks.
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  float g = (grain - 0.5) * 2.0;
  col *= 1.0 + g * uGrainAmp * mix(2.2, 1.0, smoothstep(0.1, 0.65, lum)) * (1.0 - 0.3 * uInkBold * uBoldMat);

  #ifdef INK_SNOW
    if (snowMask > 0.001) {
      // Ink gathers under a cap's edge. Then the snow, and one pen line along where it stops: it thins but does not break.
      // Snow banked at the foot of a rock has neither: its mask grows downward, and it just lies there.
      vec2 dYs = vec2(dFdx(P.y), dFdy(P.y));
      float capEdge = smoothstep(-0.05, 0.05, (dFdx(snowMask) * dYs.x + dFdy(snowMask) * dYs.y) / max(dot(dYs, dYs), 1e-6));
      float under = smoothstep(0.2, 0.5, snowMask) * capEdge;
      col *= mix(vec3(1.0), vec3(0.42, 0.46, 0.52), under);
      col = mix(col, snowCol, snowCover);
      float dLine = abs(snowMask - 0.5) / max(fwidth(snowMask), 1e-4);
      float wLine = (0.6 + 2.6 * smoothstep(0.34, 0.72, vnoise(P * 0.3 + 401.0))) * uPxScale;
      float nearL = 1.0 - smoothstep(0.08, 0.3, mpp);
      col = mix(col, uInkLine, (1.0 - smoothstep(wLine * 0.5, wLine * 0.5 + 0.9 * uPxScale, dLine)) * mix(0.22, 0.88, capEdge) * nearL);
    }
  #endif
  return col;
}
`,w=`
const int INK_N = 8;
const vec2 INK_DIRS[INK_N] = vec2[INK_N](
  vec2(1.0, 0.0), vec2(0.9239, 0.3827), vec2(0.7071, 0.7071), vec2(0.3827, 0.9239),
  vec2(0.0, 1.0), vec2(-0.3827, 0.9239), vec2(-0.7071, 0.7071), vec2(-0.9239, 0.3827)
);
// The nearest surface around this pixel, from a small map read with a linear filter. A ring read per pixel flips as a jagged rim enters
// and leaves it, and everything keyed on that wobbles from one pixel to the next: a stepped line, and rippled tone at the foot of a wall.
vec4 inkKey(vec2 uv, vec3 ray) {
  float z = texture(tKey, uv).r;
  return vec4(uCamPos + ray * (z / max(dot(ray, uCamFwd), 0.05)), z);
}
vec2 inkWobble(vec3 Pk, float mK, float zKey) {
  // Where the key runs quickly from one surface to another, Pk sweeps through metres of space in a few pixels, and the wobble would ripple with it. So the wobble rests there.
  float rest = 1.0 - smoothstep(0.02, 0.05, fwidth(zKey) / zKey * uPxScale);
  vec2 wob = vec2(0.0);
  // The two long waves shear the picture, so they are fields of the stone too. The short two are tooth on the line.
  float mB = inkLockMpp(mK / uPxToRad, uPxToRad);
  wob.x += uWobAmp.x * (2.0 * pxNoise(Pk, vec3(1.0), uWobLattice.x * INK_LOCK_K, mB, 1.0) - 1.0);
  wob.y += uWobAmp.x * (2.0 * pxNoise(Pk, vec3(1.0), uWobLattice.x * INK_LOCK_K, mB, 7.0) - 1.0);
  wob.x += uWobAmp.y * (2.0 * pxNoise(Pk, vec3(1.0), uWobLattice.y * INK_LOCK_K, mB, 13.0) - 1.0);
  wob.y += uWobAmp.y * (2.0 * pxNoise(Pk, vec3(1.0), uWobLattice.y * INK_LOCK_K, mB, 19.0) - 1.0);
  wob.x += uWobAmp.z * (2.0 * pxNoise(Pk, vec3(1.0), uWobLattice.z, mK, 23.0) - 1.0);
  wob.y += uWobAmp.z * (2.0 * pxNoise(Pk, vec3(1.0), uWobLattice.z, mK, 29.0) - 1.0);
  return wob * rest;
}
`,T=`
in vec3 position;
out vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,E=`
out vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0);
  gl_Position = p.xyww; // the far plane, at infinity
}
`,D=`
in vec3 vDir;
layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 gNormal;
${S}
uniform sampler2D tCloud;
uniform float uHasCloud;
uniform float uPxToRad;
uniform vec3 uPaper;
vec2 octUv(vec3 d) {
  vec3 a = d / (abs(d.x) + abs(d.y) + abs(d.z));
  return a.y >= 0.0 ? a.xz * 0.5 + 0.5
                    : (vec2(1.0) - abs(a.zx)) * sign(a.xz) * 0.5 + 0.5;
}
float mottle(vec3 d, float lambdaPx) {
  return vnoise(d / (lambdaPx * uPxToRad)) - 0.5;
}
void main() {
  vec3 d = normalize(vDir);
  float g = 0.0;
  g += 4.8 * mottle(d, 3.0);
  g += 4.2 * mottle(d, 6.0);
  g += 3.6 * mottle(d, 12.0);
  g += 3.0 * mottle(d, 24.0);
  g += 6.5 * mottle(d, 48.0);
  g += 6.0 * mottle(d, 110.0);
  vec3 col = uPaper * (1.0 + g / 160.0);

  // Fibres: fine stretched strands lying every way, darker and paler, too thin to read as blotches.
  float fibre = 0.0;
  for (int i = 0; i < 4; i++) {
    float a = float(i) * 0.81 + 0.4;
    vec3 u = normalize(vec3(cos(a), 0.31 * sin(a * 2.3), sin(a)));
    vec3 v = normalize(cross(u, vec3(0.2, 0.9, 0.3)));
    vec3 w = cross(u, v);
    // Long along u, a pixel or two across.
    vec3 q = (u * dot(d, u) / 26.0 + v * dot(d, v) / 1.5 + w * dot(d, w) / 1.5) / uPxToRad + float(i) * 19.0;
    float gate = smoothstep(0.46, 0.62, vnoise(d / (34.0 * uPxToRad) + float(i) * 7.0 + 150.0));
    fibre += (smoothstep(0.66, 0.86, vnoise(q)) - 0.5 * smoothstep(0.7, 0.88, vnoise(q + 31.0))) * gate;
  }
  col *= 1.0 - 0.026 * fibre;

  float stain = smoothstep(0.05, 0.35, mottle(d, 130.0) + 0.5 * mottle(d, 55.0));
  col *= mix(vec3(1.0), vec3(0.975, 0.955, 0.925), stain);

  float sp = vnoise(d / (8.0 * uPxToRad) + 40.0);
  float region = smoothstep(0.40, 0.60, vnoise(d / (40.0 * uPxToRad) + 70.0));
  float depth = 0.25 + 0.75 * vnoise(d / (23.0 * uPxToRad) + 90.0);
  col *= 1.0 - 0.1 * depth * smoothstep(0.92, 0.98, sp) * region;

  if (uHasCloud > 0.5) {
    vec2 c = texture(tCloud, octUv(d)).rg;
    col *= mix(vec3(1.0), vec3(0.94, 0.71, 0.70), c.r);
    col *= mix(vec3(1.0), vec3(0.99, 0.97, 0.98), c.g);
  }

  outColor = vec4(col, 1.0);
  gNormal = vec4(0.5, 0.5, 0.5, 0.0);
}
`,O=`
out vec3 vWorldPos;
out vec2 vUv;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,k=`
in vec3 vWorldPos;
in vec2 vUv;
layout(location = 0) out vec4 outColor;
${S}
uniform highp sampler2D tDepth;
uniform vec2  uRes;
uniform float uNear, uFar;
uniform float uTime;
uniform float uSoftZ;
uniform float uMistFreq;
uniform float uAlphaMax;
uniform float uRise;
uniform vec3  uMistCol;
uniform vec3  uMistThin;
uniform float uBank;
float linZ(float d) {
  float n = d * 2.0 - 1.0;
  return 2.0 * uNear * uFar / (uFar + uNear - n * (uFar - uNear));
}
// Round lobes split by tight creases: cauliflower vapour, not streaks.
float billow(vec3 p) {
  float a = abs(2.0 * vnoise(p) - 1.0);
  float b = abs(2.0 * vnoise(p * 2.07 + 11.3) - 1.0);
  float c = abs(2.0 * vnoise(p * 4.13 + 5.1) - 1.0);
  return a * 0.55 + b * 0.3 + c * 0.15;
}
// A bank: one wide translucent sheet, heaviest low down, with its top dragged up into wisps. No
// lobes and no core, so it fuses with what it covers instead of sitting in front of it as puffs.
float bankAlpha(vec2 p, vec3 w, vec3 d) {
  vec3 q = w * vec3(0.36, 0.2, 0.36) + d;
  float roll = fbm3(q) - 0.5;
  float roll2 = fbm3(w * vec3(0.9, 0.34, 0.9) + d * 1.6 + 19.0) - 0.5;
  // Wisps are tall and thin, as vapour rising: stretched hard up the plane.
  float wisp = fbm3(w * vec3(1.3, 0.3, 1.3) + d * 2.0 + 41.0) - 0.5;
  float wispFine = fbm3(w * vec3(4.0, 0.7, 4.0) + d * 3.0 + 71.0) - 0.5;
  float y = p.y * 0.5 + 0.5;
  // The top of the sheet wanders, so the bank is high in some places and low in others.
  float top = 0.82 + roll * 0.9 + roll2 * 0.22;
  float h = (top - y) / max(top, 0.05);
  float body = smoothstep(-0.02, 0.5, h + wisp * mix(0.6, 0.2, smoothstep(0.0, 0.6, h)) + wispFine * 0.1);
  body *= 0.76 + roll2 * 0.5 + wisp * 0.22;
  // Sides fade over a long way. Nothing reaches the rim of the plane.
  float side = 1.0 - smoothstep(0.42, 0.98, abs(p.x) + roll * 0.3);
  float foot = smoothstep(0.0, 0.14, y) * (1.0 - smoothstep(0.78, 1.0, y));
  return clamp(body, 0.0, 1.0) * side * foot;
}
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  vec3 w = vWorldPos * uMistFreq;
  vec3 d = vec3(uTime * 0.02, -uTime * uRise, uTime * 0.01);
  if (uBank > 0.5) {
    float ab = bankAlpha(p, w, d);
    float zSb = linZ(texture(tDepth, gl_FragCoord.xy / uRes).r);
    float zFb = linZ(gl_FragCoord.z);
    ab *= smoothstep(0.0, uSoftZ, zSb - zFb);
    // A bank is for the distance. Across the near scene it would only wash out his ink and every line.
    ab *= smoothstep(10.0, 40.0, zFb);
    outColor = vec4(mix(uMistThin, uMistCol, smoothstep(0.1, 0.7, ab)), ab * uAlphaMax);
    return;
  }
  // The body is warped hard, so its outline never reads as an ellipse.
  vec3 wq = w * vec3(0.3, 0.34, 0.3) + d;
  vec2 wob = vec2(fbm3(wq), fbm3(wq + 37.0)) - 0.5;
  vec2 q = p + wob * vec2(1.3, 1.1);
  // Heavy low down, thinning as it rises. The mass sits under the centre of the plane.
  float r = length(q * vec2(0.92, 0.8) + vec2(0.0, 0.34));
  float body = 1.0 - smoothstep(0.0, 0.95, r);
  float lobes = billow(w * vec3(0.44, 0.5, 0.44) + wob.xyx * 1.6 + d);
  float rise = 1.0 - smoothstep(-0.25, 0.75, q.y + (lobes - 0.4) * 0.5);
  float density = body * (0.6 + lobes * 1.0) * mix(0.34, 1.0, rise * rise);
  // Core: dense enough that what lies behind is gone, not ghosted. Tail: long and thin.
  float a = smoothstep(0.0, 0.66, density);
  a = a * mix(a, 1.0, 0.55);
  // A guarantee: nothing reaches the plane's rim, whatever the noise did.
  float rim = max(abs(p.x), abs(p.y));
  a *= 1.0 - smoothstep(0.66, 0.98, rim);
  float zS = linZ(texture(tDepth, gl_FragCoord.xy / uRes).r);
  float zF = linZ(gl_FragCoord.z);
  a *= smoothstep(0.0, uSoftZ, zS - zF);
  outColor = vec4(mix(uMistThin, uMistCol, smoothstep(0.15, 0.8, a)), a * uAlphaMax);
}
`,A=`
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform highp sampler2D tDepthRaw;
void main() {
  outColor = vec4(texture(tDepthRaw, vUv).r, 0.0, 0.0, 1.0);
}
`,j=`
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform highp sampler2D tDepth;
uniform vec2  uRes;
uniform float uPxScale;
uniform float uNear, uFar;
uniform float uKeyRadius;
const vec2 DIRS[8] = vec2[8](
  vec2(1.0, 0.0), vec2(0.9239, 0.3827), vec2(0.7071, 0.7071), vec2(0.3827, 0.9239),
  vec2(0.0, 1.0), vec2(-0.3827, 0.9239), vec2(-0.7071, 0.7071), vec2(-0.9239, 0.3827)
);
float linZ(float d) {
  float n = d * 2.0 - 1.0;
  return 2.0 * uNear * uFar / (uFar + uNear - n * (uFar - uNear));
}
void main() {
  vec2 r = uKeyRadius * uPxScale / uRes;
  float z = linZ(texture(tDepth, vUv).r);
  for (int i = 0; i < 8; i++) {
    z = min(z, linZ(texture(tDepth, vUv + DIRS[i] * r).r));
    z = min(z, linZ(texture(tDepth, vUv - DIRS[i] * r).r));
  }
  outColor = vec4(z, 0.0, 0.0, 1.0);
}
`,M=`
precision highp float;
in vec2 vUv;
out vec4 outColor;
${S}
uniform highp sampler2D tDepth;
uniform highp sampler2D tKey;
uniform highp sampler2D tNormal;
uniform vec2  uRes;
uniform float uPxScale;
uniform float uNear, uFar;
uniform mat4  uInvViewProj;
uniform vec3  uCamPos;
uniform vec3  uCamFwd;
uniform vec3  uSunDir;
uniform float uPxToRad;
uniform float uLineW, uLineRefZ, uLineWPow, uLineWMax, uWidthVar, uBlobAmp;
uniform float uGapLo, uGapHi, uGapPx, uUpLo, uUpHi, uLowerKeep;
uniform float uZLo, uZHi, uNLo, uNHi, uCreaseK, uConvexKeep;
uniform float uFadeNear, uFadeFar, uMidDark, uDryLine;
uniform float uLoadBase, uLoadLit, uLoadFloor;
uniform float uOccRadius, uOccCap;
uniform float uSmallPx, uSmallGap, uSmallLoad;
uniform vec4  uWobLattice;
uniform vec4  uWobAmp;

float linZ(float d) {
  float n = d * 2.0 - 1.0;
  return 2.0 * uNear * uFar / (uFar + uNear - n * (uFar - uNear));
}
vec3 rayDir(vec2 uv) {
  vec4 h = uInvViewProj * vec4(uv * 2.0 - 1.0, 1.0, 1.0);
  return normalize(h.xyz / h.w - uCamPos);
}

${w}
#define N INK_N
#define DIRS INK_DIRS

void main() {
  vec2 px = 1.0 / uRes;
  vec3 ray = rayDir(vUv);

  // The key: nearest surface within a few pixels, as a world position.
  vec4 key = inkKey(vUv, ray);
  vec3 Pk = key.xyz;
  float zKey = key.w;
  float mK = zKey * uPxToRad;
  float mB = inkLockMpp(zKey, uPxToRad);
  #define FIELD(l, s) pxNoise(Pk, vec3(1.0), (l) * INK_LOCK_K, mB, s)

  // Static wobble, never animated.
  vec2 uv = vUv + inkWobble(Pk, mK, zKey) * uPxScale * px;

  float zC = linZ(texture(tDepth, uv).r);
  float iC = 1.0 / zC;

  // Cavity: is this pixel lower than the surface on both sides of it, at two sizes? A pixel
  // beside a far-off foreground object sees it on one side only, and the cap keeps that low.
  float cap = uOccCap * iC;
  float cavity = 0.0;
  float valley = 0.0;
  float rO = uOccRadius * uPxScale * pow(uLineRefZ / max(zC, 0.1), 0.5);
  for (int i = 0; i < N; i++) {
    vec2 o = DIRS[i] * rO * px * (i % 2 == 0 ? 1.0 : 0.55);
    float ia = 1.0 / linZ(texture(tDepth, uv + o).r);
    float ib = 1.0 / linZ(texture(tDepth, uv - o).r);
    cavity += clamp(ia - iC, -cap, cap) + clamp(ib - iC, -cap, cap);
    // A real crevice has surface nearer than this pixel on both sides along some axis.
    valley += clamp(min(ia, ib) - iC, 0.0, cap);
  }
  cavity = clamp(cavity / (float(N) * 2.0 * cap), 0.0, 1.0);
  valley = clamp(valley / (float(N) * cap), 0.0, 1.0);

  // Pressure along the stroke. Long stretches sit below the threshold, so the brush lifts off and
  // the line tapers to nothing. The short octave means even a small pebble gets a break in it.
  float pField = 0.78 * FIELD(uGapPx, 61.0) + 0.22 * FIELD(uGapPx * 0.3, 67.0);
  float crevice = smoothstep(0.2, 0.55, valley);

  // How small is the thing this line belongs to? Look out in eight directions from the pixel: on a
  // big form about half of them stay on the surface, on a pebble nearly all of them run off it.
  float offForm = 0.0;
  vec2 rS = uSmallPx * uPxScale * px;
  for (int i = 0; i < N; i++) {
    offForm += step(zKey * 1.02 + 0.05, linZ(texture(tDepth, vUv + DIRS[i] * rS).r));
    offForm += step(zKey * 1.02 + 0.05, linZ(texture(tDepth, vUv - DIRS[i] * rS).r));
  }
  float small = smoothstep(0.56, 0.86, offForm / float(2 * N));

  // Small stones lift the brush more often, so a good part of their contour is simply not drawn.
  float gapShift = uSmallGap * small;
  float pressure = smoothstep(uGapLo + gapShift, uGapHi + gapShift, pField);
  pressure = max(pressure, crevice * 0.9);

  // Width, in reference px: thin by default, swells a little with pressure and in a crevice.
  float wN = smoothstep(0.2, 0.8, FIELD(52.0, 41.0));
  float blob = smoothstep(0.7, 0.88, FIELD(31.0, 53.0));
  float W = uLineW * pow(uLineRefZ / max(zC, 0.1), uLineWPow);
  W = min(W, uLineWMax);
  W *= 1.0 + uWidthVar * (2.0 * wN - 1.0);
  W *= 1.0 + uBlobAmp * blob * pressure;
  W *= 1.0 + 1.1 * crevice;
  W *= mix(0.35, 1.0, pressure);
  // Under a pixel and a half the ring cannot draw a whole line: it catches the stair steps of the edge and leaves dots.
  // So the ring stops shrinking there, and a thinner stroke gets paler instead. The composite's threshold turns that into a taper.
  float Rw = W * 0.5 * uPxScale;
  float R = max(Rw, 1.5);
  float thin = smoothstep(0.1, 0.7, Rw / 1.5);

  float lap = 0.0;
  float crease = 0.0;
  float zNear = zC;
  vec4 nearN = texture(tNormal, uv);
  for (int i = 0; i < N; i++) {
    vec2 o = DIRS[i] * R * px;
    float za = linZ(texture(tDepth, uv + o).r);
    float zb = linZ(texture(tDepth, uv - o).r);
    vec4 na = texture(tNormal, uv + o);
    vec4 nb = texture(tNormal, uv - o);
    float ia = 1.0 / za, ib = 1.0 / zb;
    float l = 0.5 * (ia + ib) - iC;
    lap = max(lap, abs(2.0 * l) * min(zC, min(za, zb)));
    // A valley always takes the line. A ridge takes less of it, as the wash already marks it.
    float c = (1.0 - dot(na.xyz * 2.0 - 1.0, nb.xyz * 2.0 - 1.0)) * min(na.a, nb.a) / max(max(na.a, nb.a), 1e-3);
    c *= l > 0.0 ? 1.0 : uConvexKeep;
    crease = max(crease, c);
    if (za < zNear) { zNear = za; nearN = na; }
    if (zb < zNear) { zNear = zb; nearN = nb; }
  }

  float edge = smoothstep(uZLo, uZHi, lap);
  edge = max(edge, uCreaseK * smoothstep(uNLo, uNHi, crease));

  // Tops are inked, bases are left to the wash.
  vec3 nW = nearN.xyz * 2.0 - 1.0;
  float strength = mix(uLowerKeep, 1.0, smoothstep(uUpLo, uUpHi, nW.y));

  // The brush lifts off, and at low pressure it goes dry and skips.
  edge *= smoothstep(0.0, 0.12, pressure) * thin;
  edge *= mix(1.0, smoothstep(0.3, 0.55, pxNoise(Pk, vec3(1.0), 24.0, mK, 83.0)), (1.0 - smoothstep(0.3, 0.8, pressure)) * uDryLine);

  // Line weight comes from the nearer surface. Mountains and sky have 0.
  strength *= nearN.a;

  // Ink load. Lines on lit sides run dark grey, and full black is kept for the crevices.
  float lit = smoothstep(0.1, 0.7, dot(nW, uSunDir));
  float load = mix(uLoadBase, uLoadLit, lit) * mix(0.72, 1.0, FIELD(90.0, 71.0));
  load *= mix(1.0, uSmallLoad, small);
  load = max(load * mix(uLoadFloor, 1.0, pressure), crevice * mix(1.0, uSmallLoad, small));

  // Distance: thin first, then pale, then gone.
  float dist = smoothstep(uFadeNear, uFadeFar, zNear);
  float fade = 1.0 - smoothstep(uFadeFar, uFadeFar * 2.5, zNear);
  strength *= mix(1.0, uMidDark, dist) * fade;

  // Pools belong to inked surfaces only, and fade as lines do.
  float weight = texture(tNormal, uv).a;
  cavity = max(valley, cavity * 0.62) * smoothstep(0.02, 0.2, weight) * mix(1.0, uMidDark, dist) * fade;

  // A is where the stroke is, R what it weighs: kept apart so that thresholding the shape does not also take the light lines away.
  outColor = vec4(edge * strength, cavity, load, edge);
}
`,N=`
precision highp float;
in vec2 vUv;
out vec4 outColor;
${S}
uniform sampler2D tColor;
uniform sampler2D tLine;
uniform highp sampler2D tDepth;
uniform highp sampler2D tKey;
uniform vec2  uRes;
uniform float uPxScale;
uniform float uPxToRad;
uniform float uNear, uFar;
uniform mat4  uInvViewProj;
uniform vec3  uCamPos;
uniform vec3  uCamFwd;
uniform vec3  uInk;
uniform vec3  uPoolInk;
uniform float uLineSoft, uLineLo, uLineHi, uSS;
uniform float uOccLo, uOccHi, uOccAmt, uOccSoft;
uniform float uBleedPx;
uniform float uFogZ, uFogMax, uHorizonEl;
uniform vec3 uMistTint;
uniform float uInkBold;
uniform vec4  uWobLattice;
uniform vec4  uWobAmp;

float linZ(float d) {
  float n = d * 2.0 - 1.0;
  return 2.0 * uNear * uFar / (uFar + uNear - n * (uFar - uNear));
}
${w}
vec3 fogColour(float elBelowDeg) {
  vec3 c = vec3(202.0, 193.0, 174.0) / 255.0;
  c = mix(c, vec3(200.0, 198.0, 192.0) / 255.0, smoothstep(0.0, 3.0, elBelowDeg));
  c = mix(c, vec3(201.0, 202.0, 200.0) / 255.0, smoothstep(3.0, 8.0, elBelowDeg));
  c = mix(c, vec3(188.0, 192.0, 191.0) / 255.0, smoothstep(11.0, 16.0, elBelowDeg));
  c = mix(c, vec3(181.0, 186.0, 185.0) / 255.0, smoothstep(16.0, 22.0, elBelowDeg));
  c = mix(c, vec3(179.0, 190.0, 195.0) / 255.0, smoothstep(22.0, 28.0, elBelowDeg));
  return c;
}
void main() {
  vec4 h = uInvViewProj * vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
  vec3 ray = normalize(h.xyz / h.w - uCamPos);

  // Key the small fields on the nearest surface, as the edge pass does, so they travel with stone.
  vec4 key = inkKey(vUv, ray);
  vec3 Pk = key.xyz;
  float mK = key.w * uPxToRad;

  // Blur then threshold: the blur rounds the stair steps of the mask off, and the threshold brings the edge back about a pixel wide.
  vec2 s = max(uLineSoft * uSS, 1.0) / uRes;
  vec4 c0 = texture(tLine, vUv);
  vec4 m = c0 * 0.28;
  m += texture(tLine, vUv + vec2(s.x, 0.0)) * 0.14;
  m += texture(tLine, vUv - vec2(s.x, 0.0)) * 0.14;
  m += texture(tLine, vUv + vec2(0.0, s.y)) * 0.14;
  m += texture(tLine, vUv - vec2(0.0, s.y)) * 0.14;
  m += texture(tLine, vUv + vec2(s.x, s.y) * 0.7) * 0.04;
  m += texture(tLine, vUv - vec2(s.x, s.y) * 0.7) * 0.04;
  m += texture(tLine, vUv + vec2(s.x, -s.y) * 0.7) * 0.04;
  m += texture(tLine, vUv - vec2(s.x, -s.y) * 0.7) * 0.04;
  float weigh = clamp(m.r / max(m.a, 0.02), 0.0, 1.0);
  // A lighter line is a thinner one, and only the last of it goes pale.
  float a = smoothstep(uLineLo, uLineHi, m.a - (1.0 - weigh) * 0.15) * smoothstep(0.02, 0.35, weigh);
  // A stroke runs on. A speck with nothing a few pixels either side of it is the edge test catching a stair step, not a line.
  if (a > 0.0) {
    float reach = 0.0;
    vec2 r = 2.8 * uSS / uRes;
    for (int i = 0; i < 8; i++) {
      reach += texture(tLine, vUv + INK_DIRS[i] * r).a + texture(tLine, vUv - INK_DIRS[i] * r).a;
    }
    a *= smoothstep(0.03, 0.12, reach / 16.0);
  }

  // Colour goes through the same wobble as the lines, so a tone edge and its line stay together.
  vec3 col = texture(tColor, vUv + inkWobble(Pk, mK, key.w) * uPxScale / uRes).rgb;

  // Ink pools in the gaps, thresholded so it has an edge, and it bleeds a little downward.
  vec2 up = vec2(0.0, uBleedPx * uPxScale / uRes.y);
  float cav = max(c0.g, 0.8 * texture(tLine, vUv + up).g);
  // A crevice does not hold the same ink all round a stone: deep in one place, nearly dry in the next,
  // or every stone sits in the same black ring.
  cav *= mix(0.42, 1.0, smoothstep(0.34, 0.62, pxNoise(Pk, vec3(1.0), 58.0 * INK_LOCK_K, inkLockMpp(key.w, uPxToRad), 141.0)));
  float tear = (pxNoise(Pk, vec3(1.0), 9.0, mK, 131.0) - 0.5) * 0.3 + (pxNoise(Pk, vec3(1.0), 3.0, mK, 137.0) - 0.5) * 0.18;
  // A soft stain gathers round the crevice first, then a hard core of ink sits inside it.
  col *= 1.0 - uOccSoft * smoothstep(0.02, uOccLo + 0.1, cav);
  float pool = smoothstep(uOccLo, uOccHi, cav + tear * step(0.01, cav));
  col = mix(col, uPoolInk, pool * uOccAmt);

  col = mix(col, uInk, clamp(a * m.b, 0.0, 1.0));

  float d = texture(tDepth, vUv).r;
  if (d < 1.0) {
    float el = (uHorizonEl - asin(clamp(ray.y, -1.0, 1.0))) * 57.2958;
    float f = uFogMax * (1.0 - exp(-max(linZ(d) - 22.0 * uInkBold, 0.0) / (uFogZ * (1.0 + 0.3 * uInkBold))));
    col = mix(col, fogColour(max(el, 0.0)) * uMistTint, f);
  }
  outColor = vec4(col, 1.0);
}
`,P=`
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D tColor;
uniform vec2  uRes;
uniform float uSS;
uniform float uFilterPx;
uniform float uShoulder;
uniform float uCeiling;
uniform vec3  uVigK;
uniform float uVigP;
uniform vec3  uBurnK;
uniform float uBurnP;

// Takes the supersampled frame down to the canvas. A tent about a pixel and a half wide, so a line neither crawls nor goes soft.
vec3 softBlur(vec2 uv) {
  vec2 s = uFilterPx * uSS / uRes;
  float w0 = 0.40, w1 = 0.15;
  vec3 c = texture(tColor, uv).rgb * w0;
  c += texture(tColor, uv + vec2( s.x, 0.0)).rgb * w1;
  c += texture(tColor, uv + vec2(-s.x, 0.0)).rgb * w1;
  c += texture(tColor, uv + vec2(0.0,  s.y)).rgb * w1;
  c += texture(tColor, uv + vec2(0.0, -s.y)).rgb * w1;
  return c;
}
vec3 shoulder(vec3 c) {
  vec3 over = max(c - uShoulder, 0.0);
  float span = uCeiling - uShoulder;
  return min(c, vec3(uShoulder)) + span * (1.0 - exp(-over / span));
}
float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}
void main() {
  vec3 c = shoulder(softBlur(vUv));
  vec2 q = vec2(vUv.x * 2.0 - 1.0, vUv.y * 2.0 - 1.0);
  float V = pow(clamp(length(q) / 1.41421, 0.0, 1.0), uVigP);
  c *= 1.0 - uVigK * V;
  // Corners burn in beyond the fit, on stone as well as sky.
  c *= 1.0 - uBurnK * pow(clamp(length(q) / 1.41421, 0.0, 1.0), uBurnP);
  c += (ign(gl_FragCoord.xy) - 0.5) / 255.0;
  outColor = vec4(c, 1.0);
}
`;function F(e){let t=new d(e);return new f(t.r,t.g,t.b)}function I(){let e=new Uint8Array(262144),t=49734321;for(let n=0;n<e.length;n++)t^=t<<13,t>>>=0,t^=t>>>17,t^=t<<5,t>>>=0,e[n]=t&255;let r=new g(e,64,64,64);return r.format=n,r.type=p,r.minFilter=i,r.magFilter=i,r.wrapS=r.wrapT=r.wrapR=s,r.unpackAlignment=1,r.colorSpace=``,r.needsUpdate=!0,r}function L(){let e=new v(new Float32Array([1,0,0,1]),1,1,t,_);return e.needsUpdate=!0,e}var R={tInkNoise:{value:I()},uSunDir:{value:new f(.3,.8,.5).normalize()},uShadowMul:{value:new f(...x.shadow.mul)},tDepth:{value:L()},uRes:{value:new u(1280,704)},uPxScale:{value:1},uPxToRad:{value:Math.tan(20*Math.PI/180)/352},uNear:{value:.1},uFar:{value:4e3},uMistTint:{value:new f(1,1,1)},uInkBold:{value:1},uGapLo:{value:x.line.gapLo},uGapHi:{value:x.line.gapHi},uDryLine:{value:x.line.dryLine},uFoot:{value:new h(0,0,0,0)}};l.dithering_pars_fragment.includes(`inkGBuffer`)||(l.dithering_pars_fragment+=`
layout(location = 1) out vec4 inkGBuffer;
`,l.dithering_fragment+=`
inkGBuffer = vec4(0.5, 0.5, 0.5, 0.0);
`);var z={useRamp:!0,lineWeight:1,look:!1,vertexPaint:void 0,flat:!1,wrap:x.surface.wrap,skyFill:x.surface.skyFill,washFreq:x.surface.washFreq,washWarp:x.surface.washWarp,cavityK:x.surface.cavityK,dryAmt:x.surface.dryAmt,dryFreq:x.surface.dryFreq,dryCol:x.surface.dryCol,grainAmp:x.surface.grainAmp,grainFreq:x.surface.grainFreq,blotchAmp:x.surface.blotchAmp,blotchFreq:x.surface.blotchFreq,streakAmp:x.surface.streakAmp,rampBias:.02,rampScale:1.06,poolAmt:1,step:x.surface.step,brushEdge:x.surface.brushEdge,hueAmt:x.surface.hueAmt,facetAmt:x.surface.facetAmt,facetFreq:x.surface.facetFreq,facetStretch:x.surface.facetStretch,crackAmt:x.surface.crackAmt,crackW:x.surface.crackW,crackGate:x.surface.crackGate,facetBevel:x.surface.facetBevel,brushAmt:x.surface.brushAmt,brushLean:x.surface.brushLean,pitAmt:x.surface.pitAmt,scumble:x.surface.scumble,stainAmt:x.surface.stainAmt,stainFreq:x.surface.stainFreq,speckAmt:x.surface.speckAmt,gouge:x.surface.gouge,litClean:x.surface.litClean,zones:x.surface.zones,zoneA:x.surface.zoneA,zoneB:x.surface.zoneB,zoneWander:x.surface.zoneWander,zoneSoft:x.surface.zoneSoft,zoneVals:x.surface.zoneVals,dryDirect:0,bold:1,inkShape:1,poolTear:1,coolDark:x.surface.coolDark,groundSqueeze:1,groundHeading:0,tint:[1,1,1],shadeTint:[.43,.44,.47],poolCol:x.surface.poolCol,poolDeep:x.surface.poolDeep};function B(t,n){let r=n*Math.PI/180,i=Math.cos(r),a=Math.sin(r);return new e().set(i,0,-a,0,1,0,-a*t,0,-i*t)}var V=[`color`,`map`,`alphaMap`,`alphaTest`,`side`,`normalMap`,`normalScale`,`flatShading`,`vertexColors`,`alphaToCoverage`];function H(e={}){let t=typeof e.preset==`string`?b[e.preset]:null;if(e.preset&&!t)throw Error(`[ink] unknown preset "${e.preset}"`);let n={...z,...t,...e},r={};for(let e of V)n[e]!==void 0&&(r[e]=n[e]);let i=new y(r);n.map&&(n.map.anisotropy=Math.max(n.map.anisotropy,16)),i.name=n.name??`ink_${n.preset??`custom`}`;let a=(n.vertexPaint??n.useRamp)&&!n.vertexColors,o=n.snow!==void 0;i.defines={...i.defines,...a?{INK_VERTEX_PAINT:1}:{},...o?{INK_SNOW:1}:{}};let s={uWrap:{value:n.wrap},uSkyFill:{value:n.skyFill},uWashFreq:{value:n.washFreq},uWashWarp:{value:n.washWarp},uCavityK:{value:n.cavityK},uDryAmt:{value:n.dryAmt},uDryFreq:{value:n.dryFreq},uGrainAmp:{value:n.grainAmp},uGrainFreq:{value:n.grainFreq},uBlotchAmp:{value:n.blotchAmp},uBlotchFreq:{value:n.blotchFreq},uStreakAmp:{value:n.streakAmp},uUseRamp:{value:+!!n.useRamp},uLookMap:{value:+!!n.look},uFlat:{value:+!!n.flat},uRampBias:{value:n.rampBias},uRampScale:{value:n.rampScale},uPoolAmt:{value:n.poolAmt},uStep:{value:n.step},uBrushEdge:{value:n.brushEdge},uHueAmt:{value:n.hueAmt},uFacetAmt:{value:n.useRamp?n.facetAmt:0},uFacetFreq:{value:n.facetFreq},uFacetStretch:{value:n.facetStretch},uCrackAmt:{value:n.useRamp?n.crackAmt:0},uCrackW:{value:n.crackW},uCrackGate:{value:n.crackGate},uFacetBevel:{value:n.facetBevel},uBrushAmt:{value:n.useRamp?n.brushAmt:0},uBrushLean:{value:n.brushLean},uPitAmt:{value:n.pitAmt},uScumble:{value:n.scumble},uStainAmt:{value:n.useRamp?n.stainAmt:0},uStainFreq:{value:n.stainFreq},uSpeckAmt:{value:n.speckAmt},uGouge:{value:n.useRamp?n.gouge:0},uLitClean:{value:n.litClean},uZones:{value:n.useRamp?n.zones:0},uZoneA:{value:n.zoneA},uZoneB:{value:n.zoneB},uZoneWander:{value:n.zoneWander},uZoneSoft:{value:n.zoneSoft},uZoneVals:{value:new f(...n.zoneVals)},uDryDirect:{value:n.dryDirect},uPoolTear:{value:n.poolTear},uCoolDark:{value:n.coolDark},uPxScale:R.uPxScale,uPxToRad:R.uPxToRad,uInkBold:R.uInkBold,uBoldMat:{value:n.bold},uInkShape:{value:n.useRamp?n.inkShape:0},uSnowCover:{value:n.snow??0},uFoot:R.uFoot,uNoiseFrame:{value:B(n.groundSqueeze,n.groundHeading)},uTint:{value:new f(...n.tint)},uShadeTint:{value:new f(...n.shadeTint)},uDryCol:{value:F(n.dryCol)},uPoolCol:{value:F(n.poolCol)},uPoolDeep:{value:F(n.poolDeep)},uInkLine:{value:F(x.line.ink)},uLineWeight:{value:n.lineWeight},uSunDir:R.uSunDir,uShadowMul:R.uShadowMul,tInkNoise:R.tInkNoise};return i.userData.ink=s,i.userData.inkOptions=n,i.onBeforeCompile=e=>{Object.assign(e.uniforms,s),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vInkWorldPos;
#ifdef INK_VERTEX_PAINT
attribute vec4 color;
varying vec4 vInkPaint;
#endif`).replace(`#include <project_vertex>`,`#include <project_vertex>
{
  vec4 inkWorld = vec4(transformed, 1.0);
  #ifdef USE_BATCHING
    inkWorld = batchingMatrix * inkWorld;
  #endif
  #ifdef USE_INSTANCING
    inkWorld = instanceMatrix * inkWorld;
  #endif
  inkWorld = modelMatrix * inkWorld;
  vInkWorldPos = inkWorld.xyz;
  #ifdef INK_VERTEX_PAINT
    vInkPaint = color;
  #endif
}`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
${S}
${C}
varying vec3 vInkWorldPos;
#ifdef INK_VERTEX_PAINT
varying vec4 vInkPaint;
#endif`).replace(`#include <shadowmap_pars_fragment>`,`#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>`).replace(`#include <dithering_fragment>`,`{
  #ifdef INK_VERTEX_PAINT
    vec4 inkPaint = vInkPaint;
  #else
    vec4 inkPaint = vec4(1.0, 0.0, 0.0, 1.0);
  #endif
  vec3 inkN = normalize(inverseTransformDirection(normal, viewMatrix));
  // The wash already shades faces turned from the sun. Only cast shadows are multiplied on, or
  // every stone gets a hard terminator cut across it wherever the shadow map fails to reach.
  #if defined( INK_SNOW ) && defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
    // On snow a shadow has a wide soft edge: six times the radius, which the pipeline's supersampling smooths.
    float inkShadow = receiveShadow ? getShadow( directionalShadowMap[ 0 ], directionalLightShadows[ 0 ].shadowMapSize, directionalLightShadows[ 0 ].shadowIntensity, directionalLightShadows[ 0 ].shadowBias, directionalLightShadows[ 0 ].shadowRadius * 6.0, vDirectionalShadowCoord[ 0 ] ) : 1.0;
  #else
    float inkShadow = getShadowMask();
  #endif
  #if NUM_DIR_LIGHTS > 0
    inkShadow = mix(1.0, inkShadow, smoothstep(0.02, 0.22, dot(normal, directionalLights[0].direction)));
  #endif
  gl_FragColor.rgb = inkSurface(vInkWorldPos, inkN, diffuseColor.rgb, inkPaint, inkShadow);
  inkGBuffer = vec4(inkN * 0.5 + 0.5, uLineWeight * inkPaint.a);
}`)},i.customProgramCacheKey=()=>`ink3:${+!!a}:${+!!o}`,i}function U(e,t={preset:`rock`},{castShadow:n=!0,receiveShadow:r=!0}={}){let i=new Map,a=(e,n)=>{let r=typeof t==`function`?t(e,n):t;if(!r)return n;let a=!!e.geometry?.attributes?.color,o=`${n.uuid}:${JSON.stringify(r)}:${a}`;if(i.has(o))return i.get(o);let s=H({name:n.name,color:n.color?.clone(),map:n.map??void 0,alphaMap:n.alphaMap??void 0,alphaTest:n.alphaTest||void 0,side:n.side,vertexPaint:a&&(r.useRamp??b[r.preset]?.useRamp??!0),...r});return i.set(o,s),s};return e.traverse(e=>{if(!e.isMesh)return;let t=e.geometry?.attributes?.color;if(t?.itemSize===4&&!e.geometry.userData.inkAlphaChecked){e.geometry.userData.inkAlphaChecked=!0;let n=!1;for(let e=0;e<t.count&&!n;e++)n=t.getW(e)>0;if(!n){for(let e=0;e<t.count;e++)t.setW(e,1);t.needsUpdate=!0}}e.material=Array.isArray(e.material)?e.material.map(t=>a(e,t)):a(e,e.material),e.castShadow=n,e.receiveShadow=r}),e}function W(e){let t=new f,n=new f,r=new f,i=new f;return e.traverse(e=>{let a=e.geometry;if(!e.isMesh||!a?.attributes.position||a.userData.inkSmoothed)return;a.userData.inkSmoothed=!0;let o=a.attributes.position,s=a.index,c=s?s.count/3:o.count/3,l=new Float32Array(c*3),u=new Map,d=e=>`${Math.round(o.getX(e)*50)},${Math.round(o.getY(e)*50)},${Math.round(o.getZ(e)*50)}`,p=new Int32Array(o.count).fill(-1);for(let e=0;e<c;e++){let a=s?s.getX(e*3):e*3,c=s?s.getX(e*3+1):e*3+1,f=s?s.getX(e*3+2):e*3+2;t.fromBufferAttribute(o,a),n.fromBufferAttribute(o,c),r.fromBufferAttribute(o,f),i.subVectors(n,t).cross(r.sub(t)),l.set([i.x,i.y,i.z],e*3);for(let t of[a,c,f]){let n=d(t);u.has(n)||u.set(n,[]),u.get(n).push(e),p[t]=e}}let h=new Float32Array(o.count*3),g=new f,_=new f;for(let e=0;e<o.count;e++)if(!(p[e]<0)){_.fromArray(l,p[e]*3).normalize(),i.set(0,0,0);for(let t of u.get(d(e)))g.fromArray(l,t*3),g.dot(_)>.5*g.length()&&i.add(g);i.normalize().toArray(h,e*3)}a.setAttribute(`normal`,new m(h,3))}),e}function G({cloudMap:e=null}={}){let t=new c({glslVersion:o,uniforms:{tInkNoise:R.tInkNoise,uPxToRad:R.uPxToRad,uPaper:{value:new f(...x.paperBase).multiplyScalar(1/255)},tCloud:{value:e},uHasCloud:{value:+!!e}},vertexShader:E,fragmentShader:D,side:1,depthWrite:!1});t.name=`ink_sky`;let n=new r(new a(10,3),t);return n.name=`ink_sky_dome`,n.frustumCulled=!1,n.renderOrder=1e6,n.userData.inkSky=!0,n}function K({color:e=x.mist.color,thin:t=x.mist.thin,alphaMax:n=x.mist.alphaMax,softZ:r=x.mist.softZ,freq:i=1,rise:a=x.mist.rise,bank:s=!1}={}){let l=new c({glslVersion:o,uniforms:{tInkNoise:R.tInkNoise,tDepth:R.tDepth,uRes:R.uRes,uNear:R.uNear,uFar:R.uFar,uTime:{value:0},uSoftZ:{value:r},uMistFreq:{value:i},uAlphaMax:{value:n},uRise:{value:a},uBank:{value:+!!s},uMistCol:{value:F(e)},uMistThin:{value:F(t)}},vertexShader:O,fragmentShader:k,transparent:!0,depthWrite:!1,side:2});return l.name=`ink_mist`,l}export{R as a,A as c,P as d,S as f,G as i,M as l,H as n,W as o,j as p,K as r,N as s,U as t,T as u};