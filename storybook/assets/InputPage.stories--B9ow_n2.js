import{j as g}from"./jsx-runtime-D55GQ3BV.js";import{h as y,H as r}from"./index-C5aCdurT.js";import{a as o,e as l,u as s}from"./index-3UExtwfn.js";import{s as x}from"./util-nv791zPf.js";import{I as h}from"./InputPage-DUEx-7LB.js";import{g as w,b as v}from"./server-response-Cmhjwb6A.js";import"./index-CtTTUaxh.js";import"./_commonjsHelpers-CE1G-McA.js";import"./iframe-Cp62kWYG.js";import"./index-BAMY2Nnw.js";import"./find-DOPPtTO5.js";import"./_arrayIncludesWith-Cf8RQZ1L.js";import"./invariant-Cbo0Fu-i.js";import"./modes-C8SQrryx.js";import"./Clickable-gBf45GFR.js";import"./index-TwQu68rg.js";import"./index-BKv2EDKS.js";import"./usePlatform-4654Jxgv.js";import"./index-DXTH3g_Q.js";import"./variables-DTFMykBX.js";import"./pick-C0bI9_1F.js";import"./TabBar-DdYnVjVl.js";import"./DotsThreeVertical-BtXVJWcg.js";import"./IconProvider-DfXPuXoa.js";import"./ErrorBoundary-2SQQowkG.js";import"./messageUtil-DnHFL-Io.js";import"./SVGInternal-zggHEN0-.js";import"./SVG-Cr2z3RPr.js";import"./searchUtil-DxLq2Op6.js";import"./isEqual-CzWrA3aE.js";import"./_baseDifference-C3Q7_G0N.js";import"./Heading-BNY10ykd.js";import"./Heading-De4XED9R.js";import"./Box-BaDtlhAb.js";import"./Tooltip-nNqhIvge.js";import"./ScreenReaderContent-qsyEXMyy.js";import"./Button-fPXh-Lq2.js";import"./style-gb7uifME.js";import"./External-CYO48bYj.js";import"./Link-CFB-t7hC.js";import"./Link-DTBEsgMb.js";import"./ArrowSquareTopRight-2nx1XQBJ.js";import"./variables-BqwaEspd.js";import"./pick-Bf73G4N4.js";import"./CollapsiblePanel-BLdGK9UY.js";import"./usePrevious-q-aoz80S.js";import"./ChevronRight-dvcXO2Iz.js";import"./index-CfESDoyh.js";import"./EntityPage-CD94BYOT.js";import"./BaseFormView-SKn7Bdyy.js";import"./TableContext-CclY-zzT.js";import"./index-nEgpdRiK.js";import"./Message-DpUq2CsJ.js";import"./Close-DT0qGRBu.js";import"./ControlWrapper-DbCRcu6A.js";import"./ControlGroup-Dz58dqqR.js";import"./ControlGroup-h1kJxx7z.js";import"./MarkdownMessage-DuY-WcuS.js";import"./CheckboxTree-BARM0uhq.js";import"./Button-CSLC7xhu.js";import"./Switch-SM58S-Wg.js";import"./Switch-Bh6TuT65.js";import"./HelpLinkComponent-DIfiPZKf.js";import"./textUtils-CvJd_8qc.js";import"./TextComponent-DVqSNxkD.js";import"./Text-CEFHVeb6.js";import"./noop-CoMJoj29.js";import"./TextArea-CSOBYjfB.js";import"./utils-CEqOZghX.js";import"./TextAreaComponent-CC98rpzK.js";import"./SingleInputComponent-B_BYarEL.js";import"./extend-DuyhAT9M.js";import"./Menu-Dc46JiH0.js";import"./Divider-DpeIN7LP.js";import"./ResultsMenu-Ddbkllha.js";import"./WaitSpinner-l7cUSAmq.js";import"./filter-B4FjaX6z.js";import"./Clear-C1R2h3S5.js";import"./api-GqO88VGt.js";import"./url-DNBCE42A.js";import"./considerFalseAndTruthy-D4Pwj1gQ.js";import"./MultiInputComponent-BkSs0dtz.js";import"./format-Cmm_Rw-E.js";import"./repeat-FymCtWjv.js";import"./CheckBoxComponent-DYa4IjT4.js";import"./RadioComponent-4bdOw_Gn.js";import"./script-epayKKsf.js";import"./CustomComponentContext-C3N2SDcm.js";import"./FileInputComponent-CdirMscK.js";import"./toUpper-Vbgaie99.js";import"./CheckboxGroup-2K83DwBZ.js";import"./Group-CdYteFJl.js";import"./pageContext-DllO6PNg.js";import"./PageContext-w0u9Vfuv.js";import"./UCCButton-DzEKGeX7.js";import"./TableWrapper-RHLxjrMZ.js";import"./CustomTableStyle-CaJsFq94.js";import"./Trash-B20a87Nd.js";import"./AcceptModal-Dg6Z6YS8.js";import"./Modal-C2T4uvJ2.js";import"./EntityModal-DPuf0SZW.js";import"./DeleteModal-CWDTvHIU.js";import"./Search-CHFbM7mK.js";import"./MenuInput-A3tXacIO.js";import"./Menu-BD5qZrDV.js";import"./ChevronLeft-CewvDSN2.js";import"./SubDescription-Dzl3VcUe.js";const B={configuration:{title:"",tabs:[{name:"a",title:"",entity:[]}]},inputs:{services:[{name:"demo_input",conf:"some_conf",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0},{type:"text",label:"Interval",validators:[{type:"regex",errorMsg:"Interval must be an integer.",pattern:"^\\-[1-9]\\d*$|^\\d*$"}],defaultValue:"300",field:"interval",help:"Time interval of the data input, in seconds.",required:!0},{type:"singleSelect",field:"select1",label:"Select 1",help:"Default value is Numeric 1",defaultValue:1,options:{autoCompleteFields:[{value:1,label:"Numeric 1"}]}},{type:"singleSelect",field:"select2",label:"Select 2",help:"Default value is Numeric 3",defaultValue:3,options:{autoCompleteFields:[{value:3,label:"Numeric 3"}]}},{type:"multipleSelect",field:"multipleselect1",label:"MultiSelect 1",help:"Default value is Numeric 1",defaultValue:"1",options:{items:[{value:1,label:"Numeric 1"}]}},{type:"singleSelect",label:"Account to use",options:{autoCompleteFields:[{value:"value1",label:"Value1"},{value:"value2",label:"Value2"}]},help:"Account to use for this input.",field:"account",required:!0},{type:"text",label:"sometext",validators:[{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:1e3}],field:"sometext",help:"A unique text for the data input.",required:!0},{type:"singleSelect",label:"Some Select Dropdown",options:{disableSearch:!0,autoCompleteFields:[{value:"DEBUG",label:"DEBUG"},{value:"INFO",label:"INFO"},{value:"WARN",label:"WARN"},{value:"ERROR",label:"ERROR"},{value:"CRITICAL",label:"CRITICAL"}]},defaultValue:"INFO",field:"someselectdropdown"},{type:"checkboxGroup",label:"CheckboxGroupTitle",field:"api3",options:{groups:[{label:"Group 1",options:{isExpandable:!0,expand:!0},fields:["rowUnderGroup1"]},{label:"Group 3",options:{isExpandable:!0,expand:!0},fields:["field223","160validation"]}],rows:[{field:"rowWithoutGroup",input:{defaultValue:1,required:!0}},{field:"rowUnderGroup1",checkbox:{label:"Row under Group 1",defaultValue:!0},input:{defaultValue:1200,required:!1}},{field:"field223",checkbox:{label:"Required field",defaultValue:!0},input:{required:!0}},{field:"160validation",checkbox:{label:"from 1 to 60 validation"},input:{validators:[{type:"number",range:[1,60]}]}}]}}],title:"demo_input",subTitle:" This is a demo input"},{name:"demo_input_page",style:"page",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0},{field:"config2_help_link",label:"",type:"helpLink",options:{text:"SSL configuration documentation",link:"https://ta-jira-service-desk-simple-addon.readthedocs.io/en/latest/configuration.html"}},{type:"checkbox",label:"Hide in UI boolean value",field:"hide_in_ui",options:{display:!1}},{type:"checkbox",label:"Is input readonly?",field:"hard_disabled",options:{display:!1}},{type:"text",label:"Interval",validators:[{type:"regex",errorMsg:"Interval must be an integer.",pattern:"^\\-[1-9]\\d*$|^\\d*$"}],defaultValue:"300",field:"interval",help:"Time interval of the data input, in seconds.",required:!0},{type:"singleSelect",label:"Account to use",options:{autoCompleteFields:[{value:"value1",label:"Value1"},{value:"value2",label:"Value2"}]},help:"Account to use for this input.",field:"account",required:!0},{type:"text",label:"sometext",validators:[{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:1e3}],field:"sometext",help:"A unique text for the data input.",required:!0},{type:"singleSelect",label:"Some Select Dropdown",options:{disableSearch:!0,autoCompleteFields:[{value:"DEBUG",label:"DEBUG"},{value:"INFO",label:"INFO"},{value:"WARN",label:"WARN"},{value:"ERROR",label:"ERROR"},{value:"CRITICAL",label:"CRITICAL"}]},defaultValue:"INFO",field:"someselectdropdown"},{type:"checkboxGroup",label:"CheckboxGroupTitle",field:"api3",options:{groups:[{label:"Group 1",options:{isExpandable:!0,expand:!0},fields:["rowUnderGroup1"]},{label:"Group 3",options:{isExpandable:!0,expand:!0},fields:["field223","160validation"]}],rows:[{field:"rowWithoutGroup",input:{defaultValue:1,required:!0}},{field:"rowUnderGroup1",checkbox:{label:"Row under Group 1",defaultValue:!0},input:{defaultValue:1200,required:!1}},{field:"field223",checkbox:{label:"Required field",defaultValue:!0},input:{required:!0}},{field:"160validation",checkbox:{label:"from 1 to 60 validation"},input:{validators:[{type:"number",range:[1,60]}]}}]}}],title:"Demo input page"},{name:"demo_input_custom",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0},{type:"text",label:"Interval",validators:[{type:"regex",errorMsg:"Interval must be an integer.",pattern:"^\\-[1-9]\\d*$|^\\d*$"}],defaultValue:"300",field:"interval",help:"Time interval of the data input, in seconds.",required:!0}],title:"demo_input_custom",formTitle:"custom header"}],title:"Inputs",description:"Manage your data inputs",table:{actions:["edit","delete","search","clone"],header:[{label:"Name",field:"name"},{label:"Interval",field:"interval"},{label:"Index",field:"index"},{label:"Status",field:"disabled"},{label:"Select Dropdown",field:"someselectdropdown1"}],moreInfo:[{label:"Name",field:"name"},{label:"Interval",field:"interval"},{label:"Index",field:"index"},{label:"Status",field:"disabled",mapping:{1:"Disabled",true:"Disabled",false:"Enabled"}},{label:"Exported",field:"hard_disabled",mapping:{0:"No",1:"Yes",f:"No"}},{label:"Select Dropdown",field:"someselectdropdown2"}]},readonlyFieldId:"hard_disabled",hideFieldId:"hide_in_ui"},dashboard:{panels:[{name:"default"}]}},I={name:"demo_addon_for_splunk",restRoot:"demo_addon_for_splunk",version:"5.32.0R0e2087fe",displayName:"Demo Add-on for Splunk",schemaVersion:"0.0.3"},R={pages:B,meta:I},Rt={component:h,title:"InputPage",render:e=>(x(JSON.parse(JSON.stringify(e.globalConfig))),g.jsx(h,{})),args:{globalConfig:R},parameters:{msw:{handlers:[y.get("/servicesNS/nobody/-/:inputName",({params:e})=>{switch(e.inputName){case"demo_addon_for_splunk_demo_input":return r.json(w([{name:"my_disabled_input",content:{disabled:"1",hard_disabled:"f",hide_in_ui:"N",account:"value1"}},{name:"my_read_only_input",content:{hard_disabled:"1"}},{name:"my_hidden_input",content:{hide_in_ui:"y"}}]));case"demo_addon_for_splunk_demo_input_page":return r.json(v);case"demo_addon_for_splunk_demo_input_custom":return r.json(w([{name:"name_demo_custom",content:{account:"value1"}}]));default:return r.error()}}),y.post("/servicesNS/nobody/-/:inputName/:name",()=>r.json(v))]},snapshots:{width:1200,height:1200}}},u={play:async({canvasElement:e})=>{const t=o(e);await l(await t.findAllByRole("row")).toHaveLength(5)}},p={play:async({canvasElement:e})=>{const t=o(e),i=(await t.findAllByRole("cell")).filter(n=>n.dataset.test==="expand")[0],a=o(i).getByRole("button");await s.click(a),await l((await t.findAllByRole("definition")).length).toBeGreaterThan(0)}},d={play:async({canvasElement:e})=>{const t=s.setup(),i=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n),await t.click(a.getByRole("button",{name:"Create New Input"})),await t.click(await i.findByText("demo_input")),await l(await i.findByRole("dialog",{name:"Add demo_input"})).toBeInTheDocument()}},c={play:async({canvasElement:e})=>{const t=s.setup(),i=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n);const f=await a.findAllByRole("button",{name:"Edit"});await t.click(f[0]),await l(await i.findByRole("dialog",{name:"Update demo_input"})).toBeInTheDocument()}},m={play:async({canvasElement:e})=>{const t=s.setup(),i=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n),await t.click(a.getByRole("button",{name:"Create New Input"})),await t.click(await i.findByText("Demo input page")),await l(await a.findByRole("textbox",{name:/name/i})).toBeInTheDocument()}},b={play:async({canvasElement:e})=>{const t=s.setup(),i=o(e.ownerDocument.body),a=o(e),n=a.queryByRole("button",{name:/(Close)|(Cancel)/});n&&await t.click(n);const f=await a.findAllByRole("button",{name:"Edit"});await t.click(f[2]),await l(await i.findByRole("dialog",{name:"Update custom header"})).toBeInTheDocument()}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};const _t=["InputPageView","InputPageExpandedRow","InputPageViewAdd","InputPageViewUpdateInput","InputTabViewAdd","InputTabCustomHeader"];export{p as InputPageExpandedRow,u as InputPageView,d as InputPageViewAdd,c as InputPageViewUpdateInput,b as InputTabCustomHeader,m as InputTabViewAdd,_t as __namedExportsOrder,Rt as default};
