var g=Object.defineProperty;var c=(n,r,e)=>r in n?g(n,r,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[r]=e;var s=(n,r,e)=>c(n,typeof r!="symbol"?r+"":r,e);import{j as o}from"./jsx-runtime-ClejQJRV.js";import{r as v}from"./index-BnZYiL63.js";import{g as f}from"./_commonjsHelpers-D6-XlEtG.js";import{r as y}from"./RadioBar-C-BIDM59.js";import{q as h}from"./Clickable-wzamu0qE.js";import{g as l}from"./considerFalseAndTruthy-D4Pwj1gQ.js";import{e as q}from"./utils-CEqOZghX.js";var b=y();const p=f(b),x=h(p.Option)`
    margin-left: 0px !important;
`;class C extends v.Component{constructor(){super(...arguments);s(this,"handleChange",(e,{value:a})=>{this.props.handleChange(this.props.field,a)})}render(){const{value:e,controlOptions:a,disabled:u,page:i,...m}=this.props,d=q(m);return o.jsx(p,{...d,onChange:this.handleChange,value:e&&l(e,i),children:a.items.map(t=>o.jsx(x,{value:l(t.value,i),label:t.label,disabled:u},t.value))})}}C.__docgenInfo={description:"",methods:[{name:"handleChange",docblock:null,modifiers:[],params:[{name:"e",optional:!1,type:{name:"unknown"}},{name:"{ value }: { value: string }",optional:!1,type:{name:"signature",type:"object",raw:"{ value: string }",signature:{properties:[{key:"value",value:{name:"string",required:!0}}]}}}],returns:null}],displayName:"RadioComponent",props:{id:{required:!1,tsType:{name:"string"},description:""},value:{required:!0,tsType:{name:"string"},description:""},handleChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(field: string, value: string) => void",signature:{arguments:[{type:{name:"string"},name:"field"},{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""},field:{required:!0,tsType:{name:"string"},description:""},controlOptions:{required:!0,tsType:{name:"signature",type:"object",raw:`{
    items: {
        value: string;
        label: string;
    }[];
}`,signature:{properties:[{key:"items",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
    value: string;
    label: string;
}`,signature:{properties:[{key:"value",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}}]}}],raw:`{
    value: string;
    label: string;
}[]`,required:!0}}]}},description:""},disabled:{required:!0,tsType:{name:"boolean"},description:""},page:{required:!1,tsType:{name:"union",raw:"'configuration' | 'inputs'",elements:[{name:"literal",value:"'configuration'"},{name:"literal",value:"'inputs'"}]},description:""}}};export{C as R};
