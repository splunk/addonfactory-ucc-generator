import{j as l}from"./jsx-runtime-ojCMydbh.js";import{r as c}from"./index-DI6txC9U.js";import{f as d}from"./index-DpwipV_e.js";import{h as u,H as f}from"./index-kle9pbY7.js";import{S as i}from"./ControlWrapper-Ci-zlHqj.js";import{s as b}from"./util-CGkFfNTa.js";import{g}from"./globalConfigMock-D5-GCOWV.js";import{m as v}from"./server-response-Cmhjwb6A.js";import{w as h}from"./withControlGroup-D8Ni7tKW.js";import"./_commonjsHelpers-CE1G-McA.js";import"./iframe-BVJboWvC.js";import"./index-BAMY2Nnw.js";import"./Text-BOUR33a1.js";import"./omit-ztEEjYnI.js";import"./times-DEtgg_I4.js";import"./_baseIteratee-BgljbWfr.js";import"./includes-Clo6__ke.js";import"./Clickable-m7b-p22w.js";import"./ExclamationTriangle-DaHVRaQA.js";import"./Button-BVwbUX9I.js";import"./ScreenReaderContent-DYUfzbCm.js";import"./ButtonSimple-Bnkbn06o.js";import"./Box-dCuMX_uk.js";import"./index-CujC5SV_.js";import"./AnimationToggle-Dgpdi4Ip.js";import"./Tooltip-DNvjBS2i.js";import"./Popover-CmySphiq.js";import"./_arrayIncludesWith-D7mRho23.js";import"./ScrollContainerContext-Cdp9tX0F.js";import"./InformationCircle-gwQHWa7p.js";import"./ChevronRight-B2uYXglV.js";import"./isEqual-Q2uatnfO.js";import"./index-s8iMx1jP.js";import"./MarkdownMessage-vKaL8cy0.js";import"./Link-BMz1NHYV.js";import"./Divider-wHm8s2UO.js";import"./Button-zWON0gNY.js";import"./CollapsiblePanel-CBq0y_BG.js";import"./variables-BfrwVMxe.js";import"./pick-B2D4nEtf.js";import"./Menu-DJUgZFWQ.js";import"./Dropdown-ChHUzFro.js";import"./textUtils-BIiSxj3a.js";import"./toUpper-DNM9XKBs.js";import"./_baseDifference-BucyWK35.js";import"./url-Dlk_22OB.js";import"./scroll-D_om4I15.js";import"./WaitSpinner-BSmPTg-B.js";import"./api-D_ndwf0a.js";import"./url-1MEF4Ke-.js";import"./messageUtil-8kA0E4H4.js";import"./DatePickerComponent-Bm9AYacc.js";import"./ChevronLeft-CjhuJSXo.js";import"./script-BkARDwkC.js";import"./Group-RnZmXvj5.js";const Ce={component:i,title:"SingleInputComponent",parameters:{msw:{handlers:[u.get("/servicesNS/nobody/-/*",()=>f.json(v))]}},render:a=>{const[m,n]=c.useState(a.value);return b(g()),l.jsx(i,{...a,handleChange:(p,s)=>{typeof s=="string"&&n(s),a.handleChange(p,s)},value:m})},decorators:[h]},r={handleChange:d(),disabled:!1,error:!1,field:"field",value:"",dependencyValues:void 0,controlOptions:{autoCompleteFields:[{label:"aaa",value:"aaa"},{label:"bbb",value:"bbb"},{label:"ccc",value:"ccc"},{label:"ddd",value:"ddd"},{label:"test",value:"test"},{label:"test1",value:"test1"},{label:"test2",value:"test2"},{label:"test3",value:"test3"},{label:"test4",value:"test4"},{label:"test5",value:"test5"}],endpointUrl:void 0,denyList:"denyList",allowList:"allowList",dependencies:void 0,createSearchChoice:!0,referenceName:void 0,disableSearch:!0,labelField:"labelField",hideClearBtn:!1},required:!1},e={args:r},t={args:{...r,controlOptions:{createSearchChoice:!0}}},o={args:{...r,controlOptions:{...r.controlOptions,allowList:"test1",denyList:"test1",referenceName:"refernceName"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};const Le=["SelectList","AcceptAnyInput","AllowDenyListFromBackend"];export{t as AcceptAnyInput,o as AllowDenyListFromBackend,e as SelectList,Le as __namedExportsOrder,Ce as default};
