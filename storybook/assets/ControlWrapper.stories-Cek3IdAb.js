import{C as s}from"./ControlWrapper-CVzGeWh8.js";import"./jsx-runtime-ClejQJRV.js";import"./index-BnZYiL63.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./ControlGroup-a8oyWZe3.js";import"./ControlGroup-D1l7iBTi.js";import"./Clickable-wzamu0qE.js";import"./index-C6Xwkj2v.js";import"./index-BAMY2Nnw.js";import"./index-BeaWwRds.js";import"./find-D36SYLnv.js";import"./Box-9y-3oeI2.js";import"./ScreenReaderContent-DTnCP1nJ.js";import"./Tooltip-s2-C62Iv.js";import"./MarkdownMessage-KWXjiEhM.js";import"./Link-COq5B319.js";import"./Link-B3IMA5iK.js";import"./ArrowSquareTopRight-cE1IFp2S.js";import"./IconProvider-D1bqsLqQ.js";import"./External-CaozYYRu.js";import"./CheckboxTree-CsvFXcxD.js";import"./modes-torNl340.js";import"./Button-BHr02HYf.js";import"./Button-JhicfZMm.js";import"./style-gy5-imeJ.js";import"./CollapsiblePanel-BPnrRfFA.js";import"./usePrevious-T3tkdeEg.js";import"./ChevronRight-BZ9dd8ev.js";import"./variables-BlEdyhR1.js";import"./pick-BPsdbB5n.js";import"./Switch-CnzSxpRR.js";import"./Switch-DAz2gr6S.js";import"./HelpLinkComponent-dsK2_iXH.js";import"./textUtils-DUUDexJ9.js";import"./TextComponent-BxD6sPuy.js";import"./Text-CXLzpk1L.js";import"./TextArea-WoYN_p44.js";import"./Close-CPSltoSy.js";import"./Search-DJ2srasI.js";import"./utils-CEqOZghX.js";import"./TextAreaComponent-D398mJR1.js";import"./SingleInputComponent-B52slQX9.js";import"./ComboBox-CmYP-_Jn.js";import"./extend-BCHzQ2P0.js";import"./Menu-CO_c8kuU.js";import"./Divider-BxwkhgHI.js";import"./Heading-2h2rzLUR.js";import"./WaitSpinner-pc6awGU8.js";import"./api-D6WilaDV.js";import"./url-CzOjCGiC.js";import"./util-DfUvgPwM.js";import"./invariant-Cbo0Fu-i.js";import"./messageUtil-CXCS-b_z.js";import"./considerFalseAndTruthy-D4Pwj1gQ.js";import"./MultiInputComponent-T90e_uJj.js";import"./Multiselect-DzTVP2xI.js";import"./format-pOB4dcXd.js";import"./CheckBoxComponent-Y9tZdK2B.js";import"./RadioComponent-BlPsbW1_.js";import"./RadioBar-C-BIDM59.js";import"./iframe-B0-yMJSF.js";import"./script-Dpip0sFJ.js";import"./CustomComponentContext-DUBuY9CR.js";import"./FileInputComponent-CoOmUzrQ.js";import"./File-B2KlQZ1a.js";import"./CheckboxGroup-DBkKfCe4.js";import"./Group-B0Pjm6PE.js";import"./Number-CBlFIa2o.js";const Le={component:s,title:"ControlWrapper",parameters:{snapshots:{height:300}}},e={args:{utilityFuncts:{utilCustomFunctions:{setState:()=>{},setErrorFieldMsg:()=>{},clearAllErrorMsg:a=>a,setErrorMsg:()=>{}},handleChange:()=>{},addCustomValidator:()=>{}},value:"",display:!0,error:!1,entity:{type:"file",label:"Upload File",help:"Upload service account's certificate",field:"single_certificate",options:{fileSupportMessage:"Here is the support message",supportedFileTypes:["json"]},encrypted:!0,required:!0,defaultValue:void 0},serviceName:"settings",mode:"config",disabled:!1,dependencyValues:null,fileNameToDisplay:"Previous File"}},t={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:"Enter the URL, for example",required:!0,encrypted:!1},modifiedEntitiesData:{required:!1,label:"Modified URL",help:"Modified help"}}},r={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:"Enter the URL, for example",required:!1,encrypted:!1},modifiedEntitiesData:{required:!0,label:"Modified URL",help:"Modified help required"}}},i={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:`Enter the URL, for example
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
}`,...n.parameters?.docs?.source}}};const Me=["Base","WithModifications","WithModificationsMakeRequired","MultiLineHelpText","MultiLineHelpTextWithLinks","HelpWithLink"];export{e as Base,n as HelpWithLink,i as MultiLineHelpText,o as MultiLineHelpTextWithLinks,t as WithModifications,r as WithModificationsMakeRequired,Me as __namedExportsOrder,Le as default};
