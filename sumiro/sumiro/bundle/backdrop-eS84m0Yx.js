const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./constants-BjlLV5tN.js","./rolldown-runtime-DK3Fl9T5.js"])))=>i.map(i=>d[i]);
import{A as e,C as t,E as n,L as r,M as i,N as a,P as o,R as s,T as c,U as l,Y as u,Z as d,_ as f,ct as p,d as m,h,k as g,lt as _,t as v}from"./index-VEMJneSs.js";var y=`
precision highp float;
precision highp sampler2D;
layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 gNormal;

in vec4 vClip;

uniform sampler2D tPaper;
uniform float uFallbackVig;
uniform vec3 uBurnK;
uniform float uBurnP;
uniform vec2 uGrade;      // the grade's shoulder and ceiling
uniform vec3 uPaletteSky; // a level's tint on the whole backdrop

const float PI = 3.14159265;
const float DEG = 57.29578;

float azimuthDeg(vec3 d) { return atan(-d.x, -d.z) * DEG; }
float elevationDeg(vec3 d) { return asin(clamp(d.y, -1.0, 1.0)) * DEG; }

// Y levels at Y = 160. The tile is 2048 px and repeats three times around the horizon.
float paperLevels(vec3 d) {
  vec2 uv = vec2(atan(-d.x, -d.z), asin(clamp(d.y, -1.0, 1.0))) / (2.0 * PI / 3.0);
  return (texture(tPaper, uv).r * 255.0 - 128.0) / 4.0;
}

// Elevation below the horizon, positive downward.
// Bright mist: warm at the horizon, whitest around 8 degrees, cooler towards the camera.
vec3 mistColour(float below) {
  vec3 c = vec3(198.0, 190.0, 173.0) / 255.0;
  c = mix(c, vec3(199.0, 197.0, 187.0) / 255.0, smoothstep(0.0, 3.0, below));
  c = mix(c, vec3(200.0, 202.0, 197.0) / 255.0, smoothstep(3.0, 8.0, below));
  c = mix(c, vec3(197.0, 201.0, 198.0) / 255.0, smoothstep(11.0, 16.0, below));
  c = mix(c, vec3(189.0, 192.0, 188.0) / 255.0, smoothstep(16.0, 22.0, below));
  c = mix(c, vec3(180.0, 184.0, 180.0) / 255.0, smoothstep(22.0, 28.0, below));
  return c;
}

// The undersides of the strata, a little brighter than the valley they veil.
vec3 floorColour(float below) {
  vec3 c = vec3(186.0, 178.0, 158.0) / 255.0;
  c = mix(c, vec3(172.0, 167.0, 152.0) / 255.0, smoothstep(1.0, 5.0, below));
  c = mix(c, vec3(160.0, 158.0, 148.0) / 255.0, smoothstep(5.0, 11.0, below));
  c = mix(c, vec3(138.0, 138.0, 128.0) / 255.0, smoothstep(12.0, 22.0, below));
  return c;
}

void emit(vec3 col, float alpha) {
  col *= uPaletteSky;
  // From the clip position, not gl_FragCoord: the pipeline renders supersampled.
  float r = clamp(length(vClip.xy / vClip.w) / 1.41421, 0.0, 1.0);
  if (uFallbackVig > 0.5) {
    col *= 1.0 - vec3(0.253, 0.325, 0.400) * pow(r, 2.258);
  } else if (uBurnP > 0.0) {
    // The grade's extra corner burn is tuned on stone. Far depth follows the measured fit
    // (style.md section 8), so the backdrop undoes it for itself.
    col /= max(vec3(1.0) - uBurnK * pow(r, uBurnP), vec3(0.3));
    // The corner still lands under the measured fit (top left of f0000).
    col *= 1.0 + vec3(0.09, 0.115, 0.14) * smoothstep(0.82, 0.97, r);
    // The grade's shoulder runs before the burn and would squash that lift to its ceiling,
    // unevenly per channel, which is what greys a corner. Stop just under the ceiling with the
    // hue intact, so the corner burns brown, then invert the shoulder.
    // Translucent layers blend after this, in the inverted range, where the small lead of green over
    // red would be blown up into a mint cast. So they stop much lower, with the hue intact.
    float lim = mix(uGrade.x + 0.02, uGrade.y - 0.005, smoothstep(0.985, 1.0, alpha));
    float top = max(col.r, max(col.g, col.b));
    if (top > lim) col *= lim / top;
    float span = uGrade.y - uGrade.x;
    vec3 over = max(col - uGrade.x, 0.0);
    col = min(col, vec3(uGrade.x)) - span * log(max(1.0 - over / span, 0.002));
  }
  outColor = vec4(col, alpha);
  gNormal = vec4(0.5, 0.5, 0.5, 0.0);
}
`;function b(e){return{tPaper:e.tPaper,uFallbackVig:e.uFallbackVig,uBurnK:e.uBurnK,uBurnP:e.uBurnP,uGrade:e.uGrade,uPaletteSky:e.uPaletteSky}}var x=`
out vec3 vDir;
out vec4 vClip;
void main() {
  vec4 clip = vec4(position.xy, 1.0, 1.0);
  vec4 view = inverse(projectionMatrix) * clip;
  vDir = transpose(mat3(viewMatrix)) * (view.xyz / view.w);
  gl_Position = vec4(position.xy, 1.0, 1.0);
  vClip = gl_Position;
}
`,S=`
${y}
in vec3 vDir;
uniform sampler2D tSky;
uniform sampler2D tFar;
uniform sampler2D tFloor;
uniform sampler2D tBank;
uniform float uBank;
uniform vec3 uPaper;
uniform float uRedFade;
uniform vec3 uWashTint;

// Wash as multiplies on the paper. Sampled core ratio about (0.93, 0.70, 0.68), deepest (0.90, 0.63, 0.61).
vec3 redWash(float x) {
  vec3 c = vec3(1.0);
  c = mix(c, vec3(0.995, 0.940, 0.900), smoothstep(0.04, 0.26, x));    // the peach bleed
  c = mix(c, vec3(0.960, 0.800, 0.760), smoothstep(0.24, 0.52, x));    // thin wash
  c = mix(c, vec3(0.930, 0.695, 0.675), smoothstep(0.50, 0.78, x));    // full wash
  c = mix(c, vec3(0.895, 0.620, 0.600), smoothstep(0.78, 1.0, x));     // pooled
  return c;
}

void main() {
  vec3 d = normalize(vDir);
  float az = azimuthDeg(d);
  float el = elevationDeg(d);

  // Paper tone. Where it darkens it goes browner, never grey.
  float g = paperLevels(d) / 160.0;
  vec3 col = uPaper * (1.0 + g * (g < 0.0 ? vec3(0.82, 1.0, 1.34) : vec3(1.0, 1.0, 1.0)));
  // Golden and deepening overhead, a clean peach-cream glow low over the horizon.
  col *= mix(vec3(1.0), vec3(1.022, 0.988, 0.948), smoothstep(3.0, 18.0, el));
  col *= mix(vec3(1.0), vec3(1.016, 1.012, 1.040), smoothstep(8.0, -0.5, el));

  // The painted front half of the sky and of the land.
  vec2 uv = vec2((95.0 - az) / 180.0, (el + 10.0) / 50.0);
  if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
    vec3 m = texture(tSky, uv).rgb;
    float edge = smoothstep(0.0, 0.04, uv.x) * (1.0 - smoothstep(0.96, 1.0, uv.x)) * (1.0 - smoothstep(0.94, 1.0, uv.y));
    float stain = (m.b * 255.0 - 128.0) / 8.0 * edge;
    col *= 1.0 + stain * vec3(0.0085, 0.0115, 0.0165);
    col *= mix(vec3(1.0), vec3(0.915, 0.810, 0.740), m.g * edge * (0.45 + 0.55 * uRedFade));
    float bank = texture(tBank, uv).r * uBank;
    float washed = max(m.r, bank);
    col *= mix(vec3(1.0), redWash(washed) * mix(vec3(1.0), uWashTint, smoothstep(0.02, 0.3, washed)), edge * uRedFade);
  }

  // The land under the mist, seen wherever the cloud layers leave a gap.
  if (el < 0.5) {
    float below = max(-el, 0.0);
    vec2 fuv = vec2(uv.x, 1.0 - sqrt(below / 34.0));
    vec3 fl = texture(tFloor, clamp(fuv, 0.0, 1.0)).rgb;
    float fe = smoothstep(0.0, 0.03, uv.x) * (1.0 - smoothstep(0.97, 1.0, uv.x));
    fl = mix(floorColour(below), fl, fe);
    fl *= 1.0 + paperLevels(d) / 160.0 * 0.45;
    col = mix(col, fl, 1.0 - smoothstep(-1.2, 0.5, el));
  }

  // The palest far ranges. The nearer ones are hill rows.
  float v = (el + 9.0) / 15.0;
  if (v > 0.0 && v < 1.0) {
    vec4 f = texture(tFar, vec2(fract((180.0 - az) / 360.0), v));
    col = mix(col, f.rgb * (1.0 + paperLevels(d) / 160.0 * 0.5), f.a);
  }
  emit(col, 1.0);
}
`;function C(e,t,n,r,i){let a=new d({glslVersion:c,uniforms:{...b(e),tSky:{value:t},tFar:{value:n},tFloor:{value:r},tBank:{value:i},uBank:{value:0},uPaper:{value:new _(195.8/255,183.2/255,152/255)},uRedFade:{value:1},uWashTint:{value:new _(1,1,1)}},vertexShader:x,fragmentShader:S,depthTest:!1,depthWrite:!1});return a.name=`backdrop_sky`,a.userData.inkPass=`opaque`,a}var w=new _(2,5,-25),T=`
out vec3 vWorld;
out vec4 vClip;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
  vClip = gl_Position;
}
`,E=`
${y}
in vec3 vWorld;
uniform sampler2D tStrip;
uniform sampler2D tNoise;
uniform vec3 uHub;
uniform float uTime;
uniform float uElTop, uDeg, uAlpha, uDrift;
void main() {
  vec3 rel = vWorld - uHub;
  float azh = atan(rel.x, rel.z);
  float el = atan(rel.y, length(rel.xz)) * DEG;
  // Slow drift and a slow stir, never enough to read as a moving texture.
  vec2 st = vec2(azh * 0.37, el * 0.041);
  vec2 stir = texture(tNoise, st + vec2(uTime * 0.0013, 0.0)).rb - 0.5;
  vec2 uv = vec2(azh / (2.0 * PI) + uTime * uDrift / 360.0 + stir.x * 0.0009, (el - uElTop) / uDeg + 1.0 + stir.y * 0.002);
  vec2 s = texture(tStrip, uv).rg;
  float a = s.g * uAlpha;
  if (a < 0.003) discard;
  vec3 d = normalize(vWorld - cameraPosition);
  float below = -elevationDeg(d);
  // Undersides go to a cool grey, not to the warm floor: mist is cooler than the paper.
  vec3 col = mix(floorColour(below) * vec3(0.95, 0.965, 0.985), mistColour(below), s.r);
  col *= 1.0 + paperLevels(d) / 160.0 * 0.22;
  emit(col, a);
}
`,D=`
in vec4 aInst;     // x, y, z, width
in vec4 aInst2;    // height, cell, alpha, lit value
out vec2 vUv;
out vec3 vDir;
out float vAlpha;
out float vValue;
out vec4 vClip;
void main() {
  // Yaw-only billboard: strata stay level.
  vec3 toCam = cameraPosition - aInst.xyz;
  vec3 right = normalize(vec3(toCam.z, 0.0, -toCam.x));
  vec3 up = vec3(0.0, 1.0, 0.0);
  vec3 world = aInst.xyz + right * position.x * aInst.w + up * position.y * aInst2.x;
  float cell = floor(aInst2.y + 0.5);
  // Three flips textures, so the atlas's top row is at v = 1. Ribbons fill a row of 256 of 2048;
  // plumes are 512 cells along the bottom.
  if (cell < 5.5) {
    vUv = vec2(uv.x, 1.0 - (cell + 1.0 - uv.y) / 8.0);
  } else {
    vUv = vec2((cell - 6.0 + uv.x) / 4.0, uv.y / 4.0);
  }
  vAlpha = aInst2.z;
  vValue = aInst2.w;
  vDir = world - cameraPosition;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  vClip = gl_Position;
}
`,O=`
${y}
in vec2 vUv;
in vec3 vDir;
in float vAlpha;
in float vValue;
uniform sampler2D tRibbons;
uniform float uShow;
void main() {
  vec2 s = texture(tRibbons, vUv).rg;
  float a = s.r * vAlpha * uShow;
  if (a < 0.003) discard;
  vec3 d = normalize(vDir);
  float below = -elevationDeg(d);
  vec3 col = mix(floorColour(below), mistColour(below), clamp(vValue * s.g, 0.0, 1.0));
  col *= 1.0 + paperLevels(d) / 160.0 * 0.22;
  emit(col, a);
}
`;function k(e){return e.transparent=!1,e.blending=5,e.blendSrc=204,e.blendDst=205,e.blendEquation=100,e.blendSrcAlpha=200,e.blendDstAlpha=201,e.userData.inkPass=`opaque`,e}function ee(e,t,n){let i=e=>w.y+t.r*Math.tan(e*Math.PI/180),a=i(t.elTop),o=i(t.elTop-t.deg),s=new f(t.r,t.r,a-o,72,1,!0),l=k(new d({name:`backdrop_strip_${t.name}`,glslVersion:c,uniforms:{...b(e),tNoise:e.tNoise,uTime:e.uTime,tStrip:{value:n},uHub:{value:w},uElTop:{value:t.elTop},uDeg:{value:t.deg},uAlpha:{value:t.alpha},uDrift:{value:t.drift}},vertexShader:T,fragmentShader:E,depthTest:!1,depthWrite:!1,side:1})),u=new r(s,l);return u.name=`backdrop_strip_${t.name}`,u.position.set(w.x,(a+o)/2,w.z),u.frustumCulled=!1,u}function te(t,n,i){let a=new l(1,1),o=new e;o.index=a.index,o.setAttribute(`position`,a.attributes.position),o.setAttribute(`uv`,a.attributes.uv);let s=new Float32Array(i.length*4),u=new Float32Array(i.length*4);i.forEach((e,t)=>{s.set([e.x,e.y,e.z,e.w],t*4),u.set([e.h,e.cell,e.alpha,e.value],t*4)}),o.setAttribute(`aInst`,new g(s,4)),o.setAttribute(`aInst2`,new g(u,4)),o.instanceCount=i.length;let f=k(new d({name:`backdrop_ribbons_${n}`,glslVersion:c,uniforms:{...b(t),tRibbons:t.tRibbons,uShow:{value:1}},vertexShader:D,fragmentShader:O,depthTest:!1,depthWrite:!1,side:2})),p=new r(o,f);return p.name=`backdrop_ribbons_${n}`,p.frustumCulled=!1,p}var A=`
out vec2 vUv;
out vec3 vWorld;
out vec4 vClip;
void main() {
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
  vClip = gl_Position;
}
`,j=`
${y}
in vec2 vUv;
in vec3 vWorld;
uniform sampler2D tMap;
uniform float uShow;
uniform vec3 uKey;
uniform float uAway;
void main() {
  vec4 m = texture(tMap, vUv);
  float a = m.a * uShow;
  if (a < 0.008) discard;
  vec3 d = normalize(vWorld - cameraPosition);
  vec3 col = m.rgb;
  // Seen from well behind the camera it was drawn for, a near hill stands deeper in the air.
  if (uAway > 0.0) {
    float back = smoothstep(4.0, 26.0, length(cameraPosition.xz - uKey.xz));
    col = mix(col, mistColour(-elevationDeg(d)) * vec3(0.86, 0.87, 0.86), back * uAway);
  }
  emit(col * (1.0 + paperLevels(d) / 160.0 * 0.28), a);
}
`;function ne(e,t,n,r){let i=new d({name:`backdrop_hill_${t.name}`,glslVersion:c,uniforms:{...b(e),tMap:{value:n},uShow:{value:1},uKey:{value:r},uAway:{value:t.away??0}},vertexShader:A,fragmentShader:j,depthTest:!0,depthWrite:!0,side:2});return i.transparent=!1,i.blending=5,i.blendSrc=204,i.blendDst=205,i.blendEquation=100,i.blendSrcAlpha=200,i.blendDstAlpha=201,i.userData.inkPass=`opaque`,i}var M={0:[-.117,-5.84,-.343,2.14,9.7],96:[6.31,-5.33,-.345,3.42,-18.79],250:[25.92,-5.83,9.91,10.07,-45.45]},N=352/Math.tan(20*Math.PI/180),P=[[`W`,250,300,508,150,170,196,6,.58,1],[`N`,96,468,610,210,150,255,8,.62,.96],[`N`,96,368,650,170,150,150,9,.4,.9]];function F(){let e=new Map;for(let[t,n,r,i,a,o,s,c,l,u]of P){let[d,f,p,m,h]=M[n],g=d*Math.PI/180,_=f*Math.PI/180,v=[-Math.sin(g)*Math.cos(_),Math.sin(_),-Math.cos(g)*Math.cos(_)],y=[Math.cos(g),0,-Math.sin(g)],b=[y[1]*v[2]-y[2]*v[1],y[2]*v[0]-y[0]*v[2],y[0]*v[1]-y[1]*v[0]],x=r-640,S=352-i,C=[0,1,2].map(e=>v[e]*N+y[e]*x+b[e]*S),w=s/Math.hypot(C[0],C[2]),T=s/N,E={x:p+C[0]*w,y:m+C[1]*w,z:h+C[2]*w,w:a*T,h:o*T,cell:c,alpha:l,value:u},D=`${t}${s}`;e.has(D)||e.set(D,{name:`authored_${D}`,dist:s,side:t,ribbons:[]}),e.get(D).ribbons.push(E)}return[...e.values()]}function re(){return F()}function I(e,t){let n=(e,t,n)=>{let r=Math.min(Math.max((n-e)/(t-e),0),1);return r*r*(3-2*r)};return e===`N`?1-n(8,16,t):e===`W`?n(8,16,t):1}var L=`backdrop`,R=5,z=`backdrop`,ie=-4e6,B=null,V=null,H=null,U=!1,W=1,G=null,K=!1,q=[],J=[],Y=[],X=[],Z=[];function ae(e,t,n){let i=new r(n,e);return i.frustumCulled=!1,i.renderOrder=t,i}function Q(e){e.clearDepth()}async function $(e,t,n=!1,r=!1,o=!0){let s=await e.assets.loadTexture(`${z}/${t}`);return s.flipY=o,s.wrapS=s.wrapT=n?u:h,s.generateMipmaps=r,s.minFilter=r?a:i,s.magFilter=i,s.anisotropy=r?4:1,s.colorSpace=``,s.needsUpdate=!0,Z.push(s),s}async function oe(e){let{scene:i,assets:a}=e;B=new n,B.name=`backdrop`,i.add(B);let[o,c,l,u,d,f,g,y,b,x]=await Promise.all([$(e,`paper.jpg`,!0),$(e,`sky.jpg`),$(e,`far.webp`,!0),$(e,`floor.jpg`),$(e,`sky_bank.jpg`),$(e,`noise.jpg`,!0,!0),$(e,`ribbons.jpg`,!1,!0),a.loadJSON(`${z}/hills.json`),a.loadJSON(`${z}/strips.json`),a.loadGLTF(`${z}/hills.glb`)]);l.wrapT=h,V={tPaper:{value:o},tNoise:{value:f},tRibbons:{value:g},uFallbackVig:{value:0},uBurnK:{value:new _},uBurnP:{value:0},uGrade:{value:new p(.78,.85)},uTime:{value:0},uPaletteSky:{value:new _(1,1,1)}};let S=await a.track(v(()=>import(`./constants-BjlLV5tN.js`).then(e=>e.r),__vite__mapDeps([0,1]),import.meta.url).catch(()=>null)),w=S?.INK?.vignette;w?.burn&&w.burnP&&(V.uBurnK.value.set(...w.burn),V.uBurnP.value=w.burnP);let T=S?.INK?.grade;T&&V.uGrade.value.set(T.shoulder,T.ceiling);let E=new m;E.setAttribute(`position`,new t([-1,-1,0,3,-1,0,-1,3,0],3)),E.setAttribute(`uv`,new t([0,0,2,0,0,2],2)),X.push(E);let D=ie;G=new n,G.name=`backdrop_vista`,G.visible=!1;let O=[0,1,2].map(e=>{let t=new n;return t.rotation.y=e*2*Math.PI/3,G.add(t),t});B.add(G),H=C(V,c,l,u,d),Y.push(H);let k=ae(H,D++,E);k.name=`backdrop_sky`,k.userData.inkSky=!0,B.add(k);let A=new Map;x.scene.updateMatrixWorld(!0),x.scene.traverse(e=>{e.isMesh&&A.set(e.name,e)});let j=y.filter(e=>e.kind===`hill`),[M,N]=await Promise.all([Promise.all(j.map(t=>$(e,`hills/${t.name}.webp`,!1,!0,!1))),Promise.all(b.map(t=>$(e,`strips/${t.name}.jpg`,!0)))]);N.forEach(e=>{e.wrapT=h});let P=new Map(j.map((e,t)=>[e.name,M[t]])),F=[...b.map((e,t)=>({kind:`strip`,dist:e.r,strip:e,map:N[t]})),...j.map(e=>({kind:`hill`,dist:e.dist,entry:e})),...re().map(e=>({kind:`ribbons`,dist:e.dist-1,set:e}))].sort((e,t)=>t.dist-e.dist);for(let e of F)if(e.kind===`strip`){let t=ee(V,e.strip,e.map);t.renderOrder=D++,X.push(t.geometry),Y.push(t.material),B.add(t)}else if(e.kind===`ribbons`){let t=te(V,e.set.name,e.set.ribbons);t.renderOrder=D++,X.push(t.geometry),Y.push(t.material),J.push({side:e.set.side,mesh:t,material:t.material}),B.add(t)}else{let t=e.entry,n=A.get(t.name);if(!n){console.warn(`[backdrop] no mesh for ${t.name}`);continue}let i=ne(V,t,P.get(t.name),new _(...t.key)),a=new r(n.geometry,i);if(a.name=`backdrop_${t.name}`,a.geometry.computeBoundingSphere(),a.renderOrder=D++,a.onBeforeRender=e=>Q(e),X.push(n.geometry),Y.push(i),J.push({side:t.side,mesh:a,material:i,showZ:t.showZ}),B.add(a),t.side===`N`&&!t.showZ){q.push({material:i,away:t.away??0});for(let e of O){let a=new r(n.geometry,i);a.name=`backdrop_vista_${t.name}`,a.position.set(-t.key[0],-t.key[1],-t.key[2]),a.renderOrder=D++,a.onBeforeRender=e=>Q(e),e.add(a)}}}let I=new s({colorWrite:!1,depthWrite:!1,depthTest:!1});I.userData.inkPass=`opaque`,Y.push(I);let L=new m;L.setAttribute(`position`,new t([0,0,0,0,0,0,0,0,0],3)),X.push(L);let R=new r(L,I);R.frustumCulled=!1,R.renderOrder=D++,R.onAfterRender=e=>Q(e),B.add(R),e.registry.set(`backdrop.setPalette`,e=>{V.uPaletteSky.value.fromArray(e?.sky??[1,1,1]),H.uniforms.uWashTint.value.fromArray(e?.wash??[1,1,1]),U=!!e?.redEverywhere,W=e?.redAmount??1,K=e?.vista!==void 0,G.visible=K,G.rotation.y=(e?.vista??0)*Math.PI/180;for(let e of q)e.material.uniforms.uAway.value=K?0:e.away})}function se(e,t){V&&(V.uTime.value=t.time.t)}function ce(e){if(!V)return;V.uFallbackVig.value=+!e.renderFn;let t=e.camera.matrixWorld.elements,n=o.radToDeg(Math.atan2(t[8],t[10]));if(H.uniforms.uRedFade.value=W*(U?1:1-o.smoothstep(n,16,25)),H.uniforms.uBank.value=1-o.smoothstep(n,-14,-1),K){G.position.copy(e.camera.position),G.position.y+=60;for(let e of J)e.mesh.visible=!1;for(let e of q)e.material.uniforms.uShow.value=1}else for(let t of J){let r=I(t.side,n);if(t.showZ){let[n,i]=t.showZ,a=e.camera.position.z;r*=n>i?1-o.smoothstep(a,i,n):o.smoothstep(a,n,i)}t.mesh.visible=r>.001,t.material&&(t.material.uniforms.uShow.value=r)}}function le(e){B&&e.scene.remove(B);for(let e of Y)e.dispose();for(let e of X)e.dispose();for(let e of Z)e.dispose();Y.length=X.length=Z.length=J.length=q.length=0,G=null,K=!1,e.registry.delete(`backdrop.setPalette`),B=V=H=null}export{ce as beforeRender,le as dispose,oe as init,L as name,R as order,se as update};