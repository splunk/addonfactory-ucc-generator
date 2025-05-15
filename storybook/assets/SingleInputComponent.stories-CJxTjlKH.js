import{j as p}from"./jsx-runtime-ClejQJRV.js";import{r as c}from"./index-BnZYiL63.js";import{f as d}from"./index-CvFo5rXR.js";import{h as u,H as f}from"./index-CTWv8l7u.js";import{S as n}from"./SingleInputComponent-CUyRsDs2.js";import{s as b}from"./util-9s_bzyAI.js";import{g}from"./globalConfigMock-DihuT9Zd.js";import{m as v}from"./server-response-Cmhjwb6A.js";import{w as h}from"./withControlGroup-BJQrrEa9.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./Clickable-Bwca2DKB.js";import"./index-C6Xwkj2v.js";import"./index-NODxQXf6.js";import"./extend-co5plJTM.js";import"./TextArea-W5IxQHto.js";import"./ControlGroup-BdgR-Lfo.js";import"./find-gWtmx_xX.js";import"./Box-ikMjEsld.js";import"./ScreenReaderContent-BTHKdSEY.js";import"./Tooltip-C8RPrfb3.js";import"./style-Df2q8Zk_.js";import"./Close-Bj9wtoJU.js";import"./IconProvider-BEtmCpKb.js";import"./Button-CaNu-0_n.js";import"./External-N3vgloA-.js";import"./Menu-RgiCwolK.js";import"./Divider-PTLijbug.js";import"./Heading-9qvZOIYU.js";import"./ChevronRight-DdqaOJ2q.js";import"./Switch-DviBBIIV.js";import"./ArrowSquareTopRight-B5BPln_L.js";import"./WaitSpinner-CNexVZJK.js";import"./Link-em2tLaYv.js";import"./Text-BNJLg959.js";import"./usePrevious-T3tkdeEg.js";import"./Button-CGXuhmos.js";import"./some-Bk8yVFGI.js";import"./variables-DE_hyTtg.js";import"./api-DePkw_zr.js";import"./url-DcGE77xy.js";import"./messageUtil-1EVq4BLQ.js";import"./considerFalseAndTruthy-D4Pwj1gQ.js";import"./utils-CEqOZghX.js";import"./invariant-Cbo0Fu-i.js";import"./ControlGroup-DNw1xQ1K.js";const pe={component:n,title:"SingleInputComponent",parameters:{msw:{handlers:[u.get("/servicesNS/nobody/-/*",()=>f.json(v))]}},render:a=>{const[i,m]=c.useState(a.value);return b(g()),p.jsx(n,{...a,handleChange:(l,s)=>{typeof s=="string"&&m(s),a.handleChange(l,s)},value:i})},decorators:[h]},r={handleChange:d(),disabled:!1,error:!1,field:"field",value:"",dependencyValues:void 0,controlOptions:{autoCompleteFields:[{label:"aaa",value:"aaa"},{label:"bbb",value:"bbb"},{label:"ccc",value:"ccc"},{label:"ddd",value:"ddd"},{label:"test",value:"test"},{label:"test1",value:"test1"},{label:"test2",value:"test2"},{label:"test3",value:"test3"},{label:"test4",value:"test4"},{label:"test5",value:"test5"}],endpointUrl:void 0,denyList:"denyList",allowList:"allowList",dependencies:void 0,createSearchChoice:!0,referenceName:void 0,disableSearch:!0,labelField:"labelField",hideClearBtn:!1},required:!1},e={args:r},t={args:{...r,controlOptions:{createSearchChoice:!0}}},o={args:{...r,controlOptions:{...r.controlOptions,allowList:"test1",denyList:"test1",referenceName:"refernceName"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: common
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    ...common,
    controlOptions: {
      createSearchChoice: true
    }
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    ...common,
    controlOptions: {
      ...common.controlOptions,
      allowList: 'test1',
      denyList: 'test1',
      referenceName: 'refernceName'
    }
  }
}`,...o.parameters?.docs?.source}}};const ce=["SelectList","AcceptAnyInput","AllowDenyListFromBackend"];export{t as AcceptAnyInput,o as AllowDenyListFromBackend,e as SelectList,ce as __namedExportsOrder,pe as default};
