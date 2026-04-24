import{v as s,q as a,r as l,j as e,aB as b}from"./iframe-dpjTMnOC.js";import{L as j}from"./Link-DETRhvtj.js";import{a as D,i as O,M as S,l as n,m as v}from"./ControlWrapper-BM5zRGNC.js";import{i as t}from"./messageUtil-DTEwCut0.js";import{H as w}from"./Heading-rwKKcYAD.js";import{B as M}from"./BaseFormView-CTLU_dE2.js";import{P as N}from"./TableContext-D9PSc4Om.js";import{U as E}from"./UCCButton-DTXqduNc.js";const U=a.div.attrs({className:"pageTitle"})`
    font-size: ${s.fontSizeXXLarge};
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
`,I=a.div.attrs({className:"pageSubtitle"})`
    font-size: ${s.fontSize};
    margin-bottom: 10px;
`;a.div`
    .table-caption-inner {
        text-align: left;
    }
`;const L=a.div`
    box-shadow: ${s.embossShadow};
    padding: ${s.spacingLarge};
`,q=a.div`
    margin-top: ${s.spacingSmall};
    text-align: right;
`;function f({handleRequestClose:o,serviceName:g,mode:r,stanzaName:y,formLabel:d,page:u,groupName:C}){const c=l.useRef(null),[x,_]=l.useState(!1);let m=t._("Submit");r===D?m=t._("Add"):r===O?m=t._("Clone Input"):r===S&&(m=t._("Update"));const h=async i=>{await c.current?.handleSubmit(i)&&o()},T=(i,p)=>{_(i),p&&o()};return e.jsxs(n,{gutter:8,children:[e.jsx(n.Row,{style:{padding:"5px 0px"},children:e.jsx(n.Column,{children:e.jsxs(I,{children:[e.jsx(j,{onClick:o,children:u===N?t._("Inputs"):t._("Configuration")})," > ",t._(d)]})})}),e.jsxs(n.Row,{children:[e.jsx(n.Column,{span:2}),e.jsxs(n.Column,{span:8,style:{maxWidth:"800px"},children:[e.jsxs(L,{children:[e.jsx(w,{style:{padding:"10px 30px"},level:3,children:t._(d)}),e.jsx(v.Consumer,{children:i=>e.jsx(b.Consumer,{children:p=>e.jsx(M,{ref:c,page:u,serviceName:g,mode:r,stanzaName:y||"",handleFormSubmit:T,groupName:C,pageContext:p,customComponentContext:i})})})]}),e.jsxs(q,{children:[e.jsx(E,{appearance:"secondary",onClick:o,label:t._("Cancel"),disabled:x,style:{width:"80px"}}),e.jsx(E,{type:"Submit",label:m,onClick:h,loading:x,style:{width:"80px"}})]})]}),e.jsx(n.Column,{span:2})]})]})}const G=l.memo(f);f.__docgenInfo={description:"",methods:[],displayName:"EntityPage",props:{handleRequestClose:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},serviceName:{required:!0,tsType:{name:"string"},description:""},mode:{required:!0,tsType:{name:"union",raw:`| typeof MODE_CLONE
| typeof MODE_CREATE
| typeof MODE_DELETE
| typeof MODE_EDIT
| typeof MODE_CONFIG`,elements:[{name:"MODE_CLONE"},{name:"MODE_CREATE"},{name:"MODE_DELETE"},{name:"MODE_EDIT"},{name:"MODE_CONFIG"}]},description:""},page:{required:!0,tsType:{name:"union",raw:"'configuration' | 'inputs'",elements:[{name:"literal",value:"'configuration'"},{name:"literal",value:"'inputs'"}]},description:""},stanzaName:{required:!1,tsType:{name:"string"},description:""},formLabel:{required:!1,tsType:{name:"string"},description:""},groupName:{required:!1,tsType:{name:"string"},description:""}}};export{G as E,I as S,U as T};
