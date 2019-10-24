var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function r(t){return"function"==typeof t}function a(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function i(t,e){t.appendChild(e)}function s(t,e,n){t.insertBefore(e,n||null)}function c(t){t.parentNode.removeChild(t)}function l(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function u(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function f(){return d(" ")}function g(){return d("")}function h(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function m(t,e,n){null==n?t.removeAttribute(e):t.setAttribute(e,n)}function p(t,e,n,o){t.style.setProperty(e,n,o?"important":"")}let b;function v(t){b=t}const x=[],$=[],w=[],y=[],_=Promise.resolve();let k=!1;function P(t){w.push(t)}function D(){const t=new Set;do{for(;x.length;){const t=x.shift();v(t),j(t.$$)}for(;$.length;)$.pop()();for(let e=0;e<w.length;e+=1){const n=w[e];t.has(n)||(n(),t.add(n))}w.length=0}while(x.length);for(;y.length;)y.pop()();k=!1}function j(t){t.fragment&&(t.update(t.dirty),o(t.before_update),t.fragment.p(t.dirty,t.ctx),t.dirty=null,t.after_update.forEach(P))}const T=new Set;let U;function N(){U={r:0,c:[],p:U}}function R(){U.r||o(U.c),U=U.p}function E(t,e){t&&t.i&&(T.delete(t),t.i(e))}function O(t,e,n,o){if(t&&t.o){if(T.has(t))return;T.add(t),U.c.push(()=>{T.delete(t),o&&(n&&t.d(1),o())}),t.o(e)}}function A(t,n,a){const{fragment:i,on_mount:s,on_destroy:c,after_update:l}=t.$$;i.m(n,a),P(()=>{const n=s.map(e).filter(r);c?c.push(...n):o(n),t.$$.on_mount=[]}),l.forEach(P)}function S(t,e){t.$$.fragment&&(o(t.$$.on_destroy),t.$$.fragment.d(e),t.$$.on_destroy=t.$$.fragment=null,t.$$.ctx={})}function B(t,e){t.$$.dirty||(x.push(t),k||(k=!0,_.then(D)),t.$$.dirty=n()),t.$$.dirty[e]=!0}function C(e,r,a,i,s,c){const l=b;v(e);const u=r.props||{},d=e.$$={fragment:null,ctx:null,props:c,update:t,not_equal:s,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(l?l.$$.context:[]),callbacks:n(),dirty:null};let f=!1;var g;d.ctx=a?a(e,u,(t,n,o=n)=>(d.ctx&&s(d.ctx[t],d.ctx[t]=o)&&(d.bound[t]&&d.bound[t](o),f&&B(e,t)),n)):u,d.update(),f=!0,o(d.before_update),d.fragment=i(d.ctx),r.target&&(r.hydrate?d.fragment.l((g=r.target,Array.from(g.childNodes))):d.fragment.c(),r.intro&&E(e.$$.fragment),A(e,r.target,r.anchor),D()),v(l)}class I{$destroy(){S(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(){}}const L=[];const W=function(e,n=t){let o;const r=[];function i(t){if(a(e,t)&&(e=t,o)){const t=!L.length;for(let t=0;t<r.length;t+=1){const n=r[t];n[1](),L.push(n,e)}if(t){for(let t=0;t<L.length;t+=2)L[t][0](L[t+1]);L.length=0}}}return{set:i,update:function(t){i(t(e))},subscribe:function(a,s=t){const c=[a,s];return r.push(c),1===r.length&&(o=n(i)||t),a(e),()=>{const t=r.indexOf(c);-1!==t&&r.splice(t,1),0===r.length&&(o(),o=null)}}}}("");function F(e){var n,o,r;return{c(){m(n=u("div"),"class",o="box "+(e.box.description===e.activeWord?"active":"")+" svelte-14fm1i1"),p(n,"left",e.box.boundingPoly.vertices[0].x+"px"),p(n,"top",e.box.boundingPoly.vertices[0].y+"px"),p(n,"width",e.box.boundingPoly.vertices[1].x-e.box.boundingPoly.vertices[0].x+"px"),p(n,"height",e.box.boundingPoly.vertices[2].y-e.box.boundingPoly.vertices[0].y+"px"),r=h(n,"click",e.sendForTranslation)},m(t,e){s(t,n,e)},p(t,e){(t.box||t.activeWord)&&o!==(o="box "+(e.box.description===e.activeWord?"active":"")+" svelte-14fm1i1")&&m(n,"class",o),t.box&&(p(n,"left",e.box.boundingPoly.vertices[0].x+"px"),p(n,"top",e.box.boundingPoly.vertices[0].y+"px"),p(n,"width",e.box.boundingPoly.vertices[1].x-e.box.boundingPoly.vertices[0].x+"px"),p(n,"height",e.box.boundingPoly.vertices[2].y-e.box.boundingPoly.vertices[0].y+"px"))},i:t,o:t,d(t){t&&c(n),r()}}}function q(t,e,n){let o,{box:r}=e;return W.subscribe(t=>{n("activeWord",o=t)}),t.$set=(t=>{"box"in t&&n("box",r=t.box)}),{box:r,activeWord:o,sendForTranslation:function(){W.set(r.description)}}}class H extends I{constructor(t){super(),C(this,t,q,F,a,["box"])}}function J(t,e,n){const o=Object.create(t);return o.translation=e[n],o}function M(t){var e,n,o,r,a,l,d,g=t.translations&&V(t);return{c(){e=u("div"),n=u("input"),o=f(),r=u("div"),g&&g.c(),a=f(),l=u("div"),m(n,"type","search"),n.value=t.wtt,m(n,"class","svelte-17m947x"),m(r,"class","translated-text svelte-17m947x"),m(l,"class","close-btn svelte-17m947x"),m(e,"class","translate-drawer svelte-17m947x"),d=h(l,"click",t.destroy)},m(t,c){s(t,e,c),i(e,n),i(e,o),i(e,r),g&&g.m(r,null),i(e,a),i(e,l)},p(t,e){t.wtt&&(n.value=e.wtt),e.translations?g?g.p(t,e):((g=V(e)).c(),g.m(r,null)):g&&(g.d(1),g=null)},d(t){t&&c(e),g&&g.d(),d()}}}function V(t){var e;let n=t.translations,o=[];for(let e=0;e<n.length;e+=1)o[e]=X(J(t,n,e));return{c(){for(let t=0;t<o.length;t+=1)o[t].c();e=g()},m(t,n){for(let e=0;e<o.length;e+=1)o[e].m(t,n);s(t,e,n)},p(t,r){if(t.translations){let a;for(n=r.translations,a=0;a<n.length;a+=1){const i=J(r,n,a);o[a]?o[a].p(t,i):(o[a]=X(i),o[a].c(),o[a].m(e.parentNode,e))}for(;a<o.length;a+=1)o[a].d(1);o.length=n.length}},d(t){l(o,t),t&&c(e)}}}function X(t){var e,n,o=t.translation.translatedText+"";return{c(){e=u("div"),n=d(o),m(e,"class","translated-word")},m(t,o){s(t,e,o),i(e,n)},p(t,e){var r,a;t.translations&&o!==(o=e.translation.translatedText+"")&&(a=""+(a=o),(r=n).data!==a&&(r.data=a))},d(t){t&&c(e)}}}function z(e){var n,o=e.wtt&&M(e);return{c(){o&&o.c(),n=g()},m(t,e){o&&o.m(t,e),s(t,n,e)},p(t,e){e.wtt?o?o.p(t,e):((o=M(e)).c(),o.m(n.parentNode,n)):o&&(o.d(1),o=null)},i:t,o:t,d(t){o&&o.d(t),t&&c(n)}}}const G="fr",K="en";function Q(t,e,n){let o,r;const a=window.localStorage.getItem("translate_key");return console.log("key",a),W.subscribe(t=>{n("wtt",o=t),async function(t){const e=await window.fetch(`https://translation.googleapis.com/language/translate/v2?q=${t}&source=${G}&target=${K}&key=${a}`,{method:"POST"}),o=await e.json();console.log(o),n("translations",r=o.data.translations)}(t)}),{wtt:o,translations:r,destroy:function(){n("wtt",o=null)}}}class Y extends I{constructor(t){super(),C(this,t,Q,z,a,[])}}function Z(t,e,n){const o=Object.create(t);return o.box=e[n],o}function tt(t){var e,n,o,r;return{c(){e=u("img"),n=f(),o=u("canvas"),m(e,"src",t.imageData),m(e,"alt","uploaded image"),m(e,"class","svelte-19jdsu1"),m(o,"class","svelte-19jdsu1"),r=h(e,"load",t.setDimensions)},m(r,a){s(r,e,a),t.img_binding(e),s(r,n,a),s(r,o,a),t.canvas_1_binding(o)},p(t,n){t.imageData&&m(e,"src",n.imageData)},d(a){a&&c(e),t.img_binding(null),a&&(c(n),c(o)),t.canvas_1_binding(null),r()}}}function et(t){var e,n;let o=t.boxes,r=[];for(let e=0;e<o.length;e+=1)r[e]=ot(Z(t,o,e));const a=t=>O(r[t],1,1,()=>{r[t]=null});return{c(){for(let t=0;t<r.length;t+=1)r[t].c();e=g()},m(t,o){for(let e=0;e<r.length;e+=1)r[e].m(t,o);s(t,e,o),n=!0},p(t,n){if(t.boxes){let i;for(o=n.boxes,i=0;i<o.length;i+=1){const a=Z(n,o,i);r[i]?(r[i].p(t,a),E(r[i],1)):(r[i]=ot(a),r[i].c(),E(r[i],1),r[i].m(e.parentNode,e))}for(N(),i=o.length;i<r.length;i+=1)a(i);R()}},i(t){if(!n){for(let t=0;t<o.length;t+=1)E(r[t]);n=!0}},o(t){r=r.filter(Boolean);for(let t=0;t<r.length;t+=1)O(r[t]);n=!1},d(t){l(r,t),t&&c(e)}}}function nt(t){var e,n=new H({props:{box:t.box}});return{c(){n.$$.fragment.c()},m(t,o){A(n,t,o),e=!0},p(t,e){var o={};t.boxes&&(o.box=e.box),n.$set(o)},i(t){e||(E(n.$$.fragment,t),e=!0)},o(t){O(n.$$.fragment,t),e=!1},d(t){S(n,t)}}}function ot(t){var e,n,o=!t.box.locale&&nt(t);return{c(){o&&o.c(),e=g()},m(t,r){o&&o.m(t,r),s(t,e,r),n=!0},p(t,n){n.box.locale?o&&(N(),O(o,1,1,()=>{o=null}),R()):o?(o.p(t,n),E(o,1)):((o=nt(n)).c(),E(o,1),o.m(e.parentNode,e))},i(t){n||(E(o),n=!0)},o(t){O(o),n=!1},d(t){o&&o.d(t),t&&c(e)}}}function rt(t){var e,n=new Y({});return{c(){n.$$.fragment.c()},m(t,o){A(n,t,o),e=!0},i(t){e||(E(n.$$.fragment,t),e=!0)},o(t){O(n.$$.fragment,t),e=!1},d(t){S(n,t)}}}function at(t){var e,n,o,r,a,l,d,g,b,v=t.imageData&&tt(t),x=t.boxes&&et(t),$=t.wtt&&rt();return{c(){e=u("div"),v&&v.c(),n=f(),o=u("div"),x&&x.c(),r=f(),$&&$.c(),a=f(),l=u("div"),d=u("input"),m(o,"class","image-overlay svelte-19jdsu1"),m(e,"class","image-container svelte-19jdsu1"),p(e,"width",t.width+"px"),p(e,"height",t.height+"px"),m(d,"type","file"),m(d,"capture","camera"),m(d,"accept","image/*"),m(d,"name","cameraInput"),m(d,"class","svelte-19jdsu1"),m(l,"class","open-camera svelte-19jdsu1"),b=h(d,"change",t.input_change_handler)},m(t,c){s(t,e,c),v&&v.m(e,null),i(e,n),i(e,o),x&&x.m(o,null),s(t,r,c),$&&$.m(t,c),s(t,a,c),s(t,l,c),i(l,d),g=!0},p(t,r){r.imageData?v?v.p(t,r):((v=tt(r)).c(),v.m(e,n)):v&&(v.d(1),v=null),r.boxes?x?(x.p(t,r),E(x,1)):((x=et(r)).c(),E(x,1),x.m(o,null)):x&&(N(),O(x,1,1,()=>{x=null}),R()),g&&!t.width||p(e,"width",r.width+"px"),g&&!t.height||p(e,"height",r.height+"px"),r.wtt?$?E($,1):(($=rt()).c(),E($,1),$.m(a.parentNode,a)):$&&(N(),O($,1,1,()=>{$=null}),R())},i(t){g||(E(x),E($),g=!0)},o(t){O(x),O($),g=!1},d(t){t&&c(e),v&&v.d(),x&&x.d(),t&&c(r),$&&$.d(t),t&&(c(a),c(l)),b()}}}const it="fr";function st(t,e,n){let o,r,a,i,s,c,l,u;const d=window.localStorage.getItem("ocr_key");W.subscribe(t=>{n("wtt",c=t)});const f=new window.FileReader,g=new window.FileReader;function h(){(async()=>{console.log("srcoriientation",u);const t=function(t,e,r,a){const i=l.getContext("2d");a>4&&a<9?(n("canvas",l.width=r,l),n("canvas",l.height=e,l)):(n("canvas",l.width=e,l),n("canvas",l.height=r,l));switch(a){case 2:i.transform(-1,0,0,1,e,0);break;case 3:i.transform(-1,0,0,-1,e,r);break;case 4:i.transform(1,0,0,-1,0,r);break;case 5:i.transform(0,1,1,0,0,0);break;case 6:i.transform(0,1,-1,0,r,0);break;case 7:i.transform(0,-1,-1,0,r,e);break;case 8:i.transform(0,-1,1,0,0,e)}return i.drawImage(o,0,0,e,r),l.toDataURL()}(0,r,a,u).split(",")[1],e=await window.fetch(`https://vision.googleapis.com/v1/images:annotate?key=${d}`,{method:"POST",body:JSON.stringify({requests:[{image:{content:t},features:[{type:"TEXT_DETECTION"}],imageContext:{languageHints:[it]}}]})}),i=await e.json();console.log(i),n("boxes",s=i.responses[0].textAnnotations)})()}n("fileReaderBase64",g.onload=function(){n("imageData",i=g.result),console.log("loaded")},g),n("fileReader",f.onload=function(t){var e=new DataView(t.target.result);if(65496===e.getUint16(0,!1)){for(var n=e.byteLength,o=2;o<n;){var r=e.getUint16(o,!1);if(o+=2,65505===r){if(1165519206!==e.getUint32(o+=2,!1))return void(u=-1);var a=18761===e.getUint16(o+=6,!1);o+=e.getUint32(o+4,a);var i=e.getUint16(o,a);o+=2;for(var s=0;s<i;s++)if(274===e.getUint16(o+12*s,a))return void(u=e.getUint16(o+12*s+8,a))}else{if(65280!=(65280&r))break;o+=e.getUint16(o,!1)}}u=-1}else u=-2},f);let m,p=[];return t.$$.update=((t={files:1,file:1,fileReader:1,fileReaderBase64:1})=>{t.files&&n("file",m=p[0]),(t.file||t.fileReader)&&m&&f.readAsArrayBuffer(m.slice(0,65536)),(t.file||t.fileReaderBase64)&&m&&g.readAsDataURL(m)}),{image:o,width:r,height:a,imageData:i,boxes:s,wtt:c,canvas:l,setDimensions:function(){console.log("setting dimensions"),n("width",({width:r,height:a}=this),r,n("height",a)),h()},files:p,img_binding:function(t){$[t?"unshift":"push"](()=>{n("image",o=t)})},canvas_1_binding:function(t){$[t?"unshift":"push"](()=>{n("canvas",l=t)})},input_change_handler:function(){p=this.files,n("files",p)}}}class ct extends I{constructor(t){super(),C(this,t,st,at,a,[])}}function lt(e){var n,o=new ct({});return{c(){o.$$.fragment.c()},m(t,e){A(o,t,e),n=!0},p:t,i(t){n||(E(o.$$.fragment,t),n=!0)},o(t){O(o.$$.fragment,t),n=!1},d(t){S(o,t)}}}return new class extends I{constructor(t){super(),C(this,t,null,lt,a,[])}}({target:document.body,props:{name:"world"}})}();
//# sourceMappingURL=bundle.js.map
