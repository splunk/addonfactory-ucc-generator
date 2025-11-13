import{j as l}from"./jsx-runtime-1FKYbnEZ.js";import{r as c}from"./index-prPvd6Su.js";import{f as d}from"./index-CbXqJOWQ.js";import{h as u,H as f}from"./index-kle9pbY7.js";import{S as i}from"./ControlWrapper-D33h4I9C.js";import{s as b}from"./util-DDtLIPUa.js";import{g}from"./globalConfigMock-BBisBB0K.js";import{m as v}from"./server-response-Cmhjwb6A.js";import{w as h}from"./withControlGroup-B6DlwRHz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./iframe-DjmNRUro.js";import"./index-BAMY2Nnw.js";import"./Date-Cmj0Txw8.js";import"./omit-CSe7u5nZ.js";import"./Clickable-DCLrgFHL.js";import"./_baseIteratee-ksDslDTl.js";import"./includes-BAN5eljv.js";import"./ScreenReaderContent-DTgcavZU.js";import"./ChevronLeft-Ct0yUEYy.js";import"./ChevronRight-DDG3shYt.js";import"./isEqual-BwSphrxz.js";import"./Button-B9G_4Mfe.js";import"./ButtonSimple-DKTsOMzA.js";import"./Popover-FB-oYrLK.js";import"./_arrayIncludesWith-CeAjGiZp.js";import"./Box-BIQRv08s.js";import"./index-BQPxV8oF.js";import"./AnimationToggle-C6vyuf54.js";import"./ScrollContainerContext-XRarVF06.js";import"./ExclamationTriangle-D5UvzwJa.js";import"./Tooltip-B7RmVpsU.js";import"./InformationCircle-B-Mq5DmP.js";import"./index-CMxbcET4.js";import"./MarkdownMessage-r_yijvo_.js";import"./Link-BguIxQc6.js";import"./Divider-BmXthNdG.js";import"./Button-VhSyjuIj.js";import"./CollapsiblePanel-aG-BiLiH.js";import"./variables-BwqdKhvQ.js";import"./pick-BmRvtkqO.js";import"./Menu-IFF89z9L.js";import"./Dropdown-_2BgLkF4.js";import"./textUtils-LveNtyW9.js";import"./Number-BH7oUVAk.js";import"./url-cUhQ41mg.js";import"./_baseDifference-B9g_NAZa.js";import"./WaitSpinner-D3j-Jqu7.js";import"./api-BLOSKcgX.js";import"./url-xolDOGfA.js";import"./messageUtil-CQS9-IEm.js";import"./DatePickerComponent-CboCMxQ5.js";import"./script-wa9wuYzj.js";import"./Group-VVWCvCTc.js";const he={component:i,title:"SingleInputComponent",parameters:{msw:{handlers:[u.get("/servicesNS/nobody/-/*",()=>f.json(v))]}},render:a=>{const[n,m]=c.useState(a.value);return b(g()),l.jsx(i,{...a,handleChange:(p,s)=>{typeof s=="string"&&m(s),a.handleChange(p,s)},value:n})},decorators:[h]},r={handleChange:d(),disabled:!1,error:!1,field:"field",value:"",dependencyValues:void 0,controlOptions:{autoCompleteFields:[{label:"aaa",value:"aaa"},{label:"bbb",value:"bbb"},{label:"ccc",value:"ccc"},{label:"ddd",value:"ddd"},{label:"test",value:"test"},{label:"test1",value:"test1"},{label:"test2",value:"test2"},{label:"test3",value:"test3"},{label:"test4",value:"test4"},{label:"test5",value:"test5"}],endpointUrl:void 0,denyList:"denyList",allowList:"allowList",dependencies:void 0,createSearchChoice:!0,referenceName:void 0,disableSearch:!0,labelField:"labelField",hideClearBtn:!1},required:!1},e={args:r},t={args:{...r,controlOptions:{createSearchChoice:!0}}},o={args:{...r,controlOptions:{...r.controlOptions,allowList:"test1",denyList:"test1",referenceName:"refernceName"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};const Se=["SelectList","AcceptAnyInput","AllowDenyListFromBackend"];export{t as AcceptAnyInput,o as AllowDenyListFromBackend,e as SelectList,Se as __namedExportsOrder,he as default};
