import{r as d,j as m}from"./iframe-BLQN0JqS.js";import{T as s}from"./ControlWrapper-CcOJthta.js";import{w as c}from"./withControlGroup-eGtL2iWE.js";import"./preload-helper-BWMXw09x.js";import"./Date-CLp5-Jfo.js";import"./ChevronLeft-BedkDF4G.js";import"./ChevronRight-Dq0W4qWj.js";import"./ExclamationTriangle-d6YEqz5S.js";import"./Box-YFEb_QRy.js";import"./MarkdownMessage-BHbFjhs0.js";import"./Link-BZqR4iUZ.js";import"./Divider-aChyjKRp.js";import"./CollapsiblePanel-C1Njf11K.js";import"./SVGInternal-sFyMgQuT.js";import"./Number-aCLGLkFq.js";import"./Menu-BiGojXeR.js";import"./Heading-XPGzsxsQ.js";import"./_baseDifference-DZ-TZE0x.js";import"./script-BPSliBjH.js";import"./url-CvJzWRTA.js";import"./url-BdB9R0LC.js";import"./util-D1kXELUL.js";import"./messageUtil-CQQ8zf_h.js";import"./textUtils-BK2yMsTW.js";import"./api-B7g4orc8.js";import"./DatePickerComponent-DYkEFl2K.js";import"./Group-BiXwZAAO.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,k={component:s,title:"TextAreaComponent",render:o=>{const[l,i]=d.useState(o.value);return m.jsx(s,{...o,handleChange:(p,t)=>{i(t),o.handleChange(p,t)},value:l})},decorators:[c]},e={args:{handleChange:a(),value:"",field:"field",error:!1,controlOptions:{rowsMax:10,rowsMin:2},disabled:!1,encrypted:!1}},r={args:{handleChange:a(),value:`visbile text 
multiple lanes`,field:"field",error:!1,controlOptions:{rowsMax:10,rowsMin:2},disabled:!1,encrypted:!1}},n={args:{handleChange:a(),value:`none visbile text 
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
}`,...n.parameters?.docs?.source}}};const q=["Base","UnEncrypted","Encrypted"];export{e as Base,n as Encrypted,r as UnEncrypted,q as __namedExportsOrder,k as default};
