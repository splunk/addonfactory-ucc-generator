import{r as m,j as e,q as i}from"./iframe-CkO-8h3X.js";import{M as o}from"./Modal-CUabrX9l.js";import{M as c}from"./Message-T5dpOD9R.js";import{g as u}from"./messageUtil-CjQtoyHX.js";import{U as d}from"./UCCButton-Bug0tiA6.js";import"./preload-helper-BWMXw09x.js";import"./Modal-FBSPjVl6.js";import"./ScrollContainerContext-B3z9T_lz.js";import"./includes-CeWRCqDz.js";import"./Box-C3_NwA3u.js";import"./lodash-DC5tP0FI.js";import"./Divider-CkbYBkxJ.js";import"./ExclamationTriangle-BPrZIRtp.js";import"./Message-g-HVYw8y.js";import"./InformationCircle-dv8wnI9A.js";const l=i(o)`
    width: 600px;
`;function n(s){const[a,p]=m.useState(s.open),t=()=>{p(!1)};return e.jsxs(l,{returnFocus:s.returnFocus,open:a,onRequestClose:t,children:[e.jsx(o.Header,{title:u(104)}),e.jsx(o.Body,{children:e.jsx(c,{appearance:"fill",type:"error",children:s.message})}),e.jsx(o.Footer,{children:e.jsx(d,{onClick:t,label:"OK"})})]})}n.__docgenInfo={description:"",methods:[],displayName:"ErrorModal",props:{message:{required:!0,tsType:{name:"string"},description:""},open:{required:!0,tsType:{name:"boolean"},description:""},returnFocus:{required:!0,tsType:{name:"ComponentProps['returnFocus']",raw:"ComponentProps<typeof Modal>['returnFocus']"},description:""}}};const T={component:n,title:"ErrorModal"},r={args:{message:"Error message",open:!0,returnFocus:()=>{}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Error message',
    open: true,
    returnFocus: () => {}
  }
}`,...r.parameters?.docs?.source}}};const b=["Base"];export{r as Base,b as __namedExportsOrder,T as default};
