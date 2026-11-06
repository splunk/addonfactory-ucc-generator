import{r as m,j as e,q as i}from"./iframe-BLQN0JqS.js";import{M as o}from"./Modal-qerXQFyl.js";import{M as c}from"./Message-B3Crs33b.js";import{g as u}from"./messageUtil-CQQ8zf_h.js";import{U as d}from"./UCCButton-CmRql3Ne.js";import"./preload-helper-BWMXw09x.js";import"./Modal-C18uB4vq.js";import"./Box-YFEb_QRy.js";import"./Divider-aChyjKRp.js";import"./ExclamationTriangle-d6YEqz5S.js";import"./Message-CQRB6omU.js";const l=i(o)`
    width: 600px;
`;function n(s){const[a,p]=m.useState(s.open),t=()=>{p(!1)};return e.jsxs(l,{returnFocus:s.returnFocus,open:a,onRequestClose:t,children:[e.jsx(o.Header,{title:u(104)}),e.jsx(o.Body,{children:e.jsx(c,{appearance:"fill",type:"error",children:s.message})}),e.jsx(o.Footer,{children:e.jsx(d,{onClick:t,label:"OK"})})]})}n.__docgenInfo={description:"",methods:[],displayName:"ErrorModal",props:{message:{required:!0,tsType:{name:"string"},description:""},open:{required:!0,tsType:{name:"boolean"},description:""},returnFocus:{required:!0,tsType:{name:"ComponentProps['returnFocus']",raw:"ComponentProps<typeof Modal>['returnFocus']"},description:""}}};const B={component:n,title:"ErrorModal"},r={args:{message:"Error message",open:!0,returnFocus:()=>{}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Error message',
    open: true,
    returnFocus: () => {}
  }
}`,...r.parameters?.docs?.source}}};const _=["Base"];export{r as Base,_ as __namedExportsOrder,B as default};
