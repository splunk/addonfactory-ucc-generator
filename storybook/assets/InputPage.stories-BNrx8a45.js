import{j as g}from"./jsx-runtime-ojCMydbh.js";import{h as y,H as r}from"./index-kle9pbY7.js";import{a as o,e as l,u as s}from"./index-DpwipV_e.js";import{s as x}from"./util-CGkFfNTa.js";import{I as h}from"./InputPage-6xWHeGy7.js";import{g as w,b as v}from"./server-response-Cmhjwb6A.js";import"./index-DI6txC9U.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-BAMY2Nnw.js";import"./iframe-BVJboWvC.js";import"./_baseIteratee-BgljbWfr.js";import"./omit-ztEEjYnI.js";import"./ControlWrapper-Ci-zlHqj.js";import"./Text-BOUR33a1.js";import"./times-DEtgg_I4.js";import"./includes-Clo6__ke.js";import"./Clickable-m7b-p22w.js";import"./ExclamationTriangle-DaHVRaQA.js";import"./Button-BVwbUX9I.js";import"./ScreenReaderContent-DYUfzbCm.js";import"./ButtonSimple-Bnkbn06o.js";import"./Box-dCuMX_uk.js";import"./index-CujC5SV_.js";import"./AnimationToggle-Dgpdi4Ip.js";import"./Tooltip-DNvjBS2i.js";import"./Popover-CmySphiq.js";import"./_arrayIncludesWith-D7mRho23.js";import"./ScrollContainerContext-Cdp9tX0F.js";import"./InformationCircle-gwQHWa7p.js";import"./ChevronRight-B2uYXglV.js";import"./isEqual-Q2uatnfO.js";import"./index-s8iMx1jP.js";import"./MarkdownMessage-vKaL8cy0.js";import"./Link-BMz1NHYV.js";import"./Divider-wHm8s2UO.js";import"./Button-zWON0gNY.js";import"./CollapsiblePanel-CBq0y_BG.js";import"./variables-BfrwVMxe.js";import"./pick-B2D4nEtf.js";import"./Menu-DJUgZFWQ.js";import"./Dropdown-ChHUzFro.js";import"./textUtils-BIiSxj3a.js";import"./toUpper-DNM9XKBs.js";import"./_baseDifference-BucyWK35.js";import"./url-Dlk_22OB.js";import"./scroll-D_om4I15.js";import"./WaitSpinner-BSmPTg-B.js";import"./api-D_ndwf0a.js";import"./url-1MEF4Ke-.js";import"./messageUtil-8kA0E4H4.js";import"./DatePickerComponent-Bm9AYacc.js";import"./ChevronLeft-CjhuJSXo.js";import"./script-BkARDwkC.js";import"./Group-RnZmXvj5.js";import"./usePlatform-C3ZHxJkM.js";import"./ErrorBoundary-D3MpB3IP.js";import"./DotsThreeVertical-CiIS6iBf.js";import"./searchUtil-NABkgmcP.js";import"./Heading-CQbFkV0J.js";import"./index-CTHfhRPv.js";import"./TabBar--MTsurMI.js";import"./index-PKf9zeTC.js";import"./EntityPage-CJIOfApT.js";import"./BaseFormView-CgtB-qxT.js";import"./TableContext-DvDGRd0l.js";import"./index-DBQfC_yZ.js";import"./Message-Cv3I_ntp.js";import"./pageContext-DllO6PNg.js";import"./PageContext-BspKImV7.js";import"./UCCButton-C-pV6XSt.js";import"./TableWrapper-em9ZDpLq.js";import"./CustomTableStyle-p7X-pblC.js";import"./utilities.esm-CpsBEvtb.js";import"./AcceptModal-B0mIPAx-.js";import"./Modal-DCdZgbXq.js";import"./EntityModal-B4vcWqfM.js";import"./DeleteModal-CZROTYQp.js";import"./Search-B0muHIml.js";import"./MenuInput-C4QYufxg.js";import"./Menu-B_JWJb-T.js";import"./SubDescription-BAJnO2mb.js";const B={configuration:{title:"",tabs:[{name:"a",title:"",entity:[]}]},inputs:{services:[{name:"demo_input",conf:"some_conf",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0},{type:"text",label:"Interval",validators:[{type:"regex",errorMsg:"Interval must be an integer.",pattern:"^\\-[1-9]\\d*$|^\\d*$"}],defaultValue:"300",field:"interval",help:"Time interval of the data input, in seconds.",required:!0},{type:"singleSelect",field:"select1",label:"Select 1",help:"Default value is Numeric 1",defaultValue:1,options:{autoCompleteFields:[{value:1,label:"Numeric 1"}]}},{type:"singleSelect",field:"select2",label:"Select 2",help:"Default value is Numeric 3",defaultValue:3,options:{autoCompleteFields:[{value:3,label:"Numeric 3"}]}},{type:"multipleSelect",field:"multipleselect1",label:"MultiSelect 1",help:"Default value is Numeric 1",defaultValue:"1",options:{items:[{value:1,label:"Numeric 1"}]}},{type:"singleSelect",label:"Account to use",options:{autoCompleteFields:[{value:"value1",label:"Value1"},{value:"value2",label:"Value2"}]},help:"Account to use for this input.",field:"account",required:!0},{type:"text",label:"sometext",validators:[{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:1e3}],field:"sometext",help:"A unique text for the data input.",required:!0},{type:"singleSelect",label:"Some Select Dropdown",options:{disableSearch:!0,autoCompleteFields:[{value:"DEBUG",label:"DEBUG"},{value:"INFO",label:"INFO"},{value:"WARN",label:"WARN"},{value:"ERROR",label:"ERROR"},{value:"CRITICAL",label:"CRITICAL"}]},defaultValue:"INFO",field:"someselectdropdown"},{type:"checkboxGroup",label:"CheckboxGroupTitle",field:"api3",options:{groups:[{label:"Group 1",options:{isExpandable:!0,expand:!0},fields:["rowUnderGroup1"]},{label:"Group 3",options:{isExpandable:!0,expand:!0},fields:["field223","160validation"]}],rows:[{field:"rowWithoutGroup",input:{defaultValue:1,required:!0}},{field:"rowUnderGroup1",checkbox:{label:"Row under Group 1",defaultValue:!0},input:{defaultValue:1200,required:!1}},{field:"field223",checkbox:{label:"Required field",defaultValue:!0},input:{required:!0}},{field:"160validation",checkbox:{label:"from 1 to 60 validation"},input:{validators:[{type:"number",range:[1,60]}]}}]}}],title:"demo_input",subTitle:" This is a demo input"},{name:"demo_input_page",style:"page",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0},{field:"config2_help_link",label:"",type:"helpLink",options:{text:"SSL configuration documentation",link:"https://ta-jira-service-desk-simple-addon.readthedocs.io/en/latest/configuration.html"}},{type:"checkbox",label:"Hide in UI boolean value",field:"hide_in_ui",options:{display:!1}},{type:"checkbox",label:"Is input readonly?",field:"hard_disabled",options:{display:!1}},{type:"text",label:"Interval",validators:[{type:"regex",errorMsg:"Interval must be an integer.",pattern:"^\\-[1-9]\\d*$|^\\d*$"}],defaultValue:"300",field:"interval",help:"Time interval of the data input, in seconds.",required:!0},{type:"singleSelect",label:"Account to use",options:{autoCompleteFields:[{value:"value1",label:"Value1"},{value:"value2",label:"Value2"}]},help:"Account to use for this input.",field:"account",required:!0},{type:"text",label:"sometext",validators:[{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:1e3}],field:"sometext",help:"A unique text for the data input.",required:!0},{type:"singleSelect",label:"Some Select Dropdown",options:{disableSearch:!0,autoCompleteFields:[{value:"DEBUG",label:"DEBUG"},{value:"INFO",label:"INFO"},{value:"WARN",label:"WARN"},{value:"ERROR",label:"ERROR"},{value:"CRITICAL",label:"CRITICAL"}]},defaultValue:"INFO",field:"someselectdropdown"},{type:"checkboxGroup",label:"CheckboxGroupTitle",field:"api3",options:{groups:[{label:"Group 1",options:{isExpandable:!0,expand:!0},fields:["rowUnderGroup1"]},{label:"Group 3",options:{isExpandable:!0,expand:!0},fields:["field223","160validation"]}],rows:[{field:"rowWithoutGroup",input:{defaultValue:1,required:!0}},{field:"rowUnderGroup1",checkbox:{label:"Row under Group 1",defaultValue:!0},input:{defaultValue:1200,required:!1}},{field:"field223",checkbox:{label:"Required field",defaultValue:!0},input:{required:!0}},{field:"160validation",checkbox:{label:"from 1 to 60 validation"},input:{validators:[{type:"number",range:[1,60]}]}}]}}],title:"Demo input page"},{name:"demo_input_custom",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0},{type:"text",label:"Interval",validators:[{type:"regex",errorMsg:"Interval must be an integer.",pattern:"^\\-[1-9]\\d*$|^\\d*$"}],defaultValue:"300",field:"interval",help:"Time interval of the data input, in seconds.",required:!0}],title:"demo_input_custom",formTitle:"custom header"}],title:"Inputs",description:"Manage your data inputs",table:{actions:["edit","delete","search","clone"],header:[{label:"Name",field:"name"},{label:"Interval",field:"interval"},{label:"Index",field:"index"},{label:"Status",field:"disabled"},{label:"Select Dropdown",field:"someselectdropdown1"}],moreInfo:[{label:"Name",field:"name"},{label:"Interval",field:"interval"},{label:"Index",field:"index"},{label:"Status",field:"disabled",mapping:{1:"Disabled",true:"Disabled",false:"Enabled"}},{label:"Exported",field:"hard_disabled",mapping:{0:"No",1:"Yes",f:"No"}},{label:"Select Dropdown",field:"someselectdropdown2"}]},readonlyFieldId:"hard_disabled",hideFieldId:"hide_in_ui"},dashboard:{panels:[{name:"default"}]}},I={name:"demo_addon_for_splunk",restRoot:"demo_addon_for_splunk",version:"5.32.0R0e2087fe",displayName:"Demo Add-on for Splunk",schemaVersion:"0.0.3"},R={pages:B,meta:I},Qe={component:h,title:"InputPage",render:e=>(x(JSON.parse(JSON.stringify(e.globalConfig))),g.jsx(h,{})),args:{globalConfig:R},parameters:{msw:{handlers:[y.get("/servicesNS/nobody/-/:inputName",({params:e})=>{switch(e.inputName){case"demo_addon_for_splunk_demo_input":return r.json(w([{name:"my_disabled_input",content:{disabled:"1",hard_disabled:"f",hide_in_ui:"N",account:"value1"}},{name:"my_read_only_input",content:{hard_disabled:"1"}},{name:"my_hidden_input",content:{hide_in_ui:"y"}}]));case"demo_addon_for_splunk_demo_input_page":return r.json(v);case"demo_addon_for_splunk_demo_input_custom":return r.json(w([{name:"name_demo_custom",content:{account:"value1"}}]));default:return r.error()}}),y.post("/servicesNS/nobody/-/:inputName/:name",()=>r.json(v))]},snapshots:{width:1200,height:1200}}},u={play:async({canvasElement:e})=>{const t=o(e);await l(await t.findAllByRole("row")).toHaveLength(5)}},d={play:async({canvasElement:e})=>{const t=o(e),i=(await t.findAllByRole("cell")).filter(n=>n.dataset.test==="expand")[0],a=o(i).getByRole("button");await s.click(a),await l((await t.findAllByRole("definition")).length).toBeGreaterThan(0)}},p={play:async({canvasElement:e})=>{const t=s.setup(),i=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n),await t.click(a.getByRole("button",{name:"Create New Input"})),await t.click(await i.findByText("demo_input")),await l(await i.findByRole("dialog",{name:"Add demo_input"})).toBeInTheDocument()}},c={play:async({canvasElement:e})=>{const t=s.setup(),i=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n);const f=await a.findAllByRole("button",{name:"Edit"});await t.click(f[0]),await l(await i.findByRole("dialog",{name:"Update demo_input"})).toBeInTheDocument()}},m={play:async({canvasElement:e})=>{const t=s.setup(),i=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n),await a.findByRole("button",{name:"Create New Input"});const f=await a.findAllByTestId("edit-button");await t.click(f[2]),await l(await i.findByRole("dialog",{name:"Update custom header"})).toBeInTheDocument()}},b={play:async({canvasElement:e})=>{const t=s.setup(),i=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n),await t.click(a.getByRole("button",{name:"Create New Input"})),await t.click(await i.findByText("Demo input page")),await l(await a.findByRole("textbox",{name:/name/i})).toBeInTheDocument()}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};const Xe=["InputPageView","InputPageExpandedRow","InputPageViewAdd","InputPageViewUpdateInput","InputTabCustomHeader","InputTabViewAdd"];export{d as InputPageExpandedRow,u as InputPageView,p as InputPageViewAdd,c as InputPageViewUpdateInput,m as InputTabCustomHeader,b as InputTabViewAdd,Xe as __namedExportsOrder,Qe as default};
