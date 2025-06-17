import{j as g}from"./jsx-runtime-ClejQJRV.js";import{h as y,H as r}from"./index-DgRvTSw_.js";import{a as o,e as l,u as s}from"./index-y4Yn5WZ1.js";import{s as x}from"./util-DfUvgPwM.js";import{I as h}from"./InputPage-BPim6Dgo.js";import{g as w,b as v}from"./server-response-Cmhjwb6A.js";import"./index-BnZYiL63.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./iframe-B0-yMJSF.js";import"./index-BAMY2Nnw.js";import"./Clickable-wzamu0qE.js";import"./index-C6Xwkj2v.js";import"./index-BeaWwRds.js";import"./invariant-Cbo0Fu-i.js";import"./modes-torNl340.js";import"./usePlatform-Cun2Z0Y_.js";import"./SearchJob-C6bkeSKm.js";import"./DotsThreeVertical-B8vz7m0Y.js";import"./IconProvider-D1bqsLqQ.js";import"./ErrorBoundary-DmKTu_kt.js";import"./messageUtil-CXCS-b_z.js";import"./Search-DJ2srasI.js";import"./Heading-CGvLoTK9.js";import"./Heading-2h2rzLUR.js";import"./Box-9y-3oeI2.js";import"./Tooltip-s2-C62Iv.js";import"./ScreenReaderContent-DTnCP1nJ.js";import"./Button-JhicfZMm.js";import"./style-gy5-imeJ.js";import"./External-CaozYYRu.js";import"./Warning-CEMYJjjT.js";import"./Link-COq5B319.js";import"./Link-B3IMA5iK.js";import"./ArrowSquareTopRight-cE1IFp2S.js";import"./variables-BlEdyhR1.js";import"./pick-BPsdbB5n.js";import"./CollapsiblePanel-BPnrRfFA.js";import"./usePrevious-T3tkdeEg.js";import"./ChevronRight-BZ9dd8ev.js";import"./Search-ICZjcVxg.js";import"./extend-BCHzQ2P0.js";import"./TextArea-WoYN_p44.js";import"./ControlGroup-D1l7iBTi.js";import"./find-D36SYLnv.js";import"./Close-CPSltoSy.js";import"./Menu-CO_c8kuU.js";import"./Divider-BxwkhgHI.js";import"./Switch-DAz2gr6S.js";import"./WaitSpinner-pc6awGU8.js";import"./format-pOB4dcXd.js";import"./index-k--C9drU.js";import"./Message-BhItrygt.js";import"./ChevronLeft-CJRd2xhe.js";import"./ComboBox-CmYP-_Jn.js";import"./Text-CXLzpk1L.js";import"./url-CzOjCGiC.js";import"./CustomTableStyle-CEvuKrAz.js";import"./Button-BHr02HYf.js";import"./EntityPage-CMgabuDT.js";import"./BaseFormView-DA41Yo12.js";import"./TableContext-BmRe0wAG.js";import"./ControlWrapper-CVzGeWh8.js";import"./ControlGroup-a8oyWZe3.js";import"./MarkdownMessage-KWXjiEhM.js";import"./CheckboxTree-CsvFXcxD.js";import"./Switch-CnzSxpRR.js";import"./HelpLinkComponent-dsK2_iXH.js";import"./textUtils-DUUDexJ9.js";import"./TextComponent-BxD6sPuy.js";import"./utils-CEqOZghX.js";import"./TextAreaComponent-D398mJR1.js";import"./SingleInputComponent-B52slQX9.js";import"./api-D6WilaDV.js";import"./considerFalseAndTruthy-D4Pwj1gQ.js";import"./MultiInputComponent-T90e_uJj.js";import"./Multiselect-DzTVP2xI.js";import"./CheckBoxComponent-Y9tZdK2B.js";import"./RadioComponent-BlPsbW1_.js";import"./RadioBar-C-BIDM59.js";import"./script-Dpip0sFJ.js";import"./CustomComponentContext-DUBuY9CR.js";import"./FileInputComponent-CoOmUzrQ.js";import"./File-B2KlQZ1a.js";import"./CheckboxGroup-DBkKfCe4.js";import"./Group-B0Pjm6PE.js";import"./Number-CBlFIa2o.js";import"./pageContext-DllO6PNg.js";import"./PageContext-BOYMoToK.js";import"./UCCButton-ETWJiCtC.js";import"./TableWrapper-sZHQWMyc.js";import"./AcceptModal-DNDhPNuz.js";import"./Modal-CKUr12g2.js";import"./EntityModal-z45CIM9M.js";import"./DeleteModal-DXM0EsBy.js";import"./MenuInput-g6bRyZ2I.js";import"./Menu-C0eR2ckD.js";import"./SubDescription-kOyetVWb.js";const B={configuration:{title:"",tabs:[{name:"a",title:"",entity:[]}]},inputs:{services:[{name:"demo_input",conf:"some_conf",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0},{type:"text",label:"Interval",validators:[{type:"regex",errorMsg:"Interval must be an integer.",pattern:"^\\-[1-9]\\d*$|^\\d*$"}],defaultValue:"300",field:"interval",help:"Time interval of the data input, in seconds.",required:!0},{type:"singleSelect",field:"select1",label:"Select 1",help:"Default value is Numeric 1",defaultValue:1,options:{autoCompleteFields:[{value:1,label:"Numeric 1"}]}},{type:"singleSelect",field:"select2",label:"Select 2",help:"Default value is Numeric 3",defaultValue:3,options:{autoCompleteFields:[{value:3,label:"Numeric 3"}]}},{type:"multipleSelect",field:"multipleselect1",label:"MultiSelect 1",help:"Default value is Numeric 1",defaultValue:"1",options:{items:[{value:1,label:"Numeric 1"}]}},{type:"singleSelect",label:"Account to use",options:{autoCompleteFields:[{value:"value1",label:"Value1"},{value:"value2",label:"Value2"}]},help:"Account to use for this input.",field:"account",required:!0},{type:"text",label:"sometext",validators:[{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:1e3}],field:"sometext",help:"A unique text for the data input.",required:!0},{type:"singleSelect",label:"Some Select Dropdown",options:{disableSearch:!0,autoCompleteFields:[{value:"DEBUG",label:"DEBUG"},{value:"INFO",label:"INFO"},{value:"WARN",label:"WARN"},{value:"ERROR",label:"ERROR"},{value:"CRITICAL",label:"CRITICAL"}]},defaultValue:"INFO",field:"someselectdropdown"},{type:"checkboxGroup",label:"CheckboxGroupTitle",field:"api3",options:{groups:[{label:"Group 1",options:{isExpandable:!0,expand:!0},fields:["rowUnderGroup1"]},{label:"Group 3",options:{isExpandable:!0,expand:!0},fields:["field223","160validation"]}],rows:[{field:"rowWithoutGroup",input:{defaultValue:1,required:!0}},{field:"rowUnderGroup1",checkbox:{label:"Row under Group 1",defaultValue:!0},input:{defaultValue:1200,required:!1}},{field:"field223",checkbox:{label:"Required field",defaultValue:!0},input:{required:!0}},{field:"160validation",checkbox:{label:"from 1 to 60 validation"},input:{validators:[{type:"number",range:[1,60]}]}}]}}],title:"demo_input",subTitle:" This is a demo input"},{name:"demo_input_page",style:"page",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0},{field:"config2_help_link",label:"",type:"helpLink",options:{text:"SSL configuration documentation",link:"https://ta-jira-service-desk-simple-addon.readthedocs.io/en/latest/configuration.html"}},{type:"checkbox",label:"Hide in UI boolean value",field:"hide_in_ui",options:{display:!1}},{type:"checkbox",label:"Is input readonly?",field:"hard_disabled",options:{display:!1}},{type:"text",label:"Interval",validators:[{type:"regex",errorMsg:"Interval must be an integer.",pattern:"^\\-[1-9]\\d*$|^\\d*$"}],defaultValue:"300",field:"interval",help:"Time interval of the data input, in seconds.",required:!0},{type:"singleSelect",label:"Account to use",options:{autoCompleteFields:[{value:"value1",label:"Value1"},{value:"value2",label:"Value2"}]},help:"Account to use for this input.",field:"account",required:!0},{type:"text",label:"sometext",validators:[{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:1e3}],field:"sometext",help:"A unique text for the data input.",required:!0},{type:"singleSelect",label:"Some Select Dropdown",options:{disableSearch:!0,autoCompleteFields:[{value:"DEBUG",label:"DEBUG"},{value:"INFO",label:"INFO"},{value:"WARN",label:"WARN"},{value:"ERROR",label:"ERROR"},{value:"CRITICAL",label:"CRITICAL"}]},defaultValue:"INFO",field:"someselectdropdown"},{type:"checkboxGroup",label:"CheckboxGroupTitle",field:"api3",options:{groups:[{label:"Group 1",options:{isExpandable:!0,expand:!0},fields:["rowUnderGroup1"]},{label:"Group 3",options:{isExpandable:!0,expand:!0},fields:["field223","160validation"]}],rows:[{field:"rowWithoutGroup",input:{defaultValue:1,required:!0}},{field:"rowUnderGroup1",checkbox:{label:"Row under Group 1",defaultValue:!0},input:{defaultValue:1200,required:!1}},{field:"field223",checkbox:{label:"Required field",defaultValue:!0},input:{required:!0}},{field:"160validation",checkbox:{label:"from 1 to 60 validation"},input:{validators:[{type:"number",range:[1,60]}]}}]}}],title:"Demo input page"},{name:"demo_input_custom",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0},{type:"text",label:"Interval",validators:[{type:"regex",errorMsg:"Interval must be an integer.",pattern:"^\\-[1-9]\\d*$|^\\d*$"}],defaultValue:"300",field:"interval",help:"Time interval of the data input, in seconds.",required:!0}],title:"demo_input_custom",formTitle:"custom header"}],title:"Inputs",description:"Manage your data inputs",table:{actions:["edit","delete","search","clone"],header:[{label:"Name",field:"name"},{label:"Interval",field:"interval"},{label:"Index",field:"index"},{label:"Status",field:"disabled"},{label:"Select Dropdown",field:"someselectdropdown1"}],moreInfo:[{label:"Name",field:"name"},{label:"Interval",field:"interval"},{label:"Index",field:"index"},{label:"Status",field:"disabled",mapping:{1:"Disabled",true:"Disabled",false:"Enabled"}},{label:"Exported",field:"hard_disabled",mapping:{0:"No",1:"Yes",f:"No"}},{label:"Select Dropdown",field:"someselectdropdown2"}]},readonlyFieldId:"hard_disabled",hideFieldId:"hide_in_ui"},dashboard:{panels:[{name:"default"}]}},I={name:"demo_addon_for_splunk",restRoot:"demo_addon_for_splunk",version:"5.32.0R0e2087fe",displayName:"Demo Add-on for Splunk",schemaVersion:"0.0.3"},R={pages:B,meta:I},bt={component:h,title:"InputPage",render:e=>(x(JSON.parse(JSON.stringify(e.globalConfig))),g.jsx(h,{})),args:{globalConfig:R},parameters:{msw:{handlers:[y.get("/servicesNS/nobody/-/:inputName",({params:e})=>{switch(e.inputName){case"demo_addon_for_splunk_demo_input":return r.json(w([{name:"my_disabled_input",content:{disabled:"1",hard_disabled:"f",hide_in_ui:"N",account:"value1"}},{name:"my_read_only_input",content:{hard_disabled:"1"}},{name:"my_hidden_input",content:{hide_in_ui:"y"}}]));case"demo_addon_for_splunk_demo_input_page":return r.json(v);case"demo_addon_for_splunk_demo_input_custom":return r.json(w([{name:"name_demo_custom",content:{account:"value1"}}]));default:return r.error()}}),y.post("/servicesNS/nobody/-/:inputName/:name",()=>r.json(v))]},snapshots:{width:1200,height:1200}}},u={play:async({canvasElement:e})=>{const t=o(e);await l(await t.findAllByRole("row")).toHaveLength(5)}},p={play:async({canvasElement:e})=>{const t=o(e),i=(await t.findAllByRole("cell")).filter(n=>n.dataset.test==="expand")[0],a=o(i).getByRole("button");await s.click(a),await l((await t.findAllByRole("definition")).length).toBeGreaterThan(0)}},d={play:async({canvasElement:e})=>{const t=s.setup(),i=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n),await t.click(a.getByRole("button",{name:"Create New Input"})),await t.click(await i.findByText("demo_input")),await l(await i.findByRole("dialog",{name:"Add demo_input"})).toBeInTheDocument()}},c={play:async({canvasElement:e})=>{const t=s.setup(),i=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n);const f=await a.findAllByRole("button",{name:"Edit"});await t.click(f[0]),await l(await i.findByRole("dialog",{name:"Update demo_input"})).toBeInTheDocument()}},m={play:async({canvasElement:e})=>{const t=s.setup(),i=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n),await t.click(a.getByRole("button",{name:"Create New Input"})),await t.click(await i.findByText("Demo input page")),await l(await a.findByRole("textbox",{name:/name/i})).toBeInTheDocument()}},b={play:async({canvasElement:e})=>{const t=s.setup(),i=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n);const f=await a.findAllByRole("button",{name:"Edit"});await t.click(f[2]),await l(await i.findByRole("dialog",{name:"Update custom header"})).toBeInTheDocument()}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // there are 5 inputs where 1 is hidden
    // the header counts as a row
    await expect(await canvas.findAllByRole('row')).toHaveLength(5);
  }
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const expandableCell = (await canvas.findAllByRole('cell')).filter(cell => cell.dataset.test === 'expand')[0];
    const expandable = within(expandableCell).getByRole('button');
    await userEvent.click(expandable);
    await expect((await canvas.findAllByRole('definition')).length).toBeGreaterThan(0);
  }
}`,...p.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const user = userEvent.setup();
    const body = within(canvasElement.ownerDocument.body);
    const canvas = within(canvasElement);
    const closeBtn = canvas.queryByRole('button', {
      name: /(Close)|(Cancel)/
    });
    if (closeBtn) {
      await user.click(closeBtn);
    }
    await user.click(canvas.getByRole('button', {
      name: 'Create New Input'
    }));
    await user.click(await body.findByText('demo_input'));
    await expect(await body.findByRole('dialog', {
      name: 'Add demo_input'
    })).toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const user = userEvent.setup();
    const body = within(canvasElement.ownerDocument.body);
    const canvas = within(canvasElement);
    const closeBtn = canvas.queryByRole('button', {
      name: /(Close)|(Cancel)/
    });
    if (closeBtn) {
      await user.click(closeBtn);
    }
    const editButtons = await canvas.findAllByRole('button', {
      name: 'Edit'
    });
    await user.click(editButtons[0]);
    await expect(await body.findByRole('dialog', {
      name: 'Update demo_input'
    })).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const user = userEvent.setup();
    const body = within(canvasElement.ownerDocument.body);
    const canvas = within(canvasElement);
    const closeBtn = canvas.queryByRole('button', {
      name: /(Close)|(Cancel)/
    });
    if (closeBtn) {
      await user.click(closeBtn);
    }
    await user.click(canvas.getByRole('button', {
      name: 'Create New Input'
    }));
    await user.click(await body.findByText('Demo input page'));
    await expect(await canvas.findByRole('textbox', {
      name: /name/i
    })).toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const user = userEvent.setup();
    const body = within(canvasElement.ownerDocument.body);
    const canvas = within(canvasElement);
    const closeBtn = canvas.queryByRole('button', {
      name: /(Close)|(Cancel)/
    });
    if (closeBtn) {
      await user.click(closeBtn);
    }
    const editButtons = await canvas.findAllByRole('button', {
      name: 'Edit'
    });
    await user.click(editButtons[2]);
    await expect(await body.findByRole('dialog', {
      name: 'Update custom header'
    })).toBeInTheDocument();
  }
}`,...b.parameters?.docs?.source}}};const ft=["InputPageView","InputPageExpandedRow","InputPageViewAdd","InputPageViewUpdateInput","InputTabViewAdd","InputTabCustomHeader"];export{p as InputPageExpandedRow,u as InputPageView,d as InputPageViewAdd,c as InputPageViewUpdateInput,b as InputTabCustomHeader,m as InputTabViewAdd,ft as __namedExportsOrder,bt as default};
