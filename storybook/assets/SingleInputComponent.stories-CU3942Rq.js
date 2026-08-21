import{r as p,j as c,h as d,H as u,m as f}from"./iframe-BybQmYhs.js";import{S as n}from"./ControlWrapper-DW1ssuup.js";import{s as b}from"./util-CwSpPLLj.js";import{g}from"./globalConfigMock-DBWuimWf.js";import{w as v}from"./withControlGroup-BJ6Sc_PQ.js";import"./preload-helper-BWMXw09x.js";import"./Date-BwH_Uvrg.js";import"./lodash-BinLombY.js";import"./includes-C10hJJlp.js";import"./ChevronLeft-BdtWL9An.js";import"./ChevronRight-Cuua9ySr.js";import"./isEqual-t5_yoTve.js";import"./_baseIsEqual-CpM8zJ8H.js";import"./Popover-Bq-E0Lli.js";import"./_arrayIncludesWith-CAwgIatL.js";import"./ScrollContainerContext-CT0yTyFc.js";import"./index-BWpmYAE4.js";import"./Box-Qxlnrgei.js";import"./_baseIteratee-D2Sk1jod.js";import"./ExclamationTriangle-np3aM2XP.js";import"./Tooltip-D3jrOxmc.js";import"./InformationCircle-CW3KzXgV.js";import"./MarkdownMessage-CMGJKqHa.js";import"./Link-DMTOu5_Y.js";import"./Divider-BWQHoYm-.js";import"./CollapsiblePanel-B2Pplelk.js";import"./pick-S4WDSwY2.js";import"./Menu-Cw2EvSGZ.js";import"./Dropdown-ChPXRHzi.js";import"./textUtils-BWv0koaU.js";import"./Number-Cq_yzL8f.js";import"./url-BycM6uy-.js";import"./_baseDifference-CKo66-zF.js";import"./api-DcmWZcVU.js";import"./url-CVF012Ry.js";import"./messageUtil-CRqYlSDi.js";import"./DatePickerComponent-C7BptdDe.js";import"./script-DKIohx6e.js";import"./Group-z9SGg5Y_.js";const{fn:h}=__STORYBOOK_MODULE_TEST__,ae={component:n,title:"SingleInputComponent",parameters:{msw:{handlers:[d.get("/servicesNS/nobody/-/*",()=>u.json(f))]}},render:a=>{const[i,l]=p.useState(a.value);return b(g()),c.jsx(n,{...a,handleChange:(m,s)=>{typeof s=="string"&&l(s),a.handleChange(m,s)},value:i})},decorators:[v]},r={handleChange:h(),disabled:!1,error:!1,field:"field",value:"",dependencyValues:void 0,controlOptions:{autoCompleteFields:[{label:"aaa",value:"aaa"},{label:"bbb",value:"bbb"},{label:"ccc",value:"ccc"},{label:"ddd",value:"ddd"},{label:"test",value:"test"},{label:"test1",value:"test1"},{label:"test2",value:"test2"},{label:"test3",value:"test3"},{label:"test4",value:"test4"},{label:"test5",value:"test5"}],endpointUrl:void 0,denyList:"denyList",allowList:"allowList",dependencies:void 0,createSearchChoice:!0,referenceName:void 0,disableSearch:!0,labelField:"labelField",hideClearBtn:!1},required:!1},e={args:r},t={args:{...r,controlOptions:{createSearchChoice:!0}}},o={args:{...r,controlOptions:{...r.controlOptions,allowList:"test1",denyList:"test1",referenceName:"refernceName"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};const se=["SelectList","AcceptAnyInput","AllowDenyListFromBackend"];export{t as AcceptAnyInput,o as AllowDenyListFromBackend,e as SelectList,se as __namedExportsOrder,ae as default};
