import{h as p,H as u,g as c,r as b,j as f}from"./iframe-BybQmYhs.js";import{e as s}from"./ControlWrapper-DW1ssuup.js";import{g as v}from"./globalConfigMock-DBWuimWf.js";import{s as _}from"./util-CwSpPLLj.js";import{w as h}from"./withControlGroup-BJ6Sc_PQ.js";import"./preload-helper-BWMXw09x.js";import"./Date-BwH_Uvrg.js";import"./lodash-BinLombY.js";import"./includes-C10hJJlp.js";import"./ChevronLeft-BdtWL9An.js";import"./ChevronRight-Cuua9ySr.js";import"./isEqual-t5_yoTve.js";import"./_baseIsEqual-CpM8zJ8H.js";import"./Popover-Bq-E0Lli.js";import"./_arrayIncludesWith-CAwgIatL.js";import"./ScrollContainerContext-CT0yTyFc.js";import"./index-BWpmYAE4.js";import"./Box-Qxlnrgei.js";import"./_baseIteratee-D2Sk1jod.js";import"./ExclamationTriangle-np3aM2XP.js";import"./Tooltip-D3jrOxmc.js";import"./InformationCircle-CW3KzXgV.js";import"./MarkdownMessage-CMGJKqHa.js";import"./Link-DMTOu5_Y.js";import"./Divider-BWQHoYm-.js";import"./CollapsiblePanel-B2Pplelk.js";import"./pick-S4WDSwY2.js";import"./Menu-Cw2EvSGZ.js";import"./Dropdown-ChPXRHzi.js";import"./textUtils-BWv0koaU.js";import"./Number-Cq_yzL8f.js";import"./url-BycM6uy-.js";import"./_baseDifference-CKo66-zF.js";import"./api-DcmWZcVU.js";import"./url-CVF012Ry.js";import"./messageUtil-CRqYlSDi.js";import"./DatePickerComponent-C7BptdDe.js";import"./script-DKIohx6e.js";import"./Group-z9SGg5Y_.js";const{fn:l}=__STORYBOOK_MODULE_TEST__,le={component:s,title:"MultiInputComponent",render:a=>{const r=v();_(r);const[i,d]=b.useState(a?.value||"");return f.jsx(s,{...a,value:i,handleChange:(m,o)=>{d(o),a.handleChange(m,o)}})},decorators:[h]},e={args:{handleChange:l(),field:"field",controlOptions:{items:[{label:"label1",value:"value1"},{label:"label2",value:"value2"},{label:"label3",value:"value3"}]}}},n={args:{handleChange:l(),field:"field",controlOptions:{delimiter:",",createSearchChoice:!0,referenceName:"referenceName",dependencies:void 0,endpointUrl:void 0,denyList:"value1",allowList:"string",labelField:"labelField",items:[{label:"label1",value:"value1"},{label:"label2",value:"value2"},{label:"label3",value:"value3"}]},disabled:!1,value:void 0,dependencyValues:{}}},t={args:{handleChange:l(),field:"field",controlOptions:{delimiter:",",createSearchChoice:!0,dependencies:void 0,denyList:void 0,allowList:void 0,labelField:"testLabel",valueField:"testValue",endpointUrl:"/demo_addon_for_splunk/some_API_endpint_for_select_data"},disabled:!1,value:void 0,dependencyValues:{}},parameters:{msw:{handlers:[p.get("demo_addon_for_splunk/some_API_endpint_for_select_data",()=>u.json(c([{name:"dataFromApiTest1",content:{testLabel:"aaa1",testValue:"bbb1"}},{name:"dataFromApiTest2",content:{testLabel:"aaa2",testValue:"bbb2"}},{name:"dataFromApiTest3",content:{testLabel:"aaa3",testValue:"bbb3"}},{name:"dataFromApiTest4",content:{testLabel:"aaa4",testValue:"bbb4"}},{name:"d1",content:{testLabel:"firstLabel",testValue:"firstValue"}},{name:"d2",content:{testLabel:"secondLabel",testValue:"secondValue"}},{name:"d3",content:{testLabel:"thirdLabel",testValue:"thirdValue"}},{name:"d4",content:{testLabel:"fourthLabel",testValue:"fourthValue"}}])))]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const oe=["Base","AllProps","EndpointApi"];export{n as AllProps,e as Base,t as EndpointApi,oe as __namedExportsOrder,le as default};
