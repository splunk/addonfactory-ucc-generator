import{j as p}from"./jsx-runtime-ClejQJRV.js";import{r as c}from"./index-BnZYiL63.js";import{f as d}from"./index-y4Yn5WZ1.js";import{h as u,H as f}from"./index-DgRvTSw_.js";import{S as i}from"./SingleInputComponent-B52slQX9.js";import{s as b}from"./util-DfUvgPwM.js";import{g}from"./globalConfigMock-CjVyTY6j.js";import{m as v}from"./server-response-Cmhjwb6A.js";import{w as h}from"./withControlGroup-DhG-ZuCY.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./iframe-B0-yMJSF.js";import"./index-BAMY2Nnw.js";import"./ComboBox-CmYP-_Jn.js";import"./Clickable-wzamu0qE.js";import"./index-C6Xwkj2v.js";import"./index-BeaWwRds.js";import"./extend-BCHzQ2P0.js";import"./TextArea-WoYN_p44.js";import"./ControlGroup-D1l7iBTi.js";import"./find-D36SYLnv.js";import"./Box-9y-3oeI2.js";import"./ScreenReaderContent-DTnCP1nJ.js";import"./Tooltip-s2-C62Iv.js";import"./style-gy5-imeJ.js";import"./Close-CPSltoSy.js";import"./IconProvider-D1bqsLqQ.js";import"./Button-JhicfZMm.js";import"./External-CaozYYRu.js";import"./Search-DJ2srasI.js";import"./Menu-CO_c8kuU.js";import"./Divider-BxwkhgHI.js";import"./Heading-2h2rzLUR.js";import"./ChevronRight-BZ9dd8ev.js";import"./Switch-DAz2gr6S.js";import"./ArrowSquareTopRight-cE1IFp2S.js";import"./WaitSpinner-pc6awGU8.js";import"./Link-B3IMA5iK.js";import"./Text-CXLzpk1L.js";import"./usePrevious-T3tkdeEg.js";import"./Button-BHr02HYf.js";import"./variables-BlEdyhR1.js";import"./api-D6WilaDV.js";import"./url-CzOjCGiC.js";import"./messageUtil-CXCS-b_z.js";import"./considerFalseAndTruthy-D4Pwj1gQ.js";import"./utils-CEqOZghX.js";import"./invariant-Cbo0Fu-i.js";import"./ControlGroup-a8oyWZe3.js";const ue={component:i,title:"SingleInputComponent",parameters:{msw:{handlers:[u.get("/servicesNS/nobody/-/*",()=>f.json(v))]}},render:a=>{const[n,m]=c.useState(a.value);return b(g()),p.jsx(i,{...a,handleChange:(l,s)=>{typeof s=="string"&&m(s),a.handleChange(l,s)},value:n})},decorators:[h]},r={handleChange:d(),disabled:!1,error:!1,field:"field",value:"",dependencyValues:void 0,controlOptions:{autoCompleteFields:[{label:"aaa",value:"aaa"},{label:"bbb",value:"bbb"},{label:"ccc",value:"ccc"},{label:"ddd",value:"ddd"},{label:"test",value:"test"},{label:"test1",value:"test1"},{label:"test2",value:"test2"},{label:"test3",value:"test3"},{label:"test4",value:"test4"},{label:"test5",value:"test5"}],endpointUrl:void 0,denyList:"denyList",allowList:"allowList",dependencies:void 0,createSearchChoice:!0,referenceName:void 0,disableSearch:!0,labelField:"labelField",hideClearBtn:!1},required:!1},e={args:r},t={args:{...r,controlOptions:{createSearchChoice:!0}}},o={args:{...r,controlOptions:{...r.controlOptions,allowList:"test1",denyList:"test1",referenceName:"refernceName"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};const fe=["SelectList","AcceptAnyInput","AllowDenyListFromBackend"];export{t as AcceptAnyInput,o as AllowDenyListFromBackend,e as SelectList,fe as __namedExportsOrder,ue as default};
