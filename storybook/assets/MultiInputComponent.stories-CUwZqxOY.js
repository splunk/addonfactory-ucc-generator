import{h as p,H as u,g as c,r as b,j as f}from"./iframe-CkO-8h3X.js";import{e as s}from"./ControlWrapper-8LmMu1gh.js";import{g as v}from"./globalConfigMock-C68BzUr-.js";import{s as _}from"./util-DhnbgUjE.js";import{w as h}from"./withControlGroup-RXTCRBts.js";import"./preload-helper-BWMXw09x.js";import"./Date-BPwjYypH.js";import"./lodash-DC5tP0FI.js";import"./includes-CeWRCqDz.js";import"./ChevronLeft-CFN5hHG6.js";import"./ChevronRight-DlBO1xqA.js";import"./isEqual-D_kYa9Y5.js";import"./_baseIsEqual-BA1SpDro.js";import"./Popover-CCWJKSFR.js";import"./_arrayIncludesWith-CKt2KOEb.js";import"./ScrollContainerContext-B3z9T_lz.js";import"./Box-C3_NwA3u.js";import"./_baseIteratee-CKKdKeVM.js";import"./ExclamationTriangle-BPrZIRtp.js";import"./Tooltip-Nygr4oAo.js";import"./InformationCircle-dv8wnI9A.js";import"./MarkdownMessage-B9v76_pw.js";import"./Link-CETJi4Jo.js";import"./Divider-CkbYBkxJ.js";import"./CollapsiblePanel-CN6WDnk5.js";import"./pick-Toh7DJ-o.js";import"./Menu-Bq9H8ILd.js";import"./Dropdown-DdfZSMfv.js";import"./textUtils-Bj3ckYR9.js";import"./Number-DcvxqngO.js";import"./url-BGnD4wdp.js";import"./_baseDifference-BpZKW9m7.js";import"./api-brTVIpnl.js";import"./url-DqCSShB-.js";import"./messageUtil-CjQtoyHX.js";import"./DatePickerComponent-BAU-o5w3.js";import"./script-C_nnifbq.js";import"./Group-CG6LE1cd.js";const{fn:l}=__STORYBOOK_MODULE_TEST__,ae={component:s,title:"MultiInputComponent",render:a=>{const r=v();_(r);const[i,d]=b.useState(a?.value||"");return f.jsx(s,{...a,value:i,handleChange:(m,o)=>{d(o),a.handleChange(m,o)}})},decorators:[h]},e={args:{handleChange:l(),field:"field",controlOptions:{items:[{label:"label1",value:"value1"},{label:"label2",value:"value2"},{label:"label3",value:"value3"}]}}},n={args:{handleChange:l(),field:"field",controlOptions:{delimiter:",",createSearchChoice:!0,referenceName:"referenceName",dependencies:void 0,endpointUrl:void 0,denyList:"value1",allowList:"string",labelField:"labelField",items:[{label:"label1",value:"value1"},{label:"label2",value:"value2"},{label:"label3",value:"value3"}]},disabled:!1,value:void 0,dependencyValues:{}}},t={args:{handleChange:l(),field:"field",controlOptions:{delimiter:",",createSearchChoice:!0,dependencies:void 0,denyList:void 0,allowList:void 0,labelField:"testLabel",valueField:"testValue",endpointUrl:"/demo_addon_for_splunk/some_API_endpint_for_select_data"},disabled:!1,value:void 0,dependencyValues:{}},parameters:{msw:{handlers:[p.get("demo_addon_for_splunk/some_API_endpint_for_select_data",()=>u.json(c([{name:"dataFromApiTest1",content:{testLabel:"aaa1",testValue:"bbb1"}},{name:"dataFromApiTest2",content:{testLabel:"aaa2",testValue:"bbb2"}},{name:"dataFromApiTest3",content:{testLabel:"aaa3",testValue:"bbb3"}},{name:"dataFromApiTest4",content:{testLabel:"aaa4",testValue:"bbb4"}},{name:"d1",content:{testLabel:"firstLabel",testValue:"firstValue"}},{name:"d2",content:{testLabel:"secondLabel",testValue:"secondValue"}},{name:"d3",content:{testLabel:"thirdLabel",testValue:"thirdValue"}},{name:"d4",content:{testLabel:"fourthLabel",testValue:"fourthValue"}}])))]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const le=["Base","AllProps","EndpointApi"];export{n as AllProps,e as Base,t as EndpointApi,le as __namedExportsOrder,ae as default};
