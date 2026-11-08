import{a as e,i as t,n,o as r,r as i,s as a,t as o}from"./layout-DibyQJX5.js";import{a as s,f as c,n as l}from"./ink_material-UyOP6egx.js";var u=`
out vec3 vW;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vW = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,d=`
in vec3 vW;
layout(location = 0) out vec4 outColor;
${c}
uniform sampler2D tMask;
uniform vec4 uWin;
uniform float uGrow;
void main() {
  vec2 uv = vec2((vW.x - uWin.x) / (uWin.y - uWin.x), (vW.z - uWin.z) / (uWin.w - uWin.z));
  float a = texture(tMask, uv).r;
  // The bleed: blurred mask from the mips is a distance field near each edge. It moves about 1 cm in the time the video shows.
  float field = textureLod(tMask, uv, 3.0).r;
  a = max(a, smoothstep(0.62 - uGrow, 0.70 - uGrow, field) * 0.5);

  vec3 toEye = normalize(cameraPosition - vW);
  float graze = 1.0 - clamp(toEye.y, 0.0, 1.0);

  // Pigment: warm brown where thin, near-neutral black where solid.
  vec3 thin = vec3(46.0, 42.0, 34.0) / 255.0;
  vec3 solid = vec3(9.0, 8.0, 7.0) / 255.0;
  vec3 col = mix(thin, solid, smoothstep(0.45, 0.92, a));

  // Wet sheen: sky colour in long streaks lying across the view from the plateau's edge, seen only low across the surface.
  vec2 q = vec2(vW.x * 0.887 - vW.z * 0.462, vW.x * 0.462 + vW.z * 0.887);
  float s = fbm3(vec3(q.x * 0.34, 3.0, q.y * 1.7));
  float s2 = fbm3(vec3(q.x * 0.9, 9.0, q.y * 5.5));
  float patchy = smoothstep(0.36, 0.58, vnoise(vec3(q.x * 0.42, 14.0, q.y * 0.9)));
  float sheen = smoothstep(0.44, 0.64, s * 0.55 + s2 * 0.45) * patchy * smoothstep(0.66, 0.86, graze);
  col = mix(col, vec3(92.0, 80.0, 62.0) / 255.0, sheen * smoothstep(0.5, 0.9, a) * 0.72);

  outColor = vec4(col, a);
}
`,f=`
in vec3 vW;
layout(location = 0) out vec4 outColor;
${c}
uniform sampler2D tMask;
uniform vec2 uCentre;
uniform vec2 uRadius;
uniform float uSpan;
uniform float uTime;
void main() {
  vec2 p = (vW.xz - uCentre) / uRadius;
  // Texture y runs north to south, world z runs south to north.
  float r = length(p);
  // The measured residual motion is under 1.5% of R per second, and it shifts width more than it travels.
  float t = uTime * 0.03;
  vec2 wob = vec2(vnoise(vec3(p * 1.7, t + 3.0)), vnoise(vec3(p * 1.7 + 19.0, t + 8.0))) - 0.5;
  vec2 q = p + wob * 0.012;
  vec2 uv = q / uSpan * 0.5 + 0.5;
  float a = texture(tMask, uv).r;
  vec3 ring = vec3(20.0, 18.0, 14.0) / 255.0;
  vec3 core = vec3(4.0, 4.0, 4.0) / 255.0;
  vec3 col = mix(core, ring, smoothstep(0.34, 0.62, r));
  outColor = vec4(col, a);
}
`,p=`
in float aBirth;
in float aCell;
out vec2 vUv;
out float vFade;
uniform float uTime;
uniform float uHold;
uniform float uFadeOut;
void main() {
  vUv = vec2((uv.x + aCell) / 4.0, uv.y);
  float age = uTime - aBirth;
  vFade = aBirth < 0.0 ? 0.0 : smoothstep(0.0, 0.15, age) * (1.0 - smoothstep(uHold, uHold + uFadeOut, age));
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
}
`,m=`
in vec2 vUv;
in float vFade;
layout(location = 0) out vec4 outColor;
uniform sampler2D tBlots;
void main() {
  float a = texture(tBlots, vUv).r * vFade;
  if (a < 0.003) discard;
  outColor = vec4(vec3(12.0, 11.0, 9.0) / 255.0, a);
}
`,h=`
in vec3 aPos;
in vec3 aVel;
in float aBirth;
in float aLife;
in float aSize;
in float aTone;
out vec2 vUv;
out float vFade;
out float vTone;
out float vSeed;
uniform float uTime;
void main() {
  float age = uTime - aBirth;
  float alive = step(0.0, age) * step(age, aLife) * step(0.0, aBirth);
  float hold = aLife * 0.28;
  vFade = alive * (1.0 - smoothstep(hold, aLife, age));
  vTone = aTone;
  vSeed = aPos.x * 37.0 + aPos.z * 91.0;
  vUv = uv * 2.0 - 1.0;
  vec3 p = aPos + aVel * age + vec3(0.0, -3.8, 0.0) * age * age * step(0.001, dot(aVel, aVel));
  p.y = max(p.y, aPos.y);
  vec4 view = viewMatrix * vec4(p, 1.0);
  view.xy += position.xy * aSize * alive;
  gl_Position = projectionMatrix * view;
}
`,g=`
in vec2 vUv;
in float vFade;
in float vTone;
in float vSeed;
layout(location = 0) out vec4 outColor;
void main() {
  // Not a clean dot: squashed and nicked by its own angle.
  float ang = atan(vUv.y, vUv.x);
  float d = length(vUv * vec2(1.0, 1.25)) + 0.16 * sin(ang * 3.0 + vSeed) + 0.09 * sin(ang * 7.0 + vSeed * 1.7);
  float a = smoothstep(1.0, 0.62, d) * vFade;
  if (a < 0.004) discard;
  // Opaque mid-tones: on stone they read dark, on the black stain they read light. Spec part 3a.
  vec3 dark = vec3(70.0, 65.0, 55.0) / 255.0;
  vec3 mid = vec3(106.0, 101.0, 90.0) / 255.0;
  outColor = vec4(mix(dark, mid, vTone), a);
}
`,_=`
in float aBirth;
in float aLife;
out vec2 vUv;
out vec3 vW;
out float vFade;
uniform float uTime;
void main() {
  float age = uTime - aBirth;
  vFade = step(0.0, aBirth) * step(0.0, age) * (1.0 - smoothstep(aLife * 0.3, aLife, age));
  vUv = uv * 2.0 - 1.0;
  vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vW = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,v=`
in vec2 vUv;
in vec3 vW;
in float vFade;
layout(location = 0) out vec4 outColor;
${c}
void main() {
  float n = fbm3(vec3(vW.x * 5.0, 1.0, vW.z * 5.0));
  float grit = 0.5 * vnoise(vec3(vW.x * 70.0, 4.0, vW.z * 70.0)) + 0.5 * vnoise(vec3(vW.x * 150.0, 7.0, vW.z * 150.0));
  float body = 1.0 - smoothstep(0.1, 1.0, length(vUv) + (n - 0.5) * 0.7);
  float a = body * (0.7 + 0.6 * grit) * 0.5 * vFade;
  if (a < 0.004) discard;
  outColor = vec4(vec3(122.0, 118.0, 106.0) / 255.0, clamp(a, 0.0, 1.0));
}
`,y=`fx_ink`,b=320,x=.5,S=5,C=60,w=5,T=325,E=S,D=.56,O=24,k=6,A=3,j=10,M=1.02,N=null,P=e=>{let t=Object.keys({"./audio.js":0,"./backdrop.js":0,"./camera_rig.js":0,"./combat.js":0,"./env_bridge_stairs.js":0,"./env_cliff.js":0,"./env_gate.js":0,"./env_pines.js":0,"./env_plateau.js":0,"./fx_crows.js":0,"./fx_ink_step.js":0,"./fx_mist.js":0,"./game.js":0,"./hud.js":0,"./level.js":0,"./player.js":0,"./render_pipeline.js":0}).map(e=>/([^/]+)\.js$/.exec(e)[1]);return(e.params.only??t).some(e=>/plateau/.test(e)&&!e.startsWith(`_`))};function F(e,t,n){return new e.ShaderMaterial({glslVersion:e.GLSL3,uniforms:{tInkNoise:s.tInkNoise,...n},vertexShader:u,fragmentShader:t,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-4})}function I(e,t,n){return t.wrapS=e.ClampToEdgeWrapping,t.wrapT=e.ClampToEdgeWrapping,t.generateMipmaps=!0,t.minFilter=e.LinearMipmapLinearFilter,t.anisotropy=n.capabilities.getMaxAnisotropy(),t}function L(e){let{THREE:t,scene:n}=e,r=new t.PlaneGeometry(1,1),i=new t.InstancedBufferGeometry;i.index=r.index,i.setAttribute(`position`,r.getAttribute(`position`)),i.setAttribute(`uv`,r.getAttribute(`uv`));let a=e=>new t.InstancedBufferAttribute(new Float32Array(T*e),e).setUsage(t.DynamicDrawUsage),o={aPos:a(3),aVel:a(3),aBirth:a(1),aLife:a(1),aSize:a(1),aTone:a(1)};o.aBirth.array.fill(-1);for(let e of Object.keys(o))i.setAttribute(e,o[e]);i.instanceCount=T;let c={value:0},l=new t.ShaderMaterial({glslVersion:t.GLSL3,uniforms:{uTime:c},vertexShader:h,fragmentShader:g,transparent:!0,depthWrite:!1}),u=new t.Mesh(i,l);u.name=`fx_ink_specks`,u.frustumCulled=!1,u.renderOrder=6,n.add(u);let d=new t.PlaneGeometry(1,1);d.rotateX(-Math.PI/2);let f=new t.InstancedBufferAttribute(new Float32Array(E).fill(-1),1).setUsage(t.DynamicDrawUsage),p=new t.InstancedBufferAttribute(new Float32Array(E),1).setUsage(t.DynamicDrawUsage);d.setAttribute(`aBirth`,f),d.setAttribute(`aLife`,p);let m=new t.ShaderMaterial({glslVersion:t.GLSL3,uniforms:{uTime:c,tInkNoise:s.tInkNoise},vertexShader:_,fragmentShader:v,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-8}),y=new t.InstancedMesh(d,m,E);return y.name=`fx_ink_smears`,y.frustumCulled=!1,y.renderOrder=5,n.add(y),{uTime:c,a:o,specks:i,speckMesh:u,speckMat:l,smearMesh:y,smearGeo:d,smearMat:m,smearBirth:f,smearLife:p,nextSpeck:0,nextSmear:0,matrix:new t.Matrix4,quat:new t.Quaternion,pos:new t.Vector3,scale:new t.Vector3,euler:new t.Euler(0,0,0,`YXZ`)}}function R(e,t,n,r,i,a,o,s){let c=Math.sin(i),l=Math.cos(i),u=Math.cos(i),d=-Math.sin(i),f=s?C:Math.round(C*.8),{aPos:p,aVel:m,aBirth:h,aLife:g,aSize:_,aTone:v}=e.a,y=(t,n,r,i,o,s,c,l,u)=>{let d=e.nextSpeck;e.nextSpeck=(d+1)%T,p.setXYZ(d,t,n,r),m.setXYZ(d,i,o,s),h.setX(d,a),g.setX(d,u),_.setX(d,c),v.setX(d,l)};for(let e=0;e<f;e++){let e=(o.next()+o.next()+o.next()-1.5)/1.5,i=(o.next()+o.next()+o.next()-1.5)/1.5,a=.16+e*.3,s=i*.28,f=o.range(.012,.036)*(o.next()<.1?1.5:1);y(t+c*a+u*s,n+.03,r+l*a+d*s,0,0,0,f,o.next()**1.6,D*o.range(.85,1.1))}for(let e=0;e<w;e++){let e=o.range(0,Math.PI*2),i=o.range(.3,.8);y(t+o.range(-.08,.08),n+.05,r+o.range(-.08,.08),Math.cos(e)*i+c*.4,o.range(.9,1.5),Math.sin(e)*i+l*.4,o.range(.016,.032),o.next()*.3,.22)}p.needsUpdate=m.needsUpdate=h.needsUpdate=g.needsUpdate=_.needsUpdate=v.needsUpdate=!0;let b=e.nextSmear;e.nextSmear=(b+1)%E,e.pos.set(t+c*.26,n+.03,r+l*.26),e.euler.set(0,i,0),e.quat.setFromEuler(e.euler);let x=(s?1.25:1)*o.range(.9,1.15);e.scale.set(x,1,x*1.35),e.matrix.compose(e.pos,e.quat,e.scale),e.smearMesh.setMatrixAt(b,e.matrix),e.smearMesh.instanceMatrix.needsUpdate=!0,e.smearBirth.setX(b,a),e.smearLife.setX(b,.8),e.smearBirth.needsUpdate=!0,e.smearLife.needsUpdate=!0}function z(e,t){let{THREE:n,scene:r}=e,i=new n.PlaneGeometry(1,1);i.rotateX(-Math.PI/2);let a=new n.InstancedBufferAttribute(new Float32Array(O).fill(-1),1).setUsage(n.DynamicDrawUsage),o=new n.InstancedBufferAttribute(new Float32Array(O),1).setUsage(n.DynamicDrawUsage);i.setAttribute(`aBirth`,a),i.setAttribute(`aCell`,o);let s={value:0},c=new n.ShaderMaterial({glslVersion:n.GLSL3,uniforms:{uTime:s,uHold:{value:k},uFadeOut:{value:A},tBlots:{value:t}},vertexShader:p,fragmentShader:m,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-6}),l=new n.InstancedMesh(i,c,O);return l.name=`fx_ink_prints`,l.frustumCulled=!1,l.renderOrder=3,r.add(l),{mesh:l,geo:i,mat:c,uTime:s,birth:a,cell:o,next:0,m:new n.Matrix4,q:new n.Quaternion,p:new n.Vector3,v:new n.Vector3,e:new n.Euler}}function B(e,t,n,r,i,a,s){let c=e.next;e.next=(c+1)%O,e.p.set(t,n+o+.004,r),e.e.set(0,i+s.range(-.25,.25)+Math.PI/2,0,`YXZ`),e.q.setFromEuler(e.e);let l=s.range(.42,.75);e.v.set(l,1,l*s.range(.55,.72)),e.m.compose(e.p,e.q,e.v),e.mesh.setMatrixAt(c,e.m),e.mesh.instanceMatrix.needsUpdate=!0,e.birth.setX(c,a),e.cell.setX(c,s.int(0,3)),e.birth.needsUpdate=!0,e.cell.needsUpdate=!0}function V(e,t,n){let r=e.registry.get(`player.feet`);if(r&&!e.input.scripted)return n.x=r.x,n.y=r.y,n.z=r.z,n;let i=e.registry.get(`camera_rig.layout`);if(i?.feetAt)return i.feetAt(t,n);let a=e.route.feetAtTime(t);return n.x=a.x,n.y=a.y,n.z=a.z,n}var H=(t,n)=>t>e[0]-1&&t<e[1]+6&&n>e[2]&&n<e[3]-.5;async function U(r){let{THREE:s,assets:c,scene:u,renderer:p,registry:m}=r,[h,g,_,v]=await Promise.all([c.loadGLTF(`fx_ink/fx_ink.glb`),c.loadTexture(`fx_ink/stain.webp`),c.loadTexture(`fx_ink/pool.webp`),c.loadTexture(`fx_ink/blots.webp`)]);for(let e of[g,_,v])I(s,e,p);let b=new s.Group;b.name=`fx_ink`,u.add(b);let x={value:0},S={value:0},C=F(s,d,{tMask:{value:g},uWin:{value:new s.Vector4(...e)},uGrow:x}),w=F(s,f,{tMask:{value:_},uCentre:{value:new s.Vector2(n[0],n[1])},uRadius:{value:new s.Vector2(i[0],i[1])},uSpan:{value:t},uTime:S});w.polygonOffsetUnits=-6;let T=null,E=[];h.scene.traverse(e=>{e.isMesh&&E.push(e)});for(let e of E)e.name.startsWith(`ink_stain`)?(e.material=C,e.position.y+=o,e.renderOrder=1,e.castShadow=e.receiveShadow=!1,b.add(e)):e.name.startsWith(`ink_pool`)?(e.material=w,e.position.y+=o+.002,e.renderOrder=2,e.castShadow=e.receiveShadow=!1,b.add(e)):e.name.startsWith(`review_slab`)&&!P(r)&&(e.material=l({preset:`stone`,vertexPaint:!1,rampBias:.56,rampScale:.56,tint:[.995,1,1],crackAmt:0,pitAmt:.12,speckAmt:.2,facetAmt:0,brushAmt:.1,scumble:.05,stainAmt:.3,stainFreq:.34,lineWeight:.4}),e.castShadow=!1,e.receiveShadow=!0,T=e,b.add(e));let D=L(r),O=z(r,v),k=a().map(e=>e/24);N={group:b,stainMat:C,poolMat:w,slab:T,textures:[g,_,v],uGrow:x,uTime:S,puffs:D,prints:O,plants:k,nextPlant:0,rng:r.rng.fork(y),feet:{},ahead:{},side:1,walked:0,last:null,printToggle:0,printsScripted:r.params.raw.get(`fxprints`)===`1`,unsubscribe:null},m.set(`fx_ink.ready`,!0),N.offLevel=r.input.scripted?null:m.on(`level.current`,e=>{let t=e.id===`ch1_climb`;N.group.visible=t,N.prints.mesh.visible=t,N.here=t}),N.unsubscribe=m.on(`player.footPlant`,e=>{e&&G(r,e.x,e.y,e.z,e.heading??N.lastHeading??0,r.time.t,!0,e.heavy)})}function W(e,t,n){let i=e.registry.get(`camera_rig.layout`);return i?.plateauY?i.plateauY(t,n):r(t,n)}function G(e,t,r,i,a,o,s,c){let l=c??(o>7.9&&o<8.2);N.side=-N.side;let u=Math.cos(a),d=-Math.sin(a),f=t+u*N.side*(s?0:.11),p=i+d*N.side*(s?0:.11);if(R(N.puffs,f,r,p,a,o,N.rng,l),e.input.scripted&&!N.printsScripted||N.here===!1)return;let m=Math.abs(r-W(e,t,i))<.3&&H(t,i),h=Math.hypot(t-n[0],i-n[1]);m&&h<j&&(N.printToggle=1-N.printToggle)==1&&B(N.prints,f,W(e,f,p),p,a,o,N.rng)}function K(e,t,n,r,i){let a=n-e,o=r-t;return a*a+o*o<1e-5?i:Math.atan2(-a,-o)}function q(e,t){if(!N)return;let n=t.time.t;N.uTime.value=n,N.puffs.uTime.value=n,N.prints.uTime.value=n,N.uGrow.value=Math.min(Math.max(n-10,0),5)*.012;let r=t.registry.has(`player.footPlant`);if(t.input.scripted){if(!r)for(;N.nextPlant<N.plants.length&&N.plants[N.nextPlant]<=n;){let e=N.plants[N.nextPlant++];V(t,e,N.feet),V(t,e+.08,N.ahead);let n=K(N.feet.x,N.feet.z,N.ahead.x,N.ahead.z,0);N.lastHeading=n,G(t,N.feet.x,N.feet.y,N.feet.z,n,e,!1)}return}V(t,n,N.feet),N.last||(N.last={...N.feet});let i=Math.hypot(N.feet.x-N.last.x,N.feet.z-N.last.z),a=Math.abs(N.feet.y-N.last.y)<.2;i>0&&e>0&&(N.lastHeading=K(N.last.x,N.last.z,N.feet.x,N.feet.z,N.lastHeading??0),!r&&a&&(N.walked+=i,N.walked>=M&&(N.walked-=M,G(t,N.feet.x,N.feet.y,N.feet.z,N.lastHeading,n,!1)))),N.last.x=N.feet.x,N.last.y=N.feet.y,N.last.z=N.feet.z}function J(e){if(N){N.unsubscribe?.(),N.offLevel?.(),e.scene.remove(N.group,N.puffs.speckMesh,N.puffs.smearMesh,N.prints.mesh);for(let e of N.textures)e.dispose();for(let e of[N.stainMat,N.poolMat,N.puffs.speckMat,N.puffs.smearMat,N.prints.mat])e.dispose();N.puffs.specks.dispose(),N.puffs.smearGeo.dispose(),N.prints.geo.dispose(),e.registry.delete(`fx_ink.ready`),N=null}}export{x as budgetMs,J as dispose,U as init,y as name,b as order,q as update};