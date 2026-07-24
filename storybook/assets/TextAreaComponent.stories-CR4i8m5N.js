import{r as m,j as d}from"./iframe-CkO-8h3X.js";import{T as s}from"./ControlWrapper-8LmMu1gh.js";import{w as c}from"./withControlGroup-RXTCRBts.js";import"./preload-helper-BWMXw09x.js";import"./Date-BPwjYypH.js";import"./lodash-DC5tP0FI.js";import"./includes-CeWRCqDz.js";import"./ChevronLeft-CFN5hHG6.js";import"./ChevronRight-DlBO1xqA.js";import"./isEqual-D_kYa9Y5.js";import"./_baseIsEqual-BA1SpDro.js";import"./Popover-CCWJKSFR.js";import"./_arrayIncludesWith-CKt2KOEb.js";import"./ScrollContainerContext-B3z9T_lz.js";import"./Box-C3_NwA3u.js";import"./_baseIteratee-CKKdKeVM.js";import"./ExclamationTriangle-BPrZIRtp.js";import"./Tooltip-Nygr4oAo.js";import"./InformationCircle-dv8wnI9A.js";import"./MarkdownMessage-B9v76_pw.js";import"./Link-CETJi4Jo.js";import"./Divider-CkbYBkxJ.js";import"./CollapsiblePanel-CN6WDnk5.js";import"./pick-Toh7DJ-o.js";import"./Menu-Bq9H8ILd.js";import"./Dropdown-DdfZSMfv.js";import"./textUtils-Bj3ckYR9.js";import"./Number-DcvxqngO.js";import"./url-BGnD4wdp.js";import"./_baseDifference-BpZKW9m7.js";import"./api-brTVIpnl.js";import"./url-DqCSShB-.js";import"./util-DhnbgUjE.js";import"./messageUtil-CjQtoyHX.js";import"./DatePickerComponent-BAU-o5w3.js";import"./script-C_nnifbq.js";import"./Group-CG6LE1cd.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,W={component:s,title:"TextAreaComponent",render:o=>{const[i,l]=m.useState(o.value);return d.jsx(s,{...o,handleChange:(p,a)=>{l(a),o.handleChange(p,a)},value:i})},decorators:[c]},e={args:{handleChange:t(),value:"",field:"field",error:!1,controlOptions:{rowsMax:10,rowsMin:2},disabled:!1,encrypted:!1}},r={args:{handleChange:t(),value:`visbile text 
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
}`,...n.parameters?.docs?.source}}};const X=["Base","UnEncrypted","Encrypted"];export{e as Base,n as Encrypted,r as UnEncrypted,X as __namedExportsOrder,W as default};
