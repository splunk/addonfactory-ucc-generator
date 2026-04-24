import{r as m,j as e,q as i}from"./iframe-dpjTMnOC.js";import{M as o}from"./Modal-DHH9dHkg.js";import{M as c}from"./Message-CTAu_nZh.js";import{g as u}from"./messageUtil-DTEwCut0.js";import{U as d}from"./UCCButton-DTXqduNc.js";import"./index-nuYtCEEu.js";import"./Modal-Bneg7RqM.js";import"./ScrollContainerContext-DogtmX69.js";import"./Box-DE7m460s.js";import"./id-Db1E8M8a.js";import"./Divider-BI7HZr8y.js";import"./ExclamationTriangle-CApgSVdg.js";import"./Message-Dhf0vLeD.js";import"./InformationCircle-B-WxxbMa.js";const l=i(o)`
    width: 600px;
`;function n(s){const[a,p]=m.useState(s.open),t=()=>{p(!1)};return e.jsxs(l,{returnFocus:s.returnFocus,open:a,onRequestClose:t,children:[e.jsx(o.Header,{title:u(104)}),e.jsx(o.Body,{children:e.jsx(c,{appearance:"fill",type:"error",children:s.message})}),e.jsx(o.Footer,{children:e.jsx(d,{onClick:t,label:"OK"})})]})}n.__docgenInfo={description:"",methods:[],displayName:"ErrorModal",props:{message:{required:!0,tsType:{name:"string"},description:""},open:{required:!0,tsType:{name:"boolean"},description:""},returnFocus:{required:!0,tsType:{name:"ComponentProps['returnFocus']",raw:"ComponentProps<typeof Modal>['returnFocus']"},description:""}}};const R={component:n,title:"ErrorModal"},r={args:{message:"Error message",open:!0,returnFocus:()=>{}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Error message',
    open: true,
    returnFocus: () => {}
  }
}`,...r.parameters?.docs?.source}}};const T=["Base"];export{r as Base,T as __namedExportsOrder,R as default};
