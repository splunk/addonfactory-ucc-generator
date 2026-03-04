import{d as s}from"./ControlWrapper-Ci-zlHqj.js";import"./jsx-runtime-ojCMydbh.js";import"./index-DI6txC9U.js";import"./_commonjsHelpers-CE1G-McA.js";import"./Text-BOUR33a1.js";import"./omit-ztEEjYnI.js";import"./index-BAMY2Nnw.js";import"./times-DEtgg_I4.js";import"./_baseIteratee-BgljbWfr.js";import"./includes-Clo6__ke.js";import"./Clickable-m7b-p22w.js";import"./ExclamationTriangle-DaHVRaQA.js";import"./Button-BVwbUX9I.js";import"./ScreenReaderContent-DYUfzbCm.js";import"./ButtonSimple-Bnkbn06o.js";import"./Box-dCuMX_uk.js";import"./index-CujC5SV_.js";import"./AnimationToggle-Dgpdi4Ip.js";import"./Tooltip-DNvjBS2i.js";import"./Popover-CmySphiq.js";import"./_arrayIncludesWith-D7mRho23.js";import"./ScrollContainerContext-Cdp9tX0F.js";import"./InformationCircle-gwQHWa7p.js";import"./ChevronRight-B2uYXglV.js";import"./isEqual-Q2uatnfO.js";import"./index-s8iMx1jP.js";import"./MarkdownMessage-vKaL8cy0.js";import"./Link-BMz1NHYV.js";import"./Divider-wHm8s2UO.js";import"./Button-zWON0gNY.js";import"./CollapsiblePanel-CBq0y_BG.js";import"./variables-BfrwVMxe.js";import"./pick-B2D4nEtf.js";import"./Menu-DJUgZFWQ.js";import"./Dropdown-ChHUzFro.js";import"./textUtils-BIiSxj3a.js";import"./toUpper-DNM9XKBs.js";import"./_baseDifference-BucyWK35.js";import"./url-Dlk_22OB.js";import"./scroll-D_om4I15.js";import"./WaitSpinner-BSmPTg-B.js";import"./api-D_ndwf0a.js";import"./url-1MEF4Ke-.js";import"./util-CGkFfNTa.js";import"./messageUtil-8kA0E4H4.js";import"./DatePickerComponent-Bm9AYacc.js";import"./ChevronLeft-CjhuJSXo.js";import"./iframe-BVJboWvC.js";import"./script-BkARDwkC.js";import"./Group-RnZmXvj5.js";const ne={component:s,title:"ControlWrapper",parameters:{snapshots:{height:300}}},e={args:{utilityFuncts:{utilCustomFunctions:{setState:()=>{},setErrorFieldMsg:()=>{},clearAllErrorMsg:a=>a,setErrorMsg:()=>{}},handleChange:()=>{},addCustomValidator:()=>{}},value:"",display:!0,error:!1,entity:{type:"file",label:"Upload File",help:"Upload service account's certificate",field:"single_certificate",options:{fileSupportMessage:"Here is the support message",supportedFileTypes:["json"]},encrypted:!0,required:!0,defaultValue:void 0},serviceName:"settings",mode:"config",disabled:!1,dependencyValues:null,fileNameToDisplay:"Previous File"}},t={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:"Enter the URL, for example",required:!0,encrypted:!1},modifiedEntitiesData:{required:!1,label:"Modified URL",help:"Modified help"}}},r={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:"Enter the URL, for example",required:!1,encrypted:!1},modifiedEntitiesData:{required:!0,label:"Modified URL",help:"Modified help required"}}},i={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:`Enter the URL, for example
https://splunk.github.io/addonfactory-ucc-generator/
https://github.com/splunk/addonfactory-ucc-generator`,required:!1,encrypted:!1}}},n={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:{text:`Check [[link]] to learn more about UCC
 Also you can check this 
[[repository]]
 to view UCC generator repository`,links:[{slug:"link",link:"https://splunk.github.io/addonfactory-ucc-generator/",linkText:"documentation"},{slug:"repository",link:"https://github.com/splunk/addonfactory-ucc-generator",linkText:"link"}]},required:!1,encrypted:!1}}},o={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:{text:"Check [[link]] to learn more about UCC",links:[{slug:"link",link:"https://splunk.github.io/addonfactory-ucc-generator/",linkText:"documentation"}]},required:!1,encrypted:!1}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};const oe=["Base","WithModifications","WithModificationsMakeRequired","MultiLineHelpText","MultiLineHelpTextWithLinks","HelpWithLink"];export{e as Base,o as HelpWithLink,i as MultiLineHelpText,n as MultiLineHelpTextWithLinks,t as WithModifications,r as WithModificationsMakeRequired,oe as __namedExportsOrder,ne as default};
