import{j as p}from"./jsx-runtime-ClejQJRV.js";import{r as u}from"./index-BnZYiL63.js";import{f as l}from"./index-CvFo5rXR.js";import{h as c,H as b}from"./index-CTWv8l7u.js";import{M as r}from"./MultiInputComponent-DSUjIdt4.js";import{g as f}from"./globalConfigMock-DihuT9Zd.js";import{s as v}from"./util-9s_bzyAI.js";import{g as h}from"./server-response-Cmhjwb6A.js";import{w as L}from"./withControlGroup-BJQrrEa9.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./Clickable-Bwca2DKB.js";import"./index-C6Xwkj2v.js";import"./index-NODxQXf6.js";import"./Menu-RgiCwolK.js";import"./Divider-PTLijbug.js";import"./Heading-9qvZOIYU.js";import"./ChevronRight-DdqaOJ2q.js";import"./IconProvider-BEtmCpKb.js";import"./Switch-DviBBIIV.js";import"./ScreenReaderContent-BTHKdSEY.js";import"./Box-ikMjEsld.js";import"./ArrowSquareTopRight-B5BPln_L.js";import"./External-N3vgloA-.js";import"./extend-co5plJTM.js";import"./TextArea-W5IxQHto.js";import"./ControlGroup-BdgR-Lfo.js";import"./find-gWtmx_xX.js";import"./Tooltip-C8RPrfb3.js";import"./style-Df2q8Zk_.js";import"./Close-Bj9wtoJU.js";import"./Button-CaNu-0_n.js";import"./WaitSpinner-CNexVZJK.js";import"./Link-em2tLaYv.js";import"./Text-BNJLg959.js";import"./usePrevious-T3tkdeEg.js";import"./color-arUTSqUp.js";import"./format-D2VnRqHv.js";import"./api-DePkw_zr.js";import"./url-DcGE77xy.js";import"./messageUtil-1EVq4BLQ.js";import"./invariant-Cbo0Fu-i.js";import"./utils-CEqOZghX.js";import"./ControlGroup-DNw1xQ1K.js";const ie={component:r,title:"MultiInputComponent",render:a=>{const s=f();v(s);const[i,d]=u.useState(a?.value||"");return p.jsx(r,{...a,value:i,handleChange:(m,o)=>{d(o),a.handleChange(m,o)}})},decorators:[L]},e={args:{handleChange:l(),field:"field",controlOptions:{items:[{label:"label1",value:"value1"},{label:"label2",value:"value2"},{label:"label3",value:"value3"}]}}},n={args:{handleChange:l(),field:"field",controlOptions:{delimiter:",",createSearchChoice:!0,referenceName:"referenceName",dependencies:void 0,endpointUrl:void 0,denyList:"value1",allowList:"string",labelField:"labelField",items:[{label:"label1",value:"value1"},{label:"label2",value:"value2"},{label:"label3",value:"value3"}]},disabled:!1,value:void 0,dependencyValues:{}}},t={args:{handleChange:l(),field:"field",controlOptions:{delimiter:",",createSearchChoice:!0,dependencies:void 0,denyList:void 0,allowList:void 0,labelField:"testLabel",valueField:"testValue",endpointUrl:"/demo_addon_for_splunk/some_API_endpint_for_select_data"},disabled:!1,value:void 0,dependencyValues:{}},parameters:{msw:{handlers:[c.get("demo_addon_for_splunk/some_API_endpint_for_select_data",()=>b.json(h([{name:"dataFromApiTest1",content:{testLabel:"aaa1",testValue:"bbb1"}},{name:"dataFromApiTest2",content:{testLabel:"aaa2",testValue:"bbb2"}},{name:"dataFromApiTest3",content:{testLabel:"aaa3",testValue:"bbb3"}},{name:"dataFromApiTest4",content:{testLabel:"aaa4",testValue:"bbb4"}},{name:"d1",content:{testLabel:"firstLabel",testValue:"firstValue"}},{name:"d2",content:{testLabel:"secondLabel",testValue:"secondValue"}},{name:"d3",content:{testLabel:"thirdLabel",testValue:"thirdValue"}},{name:"d4",content:{testLabel:"fourthLabel",testValue:"fourthValue"}}])))]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const de=["Base","AllProps","EndpointApi"];export{n as AllProps,e as Base,t as EndpointApi,de as __namedExportsOrder,ie as default};
