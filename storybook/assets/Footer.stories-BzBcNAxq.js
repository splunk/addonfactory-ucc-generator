import{r as a,j as t,t as o,q as d}from"./iframe-dpjTMnOC.js";import{g as h,s as x}from"./util-DakudGGz.js";import{p as b}from"./messageUtil-DTEwCut0.js";import{r as v}from"./searchUtil-C4wQ5BGE.js";import{g as S}from"./globalConfigMock-BVxEarns.js";import"./index-nuYtCEEu.js";import"./id-Db1E8M8a.js";import"./url-DGkq2p2F.js";const F=d.footer`
    padding: ${o.variables.spacingXSmall} ${o.variables.fontSizeXXLarge};
    padding-bottom: 0;
    display: flex;
    font-size: ${o.variables.fontSizeSmall};
    border-top: 1px solid ${o.variables.borderActiveColor};
    justify-content: flex-end;
    flex-direction: column;
    align-items: flex-end;
`,$=d.div`
    font-weight: ${o.variables.fontWeightSemiBold};
`,l=()=>{const[m,p]=a.useState("..."),[c,f]=a.useState(null),{meta:e}=h(),s=e.showFooter===void 0||e.showFooter;return a.useEffect(()=>{if(!s)return;(async()=>{try{const n=`| rest services/apps/local/${e.name} splunk_server=local | fields build`,i=(await v(n))?.results?.[0]?.build;if(i&&/^\d+$/.test(i)){const u=parseInt(i,10)*1e3,g=`${new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"medium",timeZone:"UTC",hour12:!1}).format(new Date(u))} UTC`;p(g)}}catch(n){f(b(n))}})()},[e.name,s]),s?t.jsxs(F,{role:"contentinfo",children:[t.jsxs($,{children:["Add-on Version: ",e.version||"Unknown"]}),t.jsx("div",{children:c?`Build Error: ${c}`:`Build Time: ${m}`})]}):null};l.__docgenInfo={description:"",methods:[],displayName:"Footer"};const k={component:l,title:"Footer",render:()=>(x(S()),t.jsx("div",{style:{marginTop:"calc( 100vh - 78px - 70px)"},children:t.jsx(l,{})}))},r={args:{}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {}
}`,...r.parameters?.docs?.source}}};const z=["Base"];export{r as Base,z as __namedExportsOrder,k as default};
