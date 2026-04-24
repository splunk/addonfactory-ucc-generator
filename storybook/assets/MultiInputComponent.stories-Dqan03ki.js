import{h as u,H as p,g as c,r as b,j as f}from"./iframe-dpjTMnOC.js";import{e as s}from"./ControlWrapper-BM5zRGNC.js";import{g as v}from"./globalConfigMock-BVxEarns.js";import{s as _}from"./util-DakudGGz.js";import{w as h}from"./withControlGroup-BbgsCEf2.js";import"./index-nuYtCEEu.js";import"./Date-XutZtAHB.js";import"./id-Db1E8M8a.js";import"./ScrollContainerContext-DogtmX69.js";import"./Box-DE7m460s.js";import"./ChevronLeft-0NIlqeDI.js";import"./ChevronRight-CAKwgwce.js";import"./Popover-D3MLdcR2.js";import"./ExclamationTriangle-CApgSVdg.js";import"./Tooltip-D0dtXLIo.js";import"./InformationCircle-B-WxxbMa.js";import"./MarkdownMessage-Botp4GAi.js";import"./Link-DETRhvtj.js";import"./Divider-BI7HZr8y.js";import"./CollapsiblePanel-DVzU4Rpc.js";import"./pick-JbkSLyfC.js";import"./Menu-BaV4-Toi.js";import"./Dropdown-BSmjb7Ht.js";import"./textUtils-D6rK6Eep.js";import"./Number-EeQbK4AB.js";import"./api-CjZPq5JP.js";import"./url-cmzogVIW.js";import"./url-DGkq2p2F.js";import"./messageUtil-DTEwCut0.js";import"./DatePickerComponent-DH2M6FjX.js";import"./script-DFaIqjR1.js";import"./Group-Bp5WCcDP.js";const{fn:l}=__STORYBOOK_MODULE_TEST__,X={component:s,title:"MultiInputComponent",render:t=>{const r=v();_(r);const[i,d]=b.useState(t?.value||"");return f.jsx(s,{...t,value:i,handleChange:(m,o)=>{d(o),t.handleChange(m,o)}})},decorators:[h]},e={args:{handleChange:l(),field:"field",controlOptions:{items:[{label:"label1",value:"value1"},{label:"label2",value:"value2"},{label:"label3",value:"value3"}]}}},n={args:{handleChange:l(),field:"field",controlOptions:{delimiter:",",createSearchChoice:!0,referenceName:"referenceName",dependencies:void 0,endpointUrl:void 0,denyList:"value1",allowList:"string",labelField:"labelField",items:[{label:"label1",value:"value1"},{label:"label2",value:"value2"},{label:"label3",value:"value3"}]},disabled:!1,value:void 0,dependencyValues:{}}},a={args:{handleChange:l(),field:"field",controlOptions:{delimiter:",",createSearchChoice:!0,dependencies:void 0,denyList:void 0,allowList:void 0,labelField:"testLabel",valueField:"testValue",endpointUrl:"/demo_addon_for_splunk/some_API_endpint_for_select_data"},disabled:!1,value:void 0,dependencyValues:{}},parameters:{msw:{handlers:[u.get("demo_addon_for_splunk/some_API_endpint_for_select_data",()=>p.json(c([{name:"dataFromApiTest1",content:{testLabel:"aaa1",testValue:"bbb1"}},{name:"dataFromApiTest2",content:{testLabel:"aaa2",testValue:"bbb2"}},{name:"dataFromApiTest3",content:{testLabel:"aaa3",testValue:"bbb3"}},{name:"dataFromApiTest4",content:{testLabel:"aaa4",testValue:"bbb4"}},{name:"d1",content:{testLabel:"firstLabel",testValue:"firstValue"}},{name:"d2",content:{testLabel:"secondLabel",testValue:"secondValue"}},{name:"d3",content:{testLabel:"thirdLabel",testValue:"thirdValue"}},{name:"d4",content:{testLabel:"fourthLabel",testValue:"fourthValue"}}])))]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};const Z=["Base","AllProps","EndpointApi"];export{n as AllProps,e as Base,a as EndpointApi,Z as __namedExportsOrder,X as default};
