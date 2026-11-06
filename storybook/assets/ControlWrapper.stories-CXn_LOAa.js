import{d as o}from"./ControlWrapper-CcOJthta.js";import"./iframe-BLQN0JqS.js";import"./preload-helper-BWMXw09x.js";import"./Date-CLp5-Jfo.js";import"./ChevronLeft-BedkDF4G.js";import"./ChevronRight-Dq0W4qWj.js";import"./ExclamationTriangle-d6YEqz5S.js";import"./Box-YFEb_QRy.js";import"./MarkdownMessage-BHbFjhs0.js";import"./Link-BZqR4iUZ.js";import"./Divider-aChyjKRp.js";import"./CollapsiblePanel-C1Njf11K.js";import"./SVGInternal-sFyMgQuT.js";import"./Number-aCLGLkFq.js";import"./Menu-BiGojXeR.js";import"./Heading-XPGzsxsQ.js";import"./_baseDifference-DZ-TZE0x.js";import"./script-BPSliBjH.js";import"./url-CvJzWRTA.js";import"./url-BdB9R0LC.js";import"./util-D1kXELUL.js";import"./messageUtil-CQQ8zf_h.js";import"./textUtils-BK2yMsTW.js";import"./api-B7g4orc8.js";import"./DatePickerComponent-DYkEFl2K.js";import"./Group-BiXwZAAO.js";const B={component:o,title:"ControlWrapper",parameters:{snapshots:{height:300}}},e={args:{utilityFuncts:{utilCustomFunctions:{setState:()=>{},setErrorFieldMsg:()=>{},clearAllErrorMsg:s=>s,setErrorMsg:()=>{}},handleChange:()=>{},addCustomValidator:()=>{}},value:"",display:!0,error:!1,entity:{type:"file",label:"Upload File",help:"Upload service account's certificate",field:"single_certificate",options:{fileSupportMessage:"Here is the support message",supportedFileTypes:["json"]},encrypted:!0,required:!0,defaultValue:void 0},serviceName:"settings",mode:"config",disabled:!1,dependencyValues:null,fileNameToDisplay:"Previous File"}},t={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:"Enter the URL, for example",required:!0,encrypted:!1},modifiedEntitiesData:{required:!1,label:"Modified URL",help:"Modified help"}}},r={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:"Enter the URL, for example",required:!1,encrypted:!1},modifiedEntitiesData:{required:!0,label:"Modified URL",help:"Modified help required"}}},n={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:`Enter the URL, for example
https://splunk.github.io/addonfactory-ucc-generator/
https://github.com/splunk/addonfactory-ucc-generator`,required:!1,encrypted:!1}}},i={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:{text:`Check [[link]] to learn more about UCC
 Also you can check this 
[[repository]]
 to view UCC generator repository`,links:[{slug:"link",link:"https://splunk.github.io/addonfactory-ucc-generator/",linkText:"documentation"},{slug:"repository",link:"https://github.com/splunk/addonfactory-ucc-generator",linkText:"link"}]},required:!1,encrypted:!1}}},a={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:{text:"Check [[link]] to learn more about UCC",links:[{slug:"link",link:"https://splunk.github.io/addonfactory-ucc-generator/",linkText:"documentation"}]},required:!1,encrypted:!1}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    utilityFuncts: {
      utilCustomFunctions: {
        setState: () => {},
        setErrorFieldMsg: () => {},
        clearAllErrorMsg: state => state,
        setErrorMsg: () => {}
      },
      handleChange: () => {},
      addCustomValidator: () => {}
    },
    value: '',
    display: true,
    error: false,
    entity: {
      type: 'file',
      label: 'Upload File',
      help: "Upload service account's certificate",
      field: 'single_certificate',
      options: {
        fileSupportMessage: 'Here is the support message',
        supportedFileTypes: ['json']
      },
      encrypted: true,
      required: true,
      defaultValue: undefined
    },
    serviceName: 'settings',
    mode: 'config',
    disabled: false,
    dependencyValues: null,
    fileNameToDisplay: 'Previous File'
  }
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    ...Base.args,
    entity: {
      field: 'url',
      label: 'URL',
      type: 'text',
      help: 'Enter the URL, for example',
      required: true,
      encrypted: false
    },
    modifiedEntitiesData: {
      required: false,
      label: 'Modified URL',
      help: 'Modified help'
    }
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    ...Base.args,
    entity: {
      field: 'url',
      label: 'URL',
      type: 'text',
      help: 'Enter the URL, for example',
      required: false,
      encrypted: false
    },
    modifiedEntitiesData: {
      required: true,
      label: 'Modified URL',
      help: 'Modified help required'
    }
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    ...Base.args,
    entity: {
      field: 'url',
      label: 'URL',
      type: 'text',
      help: 'Enter the URL, for example\\nhttps://splunk.github.io/addonfactory-ucc-generator/\\nhttps://github.com/splunk/addonfactory-ucc-generator',
      required: false,
      encrypted: false
    }
  }
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    ...Base.args,
    entity: {
      field: 'url',
      label: 'URL',
      type: 'text',
      help: {
        text: 'Check [[link]] to learn more about UCC\\n Also you can check this \\n[[repository]]\\n to view UCC generator repository',
        links: [{
          slug: 'link',
          link: 'https://splunk.github.io/addonfactory-ucc-generator/',
          linkText: 'documentation'
        }, {
          slug: 'repository',
          link: 'https://github.com/splunk/addonfactory-ucc-generator',
          linkText: 'link'
        }]
      },
      required: false,
      encrypted: false
    }
  }
}`,...i.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    ...Base.args,
    entity: {
      field: 'url',
      label: 'URL',
      type: 'text',
      help: {
        text: 'Check [[link]] to learn more about UCC',
        links: [{
          slug: 'link',
          link: 'https://splunk.github.io/addonfactory-ucc-generator/',
          linkText: 'documentation'
        }]
      },
      required: false,
      encrypted: false
    }
  }
}`,...a.parameters?.docs?.source}}};const D=["Base","WithModifications","WithModificationsMakeRequired","MultiLineHelpText","MultiLineHelpTextWithLinks","HelpWithLink"];export{e as Base,a as HelpWithLink,n as MultiLineHelpText,i as MultiLineHelpTextWithLinks,t as WithModifications,r as WithModificationsMakeRequired,D as __namedExportsOrder,B as default};
