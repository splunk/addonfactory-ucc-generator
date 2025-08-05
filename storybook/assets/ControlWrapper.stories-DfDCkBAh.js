import{C as s}from"./ControlWrapper-DbCRcu6A.js";import"./jsx-runtime-D55GQ3BV.js";import"./index-CtTTUaxh.js";import"./_commonjsHelpers-CE1G-McA.js";import"./ControlGroup-Dz58dqqR.js";import"./ControlGroup-h1kJxx7z.js";import"./Clickable-gBf45GFR.js";import"./_arrayIncludesWith-Cf8RQZ1L.js";import"./index-BAMY2Nnw.js";import"./index-TwQu68rg.js";import"./index-BKv2EDKS.js";import"./find-DOPPtTO5.js";import"./Box-BaDtlhAb.js";import"./ScreenReaderContent-qsyEXMyy.js";import"./Tooltip-nNqhIvge.js";import"./MarkdownMessage-DuY-WcuS.js";import"./Link-CFB-t7hC.js";import"./Link-DTBEsgMb.js";import"./ArrowSquareTopRight-2nx1XQBJ.js";import"./IconProvider-DfXPuXoa.js";import"./External-CYO48bYj.js";import"./CheckboxTree-BARM0uhq.js";import"./modes-C8SQrryx.js";import"./Button-CSLC7xhu.js";import"./Button-fPXh-Lq2.js";import"./style-gb7uifME.js";import"./CollapsiblePanel-BLdGK9UY.js";import"./usePrevious-q-aoz80S.js";import"./ChevronRight-dvcXO2Iz.js";import"./variables-BqwaEspd.js";import"./variables-DTFMykBX.js";import"./pick-Bf73G4N4.js";import"./pick-C0bI9_1F.js";import"./Switch-SM58S-Wg.js";import"./Switch-Bh6TuT65.js";import"./HelpLinkComponent-DIfiPZKf.js";import"./textUtils-CvJd_8qc.js";import"./TextComponent-DVqSNxkD.js";import"./Text-CEFHVeb6.js";import"./noop-CoMJoj29.js";import"./Close-DT0qGRBu.js";import"./TextArea-CSOBYjfB.js";import"./utils-CEqOZghX.js";import"./TextAreaComponent-CC98rpzK.js";import"./SingleInputComponent-B_BYarEL.js";import"./extend-DuyhAT9M.js";import"./_baseDifference-C3Q7_G0N.js";import"./Menu-Dc46JiH0.js";import"./Divider-DpeIN7LP.js";import"./Heading-De4XED9R.js";import"./ResultsMenu-Ddbkllha.js";import"./WaitSpinner-l7cUSAmq.js";import"./filter-B4FjaX6z.js";import"./Clear-C1R2h3S5.js";import"./SVGInternal-zggHEN0-.js";import"./messageUtil-DnHFL-Io.js";import"./api-GqO88VGt.js";import"./url-DNBCE42A.js";import"./util-nv791zPf.js";import"./invariant-Cbo0Fu-i.js";import"./considerFalseAndTruthy-D4Pwj1gQ.js";import"./MultiInputComponent-BkSs0dtz.js";import"./format-Cmm_Rw-E.js";import"./repeat-FymCtWjv.js";import"./CheckBoxComponent-DYa4IjT4.js";import"./RadioComponent-4bdOw_Gn.js";import"./iframe-Cp62kWYG.js";import"./script-epayKKsf.js";import"./CustomComponentContext-C3N2SDcm.js";import"./FileInputComponent-CdirMscK.js";import"./toUpper-Vbgaie99.js";import"./CheckboxGroup-2K83DwBZ.js";import"./Group-CdYteFJl.js";const Ee={component:s,title:"ControlWrapper",parameters:{snapshots:{height:300}}},e={args:{utilityFuncts:{utilCustomFunctions:{setState:()=>{},setErrorFieldMsg:()=>{},clearAllErrorMsg:a=>a,setErrorMsg:()=>{}},handleChange:()=>{},addCustomValidator:()=>{}},value:"",display:!0,error:!1,entity:{type:"file",label:"Upload File",help:"Upload service account's certificate",field:"single_certificate",options:{fileSupportMessage:"Here is the support message",supportedFileTypes:["json"]},encrypted:!0,required:!0,defaultValue:void 0},serviceName:"settings",mode:"config",disabled:!1,dependencyValues:null,fileNameToDisplay:"Previous File"}},t={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:"Enter the URL, for example",required:!0,encrypted:!1},modifiedEntitiesData:{required:!1,label:"Modified URL",help:"Modified help"}}},r={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:"Enter the URL, for example",required:!1,encrypted:!1},modifiedEntitiesData:{required:!0,label:"Modified URL",help:"Modified help required"}}},i={args:{...e.args,entity:{field:"url",label:"URL",type:"text",help:`Enter the URL, for example
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
}`,...n.parameters?.docs?.source}}};const Te=["Base","WithModifications","WithModificationsMakeRequired","MultiLineHelpText","MultiLineHelpTextWithLinks","HelpWithLink"];export{e as Base,n as HelpWithLink,i as MultiLineHelpText,o as MultiLineHelpTextWithLinks,t as WithModifications,r as WithModificationsMakeRequired,Te as __namedExportsOrder,Ee as default};
