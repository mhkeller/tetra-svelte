var app=function(){"use strict";function e(){}function t(e){return e()}function n(){return Object.create(null)}function o(e){e.forEach(t)}function i(e){return"function"==typeof e}function r(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function a(e){return null==e?"":e}function c(e,t){e.appendChild(t)}function d(e,t,n){e.insertBefore(t,n||null)}function s(e){e.parentNode.removeChild(e)}function u(e){return document.createElement(e)}function l(){return e=" ",document.createTextNode(e);var e}function h(e,t,n,o){return e.addEventListener(t,n,o),()=>e.removeEventListener(t,n,o)}function f(e,t,n){null==n?e.removeAttribute(t):e.setAttribute(t,n)}function p(e,t,n,o){e.style.setProperty(t,n,o?"important":"")}let g;function m(e){g=e}function v(e){(function(){if(!g)throw new Error("Function called outside component initialization");return g})().$$.on_mount.push(e)}const $=[],w=[],b=[],y=[],_=Promise.resolve();let x=!1;function O(e){b.push(e)}function q(){const e=new Set;do{for(;$.length;){const e=$.shift();m(e),C(e.$$)}for(;w.length;)w.pop()();for(let t=0;t<b.length;t+=1){const n=b[t];e.has(n)||(n(),e.add(n))}b.length=0}while($.length);for(;y.length;)y.pop()();x=!1}function C(e){e.fragment&&(e.update(e.dirty),o(e.before_update),e.fragment.p(e.dirty,e.ctx),e.dirty=null,e.after_update.forEach(O))}const E=new Set;let k;function j(e,t){e&&e.i&&(E.delete(e),e.i(t))}function A(e,n,r){const{fragment:a,on_mount:c,on_destroy:d,after_update:s}=e.$$;a.m(n,r),O(()=>{const n=c.map(t).filter(i);d?d.push(...n):o(n),e.$$.on_mount=[]}),s.forEach(O)}function H(e,t){e.$$.fragment&&(o(e.$$.on_destroy),e.$$.fragment.d(t),e.$$.on_destroy=e.$$.fragment=null,e.$$.ctx={})}function M(e,t){e.$$.dirty||($.push(e),x||(x=!0,_.then(q)),e.$$.dirty=n()),e.$$.dirty[t]=!0}function N(t,i,r,a,c,d){const s=g;m(t);const u=i.props||{},l=t.$$={fragment:null,ctx:null,props:d,update:e,not_equal:c,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(s?s.$$.context:[]),callbacks:n(),dirty:null};let h=!1;var f;l.ctx=r?r(t,u,(e,n,o=n)=>(l.ctx&&c(l.ctx[e],l.ctx[e]=o)&&(l.bound[e]&&l.bound[e](o),h&&M(t,e)),n)):u,l.update(),h=!0,o(l.before_update),l.fragment=a(l.ctx),i.target&&(i.hydrate?l.fragment.l((f=i.target,Array.from(f.childNodes))):l.fragment.c(),i.intro&&j(t.$$.fragment),A(t,i.target,i.anchor),q()),m(s)}class P{$destroy(){H(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(){}}function S(t){var n,i,r,g,m,v,$,w,b,y,_,x,O;return{c(){n=u("video"),r=l(),g=u("canvas"),m=l(),v=u("div"),$=l(),w=u("ul"),b=u("li"),_=u("li"),f(n,"id","video"),f(n,"width",t.w),f(n,"height",t.h),n.autoplay=!0,n.playsInline=!0,n.muted=!0,f(n,"class",i=a(t.cameraOn?"":"hidden")+" svelte-92qeeg"),f(g,"id","video-capture-canvas"),f(g,"width",t.w),f(g,"height",t.h),f(g,"class","svelte-92qeeg"),f(v,"id","video-overlay"),p(v,"width",t.w+"px"),p(v,"height",t.h+"px"),f(v,"class","svelte-92qeeg"),f(b,"id","retake-btn"),f(b,"class",y="toolbar-btn "+(t.cameraOn?"hidden":"")+" svelte-92qeeg"),f(_,"id","capture-btn"),f(_,"class",x="toolbar-btn "+(t.cameraOn?"":"hidden")+" svelte-92qeeg"),f(w,"class","toolbar svelte-92qeeg"),O=[h(b,"click",t.reshowCamera),h(_,"click",t.capture)]},m(e,o){d(e,n,o),t.video_1_binding(n),d(e,r,o),d(e,g,o),t.canvas_binding(g),d(e,m,o),d(e,v,o),d(e,$,o),d(e,w,o),c(w,b),c(w,_)},p(e,t){e.w&&f(n,"width",t.w),e.h&&f(n,"height",t.h),e.cameraOn&&i!==(i=a(t.cameraOn?"":"hidden")+" svelte-92qeeg")&&f(n,"class",i),e.w&&f(g,"width",t.w),e.h&&f(g,"height",t.h),e.w&&p(v,"width",t.w+"px"),e.h&&p(v,"height",t.h+"px"),e.cameraOn&&y!==(y="toolbar-btn "+(t.cameraOn?"hidden":"")+" svelte-92qeeg")&&f(b,"class",y),e.cameraOn&&x!==(x="toolbar-btn "+(t.cameraOn?"":"hidden")+" svelte-92qeeg")&&f(_,"class",x)},i:e,o:e,d(e){e&&s(n),t.video_1_binding(null),e&&(s(r),s(g)),t.canvas_binding(null),e&&(s(m),s(v),s($),s(w)),o(O)}}}function I(e,t,n){let o,i,r,a=window.innerHeight,c=!0;const d={video:{height:a,facingMode:"environment"},audio:!1};return v(()=>{!function(){const e=e=>console.log(e);navigator.mediaDevices.getUserMedia(d).then(e=>(n("video",o.srcObject=e,o),e)).then(()=>new Promise(e=>(n("video",o.onloadedmetadata=e,o),e))).then(()=>{e("Success: "+o.videoWidth+"x"+o.videoHeight),n("w",r=o.videoWidth),n("h",a=o.videoHeight)}).catch(e)}();i.getContext("2d")}),{video:o,captureCanvas:i,h:a,w:r,cameraOn:c,reshowCamera:function(){n("cameraOn",c=!0),i.getContext("2d").clearRect(0,0,r,a)},capture:function(){n("cameraOn",c=!c),i.getContext("2d").drawImage(o,0,0,r,a),showCamera=!1},video_1_binding:function(e){w[e?"unshift":"push"](()=>{n("video",o=e)})},canvas_binding:function(e){w[e?"unshift":"push"](()=>{n("captureCanvas",i=e)})}}}class L extends P{constructor(e){super(),N(this,e,I,S,r,[])}}function W(t){var n,o=new L({});return{c(){o.$$.fragment.c()},m(e,t){A(o,e,t),n=!0},p:e,i(e){n||(j(o.$$.fragment,e),n=!0)},o(e){!function(e,t,n,o){if(e&&e.o){if(E.has(e))return;E.add(e),k.c.push(()=>{E.delete(e),o&&(n&&e.d(1),o())}),e.o(t)}}(o.$$.fragment,e),n=!1},d(e){H(o,e)}}}return new class extends P{constructor(e){super(),N(this,e,null,W,r,[])}}({target:document.body,props:{name:"world"}})}();
//# sourceMappingURL=bundle.js.map
