import{t as i,v as s,x as t,d as B,c as h,y as w,f as o,A as n,C as l,k as b,B as c,U as f,E as u,$ as _}from"./vendor-BNqbqwWu.js";import{S as V,h as y,G as z,V as j,J as L,Y as A}from"./ui-2-TKPCZG.js";import{r as T}from"./index-CAmoog65.js";function U(p,m){return s(),i("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor","aria-hidden":"true","data-slot":"icon"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"}),t("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M6 6h.008v.008H6V6Z"})])}const $={class:"fixed inset-0 z-[9999] flex items-center justify-center p-4"},O={class:"flex items-center justify-center w-full h-full"},D={class:"flex items-start justify-between mb-3 pb-2 border-b border-gray-100 flex-shrink-0"},M={class:"flex-1 overflow-y-auto overflow-x-hidden mb-2 w-full"},N={key:1,class:"flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 flex-shrink-0"},S=["disabled"],H=["disabled"],E={key:0,class:"inline-flex items-center justify-center"},G={key:1},q=B({__name:"AdminModal",props:{isOpen:{type:Boolean},title:{},description:{},size:{default:"md"},showCloseButton:{type:Boolean,default:!0},showActions:{type:Boolean,default:!0},showCancelButton:{type:Boolean,default:!0},showConfirmButton:{type:Boolean,default:!0},cancelText:{default:"Отмена"},confirmText:{default:"Подтвердить"},loadingText:{default:"Загрузка..."},isLoading:{type:Boolean,default:!1},isConfirmDisabled:{type:Boolean,default:!1},confirmVariant:{default:"primary"},persistent:{type:Boolean,default:!1}},emits:["update:isOpen","close","cancel","confirm"],setup(p,{emit:m}){const a=p,d=m,v=h(()=>`${`
    w-[80vw] max-w-[360px] max-h-[80vh] 
    overflow-hidden
    bg-white rounded-lg shadow-2xl
    p-2.5 sm:p-3
    transform transition-all duration-300
    focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary
    box-border
    flex flex-col
  `.replace(/\s+/g," ").trim()} ${{sm:"sm:w-[90vw]",md:"sm:w-[90vw]",lg:"sm:w-[90vw]",xl:"sm:w-[90vw]","2xl":"sm:w-[90vw]"}[a.size]}`),x=h(()=>{const e=`
    w-full sm:w-auto px-6 py-3 text-base font-medium rounded-lg
    focus:outline-none focus:ring-2 focus:ring-offset-1
    transition-all duration-200 touch-manipulation
    disabled:opacity-50 disabled:cursor-not-allowed
    min-w-[120px] justify-center inline-flex items-center
  `.replace(/\s+/g," ").trim(),r={primary:`
      bg-brand-dark text-white shadow-lg
      hover:bg-brand-dark/90 hover:shadow-xl
      focus:ring-brand-primary focus:ring-opacity-50
      active:bg-brand-dark/95 active:shadow-md
    `.replace(/\s+/g," ").trim(),danger:`
      bg-red-600 text-white shadow-lg
      hover:bg-red-700 hover:shadow-xl
      focus:ring-red-300 focus:ring-opacity-50
      active:bg-red-800 active:shadow-md
    `.replace(/\s+/g," ").trim(),success:`
      bg-green-600 text-white shadow-lg
      hover:bg-green-700 hover:shadow-xl
      focus:ring-green-300 focus:ring-opacity-50
      active:bg-green-800 active:shadow-md
    `.replace(/\s+/g," ").trim()};return`${e} ${r[a.confirmVariant]}`});function g(){a.persistent&&a.isLoading||(d("update:isOpen",!1),d("close"))}function C(){a.isLoading||(d("update:isOpen",!1),d("cancel"))}function k(){a.isLoading||a.isConfirmDisabled||d("confirm")}return(e,r)=>(s(),w(o(V),{show:e.isOpen,as:"template"},{default:n(()=>[l(o(A),{onClose:g},{default:n(()=>[l(o(y),{enter:"duration-300 ease-out","enter-from":"opacity-0","enter-to":"opacity-100",leave:"duration-200 ease-in","leave-from":"opacity-100","leave-to":"opacity-0"},{default:n(()=>[...r[0]||(r[0]=[t("div",{class:"fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]","aria-hidden":"true"},null,-1)])]),_:1}),t("div",$,[t("div",O,[l(o(y),{enter:"duration-300 ease-out","enter-from":"opacity-0 scale-95","enter-to":"opacity-100 scale-100",leave:"duration-200 ease-in","leave-from":"opacity-100 scale-100","leave-to":"opacity-0 scale-95"},{default:n(()=>[l(o(z),{class:b(v.value)},{default:n(()=>[t("div",D,[l(o(j),{class:"text-base sm:text-lg text-brand-dark leading-tight pr-4 font-primary font-normal uppercase",style:{"letter-spacing":"0.05em"}},{default:n(()=>[f(u(e.title),1)]),_:1}),e.showCloseButton?(s(),i("button",{key:0,onClick:g,class:"flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 touch-manipulation","aria-label":"Закрыть модальное окно"},[l(o(T),{class:"w-6 h-6"})])):c("",!0)]),e.description?(s(),w(o(L),{key:0,class:"mb-2 text-xs text-gray-600 flex-shrink-0"},{default:n(()=>[f(u(e.description),1)]),_:1})):c("",!0),t("div",M,[_(e.$slots,"default")]),e.showActions?(s(),i("div",N,[e.showCancelButton?(s(),i("button",{key:0,onClick:C,disabled:e.isLoading,class:"w-full sm:w-auto px-6 py-3 text-base font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"},u(e.cancelText),9,S)):c("",!0),e.showConfirmButton?(s(),i("button",{key:1,onClick:k,disabled:e.isLoading||e.isConfirmDisabled,class:b(x.value)},[e.isLoading?(s(),i("span",E,[r[1]||(r[1]=t("svg",{class:"animate-spin -ml-1 mr-3 h-5 w-5",fill:"none",viewBox:"0 0 24 24"},[t("circle",{class:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor","stroke-width":"4"}),t("path",{class:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})],-1)),f(" "+u(e.loadingText),1)])):(s(),i("span",G,u(e.confirmText),1))],10,H)):c("",!0)])):c("",!0)]),_:3},8,["class"])]),_:3})])])]),_:3})]),_:3},8,["show"]))}});export{q as _,U as r};
