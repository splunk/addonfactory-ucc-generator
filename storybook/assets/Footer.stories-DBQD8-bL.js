import{j as r}from"./jsx-runtime-1FKYbnEZ.js";import{r as a}from"./index-prPvd6Su.js";import{q as c}from"./omit-UcH284-_.js";import{t as o}from"./index-DtbBJ32H.js";import{g as h,s as x}from"./util-BVaVe7dF.js";import{p as b}from"./messageUtil-CvmCOD_s.js";import{r as v}from"./searchUtil-DKzh7vdL.js";import{g as S}from"./globalConfigMock-Daxid-vY.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-BAMY2Nnw.js";import"./_baseIteratee-CGcCafy9.js";import"./_arrayIncludesWith-C0sUgJs0.js";import"./includes-BxfbO0I6.js";import"./isEqual-YuU2Zr8y.js";import"./url-C03nQury.js";import"./_baseDifference-BqVURxtm.js";const F=c.footer`
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
