import{h as y,H as r,g as h,aJ as w,j as g}from"./iframe-dpjTMnOC.js";import{s as x}from"./util-DakudGGz.js";import{I as v}from"./InputPage-DI0PO61m.js";import"./index-nuYtCEEu.js";import"./id-Db1E8M8a.js";import"./ControlWrapper-BM5zRGNC.js";import"./Date-XutZtAHB.js";import"./ScrollContainerContext-DogtmX69.js";import"./Box-DE7m460s.js";import"./ChevronLeft-0NIlqeDI.js";import"./ChevronRight-CAKwgwce.js";import"./Popover-D3MLdcR2.js";import"./ExclamationTriangle-CApgSVdg.js";import"./Tooltip-D0dtXLIo.js";import"./InformationCircle-B-WxxbMa.js";import"./MarkdownMessage-Botp4GAi.js";import"./Link-DETRhvtj.js";import"./Divider-BI7HZr8y.js";import"./CollapsiblePanel-DVzU4Rpc.js";import"./pick-JbkSLyfC.js";import"./Menu-BaV4-Toi.js";import"./Dropdown-BSmjb7Ht.js";import"./textUtils-D6rK6Eep.js";import"./Number-EeQbK4AB.js";import"./api-CjZPq5JP.js";import"./url-cmzogVIW.js";import"./url-DGkq2p2F.js";import"./messageUtil-DTEwCut0.js";import"./DatePickerComponent-DH2M6FjX.js";import"./script-DFaIqjR1.js";import"./Group-Bp5WCcDP.js";import"./usePlatform-B6UzY2v_.js";import"./Error-De7pdCMg.js";import"./ErrorBoundary-D9m3-cHy.js";import"./DotsThreeVertical-D9WQ3Nvv.js";import"./searchUtil-C4wQ5BGE.js";import"./Heading-rwKKcYAD.js";import"./TabBar-BMjvY7by.js";import"./EntityPage-BsmSpTU0.js";import"./BaseFormView-CTLU_dE2.js";import"./TableContext-D9PSc4Om.js";import"./index-BcW2T4We.js";import"./Message-CTAu_nZh.js";import"./Message-Dhf0vLeD.js";import"./pageContext-DllO6PNg.js";import"./UCCButton-DTXqduNc.js";import"./TableWrapper-DU1AgmWU.js";import"./Search-IStF9LDf.js";import"./AcceptModal-BXW2M-go.js";import"./Modal-DHH9dHkg.js";import"./Modal-Bneg7RqM.js";import"./EntityModal-BzwYSq8k.js";import"./DeleteModal-C154FDRo.js";import"./Search-D1xE-hNF.js";import"./MenuInput-BI12IA6H.js";import"./Menu-CnrFscFf.js";import"./SubDescription-BI8r340Q.js";const B={configuration:{title:"",tabs:[{name:"a",title:"",entity:[]}]},inputs:{services:[{name:"demo_input",conf:"some_conf",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0},{type:"text",label:"Interval",validators:[{type:"regex",errorMsg:"Interval must be an integer.",pattern:"^\\-[1-9]\\d*$|^\\d*$"}],defaultValue:"300",field:"interval",help:"Time interval of the data input, in seconds.",required:!0},{type:"singleSelect",field:"select1",label:"Select 1",help:"Default value is Numeric 1",defaultValue:1,options:{autoCompleteFields:[{value:1,label:"Numeric 1"}]}},{type:"singleSelect",field:"select2",label:"Select 2",help:"Default value is Numeric 3",defaultValue:3,options:{autoCompleteFields:[{value:3,label:"Numeric 3"}]}},{type:"multipleSelect",field:"multipleselect1",label:"MultiSelect 1",help:"Default value is Numeric 1",defaultValue:"1",options:{items:[{value:1,label:"Numeric 1"}]}},{type:"singleSelect",label:"Account to use",options:{autoCompleteFields:[{value:"value1",label:"Value1"},{value:"value2",label:"Value2"}]},help:"Account to use for this input.",field:"account",required:!0},{type:"text",label:"sometext",validators:[{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:1e3}],field:"sometext",help:"A unique text for the data input.",required:!0},{type:"singleSelect",label:"Some Select Dropdown",options:{disableSearch:!0,autoCompleteFields:[{value:"DEBUG",label:"DEBUG"},{value:"INFO",label:"INFO"},{value:"WARN",label:"WARN"},{value:"ERROR",label:"ERROR"},{value:"CRITICAL",label:"CRITICAL"}]},defaultValue:"INFO",field:"someselectdropdown"},{type:"checkboxGroup",label:"CheckboxGroupTitle",field:"api3",options:{groups:[{label:"Group 1",options:{isExpandable:!0,expand:!0},fields:["rowUnderGroup1"]},{label:"Group 3",options:{isExpandable:!0,expand:!0},fields:["field223","160validation"]}],rows:[{field:"rowWithoutGroup",input:{defaultValue:1,required:!0}},{field:"rowUnderGroup1",checkbox:{label:"Row under Group 1",defaultValue:!0},input:{defaultValue:1200,required:!1}},{field:"field223",checkbox:{label:"Required field",defaultValue:!0},input:{required:!0}},{field:"160validation",checkbox:{label:"from 1 to 60 validation"},input:{validators:[{type:"number",range:[1,60]}]}}]}}],title:"demo_input",subTitle:" This is a demo input"},{name:"demo_input_page",style:"page",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0},{field:"config2_help_link",label:"",type:"helpLink",options:{text:"SSL configuration documentation",link:"https://ta-jira-service-desk-simple-addon.readthedocs.io/en/latest/configuration.html"}},{type:"checkbox",label:"Hide in UI boolean value",field:"hide_in_ui",options:{display:!1}},{type:"checkbox",label:"Is input readonly?",field:"hard_disabled",options:{display:!1}},{type:"text",label:"Interval",validators:[{type:"regex",errorMsg:"Interval must be an integer.",pattern:"^\\-[1-9]\\d*$|^\\d*$"}],defaultValue:"300",field:"interval",help:"Time interval of the data input, in seconds.",required:!0},{type:"singleSelect",label:"Account to use",options:{autoCompleteFields:[{value:"value1",label:"Value1"},{value:"value2",label:"Value2"}]},help:"Account to use for this input.",field:"account",required:!0},{type:"text",label:"sometext",validators:[{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:1e3}],field:"sometext",help:"A unique text for the data input.",required:!0},{type:"singleSelect",label:"Some Select Dropdown",options:{disableSearch:!0,autoCompleteFields:[{value:"DEBUG",label:"DEBUG"},{value:"INFO",label:"INFO"},{value:"WARN",label:"WARN"},{value:"ERROR",label:"ERROR"},{value:"CRITICAL",label:"CRITICAL"}]},defaultValue:"INFO",field:"someselectdropdown"},{type:"checkboxGroup",label:"CheckboxGroupTitle",field:"api3",options:{groups:[{label:"Group 1",options:{isExpandable:!0,expand:!0},fields:["rowUnderGroup1"]},{label:"Group 3",options:{isExpandable:!0,expand:!0},fields:["field223","160validation"]}],rows:[{field:"rowWithoutGroup",input:{defaultValue:1,required:!0}},{field:"rowUnderGroup1",checkbox:{label:"Row under Group 1",defaultValue:!0},input:{defaultValue:1200,required:!1}},{field:"field223",checkbox:{label:"Required field",defaultValue:!0},input:{required:!0}},{field:"160validation",checkbox:{label:"from 1 to 60 validation"},input:{validators:[{type:"number",range:[1,60]}]}}]}}],title:"Demo input page"},{name:"demo_input_custom",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0},{type:"text",label:"Interval",validators:[{type:"regex",errorMsg:"Interval must be an integer.",pattern:"^\\-[1-9]\\d*$|^\\d*$"}],defaultValue:"300",field:"interval",help:"Time interval of the data input, in seconds.",required:!0}],title:"demo_input_custom",formTitle:"custom header"}],title:"Inputs",description:"Manage your data inputs",table:{actions:["edit","delete","search","clone"],header:[{label:"Name",field:"name"},{label:"Interval",field:"interval"},{label:"Index",field:"index"},{label:"Status",field:"disabled"},{label:"Select Dropdown",field:"someselectdropdown1"}],moreInfo:[{label:"Name",field:"name"},{label:"Interval",field:"interval"},{label:"Index",field:"index"},{label:"Status",field:"disabled",mapping:{1:"Disabled",true:"Disabled",false:"Enabled"}},{label:"Exported",field:"hard_disabled",mapping:{0:"No",1:"Yes",f:"No"}},{label:"Select Dropdown",field:"someselectdropdown2"}]},readonlyFieldId:"hard_disabled",hideFieldId:"hide_in_ui"},dashboard:{panels:[{name:"default"}]}},_={name:"demo_addon_for_splunk",restRoot:"demo_addon_for_splunk",version:"5.32.0R0e2087fe",displayName:"Demo Add-on for Splunk",schemaVersion:"0.0.3"},I={pages:B,meta:_},{userEvent:s,within:o,expect:i}=__STORYBOOK_MODULE_TEST__,Ne={component:v,title:"InputPage",render:e=>(x(JSON.parse(JSON.stringify(e.globalConfig))),g.jsx(v,{})),args:{globalConfig:I},parameters:{msw:{handlers:[y.get("/servicesNS/nobody/-/:inputName",({params:e})=>{switch(e.inputName){case"demo_addon_for_splunk_demo_input":return r.json(h([{name:"my_disabled_input",content:{disabled:"1",hard_disabled:"f",hide_in_ui:"N",account:"value1"}},{name:"my_read_only_input",content:{hard_disabled:"1"}},{name:"my_hidden_input",content:{hide_in_ui:"y"}}]));case"demo_addon_for_splunk_demo_input_page":return r.json(w);case"demo_addon_for_splunk_demo_input_custom":return r.json(h([{name:"name_demo_custom",content:{account:"value1"}}]));default:return r.error()}}),y.post("/servicesNS/nobody/-/:inputName/:name",()=>r.json(w))]},snapshots:{width:1200,height:1200}}},u={play:async({canvasElement:e})=>{const t=o(e);await i(await t.findAllByRole("row")).toHaveLength(5)}},d={play:async({canvasElement:e})=>{const t=o(e),l=(await t.findAllByRole("cell")).filter(n=>n.dataset.test==="expand")[0],a=o(l).getByRole("button");await s.click(a),await i((await t.findAllByRole("definition")).length).toBeGreaterThan(0)}},c={play:async({canvasElement:e})=>{const t=s.setup(),l=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n),await t.click(a.getByRole("button",{name:"Create New Input"})),await t.click(await l.findByText("demo_input")),await i(await l.findByRole("dialog",{name:"Add demo_input"})).toBeInTheDocument()}},p={play:async({canvasElement:e})=>{const t=s.setup(),l=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n);const f=await a.findAllByRole("button",{name:"Edit"});await t.click(f[0]),await i(await l.findByRole("dialog",{name:"Update demo_input"})).toBeInTheDocument()}},m={play:async({canvasElement:e})=>{const t=s.setup(),l=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n),await a.findByRole("button",{name:"Create New Input"});const f=await a.findAllByTestId("edit-button");await t.click(f[2]),await i(await l.findByRole("dialog",{name:"Update custom header"})).toBeInTheDocument()}},b={play:async({canvasElement:e})=>{const t=s.setup(),l=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n),await t.click(a.getByRole("button",{name:"Create New Input"})),await t.click(await l.findByText("Demo input page")),await i(await a.findByRole("textbox",{name:/name/i})).toBeInTheDocument()}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // there are 5 inputs where 1 is hidden
    // the header counts as a row
    await expect(await canvas.findAllByRole('row')).toHaveLength(5);
  }
}`,...u.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const expandableCell = (await canvas.findAllByRole('cell')).filter(cell => cell.dataset.test === 'expand')[0];
    const expandable = within(expandableCell).getByRole('button');
    await userEvent.click(expandable);
    await expect((await canvas.findAllByRole('definition')).length).toBeGreaterThan(0);
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
    await user.click(canvas.getByRole('button', {
      name: 'Create New Input'
    }));
    await user.click(await body.findByText('demo_input'));
    await expect(await body.findByRole('dialog', {
      name: 'Add demo_input'
    })).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const user = userEvent.setup();
    const body = within(canvasElement.ownerDocument.body);
    const canvas = within(canvasElement);

    // Look for Close/Cancel button from the previous dialog
    const closeBtn = canvas.queryByRole('button', {
      name: /(Close)|(Cancel)/
    });
    if (closeBtn) {
      await user.click(closeBtn);
    }
    await canvas.findByRole('button', {
      name: 'Create New Input'
    });
    const editButtons = await canvas.findAllByTestId('edit-button');
    await user.click(editButtons[2]);
    await expect(await body.findByRole('dialog', {
      name: 'Update custom header'
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
    await user.click(canvas.getByRole('button', {
      name: 'Create New Input'
    }));
    await user.click(await body.findByText('Demo input page'));
    await expect(await canvas.findByRole('textbox', {
      name: /name/i
    })).toBeInTheDocument();
  }
}`,...b.parameters?.docs?.source}}};const Ee=["InputPageView","InputPageExpandedRow","InputPageViewAdd","InputPageViewUpdateInput","InputTabCustomHeader","InputTabViewAdd"];export{d as InputPageExpandedRow,u as InputPageView,c as InputPageViewAdd,p as InputPageViewUpdateInput,m as InputTabCustomHeader,b as InputTabViewAdd,Ee as __namedExportsOrder,Ne as default};
