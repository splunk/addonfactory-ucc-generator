import{j as p}from"./jsx-runtime-D55GQ3BV.js";import{r as u}from"./index-CtTTUaxh.js";import{f as l}from"./index-3UExtwfn.js";import{h as c,H as b}from"./index-C5aCdurT.js";import{M as r}from"./MultiInputComponent-BkSs0dtz.js";import{g as f}from"./globalConfigMock-BOeK-gsx.js";import{s as v}from"./util-nv791zPf.js";import{g as h}from"./server-response-Cmhjwb6A.js";import{w as L}from"./withControlGroup-DEXNoma6.js";import"./_commonjsHelpers-CE1G-McA.js";import"./iframe-Cp62kWYG.js";import"./index-BAMY2Nnw.js";import"./_arrayIncludesWith-Cf8RQZ1L.js";import"./Clickable-gBf45GFR.js";import"./index-TwQu68rg.js";import"./index-BKv2EDKS.js";import"./Menu-Dc46JiH0.js";import"./Divider-DpeIN7LP.js";import"./Heading-De4XED9R.js";import"./ChevronRight-dvcXO2Iz.js";import"./IconProvider-DfXPuXoa.js";import"./Switch-Bh6TuT65.js";import"./ScreenReaderContent-qsyEXMyy.js";import"./Box-BaDtlhAb.js";import"./ArrowSquareTopRight-2nx1XQBJ.js";import"./External-CYO48bYj.js";import"./extend-DuyhAT9M.js";import"./noop-CoMJoj29.js";import"./_baseDifference-C3Q7_G0N.js";import"./find-DOPPtTO5.js";import"./Link-DTBEsgMb.js";import"./ResultsMenu-Ddbkllha.js";import"./WaitSpinner-l7cUSAmq.js";import"./Text-CEFHVeb6.js";import"./ControlGroup-h1kJxx7z.js";import"./Tooltip-nNqhIvge.js";import"./Close-DT0qGRBu.js";import"./TextArea-CSOBYjfB.js";import"./style-gb7uifME.js";import"./Button-fPXh-Lq2.js";import"./usePrevious-q-aoz80S.js";import"./filter-B4FjaX6z.js";import"./format-Cmm_Rw-E.js";import"./repeat-FymCtWjv.js";import"./api-GqO88VGt.js";import"./url-DNBCE42A.js";import"./messageUtil-DnHFL-Io.js";import"./invariant-Cbo0Fu-i.js";import"./utils-CEqOZghX.js";import"./ControlGroup-Dz58dqqR.js";const fe={component:r,title:"MultiInputComponent",render:a=>{const s=f();v(s);const[i,d]=u.useState(a?.value||"");return p.jsx(r,{...a,value:i,handleChange:(m,o)=>{d(o),a.handleChange(m,o)}})},decorators:[L]},e={args:{handleChange:l(),field:"field",controlOptions:{items:[{label:"label1",value:"value1"},{label:"label2",value:"value2"},{label:"label3",value:"value3"}]}}},n={args:{handleChange:l(),field:"field",controlOptions:{delimiter:",",createSearchChoice:!0,referenceName:"referenceName",dependencies:void 0,endpointUrl:void 0,denyList:"value1",allowList:"string",labelField:"labelField",items:[{label:"label1",value:"value1"},{label:"label2",value:"value2"},{label:"label3",value:"value3"}]},disabled:!1,value:void 0,dependencyValues:{}}},t={args:{handleChange:l(),field:"field",controlOptions:{delimiter:",",createSearchChoice:!0,dependencies:void 0,denyList:void 0,allowList:void 0,labelField:"testLabel",valueField:"testValue",endpointUrl:"/demo_addon_for_splunk/some_API_endpint_for_select_data"},disabled:!1,value:void 0,dependencyValues:{}},parameters:{msw:{handlers:[c.get("demo_addon_for_splunk/some_API_endpint_for_select_data",()=>b.json(h([{name:"dataFromApiTest1",content:{testLabel:"aaa1",testValue:"bbb1"}},{name:"dataFromApiTest2",content:{testLabel:"aaa2",testValue:"bbb2"}},{name:"dataFromApiTest3",content:{testLabel:"aaa3",testValue:"bbb3"}},{name:"dataFromApiTest4",content:{testLabel:"aaa4",testValue:"bbb4"}},{name:"d1",content:{testLabel:"firstLabel",testValue:"firstValue"}},{name:"d2",content:{testLabel:"secondLabel",testValue:"secondValue"}},{name:"d3",content:{testLabel:"thirdLabel",testValue:"thirdValue"}},{name:"d4",content:{testLabel:"fourthLabel",testValue:"fourthValue"}}])))]}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};const ve=["Base","AllProps","EndpointApi"];export{n as AllProps,e as Base,t as EndpointApi,ve as __namedExportsOrder,fe as default};
