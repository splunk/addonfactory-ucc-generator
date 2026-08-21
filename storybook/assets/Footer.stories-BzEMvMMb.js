import{r as a,j as t,t as o,q as c}from"./iframe-BybQmYhs.js";import{g as h,s as x}from"./util-CwSpPLLj.js";import{p as b}from"./messageUtil-CRqYlSDi.js";import{r as v}from"./searchUtil-DDFqQx3i.js";import{g as S}from"./globalConfigMock-DBWuimWf.js";import"./preload-helper-BWMXw09x.js";import"./lodash-BinLombY.js";import"./_baseIteratee-D2Sk1jod.js";import"./_baseIsEqual-CpM8zJ8H.js";import"./_arrayIncludesWith-CAwgIatL.js";import"./includes-C10hJJlp.js";import"./isEqual-t5_yoTve.js";import"./url-BycM6uy-.js";import"./_baseDifference-CKo66-zF.js";const F=c.footer`
    padding: ${o.variables.spacingXSmall} ${o.variables.fontSizeXXLarge};
    padding-bottom: 0;
    display: flex;
    font-size: ${o.variables.fontSizeSmall};
    border-top: 1px solid ${o.variables.borderActiveColor};
    justify-content: flex-end;
    flex-direction: column;
    align-items: flex-end;
`,$=c.div`
    font-weight: ${o.variables.fontWeightSemiBold};
`,l=()=>{const[d,p]=a.useState("..."),[m,f]=a.useState(null),{meta:e}=h(),s=e.showFooter===void 0||e.showFooter;return a.useEffect(()=>{if(!s)return;(async()=>{try{const i=`| rest services/apps/local/${e.name} splunk_server=local | fields build`,n=(await v(i))?.results?.[0]?.build;if(n&&/^\d+$/.test(n)){const u=parseInt(n,10)*1e3,g=`${new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"medium",timeZone:"UTC",hour12:!1}).format(new Date(u))} UTC`;p(g)}}catch(i){f(b(i))}})()},[e.name,s]),s?t.jsxs(F,{role:"contentinfo",children:[t.jsxs($,{children:["Add-on Version: ",e.version||"Unknown"]}),t.jsx("div",{children:m?`Build Error: ${m}`:`Build Time: ${d}`})]}):null};l.__docgenInfo={description:"",methods:[],displayName:"Footer"};const G={component:l,title:"Footer",render:()=>(x(S()),t.jsx("div",{style:{marginTop:"calc( 100vh - 78px - 70px)"},children:t.jsx(l,{})}))},r={args:{}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {}
}`,...r.parameters?.docs?.source}}};const L=["Base"];export{r as Base,L as __namedExportsOrder,G as default};
