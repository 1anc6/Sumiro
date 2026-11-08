var e=`hud`,t=92,n=!0,r=.6,i=`#1b1712`,a=`#e7dcc1`,o=640,s=360,c=5,l=`
#ink-ui { position: fixed; inset: 0; pointer-events: none; user-select: none; overflow: hidden; color: ${i}; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, 'URW Palladio L', Georgia, serif; font-style: italic; --u: min(1vh, 1.78vw); z-index: 5; }
#ink-ui * { box-sizing: border-box; }
#ink-ui .veil { position: absolute; inset: 0; background: #b1a080; transition: opacity 1.6s ease; }
#ink-ui canvas.wash { position: absolute; inset: 0; width: 100%; height: 100%; display: none; }
#ink-ui .card { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; color: ${a}; opacity: 0; transition: opacity 0.7s ease; }
#ink-ui .card.on { opacity: 1; }
#ink-ui .card .num { font-size: calc(var(--u) * 2.5); letter-spacing: 0.18em; opacity: 0.72; }
#ink-ui .card .name { font-size: calc(var(--u) * 10); line-height: 1.15; margin-top: calc(var(--u) * 1.2); filter: url(#ink-brush-pale); }
#ink-ui .card .sub { font-size: calc(var(--u) * 2.7); margin-top: calc(var(--u) * 1.6); opacity: 0.8; }
#ink-ui .card .tally { font-size: calc(var(--u) * 2.1); margin-top: calc(var(--u) * 1.8); opacity: 0.55; min-height: 1.3em; }
#ink-ui .closing { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; padding: 0 14%; color: ${a}; font-size: calc(var(--u) * 3.6); line-height: 1.4; opacity: 0; transition: opacity 0.9s ease; }
#ink-ui .closing.on { opacity: 1; }
#ink-ui .card .seal { width: calc(var(--u) * 3.4); height: calc(var(--u) * 3.4); margin: calc(var(--u) * 2.4) auto 0; }
#ink-ui .seal { background: #a8321f; border-radius: 12%; filter: url(#ink-edge); display: block; position: relative; }
#ink-ui .seal::after { content: ''; position: absolute; inset: 20%; border: calc(var(--u) * 0.26) solid #e8d9bd; border-radius: 8%; }
#ink-ui .seal::before { content: ''; position: absolute; left: 20%; right: 20%; top: 50%; height: calc(var(--u) * 0.26); margin-top: calc(var(--u) * -0.13); background: #e8d9bd; }
#ink-ui .vitals { position: absolute; left: calc(var(--u) * 3.4); top: calc(var(--u) * 3); opacity: 0; transition: opacity 0.9s ease; filter: drop-shadow(0 0 calc(var(--u) * 0.5) rgba(226, 214, 184, 0.8)); }
#ink-ui .vitals.on { opacity: 1; }
#ink-ui .strokes { display: flex; gap: calc(var(--u) * 0.7); align-items: center; }
#ink-ui .strokes img { height: calc(var(--u) * 2); width: auto; display: block; transition: opacity 0.4s ease, transform 0.4s ease; }
#ink-ui .strokes img.lost { opacity: 0.16; transform: scaleX(0.82); }
#ink-ui .lower { display: flex; align-items: center; gap: calc(var(--u) * 1.5); margin-top: calc(var(--u) * 1); }
#ink-ui .gourds { display: flex; gap: calc(var(--u) * 0.45); }
#ink-ui .gourds img { height: calc(var(--u) * 3.5); width: auto; display: block; transition: opacity 0.4s ease; }
#ink-ui .gourds img.empty { opacity: 0.2; filter: grayscale(1); }
#ink-ui .ink { width: calc(var(--u) * 2); height: calc(var(--u) * 2); display: none; }
#ink-ui .ink.on { display: block; }
#ink-ui .ink circle { fill: none; stroke: ${i}; stroke-width: 15; stroke-linecap: round; transform: rotate(-80deg); transform-origin: 50% 50%; }
#ink-ui .ink.full circle { stroke: #a8321f; }
#ink-ui .line { position: absolute; left: 0; right: 0; text-align: center; font-size: calc(var(--u) * 2.6); line-height: 1.3; opacity: 0; transition: opacity 0.5s ease; }
#ink-ui .line span { display: inline-block; padding: calc(var(--u) * 0.9) calc(var(--u) * 5); background: radial-gradient(closest-side, rgba(226, 214, 186, 0.86), rgba(226, 214, 186, 0.62) 62%, rgba(226, 214, 186, 0)); }
#ink-ui .line b { font-style: normal; font-weight: 600; font-size: 0.86em; letter-spacing: 0.05em; color: #7c2415; margin: 0 0.12em; }
#ink-ui .line.on { opacity: 1; }
#ink-ui .hint { bottom: calc(var(--u) * 10); }
#ink-ui .prompt { bottom: calc(var(--u) * 4.4); }
#ink-ui.boss .hint { bottom: calc(var(--u) * 16.5); }
#ink-ui.boss .prompt { bottom: calc(var(--u) * 12); }
#ink-ui .note { position: absolute; right: calc(var(--u) * 5); top: 26%; width: calc(var(--u) * 42); font-size: calc(var(--u) * 2.8); line-height: 1.55; text-align: right; opacity: 0; transition: opacity 1.2s ease; text-shadow: 0 0 calc(var(--u) * 0.7) rgba(232, 220, 192, 0.95), 0 0 calc(var(--u) * 1.8) rgba(232, 220, 192, 0.9); }
#ink-ui .note.on { opacity: 1; }
#ink-ui .note small { display: block; margin-top: calc(var(--u) * 1.5); font-size: calc(var(--u) * 2.1); color: #7c2415; }
#ink-ui .menu { position: absolute; inset: 0; opacity: 0; transition: opacity 0.7s ease; pointer-events: none; }
#ink-ui .menu.on { opacity: 1; pointer-events: auto; }
#ink-ui .menu .body { position: absolute; left: 7.5%; top: 11%; width: min(46%, calc(var(--u) * 80)); }
#ink-ui .menu.dim { background: radial-gradient(ellipse at 28% 45%, rgba(203, 188, 155, 0.94) 0%, rgba(190, 173, 138, 0.9) 45%, rgba(160, 142, 108, 0.82) 100%); }
#ink-ui .menu.page .body { top: 8%; width: min(62%, calc(var(--u) * 92)); }
#ink-ui .menu h1 { margin: 0; font-weight: 400; font-size: calc(var(--u) * 11.5); line-height: 1; letter-spacing: -0.012em; filter: url(#ink-brush); }
#ink-ui .menu.pause h1, #ink-ui .menu.page h1 { font-size: calc(var(--u) * 6.4); }
#ink-ui .menu .head { display: flex; align-items: flex-start; gap: calc(var(--u) * 1.6); }
#ink-ui .menu .head .seal { width: calc(var(--u) * 2.6); height: calc(var(--u) * 2.6); margin-top: calc(var(--u) * 2); flex: none; }
#ink-ui .menu .sub { font-size: calc(var(--u) * 2.5); margin-top: calc(var(--u) * 2.4); max-width: 34em; }
#ink-ui .menu ul { list-style: none; margin: calc(var(--u) * 2.8) 0 0; padding: 0; }
#ink-ui .menu.page ul { margin-top: calc(var(--u) * 2.6); }
#ink-ui .menu li { position: relative; font-size: calc(var(--u) * 3.3); line-height: 1.2; padding: calc(var(--u) * 0.75) 0 calc(var(--u) * 0.75) calc(var(--u) * 3.6); opacity: 0.66; cursor: pointer; transition: opacity 0.16s ease; }
#ink-ui .menu.page li { font-size: calc(var(--u) * 2.7); padding-top: calc(var(--u) * 0.55); padding-bottom: calc(var(--u) * 0.55); }
#ink-ui .menu li.sel { opacity: 1; }
#ink-ui .menu.title li { opacity: 0.82; text-shadow: 0 0 calc(var(--u) * 0.5) rgba(226, 214, 186, 0.95), 0 0 calc(var(--u) * 1.4) rgba(226, 214, 186, 0.8); }
#ink-ui .menu.title li.sel { opacity: 1; }
#ink-ui .menu.title .sub { text-shadow: 0 0 calc(var(--u) * 0.6) rgba(226, 214, 186, 0.9); }
#ink-ui .menu li::before { content: ''; position: absolute; left: 0; top: 50%; width: calc(var(--u) * 2.5); height: calc(var(--u) * 1); margin-top: calc(var(--u) * -0.5); background: var(--stroke) center / 100% 100% no-repeat; opacity: 0; transform: scaleX(0.4); transform-origin: right; transition: opacity 0.16s ease, transform 0.2s ease; }
#ink-ui .menu li.sel::before { opacity: 1; transform: none; }
#ink-ui .menu li.row { display: flex; justify-content: space-between; align-items: center; gap: calc(var(--u) * 2); }
#ink-ui .menu li .bar { flex: none; width: calc(var(--u) * 24); height: calc(var(--u) * 2.2); position: relative; }
#ink-ui .menu li .bar i { position: absolute; left: 0; top: 50%; height: calc(var(--u) * 0.14); width: 100%; background: rgba(27, 23, 18, 0.35); }
#ink-ui .menu li .bar b { position: absolute; left: 0; top: 16%; bottom: 16%; background: var(--stroke) left center / 100% 100% no-repeat; }
#ink-ui .menu li .val { flex: none; min-width: calc(var(--u) * 6); text-align: right; }
#ink-ui .menu .poem { font-size: calc(var(--u) * 2.6); line-height: 1.45; margin: 0 0 calc(var(--u) * 2.2); cursor: default; opacity: 1; padding-left: 0; }
#ink-ui .menu .poem::before { display: none; }
#ink-ui .menu .poem b { font-style: normal; font-weight: 600; font-size: 0.86em; letter-spacing: 0.05em; color: #7c2415; }
#ink-ui .menu.page.wide .body { width: min(88%, calc(var(--u) * 150)); }
#ink-ui .menu .poems.cols { column-count: 3; column-gap: calc(var(--u) * 3); }
#ink-ui .menu .poems.cols .poem { font-size: calc(var(--u) * 2.05); line-height: 1.38; margin-bottom: calc(var(--u) * 1.6); break-inside: avoid; }
#ink-ui .credits { position: absolute; inset: 0; overflow: hidden; text-align: center; color: ${a}; opacity: 0; transition: opacity 1.4s ease; font-size: calc(var(--u) * 2.6); line-height: 1.7; }
#ink-ui .credits .roll { position: absolute; left: 0; right: 0; top: 100%; }
#ink-ui .credits h2 { margin: calc(var(--u) * 6) 0 calc(var(--u) * 1.2); font-weight: 400; font-size: calc(var(--u) * 2.1); letter-spacing: 0.16em; opacity: 0.6; }
#ink-ui .credits .ch i { opacity: 0.55; margin-right: 0.6em; }
#ink-ui .credits .ch small { opacity: 0.55; margin-left: 0.6em; font-size: 0.8em; }
#ink-ui .credits .end { position: absolute; inset: 0; display: grid; place-content: center; opacity: 0; transition: opacity 1.4s ease; }
#ink-ui .credits .end.on { opacity: 1; }
#ink-ui .credits.on { opacity: 1; }
#ink-ui .credits .name { font-size: calc(var(--u) * 7); line-height: 1.2; margin-bottom: calc(var(--u) * 2.5); filter: url(#ink-brush-pale); }
#ink-ui .credits .soft { opacity: 0.6; font-size: calc(var(--u) * 2.1); margin-top: calc(var(--u) * 4); }
`,u=`
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <filter id="ink-edge" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="4" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6"/>
  </filter>
  <filter id="ink-brush" x="-4%" y="-8%" width="108%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="7" result="warp"/>
    <feDisplacementMap in="SourceGraphic" in2="warp" scale="3.4" result="torn"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.016 0.42" numOctaves="2" seed="12" result="dry"/>
    <feColorMatrix in="dry" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.4 0 0 0 -1.98" result="streaks"/>
    <feComposite in="torn" in2="streaks" operator="out"/>
  </filter>
  <filter id="ink-brush-pale" x="-4%" y="-8%" width="108%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="3" result="warp"/>
    <feDisplacementMap in="SourceGraphic" in2="warp" scale="3" result="torn"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.014 0.4" numOctaves="2" seed="21" result="dry"/>
    <feColorMatrix in="dry" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.2 0 0 0 -1.9" result="streaks"/>
    <feComposite in="torn" in2="streaks" operator="out"/>
  </filter>
</defs></svg>`,d=(e,t,n,r)=>{let i=document.createElement(t);return n&&(i.className=n),r&&(i.innerHTML=r),e.appendChild(i),i},f=null;function p(e){return new Promise((t,n)=>{let r=new Image;r.onload=()=>t(r),r.onerror=()=>n(Error(`[hud] could not load ${e}`)),r.src=e})}function m(e,t){let n=d(e,`canvas`,`wash`);n.width=o,n.height=s;let r=n.getContext(`2d`),i=r.createImageData(o,s),a=i.data;for(let e=0;e<a.length;e+=4)a[e]=4,a[e+1]=3,a[e+2]=3;let c=document.createElement(`canvas`);c.width=o,c.height=s;let l=c.getContext(`2d`,{willReadFrequently:!0});l.drawImage(t,0,0,o,s);let u=l.getImageData(0,0,o,s).data,f=new Uint8Array(o*s);for(let e=0;e<f.length;e++)f[e]=u[e*4];let p=new Uint8Array(256),m=-1;return{canvas:n,draw(e){if(e===m)return;if(m=e,e<=0){n.style.display=`none`;return}n.style.display=`block`;let t=e>=1?2:-.04+e*1.18;for(let e=0;e<256;e++){let n=t-e/255,r=Math.min(Math.max(n/.016,0),1),i=Math.min(Math.max((n+.07)/.07,0),1)*.42;p[e]=Math.max(r,i)*255}for(let e=0;e<f.length;e++)a[e*4+3]=p[f[e]];r.putImageData(i,0,0)}}}function h(e,t){let n=f.menuBox;n.innerHTML=``,n.className=`menu ${t.kind}${t.kind===`title`?``:` dim`}${t.wide?` wide`:``}`;let r=d(n,`div`,`body`),i=d(r,`div`,`head`);d(i,`h1`,``,t.heading),t.kind===`title`&&t.heading===`Sumiro`&&d(i,`span`,`seal`),t.note&&d(r,`div`,`sub`,t.note);let a=d(r,`ul`);f.rows=[];for(let n of t.items){if(n.type===`text`){let e=d(a,`div`,n.columns?`poems cols`:`poems`);n.poems.length||d(e,`div`,`poem`,n.empty);for(let t of n.poems)d(e,`div`,`poem`,t.join(`<br>`));continue}let t=d(a,`li`),r={item:n,li:t};if(n.type===`slider`){t.classList.add(`row`),d(t,`span`,``,n.label);let i=d(t,`span`,`bar`,`<i></i><b></b>`);r.fill=i.querySelector(`b`),i.addEventListener(`click`,t=>{let a=i.getBoundingClientRect(),o=(t.clientX-a.left)/a.width,s=n.min+(n.max-n.min)*Math.min(Math.max(o,0),1);n.set(Math.round(s/n.step)*n.step),b(e,`menuMove`),g(r),t.stopPropagation()})}else n.type===`toggle`?(t.classList.add(`row`),d(t,`span`,``,n.label),r.val=d(t,`span`,`val`)):t.textContent=n.label;g(r);let i=f.rows.length;t.addEventListener(`pointerenter`,()=>_(e,i)),t.addEventListener(`click`,()=>{_(e,i),v(e,r)}),f.rows.push(r)}f.def=t,_(e,0,!0),f.justOpened=!0,n.getBoundingClientRect(),n.classList.add(`on`)}function g(e){let{item:t}=e;if(t.type===`slider`){let n=(t.get()-t.min)/(t.max-t.min);e.fill.style.width=`${n*100}%`}else t.type===`toggle`&&(e.val.textContent=t.get()?`on`:`off`)}function _(e,t,n){if(!f.rows.length)return;let r=f.rows.length,i=(t%r+r)%r;(i!==f.sel||n)&&(f.sel=i,f.rows.forEach((e,t)=>e.li.classList.toggle(`sel`,t===i)),n||b(e,`menuMove`))}function v(e,t){let{item:n}=t;n.type!==`slider`&&(n.type===`toggle`?(n.set(!n.get()),g(t),b(e,`menuMove`)):(b(e,`menuConfirm`),n.on?.()))}function y(e,t,n){let{item:r}=t;if(r.type===`slider`){let i=Math.min(Math.max(r.get()+n*r.step,r.min),r.max);r.set(Math.round(i/r.step)*r.step),g(t),b(e,`menuMove`)}else r.type===`toggle`&&(r.set(!r.get()),g(t),b(e,`menuMove`))}var b=(e,t)=>e.registry.set(`audio.cue`,{name:t});function x(e){if(!f.def)return;if(f.justOpened){f.justOpened=!1;return}let{menu:t}=e.input;t.up&&_(e,f.sel-1),t.down&&_(e,f.sel+1);let n=f.rows[f.sel];n&&t.left&&y(e,n,-1),n&&t.right&&y(e,n,1),n&&t.confirm?v(e,n):t.back&&f.def?.back&&(b(e,`menuBack`),f.def.back())}function S(e){let t=f.vitals;if(!e){f.vitalsShown=null,t.classList.remove(`on`);return}let n=`${e.strokes}/${e.maxStrokes}/${e.drinks}/${e.maxDrinks}/${!!e.abilities?.inkStep}`;if(n!==f.vitalsShown){f.vitalsShown=n,f.strokes.innerHTML=``;for(let t=0;t<e.maxStrokes;t++){let n=d(f.strokes,`img`,t<e.strokes?``:`lost`);n.src=f.strokeUrls[t%f.strokeUrls.length],n.alt=``}f.gourds.innerHTML=``;for(let t=0;t<e.maxDrinks;t++){let n=d(f.gourds,`img`,t<e.drinks?``:`empty`);n.src=f.gourdUrl,n.alt=``}f.ink.classList.toggle(`on`,!!e.abilities?.inkStep)}}function C(e,t){t?(e.innerHTML=`<span>${t.replace(/[<>&]/g,``).replace(/(^|\. )([^.]+?) {2}/g,`$1<b>$2</b> `)}</span>`,e.classList.add(`on`)):e.classList.remove(`on`)}async function w(e){if(e.input.scripted)return;let t=document.createElement(`style`);t.textContent=l,document.head.appendChild(t);let n=d(document.body,`div`);n.id=`ink-ui`,n.innerHTML=u;let r=t=>e.assets.url(t),i=[1,2,3,4,5].map(e=>r(`ui/stroke_${e}.png`)),[a]=await Promise.all([p(r(`ui/wash_map.png`)),...i.map(p),p(r(`ui/gourd.png`))]);n.style.setProperty(`--stroke`,`url("${i[0]}")`);let o=d(n,`div`,`veil`),s=d(n,`div`,`vitals`),c=d(s,`div`,`strokes`),g=d(s,`div`,`lower`),_=d(g,`div`,`gourds`);g.insertAdjacentHTML(`beforeend`,`<svg class="ink" viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" pathLength="100"/></svg>`);let v=d(n,`div`,`line hint`),y=d(n,`div`,`line prompt`),b=d(n,`div`,`note`),x=d(n,`div`,`menu`),w=m(n,a),T=d(n,`div`,`closing`),E=d(n,`div`,`card`,`<div class="num"></div><div class="name"></div><div class="sub"></div><span class="seal"></span><div class="tally"></div>`),D=d(n,`div`,`credits`,`<div class="roll"></div><div class="end"><div class="name">Sumiro</div><div>The road goes on past this page.<br>The rest of it is still wet.</div><div class="soft">Enter</div></div>`);f={root:n,style:t,veil:o,vitals:s,strokes:c,gourds:_,ink:g.querySelector(`svg.ink`),inkCircle:g.querySelector(`svg.ink circle`),hint:v,prompt:y,note:b,menuBox:x,wash:w,card:E,closing:T,credits:D,rollAnim:null,strokeUrls:i,gourdUrl:r(`ui/gourd.png`),def:null,rows:[],sel:0,justOpened:!1,p:0,tween:null,timers:[],hintT:0,noteT:0,vitalsT:0,vitalsShown:null,playing:!1,chargeShown:-1,lastV:null};let O=e=>new Promise(t=>f.timers.push({left:e,resolve:t}));e.registry.set(`hud`,{wash(e,t){return f.tween?.resolve(),new Promise(n=>{f.tween={from:f.p,to:e,t:0,seconds:t,resolve:n}})},wait:O,revealVista(){f.veil.style.opacity=0,O(1.8).then(()=>f.veil.remove())},menu(t){h(e,t)},closeMenu(){f.def=null,f.rows=[],f.menuBox.classList.remove(`on`)},showCard(e){f.card.querySelector(`.num`).textContent=e.numeral,f.card.querySelector(`.name`).textContent=e.title,f.card.querySelector(`.sub`).textContent=e.line??``,f.card.querySelector(`.tally`).textContent=e.tally??``,f.card.classList.add(`on`)},hideCard(){f.card.classList.remove(`on`)},showClosing(e){f.closing.textContent=e,f.closing.classList.add(`on`)},hideClosing(){f.closing.classList.remove(`on`)},showCredits(e){let t=f.credits.querySelector(`.roll`),n=f.credits.querySelector(`.end`),r=e.chapters.map(e=>`<div class="ch"><i>${e.numeral}</i>${e.title}<small>${e.found} of ${e.total}</small></div>`).join(``),i=e.found>=e.total?`<div>Every scroll on the mountain, found.</div>`:``;t.innerHTML=`<h2>THE ROAD</h2>${r}<h2>SCROLLS</h2><div>${e.found} of ${e.total}</div>${i}<h2>TIME ON THE ROAD</h2><div>${e.minutes} minute${e.minutes===1?``:`s`}</div><h2>SUMIRO</h2>${e.lines.map(e=>`<div>${e}</div>`).join(``)}`,n.classList.remove(`on`),f.credits.classList.add(`on`);let a=f.credits.clientHeight+t.offsetHeight;f.rollAnim=t.animate([{transform:`translateY(0)`},{transform:`translateY(${-a}px)`}],{duration:3e4,fill:`forwards`}),f.rollAnim.onfinish=()=>n.classList.add(`on`)},creditsNext(){let e=f.credits.querySelector(`.end`);return e.classList.contains(`on`)?!0:(f.rollAnim?.finish(),e.classList.add(`on`),!1)},hideCredits(){f.credits.classList.remove(`on`),f.rollAnim?.cancel(),f.rollAnim=null},setPlaying(e){f.playing=e,e||(C(f.prompt,null),C(f.hint,null),f.hintT=0)},setVitals(e){f.lastV=e,f.vitalsT=0,S(e)},hint(e,{ms:t=3500}={}){C(f.hint,e),f.hintT=t/1e3},prompt(e){C(f.prompt,e)},note(e,t){f.note.innerHTML=`${e.join(`<br>`)}${t?`<small>${t}</small>`:``}`,f.note.classList.add(`on`),f.noteT=8}})}function T(e,t){if(f){if(e>0){if(f.tween){let t=f.tween;t.t+=e;let n=t.seconds>0?Math.min(t.t/t.seconds,1):1;f.p=t.from+(t.to-t.from)*(n*n*(3-2*n)),n>=1&&(f.tween=null,t.resolve())}for(let t=f.timers.length-1;t>=0;t--)f.timers[t].left-=e,f.timers[t].left<=0&&f.timers.splice(t,1)[0].resolve();f.hintT>0&&(f.hintT-=e,f.hintT<=0&&C(f.hint,null)),f.noteT>0&&(f.noteT-=e,f.noteT<=0&&f.note.classList.remove(`on`))}if(f.wash.draw(Math.max(f.p,t.registry.get(`player.fade`)??0)),e>0&&x(t),f.lastV&&t.registry.get(`game.state`)===`PLAY`){let n=f.lastV.strokes<=2;f.vitalsT+=e,f.vitals.classList.toggle(`on`,n||f.vitalsT<c);let r=t.registry.get(`player.inkCharge`)??1;r!==f.chargeShown&&(f.chargeShown=r,f.inkCircle.setAttribute(`stroke-dasharray`,`${r*100} 100`),f.ink.classList.toggle(`full`,r>=1),r<1&&(f.vitalsT=Math.min(f.vitalsT,3.5)))}else f.vitals.classList.remove(`on`)}}function E(e){f&&=(f.root.remove(),f.style.remove(),e.registry.delete(`hud`),null)}export{r as budgetMs,E as dispose,w as init,e as name,t as order,T as update,n as whilePaused};