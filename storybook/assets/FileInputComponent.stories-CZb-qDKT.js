import{F as o}from"./ControlWrapper-CcOJthta.js";import{w as s}from"./withControlGroup-eGtL2iWE.js";import"./iframe-BLQN0JqS.js";import"./preload-helper-BWMXw09x.js";import"./Date-CLp5-Jfo.js";import"./ChevronLeft-BedkDF4G.js";import"./ChevronRight-Dq0W4qWj.js";import"./ExclamationTriangle-d6YEqz5S.js";import"./Box-YFEb_QRy.js";import"./MarkdownMessage-BHbFjhs0.js";import"./Link-BZqR4iUZ.js";import"./Divider-aChyjKRp.js";import"./CollapsiblePanel-C1Njf11K.js";import"./SVGInternal-sFyMgQuT.js";import"./Number-aCLGLkFq.js";import"./Menu-BiGojXeR.js";import"./Heading-XPGzsxsQ.js";import"./_baseDifference-DZ-TZE0x.js";import"./script-BPSliBjH.js";import"./url-CvJzWRTA.js";import"./url-BdB9R0LC.js";import"./util-D1kXELUL.js";import"./messageUtil-CQQ8zf_h.js";import"./textUtils-BK2yMsTW.js";import"./api-B7g4orc8.js";import"./DatePickerComponent-DYkEFl2K.js";import"./Group-BiXwZAAO.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,b={component:o,title:"FileInputComponent",parameters:{snapshots:{height:300}},decorators:[s]},e={args:{handleChange:a(),field:"fileInptuComponent",controlOptions:{fileSupportMessage:"test support message",supportedFileTypes:["json","txt"],maxFileSize:500},disabled:!1}},t={args:{...e.args,fileNameToDisplay:"Test_file_name.json"}},r={args:{...e.args,fileNameToDisplay:"Test_file_name.json",encrypted:!0}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    handleChange: fn(),
    field: 'fileInptuComponent',
    controlOptions: {
      fileSupportMessage: 'test support message',
      supportedFileTypes: ['json', 'txt'],
      maxFileSize: 500
    },
    disabled: false
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    ...Base.args,
    fileNameToDisplay: 'Test_file_name.json'
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    ...Base.args,
    fileNameToDisplay: 'Test_file_name.json',
    encrypted: true
  }
}`,...r.parameters?.docs?.source}}};const w=["Base","WithDefaultName","EncryptedWithDefaultName"];export{e as Base,r as EncryptedWithDefaultName,t as WithDefaultName,w as __namedExportsOrder,b as default};
