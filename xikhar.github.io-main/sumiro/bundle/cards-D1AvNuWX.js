import{n as e}from"./ink_material-UyOP6egx.js";function t(e,t,n){let r=e.onBeforeCompile,i=e.customProgramCacheKey();return e.onBeforeCompile=(e,i)=>{r(e,i),e.uniforms.uWashCol={value:t},e.uniforms.uWashAmt={value:n},e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform vec3 uWashCol;
uniform float uWashAmt;`).replace(`uLineWeight * inkPaint.a);`,`uLineWeight * inkPaint.a);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, uWashCol, uWashAmt);`)},e.customProgramCacheKey=()=>`${i}:wash`,e}function n(t,n){let r=e({preset:`pineNeedles`,color:16777215,map:t,alphaTest:.42,side:2,shadeTint:[.82,.84,.84],lineWeight:.06,wrap:.8,skyFill:.5,name:`pine_needles`}),i=r.onBeforeCompile;return r.onBeforeCompile=(e,t)=>{i(e,t),e.uniforms.uWindT=n.uWindT,e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
uniform float uWindT;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
#ifdef USE_INSTANCING
{
  vec3 o = instanceMatrix[3].xyz;
  float ph = o.x * 1.3 + o.z * 0.9 + o.y * 0.7;
  float w = sin(uWindT * 0.9 + ph) + 0.5 * sin(uWindT * 1.7 + ph * 2.1);
  transformed.xz += vec2(0.018, 0.012) * w * max(position.y, 0.0) * 2.0;
}
#endif`),e.fragmentShader=e.fragmentShader.replace(`#include <alphatest_fragment>`,`{
  vec2 dx = dFdx(vMapUv) * 2048.0, dy = dFdy(vMapUv) * 2048.0;
  float lod = 0.5 * log2(max(max(dot(dx, dx), dot(dy, dy)), 1e-6));
  if (diffuseColor.a < mix(alphaTest, 0.1, smoothstep(2.0, 5.5, lod))) {
    // Between the needles, a blurred read of the same fan fills in a solid dark heart: a pad is one wet dab with needles at its rim.
    if (texture2D(map, vMapUv, 2.4).a < 0.42) discard;
    diffuseColor.rgb = vec3(0.075, 0.085, 0.078);
  }
}`)},r.customProgramCacheKey=()=>`ink3:pinecards3`,r}export{n,t};