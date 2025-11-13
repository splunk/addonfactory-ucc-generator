import{d as s}from"./ControlWrapper-D33h4I9C.js";import"./jsx-runtime-1FKYbnEZ.js";import"./index-prPvd6Su.js";import"./_commonjsHelpers-CE1G-McA.js";import"./Date-Cmj0Txw8.js";import"./omit-CSe7u5nZ.js";import"./index-BAMY2Nnw.js";import"./Clickable-DCLrgFHL.js";import"./_baseIteratee-ksDslDTl.js";import"./includes-BAN5eljv.js";import"./ScreenReaderContent-DTgcavZU.js";import"./ChevronLeft-Ct0yUEYy.js";import"./ChevronRight-DDG3shYt.js";import"./isEqual-BwSphrxz.js";import"./Button-B9G_4Mfe.js";import"./ButtonSimple-DKTsOMzA.js";import"./Popover-FB-oYrLK.js";import"./_arrayIncludesWith-CeAjGiZp.js";import"./Box-BIQRv08s.js";import"./index-BQPxV8oF.js";import"./AnimationToggle-C6vyuf54.js";import"./ScrollContainerContext-XRarVF06.js";import"./ExclamationTriangle-D5UvzwJa.js";import"./Tooltip-B7RmVpsU.js";import"./InformationCircle-B-Mq5DmP.js";import"./index-CMxbcET4.js";import"./MarkdownMessage-r_yijvo_.js";import"./Link-BguIxQc6.js";import"./Divider-BmXthNdG.js";import"./Button-VhSyjuIj.js";import"./CollapsiblePanel-aG-BiLiH.js";import"./variables-BwqdKhvQ.js";import"./pick-BmRvtkqO.js";import"./Menu-IFF89z9L.js";import"./Dropdown-_2BgLkF4.js";import"./textUtils-LveNtyW9.js";import"./Number-BH7oUVAk.js";import"./url-cUhQ41mg.js";import"./_baseDifference-B9g_NAZa.js";import"./WaitSpinner-D3j-Jqu7.js";import"./api-BLOSKcgX.js";import"./url-xolDOGfA.js";import"./util-DDtLIPUa.js";import"./messageUtil-CQS9-IEm.js";import"./DatePickerComponent-CboCMxQ5.js";import"./iframe-DjmNRUro.js";import"./script-wa9wuYzj.js";import"./Group-VVWCvCTc.js";const re={component:s,title:"ControlWrapper",parameters:{snapshots:{height:300}}},e={args:{utilityFuncts:{utilCustomFunctions:{setState:()=>{},setErrorFieldMsg:()=>{},clearAllErrorMsg:a=>a,setErrorMsg:()=>{}},handleChange:()=>{},addCustomValidator:()=>{}},value:"",display:!0,error:!1,entity:{type:"file",label:"Upload File",help:"Upload service account's certificate",field:"single_certificate",options:{fileSupportMessage:"Here is the support message",supportedFileTypes:["json"]},encrypted:!0,required:!0,defaultValue:void 0},serviceName:"settings",mode:"config",disabled:!1,dependencyValues:null,fileNameToDisplay:"Previous File"}},t={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:"Enter the URL, for example",required:!0,encrypted:!1},modifiedEntitiesData:{required:!1,label:"Modified URL",help:"Modified help"}}},r={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:"Enter the URL, for example",required:!1,encrypted:!1},modifiedEntitiesData:{required:!0,label:"Modified URL",help:"Modified help required"}}},i={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:`Enter the URL, for example
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
}`,...o.parameters?.docs?.source}}};const ie=["Base","WithModifications","WithModificationsMakeRequired","MultiLineHelpText","MultiLineHelpTextWithLinks","HelpWithLink"];export{e as Base,o as HelpWithLink,i as MultiLineHelpText,n as MultiLineHelpTextWithLinks,t as WithModifications,r as WithModificationsMakeRequired,ie as __namedExportsOrder,re as default};
