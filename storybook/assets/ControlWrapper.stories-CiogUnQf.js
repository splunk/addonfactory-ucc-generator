import{C as s}from"./ControlWrapper-DF1yiN7V.js";import"./jsx-runtime-ClejQJRV.js";import"./index-BnZYiL63.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./ControlGroup-DNw1xQ1K.js";import"./ControlGroup-BdgR-Lfo.js";import"./Clickable-Bwca2DKB.js";import"./index-C6Xwkj2v.js";import"./index-NODxQXf6.js";import"./find-gWtmx_xX.js";import"./Box-ikMjEsld.js";import"./ScreenReaderContent-BTHKdSEY.js";import"./Tooltip-C8RPrfb3.js";import"./MarkdownMessage-D1_XWqdY.js";import"./Link-BHUv1Tn8.js";import"./Link-em2tLaYv.js";import"./ArrowSquareTopRight-B5BPln_L.js";import"./IconProvider-BEtmCpKb.js";import"./External-N3vgloA-.js";import"./CheckboxTree-CqcgSKlG.js";import"./modes-BS4Pl0Rc.js";import"./Button-CGXuhmos.js";import"./Button-CaNu-0_n.js";import"./style-Df2q8Zk_.js";import"./CollapsiblePanel-D1q-pX-7.js";import"./usePrevious-T3tkdeEg.js";import"./ChevronRight-DdqaOJ2q.js";import"./variables-DE_hyTtg.js";import"./pick-BhCQhcgj.js";import"./Switch-CDZXRY2n.js";import"./Switch-DviBBIIV.js";import"./HelpLinkComponent-BUlM-ARy.js";import"./textUtils-BSxsNS3U.js";import"./TextComponent-tGyqzTkZ.js";import"./Text-BNJLg959.js";import"./TextArea-W5IxQHto.js";import"./Close-Bj9wtoJU.js";import"./utils-CEqOZghX.js";import"./TextAreaComponent-CN5WcxhB.js";import"./SingleInputComponent-CUyRsDs2.js";import"./extend-co5plJTM.js";import"./Menu-RgiCwolK.js";import"./Divider-PTLijbug.js";import"./Heading-9qvZOIYU.js";import"./WaitSpinner-CNexVZJK.js";import"./some-Bk8yVFGI.js";import"./api-DePkw_zr.js";import"./url-DcGE77xy.js";import"./util-9s_bzyAI.js";import"./invariant-Cbo0Fu-i.js";import"./messageUtil-1EVq4BLQ.js";import"./considerFalseAndTruthy-D4Pwj1gQ.js";import"./MultiInputComponent-DSUjIdt4.js";import"./color-arUTSqUp.js";import"./format-D2VnRqHv.js";import"./CheckBoxComponent-Bk64jNx1.js";import"./RadioComponent-E4Xkq4lK.js";import"./iframe-Cyl4MB6s.js";import"./script-B1alSWUh.js";import"./CustomComponentContext-DUBuY9CR.js";import"./FileInputComponent-CIH0mX4i.js";import"./toUpper-D92jtMy_.js";import"./CheckboxGroup-CqFPSUvW.js";import"./Group-CC-M2yhK.js";const ke={component:s,title:"ControlWrapper",parameters:{snapshots:{height:300}}},e={args:{utilityFuncts:{utilCustomFunctions:{setState:()=>{},setErrorFieldMsg:()=>{},clearAllErrorMsg:a=>a,setErrorMsg:()=>{}},handleChange:()=>{},addCustomValidator:()=>{}},value:"",display:!0,error:!1,entity:{type:"file",label:"Upload File",help:"Upload service account's certificate",field:"single_certificate",options:{fileSupportMessage:"Here is the support message",supportedFileTypes:["json"]},encrypted:!0,required:!0,defaultValue:void 0},serviceName:"settings",mode:"config",disabled:!1,dependencyValues:null,fileNameToDisplay:"Previous File"}},t={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:"Enter the URL, for example",required:!0,encrypted:!1},modifiedEntitiesData:{required:!1,label:"Modified URL",help:"Modified help"}}},r={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:"Enter the URL, for example",required:!1,encrypted:!1},modifiedEntitiesData:{required:!0,label:"Modified URL",help:"Modified help required"}}},i={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:`Enter the URL, for example
https://splunk.github.io/addonfactory-ucc-generator/
https://github.com/splunk/addonfactory-ucc-generator`,required:!1,encrypted:!1}}},o={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:{text:`Check [[link]] to learn more about UCC
 Also you can check this 
[[repository]]
 to view UCC generator repository`,links:[{slug:"link",link:"https://splunk.github.io/addonfactory-ucc-generator/",linkText:"documentation"},{slug:"repository",link:"https://github.com/splunk/addonfactory-ucc-generator",linkText:"link"}]},required:!1,encrypted:!1}}},n={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:{text:"Check [[link]] to learn more about UCC",links:[{slug:"link",link:"https://splunk.github.io/addonfactory-ucc-generator/",linkText:"documentation"}]},required:!1,encrypted:!1}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};const be=["Base","WithModifications","WithModificationsMakeRequired","MultiLineHelpText","MultiLineHelpTextWithLinks","HelpWithLink"];export{e as Base,n as HelpWithLink,i as MultiLineHelpText,o as MultiLineHelpTextWithLinks,t as WithModifications,r as WithModificationsMakeRequired,be as __namedExportsOrder,ke as default};
