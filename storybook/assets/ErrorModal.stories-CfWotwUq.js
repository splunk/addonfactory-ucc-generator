import{r as m,j as e,q as i}from"./iframe-BybQmYhs.js";import{M as o}from"./Modal-OzueRJEt.js";import{M as c}from"./Message-hEBO9aN0.js";import{g as u}from"./messageUtil-CRqYlSDi.js";import{U as d}from"./UCCButton-C32sndRo.js";import"./preload-helper-BWMXw09x.js";import"./Modal-DDcYJlN9.js";import"./ScrollContainerContext-CT0yTyFc.js";import"./includes-C10hJJlp.js";import"./index-BWpmYAE4.js";import"./Box-Qxlnrgei.js";import"./lodash-BinLombY.js";import"./Divider-BWQHoYm-.js";import"./ExclamationTriangle-np3aM2XP.js";import"./Message-DVedA-FE.js";import"./InformationCircle-CW3KzXgV.js";const l=i(o)`
    width: 600px;
`;function n(s){const[a,p]=m.useState(s.open),t=()=>{p(!1)};return e.jsxs(l,{returnFocus:s.returnFocus,open:a,onRequestClose:t,children:[e.jsx(o.Header,{title:u(104)}),e.jsx(o.Body,{children:e.jsx(c,{appearance:"fill",type:"error",children:s.message})}),e.jsx(o.Footer,{children:e.jsx(d,{onClick:t,label:"OK"})})]})}n.__docgenInfo={description:"",methods:[],displayName:"ErrorModal",props:{message:{required:!0,tsType:{name:"string"},description:""},open:{required:!0,tsType:{name:"boolean"},description:""},returnFocus:{required:!0,tsType:{name:"ComponentProps['returnFocus']",raw:"ComponentProps<typeof Modal>['returnFocus']"},description:""}}};const b={component:n,title:"ErrorModal"},r={args:{message:"Error message",open:!0,returnFocus:()=>{}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Error message',
    open: true,
    returnFocus: () => {}
  }
}`,...r.parameters?.docs?.source}}};const w=["Base"];export{r as Base,w as __namedExportsOrder,b as default};
