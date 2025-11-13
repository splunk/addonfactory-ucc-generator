import{j as e}from"./jsx-runtime-1FKYbnEZ.js";import{r as l}from"./index-prPvd6Su.js";import{L as T}from"./Link-BguIxQc6.js";import{b as j,f as D,M as O,g as n,h as S}from"./ControlWrapper-D33h4I9C.js";import{i as t}from"./messageUtil-CQS9-IEm.js";import{v as s}from"./variables-BwqdKhvQ.js";import{H as v}from"./Heading-Rzy1Th7C.js";import{q as a}from"./omit-CSe7u5nZ.js";import{B as w}from"./BaseFormView-VxTL8USs.js";import{P as M}from"./TableContext-ChDLO5uF.js";import{a as N}from"./PageContext-DhAckcxo.js";import{U as x}from"./UCCButton-C8g1wOJi.js";const V=a.div.attrs({className:"pageTitle"})`
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
    padding: ${s.spacing};
`,q=a.div`
    margin-top: ${s.spacingHalf};
    text-align: right;
`;function E({handleRequestClose:o,serviceName:g,mode:r,stanzaName:y,formLabel:d,page:u,groupName:C}){const c=l.useRef(null),[f,_]=l.useState(!1);let m=t._("Submit");r===j?m=t._("Add"):r===D?m=t._("Clone Input"):r===O&&(m=t._("Update"));const h=async i=>{await c.current?.handleSubmit(i)&&o()},b=(i,p)=>{_(i),p&&o()};return e.jsxs(n,{gutter:8,children:[e.jsx(n.Row,{style:{padding:"5px 0px"},children:e.jsx(n.Column,{children:e.jsxs(I,{children:[e.jsx(T,{onClick:o,children:u===M?t._("Inputs"):t._("Configuration")})," > ",t._(d)]})})}),e.jsxs(n.Row,{children:[e.jsx(n.Column,{span:2}),e.jsxs(n.Column,{span:8,style:{maxWidth:"800px"},children:[e.jsxs(L,{children:[e.jsx(v,{style:{padding:"10px 30px"},level:3,children:t._(d)}),e.jsx(S.Consumer,{children:i=>e.jsx(N.Consumer,{children:p=>e.jsx(w,{ref:c,page:u,serviceName:g,mode:r,stanzaName:y||"",handleFormSubmit:b,groupName:C,pageContext:p,customComponentContext:i})})})]}),e.jsxs(q,{children:[e.jsx(x,{appearance:"secondary",onClick:o,label:t._("Cancel"),disabled:f,style:{width:"80px"}}),e.jsx(x,{type:"Submit",label:m,onClick:h,loading:f,style:{width:"80px"}})]})]}),e.jsx(n.Column,{span:2})]})]})}const W=l.memo(E);E.__docgenInfo={description:"",methods:[],displayName:"EntityPage",props:{handleRequestClose:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},serviceName:{required:!0,tsType:{name:"string"},description:""},mode:{required:!0,tsType:{name:"union",raw:`| typeof MODE_CLONE
| typeof MODE_CREATE
| typeof MODE_DELETE
| typeof MODE_EDIT
| typeof MODE_CONFIG`,elements:[{name:"MODE_CLONE"},{name:"MODE_CREATE"},{name:"MODE_DELETE"},{name:"MODE_EDIT"},{name:"MODE_CONFIG"}]},description:""},page:{required:!0,tsType:{name:"union",raw:"'configuration' | 'inputs'",elements:[{name:"literal",value:"'configuration'"},{name:"literal",value:"'inputs'"}]},description:""},stanzaName:{required:!1,tsType:{name:"string"},description:""},formLabel:{required:!1,tsType:{name:"string"},description:""},groupName:{required:!1,tsType:{name:"string"},description:""}}};export{W as E,I as S,V as T};
