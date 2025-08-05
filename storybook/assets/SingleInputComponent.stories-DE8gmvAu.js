import{j as l}from"./jsx-runtime-D55GQ3BV.js";import{r as c}from"./index-CtTTUaxh.js";import{f as d}from"./index-3UExtwfn.js";import{h as u,H as f}from"./index-C5aCdurT.js";import{S as i}from"./SingleInputComponent-B_BYarEL.js";import{s as b}from"./util-nv791zPf.js";import{g}from"./globalConfigMock-BOeK-gsx.js";import{m as v}from"./server-response-Cmhjwb6A.js";import{w as h}from"./withControlGroup-DEXNoma6.js";import"./_commonjsHelpers-CE1G-McA.js";import"./iframe-Cp62kWYG.js";import"./index-BAMY2Nnw.js";import"./_arrayIncludesWith-Cf8RQZ1L.js";import"./Clickable-gBf45GFR.js";import"./index-TwQu68rg.js";import"./index-BKv2EDKS.js";import"./extend-DuyhAT9M.js";import"./noop-CoMJoj29.js";import"./_baseDifference-C3Q7_G0N.js";import"./find-DOPPtTO5.js";import"./Link-DTBEsgMb.js";import"./ScreenReaderContent-qsyEXMyy.js";import"./ArrowSquareTopRight-2nx1XQBJ.js";import"./IconProvider-DfXPuXoa.js";import"./External-CYO48bYj.js";import"./Menu-Dc46JiH0.js";import"./Divider-DpeIN7LP.js";import"./Heading-De4XED9R.js";import"./ChevronRight-dvcXO2Iz.js";import"./Switch-Bh6TuT65.js";import"./Box-BaDtlhAb.js";import"./ResultsMenu-Ddbkllha.js";import"./WaitSpinner-l7cUSAmq.js";import"./Text-CEFHVeb6.js";import"./ControlGroup-h1kJxx7z.js";import"./Tooltip-nNqhIvge.js";import"./Close-DT0qGRBu.js";import"./TextArea-CSOBYjfB.js";import"./style-gb7uifME.js";import"./Button-fPXh-Lq2.js";import"./usePrevious-q-aoz80S.js";import"./filter-B4FjaX6z.js";import"./Button-CSLC7xhu.js";import"./Clear-C1R2h3S5.js";import"./SVGInternal-zggHEN0-.js";import"./messageUtil-DnHFL-Io.js";import"./variables-BqwaEspd.js";import"./variables-DTFMykBX.js";import"./api-GqO88VGt.js";import"./url-DNBCE42A.js";import"./considerFalseAndTruthy-D4Pwj1gQ.js";import"./utils-CEqOZghX.js";import"./invariant-Cbo0Fu-i.js";import"./ControlGroup-Dz58dqqR.js";const Se={component:i,title:"SingleInputComponent",parameters:{msw:{handlers:[u.get("/servicesNS/nobody/-/*",()=>f.json(v))]}},render:a=>{const[m,n]=c.useState(a.value);return b(g()),l.jsx(i,{...a,handleChange:(p,s)=>{typeof s=="string"&&n(s),a.handleChange(p,s)},value:m})},decorators:[h]},r={handleChange:d(),disabled:!1,error:!1,field:"field",value:"",dependencyValues:void 0,controlOptions:{autoCompleteFields:[{label:"aaa",value:"aaa"},{label:"bbb",value:"bbb"},{label:"ccc",value:"ccc"},{label:"ddd",value:"ddd"},{label:"test",value:"test"},{label:"test1",value:"test1"},{label:"test2",value:"test2"},{label:"test3",value:"test3"},{label:"test4",value:"test4"},{label:"test5",value:"test5"}],endpointUrl:void 0,denyList:"denyList",allowList:"allowList",dependencies:void 0,createSearchChoice:!0,referenceName:void 0,disableSearch:!0,labelField:"labelField",hideClearBtn:!1},required:!1},e={args:r},t={args:{...r,controlOptions:{createSearchChoice:!0}}},o={args:{...r,controlOptions:{...r.controlOptions,allowList:"test1",denyList:"test1",referenceName:"refernceName"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};const Ce=["SelectList","AcceptAnyInput","AllowDenyListFromBackend"];export{t as AcceptAnyInput,o as AllowDenyListFromBackend,e as SelectList,Ce as __namedExportsOrder,Se as default};
