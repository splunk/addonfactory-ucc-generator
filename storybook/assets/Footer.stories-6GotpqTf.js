import{j as r}from"./jsx-runtime-ojCMydbh.js";import{r as a}from"./index-DI6txC9U.js";import{q as c}from"./omit-ztEEjYnI.js";import{t as o}from"./index-s8iMx1jP.js";import{g as h,s as x}from"./util-CGkFfNTa.js";import{p as b}from"./messageUtil-8kA0E4H4.js";import{r as v}from"./searchUtil-NABkgmcP.js";import{g as S}from"./globalConfigMock-D5-GCOWV.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-BAMY2Nnw.js";import"./_baseIteratee-BgljbWfr.js";import"./_arrayIncludesWith-D7mRho23.js";import"./includes-Clo6__ke.js";import"./isEqual-Q2uatnfO.js";import"./url-Dlk_22OB.js";import"./_baseDifference-BucyWK35.js";const F=c.footer`
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
`,m=()=>{const[d,p]=a.useState("..."),[l,f]=a.useState(null),{meta:e}=h(),s=e.showFooter===void 0||e.showFooter;return a.useEffect(()=>{if(!s)return;(async()=>{try{const i=`| rest services/apps/local/${e.name} splunk_server=local | fields build`,n=(await v(i))?.results?.[0]?.build;if(n&&/^\d+$/.test(n)){const u=parseInt(n,10)*1e3,g=`${new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"medium",timeZone:"UTC",hour12:!1}).format(new Date(u))} UTC`;p(g)}}catch(i){f(b(i))}})()},[e.name,s]),s?r.jsxs(F,{role:"contentinfo",children:[r.jsxs($,{children:["Add-on Version: ",e.version||"Unknown"]}),r.jsx("div",{children:l?`Build Error: ${l}`:`Build Time: ${d}`})]}):null};m.__docgenInfo={description:"",methods:[],displayName:"Footer"};const M={component:m,title:"Footer",render:()=>(x(S()),r.jsx("div",{style:{marginTop:"calc( 100vh - 78px - 70px)"},children:r.jsx(m,{})}))},t={args:{}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {}
}`,...t.parameters?.docs?.source}}};const R=["Base"];export{t as Base,R as __namedExportsOrder,M as default};
