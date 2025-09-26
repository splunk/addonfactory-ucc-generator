import{d as s}from"./ControlWrapper-C-3SaADr.js";import"./jsx-runtime-1FKYbnEZ.js";import"./index-prPvd6Su.js";import"./_commonjsHelpers-CE1G-McA.js";import"./Number-akKODsrJ.js";import"./isEqual-YuU2Zr8y.js";import"./_baseIteratee-CGcCafy9.js";import"./omit-UcH284-_.js";import"./index-BAMY2Nnw.js";import"./Dropdown-CEDZaBsM.js";import"./Clickable-vbs6x6a2.js";import"./_arrayIncludesWith-C0sUgJs0.js";import"./includes-BxfbO0I6.js";import"./Box-CA7p2Imy.js";import"./index-BQPxV8oF.js";import"./AnimationToggle-CdPY36C5.js";import"./ScrollContainerContext-DNG8B1ai.js";import"./ChevronRight-Do8a4H-E.js";import"./Menu-D4-b3kko.js";import"./Divider-HUVeSv0X.js";import"./ScreenReaderContent-DRRIcB0C.js";import"./url-C03nQury.js";import"./Button-gbqT1swN.js";import"./ButtonSimple-uRr2gocj.js";import"./Link-ooEZC2Mq.js";import"./CollapsiblePanel-BAnOmC7s.js";import"./_baseDifference-BqVURxtm.js";import"./WaitSpinner-DIBk8RZx.js";import"./ExclamationTriangle-C7EecpCM.js";import"./pick-BOH874jN.js";import"./InformationCircle-kDXLS5kt.js";import"./index-DtbBJ32H.js";import"./MarkdownMessage-Duo508BE.js";import"./Button-B_-pY_Ng.js";import"./variables-BJ06o7R7.js";import"./textUtils-CXkcwnOE.js";import"./api-BXYB3TVR.js";import"./url-uLXecbUQ.js";import"./util-BVaVe7dF.js";import"./messageUtil-CvmCOD_s.js";import"./iframe-D1ZpU7rR.js";import"./script-ClADN3Yb.js";import"./Group-BGuJRPkj.js";const Y={component:s,title:"ControlWrapper",parameters:{snapshots:{height:300}}},e={args:{utilityFuncts:{utilCustomFunctions:{setState:()=>{},setErrorFieldMsg:()=>{},clearAllErrorMsg:a=>a,setErrorMsg:()=>{}},handleChange:()=>{},addCustomValidator:()=>{}},value:"",display:!0,error:!1,entity:{type:"file",label:"Upload File",help:"Upload service account's certificate",field:"single_certificate",options:{fileSupportMessage:"Here is the support message",supportedFileTypes:["json"]},encrypted:!0,required:!0,defaultValue:void 0},serviceName:"settings",mode:"config",disabled:!1,dependencyValues:null,fileNameToDisplay:"Previous File"}},t={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:"Enter the URL, for example",required:!0,encrypted:!1},modifiedEntitiesData:{required:!1,label:"Modified URL",help:"Modified help"}}},r={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:"Enter the URL, for example",required:!1,encrypted:!1},modifiedEntitiesData:{required:!0,label:"Modified URL",help:"Modified help required"}}},i={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:`Enter the URL, for example
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
}`,...o.parameters?.docs?.source}}};const Z=["Base","WithModifications","WithModificationsMakeRequired","MultiLineHelpText","MultiLineHelpTextWithLinks","HelpWithLink"];export{e as Base,o as HelpWithLink,i as MultiLineHelpText,n as MultiLineHelpTextWithLinks,t as WithModifications,r as WithModificationsMakeRequired,Z as __namedExportsOrder,Y as default};
