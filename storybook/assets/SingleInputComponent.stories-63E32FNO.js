import{r as m,j as p,h as d,H as u,m as f}from"./iframe-BLQN0JqS.js";import{S as n}from"./ControlWrapper-CcOJthta.js";import{s as b}from"./util-D1kXELUL.js";import{g}from"./globalConfigMock-CVC6KYUe.js";import{w as v}from"./withControlGroup-eGtL2iWE.js";import"./preload-helper-BWMXw09x.js";import"./Date-CLp5-Jfo.js";import"./ChevronLeft-BedkDF4G.js";import"./ChevronRight-Dq0W4qWj.js";import"./ExclamationTriangle-d6YEqz5S.js";import"./Box-YFEb_QRy.js";import"./MarkdownMessage-BHbFjhs0.js";import"./Link-BZqR4iUZ.js";import"./Divider-aChyjKRp.js";import"./CollapsiblePanel-C1Njf11K.js";import"./SVGInternal-sFyMgQuT.js";import"./Number-aCLGLkFq.js";import"./Menu-BiGojXeR.js";import"./Heading-XPGzsxsQ.js";import"./_baseDifference-DZ-TZE0x.js";import"./script-BPSliBjH.js";import"./url-CvJzWRTA.js";import"./url-BdB9R0LC.js";import"./messageUtil-CQQ8zf_h.js";import"./textUtils-BK2yMsTW.js";import"./api-B7g4orc8.js";import"./DatePickerComponent-DYkEFl2K.js";import"./Group-BiXwZAAO.js";const{fn:h}=__STORYBOOK_MODULE_TEST__,J={component:n,title:"SingleInputComponent",parameters:{msw:{handlers:[d.get("/servicesNS/nobody/-/*",()=>u.json(f))]}},render:a=>{const[l,i]=m.useState(a.value);return b(g()),p.jsx(n,{...a,handleChange:(c,s)=>{typeof s=="string"&&i(s),a.handleChange(c,s)},value:l})},decorators:[v]},r={handleChange:h(),disabled:!1,error:!1,field:"field",value:"",dependencyValues:void 0,controlOptions:{autoCompleteFields:[{label:"aaa",value:"aaa"},{label:"bbb",value:"bbb"},{label:"ccc",value:"ccc"},{label:"ddd",value:"ddd"},{label:"test",value:"test"},{label:"test1",value:"test1"},{label:"test2",value:"test2"},{label:"test3",value:"test3"},{label:"test4",value:"test4"},{label:"test5",value:"test5"}],endpointUrl:void 0,denyList:"denyList",allowList:"allowList",dependencies:void 0,createSearchChoice:!0,referenceName:void 0,disableSearch:!0,labelField:"labelField",hideClearBtn:!1},required:!1},e={args:r},t={args:{...r,controlOptions:{createSearchChoice:!0}}},o={args:{...r,controlOptions:{...r.controlOptions,allowList:"test1",denyList:"test1",referenceName:"refernceName"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};const P=["SelectList","AcceptAnyInput","AllowDenyListFromBackend"];export{t as AcceptAnyInput,o as AllowDenyListFromBackend,e as SelectList,P as __namedExportsOrder,J as default};
