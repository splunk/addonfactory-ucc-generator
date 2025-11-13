import{j as p}from"./jsx-runtime-1FKYbnEZ.js";import{r as u}from"./index-prPvd6Su.js";import{f as l}from"./index-CbXqJOWQ.js";import{h as c,H as b}from"./index-kle9pbY7.js";import{i as r}from"./ControlWrapper-D33h4I9C.js";import{g as f}from"./globalConfigMock-BBisBB0K.js";import{s as v}from"./util-DDtLIPUa.js";import{g as h}from"./server-response-Cmhjwb6A.js";import{w as L}from"./withControlGroup-B6DlwRHz.js";import"./_commonjsHelpers-CE1G-McA.js";import"./iframe-DjmNRUro.js";import"./index-BAMY2Nnw.js";import"./Date-Cmj0Txw8.js";import"./omit-CSe7u5nZ.js";import"./Clickable-DCLrgFHL.js";import"./_baseIteratee-ksDslDTl.js";import"./includes-BAN5eljv.js";import"./ScreenReaderContent-DTgcavZU.js";import"./ChevronLeft-Ct0yUEYy.js";import"./ChevronRight-DDG3shYt.js";import"./isEqual-BwSphrxz.js";import"./Button-B9G_4Mfe.js";import"./ButtonSimple-DKTsOMzA.js";import"./Popover-FB-oYrLK.js";import"./_arrayIncludesWith-CeAjGiZp.js";import"./Box-BIQRv08s.js";import"./index-BQPxV8oF.js";import"./AnimationToggle-C6vyuf54.js";import"./ScrollContainerContext-XRarVF06.js";import"./ExclamationTriangle-D5UvzwJa.js";import"./Tooltip-B7RmVpsU.js";import"./InformationCircle-B-Mq5DmP.js";import"./index-CMxbcET4.js";import"./MarkdownMessage-r_yijvo_.js";import"./Link-BguIxQc6.js";import"./Divider-BmXthNdG.js";import"./Button-VhSyjuIj.js";import"./CollapsiblePanel-aG-BiLiH.js";import"./variables-BwqdKhvQ.js";import"./pick-BmRvtkqO.js";import"./Menu-IFF89z9L.js";import"./Dropdown-_2BgLkF4.js";import"./textUtils-LveNtyW9.js";import"./Number-BH7oUVAk.js";import"./url-cUhQ41mg.js";import"./_baseDifference-B9g_NAZa.js";import"./WaitSpinner-D3j-Jqu7.js";import"./api-BLOSKcgX.js";import"./url-xolDOGfA.js";import"./messageUtil-CQS9-IEm.js";import"./DatePickerComponent-CboCMxQ5.js";import"./script-wa9wuYzj.js";import"./Group-VVWCvCTc.js";const Le={component:r,title:"MultiInputComponent",render:a=>{const s=f();v(s);const[i,d]=u.useState(a?.value||"");return p.jsx(r,{...a,value:i,handleChange:(m,o)=>{d(o),a.handleChange(m,o)}})},decorators:[L]},e={args:{handleChange:l(),field:"field",controlOptions:{items:[{label:"label1",value:"value1"},{label:"label2",value:"value2"},{label:"label3",value:"value3"}]}}},n={args:{handleChange:l(),field:"field",controlOptions:{delimiter:",",createSearchChoice:!0,referenceName:"referenceName",dependencies:void 0,endpointUrl:void 0,denyList:"value1",allowList:"string",labelField:"labelField",items:[{label:"label1",value:"value1"},{label:"label2",value:"value2"},{label:"label3",value:"value3"}]},disabled:!1,value:void 0,dependencyValues:{}}},t={args:{handleChange:l(),field:"field",controlOptions:{delimiter:",",createSearchChoice:!0,dependencies:void 0,denyList:void 0,allowList:void 0,labelField:"testLabel",valueField:"testValue",endpointUrl:"/demo_addon_for_splunk/some_API_endpint_for_select_data"},disabled:!1,value:void 0,dependencyValues:{}},parameters:{msw:{handlers:[c.get("demo_addon_for_splunk/some_API_endpint_for_select_data",()=>b.json(h([{name:"dataFromApiTest1",content:{testLabel:"aaa1",testValue:"bbb1"}},{name:"dataFromApiTest2",content:{testLabel:"aaa2",testValue:"bbb2"}},{name:"dataFromApiTest3",content:{testLabel:"aaa3",testValue:"bbb3"}},{name:"dataFromApiTest4",content:{testLabel:"aaa4",testValue:"bbb4"}},{name:"d1",content:{testLabel:"firstLabel",testValue:"firstValue"}},{name:"d2",content:{testLabel:"secondLabel",testValue:"secondValue"}},{name:"d3",content:{testLabel:"thirdLabel",testValue:"thirdValue"}},{name:"d4",content:{testLabel:"fourthLabel",testValue:"fourthValue"}}])))]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    handleChange: fn(),
    field: 'field',
    controlOptions: {
      items: [{
        label: 'label1',
        value: 'value1'
      }, {
        label: 'label2',
        value: 'value2'
      }, {
        label: 'label3',
        value: 'value3'
      }]
    }
  }
}`,...e.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    handleChange: fn(),
    field: 'field',
    controlOptions: {
      delimiter: ',',
      createSearchChoice: true,
      referenceName: 'referenceName',
      dependencies: undefined,
      endpointUrl: undefined,
      denyList: 'value1',
      allowList: 'string',
      labelField: 'labelField',
      items: [{
        label: 'label1',
        value: 'value1'
      }, {
        label: 'label2',
        value: 'value2'
      }, {
        label: 'label3',
        value: 'value3'
      }]
    },
    disabled: false,
    value: undefined,
    dependencyValues: {}
  }
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    handleChange: fn(),
    field: 'field',
    controlOptions: {
      delimiter: ',',
      createSearchChoice: true,
      dependencies: undefined,
      denyList: undefined,
      allowList: undefined,
      labelField: 'testLabel',
      valueField: 'testValue',
      endpointUrl: '/demo_addon_for_splunk/some_API_endpint_for_select_data'
    },
    disabled: false,
    value: undefined,
    dependencyValues: {}
  },
  parameters: {
    msw: {
      handlers: [http.get('demo_addon_for_splunk/some_API_endpint_for_select_data', () => HttpResponse.json(getMockServerResponseForInput([{
        name: 'dataFromApiTest1',
        content: {
          testLabel: 'aaa1',
          testValue: 'bbb1'
        }
      }, {
        name: 'dataFromApiTest2',
        content: {
          testLabel: 'aaa2',
          testValue: 'bbb2'
        }
      }, {
        name: 'dataFromApiTest3',
        content: {
          testLabel: 'aaa3',
          testValue: 'bbb3'
        }
      }, {
        name: 'dataFromApiTest4',
        content: {
          testLabel: 'aaa4',
          testValue: 'bbb4'
        }
      }, {
        name: 'd1',
        content: {
          testLabel: 'firstLabel',
          testValue: 'firstValue'
        }
      }, {
        name: 'd2',
        content: {
          testLabel: 'secondLabel',
          testValue: 'secondValue'
        }
      }, {
        name: 'd3',
        content: {
          testLabel: 'thirdLabel',
          testValue: 'thirdValue'
        }
      }, {
        name: 'd4',
        content: {
          testLabel: 'fourthLabel',
          testValue: 'fourthValue'
        }
      }])))]
    }
  }
}`,...t.parameters?.docs?.source}}};const _e=["Base","AllProps","EndpointApi"];export{n as AllProps,e as Base,t as EndpointApi,_e as __namedExportsOrder,Le as default};
