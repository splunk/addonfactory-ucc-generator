import{j as p}from"./jsx-runtime-ClejQJRV.js";import{r as u}from"./index-BnZYiL63.js";import{f as l}from"./index-y4Yn5WZ1.js";import{h as c,H as b}from"./index-DgRvTSw_.js";import{M as r}from"./MultiInputComponent-T90e_uJj.js";import{g as f}from"./globalConfigMock-CjVyTY6j.js";import{s as v}from"./util-DfUvgPwM.js";import{g as h}from"./server-response-Cmhjwb6A.js";import{w as L}from"./withControlGroup-DhG-ZuCY.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./iframe-B0-yMJSF.js";import"./index-BAMY2Nnw.js";import"./Multiselect-DzTVP2xI.js";import"./Clickable-wzamu0qE.js";import"./index-C6Xwkj2v.js";import"./index-BeaWwRds.js";import"./Menu-CO_c8kuU.js";import"./Divider-BxwkhgHI.js";import"./Heading-2h2rzLUR.js";import"./ChevronRight-BZ9dd8ev.js";import"./IconProvider-D1bqsLqQ.js";import"./Switch-DAz2gr6S.js";import"./ScreenReaderContent-DTnCP1nJ.js";import"./Box-9y-3oeI2.js";import"./ArrowSquareTopRight-cE1IFp2S.js";import"./External-CaozYYRu.js";import"./extend-BCHzQ2P0.js";import"./TextArea-WoYN_p44.js";import"./ControlGroup-D1l7iBTi.js";import"./find-D36SYLnv.js";import"./Tooltip-s2-C62Iv.js";import"./style-gy5-imeJ.js";import"./Close-CPSltoSy.js";import"./Button-JhicfZMm.js";import"./Search-DJ2srasI.js";import"./WaitSpinner-pc6awGU8.js";import"./Link-B3IMA5iK.js";import"./Text-CXLzpk1L.js";import"./usePrevious-T3tkdeEg.js";import"./format-pOB4dcXd.js";import"./api-D6WilaDV.js";import"./url-CzOjCGiC.js";import"./messageUtil-CXCS-b_z.js";import"./invariant-Cbo0Fu-i.js";import"./utils-CEqOZghX.js";import"./ControlGroup-a8oyWZe3.js";const pe={component:r,title:"MultiInputComponent",render:a=>{const s=f();v(s);const[i,d]=u.useState(a?.value||"");return p.jsx(r,{...a,value:i,handleChange:(m,o)=>{d(o),a.handleChange(m,o)}})},decorators:[L]},e={args:{handleChange:l(),field:"field",controlOptions:{items:[{label:"label1",value:"value1"},{label:"label2",value:"value2"},{label:"label3",value:"value3"}]}}},n={args:{handleChange:l(),field:"field",controlOptions:{delimiter:",",createSearchChoice:!0,referenceName:"referenceName",dependencies:void 0,endpointUrl:void 0,denyList:"value1",allowList:"string",labelField:"labelField",items:[{label:"label1",value:"value1"},{label:"label2",value:"value2"},{label:"label3",value:"value3"}]},disabled:!1,value:void 0,dependencyValues:{}}},t={args:{handleChange:l(),field:"field",controlOptions:{delimiter:",",createSearchChoice:!0,dependencies:void 0,denyList:void 0,allowList:void 0,labelField:"testLabel",valueField:"testValue",endpointUrl:"/demo_addon_for_splunk/some_API_endpint_for_select_data"},disabled:!1,value:void 0,dependencyValues:{}},parameters:{msw:{handlers:[c.get("demo_addon_for_splunk/some_API_endpint_for_select_data",()=>b.json(h([{name:"dataFromApiTest1",content:{testLabel:"aaa1",testValue:"bbb1"}},{name:"dataFromApiTest2",content:{testLabel:"aaa2",testValue:"bbb2"}},{name:"dataFromApiTest3",content:{testLabel:"aaa3",testValue:"bbb3"}},{name:"dataFromApiTest4",content:{testLabel:"aaa4",testValue:"bbb4"}},{name:"d1",content:{testLabel:"firstLabel",testValue:"firstValue"}},{name:"d2",content:{testLabel:"secondLabel",testValue:"secondValue"}},{name:"d3",content:{testLabel:"thirdLabel",testValue:"thirdValue"}},{name:"d4",content:{testLabel:"fourthLabel",testValue:"fourthValue"}}])))]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const ue=["Base","AllProps","EndpointApi"];export{n as AllProps,e as Base,t as EndpointApi,ue as __namedExportsOrder,pe as default};
