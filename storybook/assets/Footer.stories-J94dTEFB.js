import{j as r}from"./jsx-runtime-D55GQ3BV.js";import{r as a}from"./index-CtTTUaxh.js";import{q as c}from"./_arrayIncludesWith-Cf8RQZ1L.js";import{t as o}from"./index-CveLJXK0.js";import{g as h,s as x}from"./util-nv791zPf.js";import{p as b}from"./messageUtil-DnHFL-Io.js";import{r as v}from"./searchUtil-DxLq2Op6.js";import{g as S}from"./globalConfigMock-BOeK-gsx.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-BAMY2Nnw.js";import"./index-DXTH3g_Q.js";import"./variables-DTFMykBX.js";import"./pick-C0bI9_1F.js";import"./find-DOPPtTO5.js";import"./invariant-Cbo0Fu-i.js";import"./isEqual-CzWrA3aE.js";import"./_baseDifference-C3Q7_G0N.js";const F=c.footer`
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
`,m=()=>{const[d,p]=a.useState("..."),[l,f]=a.useState(null),{meta:e}=h(),s=e.showFooter===void 0||e.showFooter;return a.useEffect(()=>{if(!s)return;(async()=>{try{const i=`| rest services/apps/local/${e.name} splunk_server=local | fields build`,n=(await v(i))?.results?.[0]?.build;if(n&&/^\d+$/.test(n)){const u=parseInt(n,10)*1e3,g=`${new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"medium",timeZone:"UTC",hour12:!1}).format(new Date(u))} UTC`;p(g)}}catch(i){f(b(i))}})()},[e.name,s]),s?r.jsxs(F,{role:"contentinfo",children:[r.jsxs($,{children:["Add-on Version: ",e.version||"Unknown"]}),r.jsx("div",{children:l?`Build Error: ${l}`:`Build Time: ${d}`})]}):null};m.__docgenInfo={description:"",methods:[],displayName:"Footer"};const R={component:m,title:"Footer",render:()=>(x(S()),r.jsx("div",{style:{marginTop:"calc( 100vh - 78px - 70px)"},children:r.jsx(m,{})}))},t={args:{}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {}
}`,...t.parameters?.docs?.source}}};const W=["Base"];export{t as Base,W as __namedExportsOrder,R as default};
