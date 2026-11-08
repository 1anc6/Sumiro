import{a as e,f as t}from"./ink_material-UyOP6egx.js";var n=`fx_ink_step`,r=335,i=.2,a=40,o=3,s=.9,c=.92,l=.012,u=`
in vec3 aDir;
in float aAlong;
in float aSide;
in float aBirth;
out vec2 vStroke;
out float vAge;
uniform float uTime;
uniform float uLife;
const float HALF = 0.62;
void main() {
  vStroke = vec2(aAlong, aSide);
  vAge = clamp((uTime - aBirth) / uLife, 0.0, 1.0);
  // Across the way he went and across the line of sight, so it is never seen edge on.
  vec3 toEye = cameraPosition - position;
  vec3 across = cross(aDir, toEye);
  float len = length(across);
  across = len > 1e-3 ? across / len : vec3(0.0, 1.0, 0.0);
  if (across.y < 0.0) across = -across;
  gl_Position = projectionMatrix * viewMatrix * vec4(position + across * (aSide * 2.0 - 1.0) * HALF, 1.0);
}
`,d=`
in vec2 vStroke;
in float vAge;
layout(location = 0) out vec4 outColor;
${t}
void main() {
  float along = vStroke.x;
  float across = abs(vStroke.y * 2.0 - 1.0);
  // The brush lands thin, swells, and lifts off at his heels, with a torn outline.
  float width = smoothstep(0.0, 0.4, along) * (1.0 - 0.75 * smoothstep(0.78, 1.0, along));
  float tear = vnoise(vec3(along * 9.0, vStroke.y * 3.0, 17.0)) * 0.28;
  float inside = width * (0.86 + tear) - across;
  if (inside <= 0.0) discard;
  // Bristles run along the stroke. Few of them are still loaded near the start, and the age takes the rest.
  float bristle = vnoise(vec3(along * 1.3 + 4.0, vStroke.y * 22.0, 3.0));
  float fine = vnoise(vec3(along * 5.0, vStroke.y * 64.0, 9.0));
  float load = bristle * 0.68 + fine * 0.32;
  float dry = mix(0.62, 0.3, smoothstep(0.1, 0.6, along)) + vAge * vAge * 0.6;
  float a = smoothstep(dry, dry + 0.1, load) * smoothstep(0.0, 0.08, inside);
  a *= 1.0 - smoothstep(0.75, 1.0, vAge);
  if (a < 0.01) discard;
  vec3 col = mix(vec3(9.0, 8.0, 7.0), vec3(38.0, 34.0, 28.0), smoothstep(0.3, 0.9, vAge)) / 255.0;
  outColor = vec4(col, a);
}
`,f=null;function p(t){if(t.input.scripted)return;let{THREE:n,scene:r,registry:i}=t,c=new n.BufferGeometry,l=e=>new n.BufferAttribute(new Float32Array(240*e),e).setUsage(n.DynamicDrawUsage),p=l(3),g=l(3),_=l(1),v=l(1),y=l(1);y.array.fill(-10);for(let e=0;e<240;e+=2)v.setX(e+1,1);c.setAttribute(`position`,p),c.setAttribute(`aDir`,g),c.setAttribute(`aAlong`,_),c.setAttribute(`aSide`,v),c.setAttribute(`aBirth`,y);let b=[];for(let e=0;e<o;e++)for(let t=0;t+1<a;t++){let n=(e*a+t)*2;b.push(n,n+1,n+3,n,n+3,n+2)}c.setIndex(b);let x=new n.ShaderMaterial({glslVersion:n.GLSL3,uniforms:{uTime:{value:0},uLife:{value:s},tInkNoise:e.tInkNoise},vertexShader:u,fragmentShader:d,transparent:!0,depthWrite:!1,side:n.DoubleSide}),S=new n.Mesh(c,x);S.name=`fx_ink_step`,S.frustumCulled=!1,S.renderOrder=7,r.add(S),f={mesh:S,geometry:c,material:x,position:p,dir:g,along:_,birth:y,stroke:-1,n:0,dx:0,dz:1,active:!1,next:0,off:null},f.off=i.on(`player.inkStep`,e=>{e&&(f.stroke=(f.stroke+1)%o,f.n=0,f.active=!0,f.next=0,f.dx=e.dx,f.dz=e.dz,m(0,e.x,e.y,e.z,t.time.t),h())})}function m(e,t,n,r,i){for(let o=e;o<a;o++){let s=(f.stroke*a+o)*2;for(let a of[s,s+1])f.position.setXYZ(a,t,n+c,r),f.dir.setXYZ(a,f.dx,0,f.dz),f.birth.setX(a,i),f.along.setX(a,Math.min(o/Math.max(e,1),1))}for(let t=0;t<e;t++){let n=(f.stroke*a+t)*2;f.along.setX(n,t/e),f.along.setX(n+1,t/e)}}function h(){f.position.needsUpdate=f.dir.needsUpdate=f.along.needsUpdate=f.birth.needsUpdate=!0}function g(e,t){if(!f)return;let n=t.time.t;if(f.material.uniforms.uTime.value=n,!f.active)return;let r=t.registry.get(`player.feet`),i=t.registry.get(`player.state`);!r||i!==`DODGE`&&i!==`DASH`&&f.n>0?f.active=!1:(f.next-=e,f.next>0||(f.next=l,m(f.n,r.x,r.y,r.z,n),f.n=Math.min(f.n+1,39),h()))}function _(e){f&&=(f.off?.(),e.scene.remove(f.mesh),f.geometry.dispose(),f.material.dispose(),null)}export{i as budgetMs,_ as dispose,p as init,n as name,r as order,g as update};