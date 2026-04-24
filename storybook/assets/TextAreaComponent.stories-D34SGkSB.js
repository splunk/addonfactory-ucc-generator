import{r as m,j as d}from"./iframe-dpjTMnOC.js";import{T as s}from"./ControlWrapper-BM5zRGNC.js";import{w as c}from"./withControlGroup-BbgsCEf2.js";import"./index-nuYtCEEu.js";import"./Date-XutZtAHB.js";import"./id-Db1E8M8a.js";import"./ScrollContainerContext-DogtmX69.js";import"./Box-DE7m460s.js";import"./ChevronLeft-0NIlqeDI.js";import"./ChevronRight-CAKwgwce.js";import"./Popover-D3MLdcR2.js";import"./ExclamationTriangle-CApgSVdg.js";import"./Tooltip-D0dtXLIo.js";import"./InformationCircle-B-WxxbMa.js";import"./MarkdownMessage-Botp4GAi.js";import"./Link-DETRhvtj.js";import"./Divider-BI7HZr8y.js";import"./CollapsiblePanel-DVzU4Rpc.js";import"./pick-JbkSLyfC.js";import"./Menu-BaV4-Toi.js";import"./Dropdown-BSmjb7Ht.js";import"./textUtils-D6rK6Eep.js";import"./Number-EeQbK4AB.js";import"./api-CjZPq5JP.js";import"./url-cmzogVIW.js";import"./url-DGkq2p2F.js";import"./util-DakudGGz.js";import"./messageUtil-DTEwCut0.js";import"./DatePickerComponent-DH2M6FjX.js";import"./script-DFaIqjR1.js";import"./Group-Bp5WCcDP.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,H={component:s,title:"TextAreaComponent",render:o=>{const[i,l]=m.useState(o.value);return d.jsx(s,{...o,handleChange:(p,a)=>{l(a),o.handleChange(p,a)},value:i})},decorators:[c]},e={args:{handleChange:t(),value:"",field:"field",error:!1,controlOptions:{rowsMax:10,rowsMin:2},disabled:!1,encrypted:!1}},r={args:{handleChange:t(),value:`visbile text 
multiple lanes`,field:"field",error:!1,controlOptions:{rowsMax:10,rowsMin:2},disabled:!1,encrypted:!1}},n={args:{handleChange:t(),value:`none visbile text 
multiple lanes`,field:"field",error:!1,controlOptions:{rowsMax:10,rowsMin:2},disabled:!1,encrypted:!0}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    handleChange: fn(),
    value: '',
    field: 'field',
    error: false,
    controlOptions: {
      rowsMax: 10,
      rowsMin: 2
    },
    disabled: false,
    encrypted: false
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    handleChange: fn(),
    value: \`visbile text 
multiple lanes\`,
    field: 'field',
    error: false,
    controlOptions: {
      rowsMax: 10,
      rowsMin: 2
    },
    disabled: false,
    encrypted: false
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    handleChange: fn(),
    value: \`none visbile text 
multiple lanes\`,
    field: 'field',
    error: false,
    controlOptions: {
      rowsMax: 10,
      rowsMin: 2
    },
    disabled: false,
    encrypted: true
  }
}`,...n.parameters?.docs?.source}}};const I=["Base","UnEncrypted","Encrypted"];export{e as Base,n as Encrypted,r as UnEncrypted,I as __namedExportsOrder,H as default};
