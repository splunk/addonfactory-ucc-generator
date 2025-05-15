import{j as e}from"./jsx-runtime-ClejQJRV.js";import{r as l}from"./index-BnZYiL63.js";import{L as T}from"./Link-BHUv1Tn8.js";import{a as j,b as D,M as O,C as n}from"./modes-BS4Pl0Rc.js";import{i as t}from"./messageUtil-1EVq4BLQ.js";import{v as s}from"./variables-DE_hyTtg.js";import{H as S}from"./Heading-Nakl_vyU.js";import{q as a}from"./Clickable-Bwca2DKB.js";import{B as v}from"./BaseFormView-CfC65bdT.js";import{P as w}from"./TableContext-CL1ZOL1I.js";import{a as M}from"./PageContext-BOYMoToK.js";import{U as E}from"./UCCButton-QVuTRROB.js";import{C as N}from"./CustomComponentContext-DUBuY9CR.js";const W=a.div.attrs({className:"pageTitle"})`
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
`;function x({handleRequestClose:o,serviceName:g,mode:r,stanzaName:C,formLabel:d,page:u,groupName:y}){const c=l.useRef(null),[f,_]=l.useState(!1);let m=t._("Submit");r===j?m=t._("Add"):r===D?m=t._("Clone Input"):r===O&&(m=t._("Update"));const b=async i=>{await c.current?.handleSubmit(i)&&o()},h=(i,p)=>{_(i),p&&o()};return e.jsxs(n,{gutter:8,children:[e.jsx(n.Row,{style:{padding:"5px 0px"},children:e.jsx(n.Column,{children:e.jsxs(I,{children:[e.jsx(T,{onClick:o,children:u===w?t._("Inputs"):t._("Configuration")})," > ",t._(d)]})})}),e.jsxs(n.Row,{children:[e.jsx(n.Column,{span:2}),e.jsxs(n.Column,{span:8,style:{maxWidth:"800px"},children:[e.jsxs(L,{children:[e.jsx(S,{style:{paddingLeft:"30px"},level:3,children:t._(d)}),e.jsx(N.Consumer,{children:i=>e.jsx(M.Consumer,{children:p=>e.jsx(v,{ref:c,page:u,serviceName:g,mode:r,stanzaName:C||"",handleFormSubmit:h,groupName:y,pageContext:p,customComponentContext:i})})})]}),e.jsxs(q,{children:[e.jsx(E,{appearance:"secondary",onClick:o,label:t._("Cancel"),disabled:f,style:{width:"80px"}}),e.jsx(E,{type:"Submit",label:m,onClick:b,loading:f,style:{width:"80px"}})]})]}),e.jsx(n.Column,{span:2})]})]})}const J=l.memo(x);x.__docgenInfo={description:"",methods:[],displayName:"EntityPage",props:{handleRequestClose:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},serviceName:{required:!0,tsType:{name:"string"},description:""},mode:{required:!0,tsType:{name:"union",raw:`| typeof MODE_CLONE
| typeof MODE_CREATE
| typeof MODE_DELETE
| typeof MODE_EDIT
| typeof MODE_CONFIG`,elements:[{name:"MODE_CLONE"},{name:"MODE_CREATE"},{name:"MODE_DELETE"},{name:"MODE_EDIT"},{name:"MODE_CONFIG"}]},description:""},page:{required:!0,tsType:{name:"union",raw:"'configuration' | 'inputs'",elements:[{name:"literal",value:"'configuration'"},{name:"literal",value:"'inputs'"}]},description:""},stanzaName:{required:!1,tsType:{name:"string"},description:""},formLabel:{required:!1,tsType:{name:"string"},description:""},groupName:{required:!1,tsType:{name:"string"},description:""}}};export{J as E,I as S,W as T};
