import{j as v}from"./jsx-runtime-ClejQJRV.js";import{f as t,a as N,u as y}from"./index-y4Yn5WZ1.js";import{B as k}from"./BaseFormView-DA41Yo12.js";import{G as m,s as C}from"./util-DfUvgPwM.js";import{i as w}from"./invariant-Cbo0Fu-i.js";import"./index-BnZYiL63.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./iframe-B0-yMJSF.js";import"./index-BAMY2Nnw.js";import"./TableContext-BmRe0wAG.js";import"./index-k--C9drU.js";import"./Clickable-wzamu0qE.js";import"./index-C6Xwkj2v.js";import"./index-BeaWwRds.js";import"./Message-BhItrygt.js";import"./IconProvider-D1bqsLqQ.js";import"./Close-CPSltoSy.js";import"./Warning-CEMYJjjT.js";import"./ScreenReaderContent-DTnCP1nJ.js";import"./Box-9y-3oeI2.js";import"./Link-B3IMA5iK.js";import"./ArrowSquareTopRight-cE1IFp2S.js";import"./External-CaozYYRu.js";import"./ControlWrapper-CVzGeWh8.js";import"./ControlGroup-a8oyWZe3.js";import"./ControlGroup-D1l7iBTi.js";import"./find-D36SYLnv.js";import"./Tooltip-s2-C62Iv.js";import"./MarkdownMessage-KWXjiEhM.js";import"./Link-COq5B319.js";import"./CheckboxTree-CsvFXcxD.js";import"./modes-torNl340.js";import"./Button-BHr02HYf.js";import"./Button-JhicfZMm.js";import"./style-gy5-imeJ.js";import"./CollapsiblePanel-BPnrRfFA.js";import"./usePrevious-T3tkdeEg.js";import"./ChevronRight-BZ9dd8ev.js";import"./variables-BlEdyhR1.js";import"./pick-BPsdbB5n.js";import"./Switch-CnzSxpRR.js";import"./Switch-DAz2gr6S.js";import"./HelpLinkComponent-dsK2_iXH.js";import"./textUtils-DUUDexJ9.js";import"./TextComponent-BxD6sPuy.js";import"./Text-CXLzpk1L.js";import"./TextArea-WoYN_p44.js";import"./Search-DJ2srasI.js";import"./utils-CEqOZghX.js";import"./TextAreaComponent-D398mJR1.js";import"./SingleInputComponent-B52slQX9.js";import"./ComboBox-CmYP-_Jn.js";import"./extend-BCHzQ2P0.js";import"./Menu-CO_c8kuU.js";import"./Divider-BxwkhgHI.js";import"./Heading-2h2rzLUR.js";import"./WaitSpinner-pc6awGU8.js";import"./api-D6WilaDV.js";import"./url-CzOjCGiC.js";import"./messageUtil-CXCS-b_z.js";import"./considerFalseAndTruthy-D4Pwj1gQ.js";import"./MultiInputComponent-T90e_uJj.js";import"./Multiselect-DzTVP2xI.js";import"./format-pOB4dcXd.js";import"./CheckBoxComponent-Y9tZdK2B.js";import"./RadioComponent-BlPsbW1_.js";import"./RadioBar-C-BIDM59.js";import"./script-Dpip0sFJ.js";import"./CustomComponentContext-DUBuY9CR.js";import"./FileInputComponent-CoOmUzrQ.js";import"./File-B2KlQZ1a.js";import"./CheckboxGroup-DBkKfCe4.js";import"./Group-B0Pjm6PE.js";import"./Number-CBlFIa2o.js";import"./pageContext-DllO6PNg.js";const g={pages:{configuration:{tabs:[{name:"account",table:{actions:["edit","delete","clone"],header:[{label:"Name",field:"name"},{label:"Auth Type",field:"auth_type"}]},entity:[{type:"text",label:"Name",validators:[{type:"string",errorMsg:"Length of ID should be between 1 and 50",minLength:1,maxLength:50},{type:"regex",errorMsg:"Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"}],field:"name",help:"Enter a unique name for this account.",required:!0},{type:"text",label:"Endpoint URL",help:"Enter the endpoint URL.",field:"endpoint",options:{display:!1,requiredWhenVisible:!0}},{type:"oauth",field:"oauth",label:"Not used",options:{auth_type:["basic","oauth"],basic:[{oauth_field:"username",label:"Username",help:"Enter the username for this account.",field:"username"},{oauth_field:"password",label:"Password",encrypted:!0,help:"Enter the password for this account.",field:"password"},{oauth_field:"security_token",label:"Security Token",encrypted:!0,help:"Enter the security token.",field:"token"},{oauth_field:"some_text",label:"Disabled on edit for oauth",help:"Enter text for field disabled on edit",field:"basic_oauth_text",required:!1,options:{disableonEdit:!0}}],oauth:[{oauth_field:"client_id",label:"Client Id",field:"client_id",help:"Enter the Client Id for this account."},{oauth_field:"client_secret",label:"Client Secret",field:"client_secret",encrypted:!0,help:"Enter the Client Secret key for this account."},{oauth_field:"redirect_url",label:"Redirect url",field:"redirect_url",help:"Copy and paste this URL into your app."},{oauth_field:"endpoint_token",label:"Token endpoint",field:"endpoint_token",help:"Put here endpoint used for token acqusition ie. login.salesforce.com"},{oauth_field:"endpoint_authorize",label:"Authorize endpoint",field:"endpoint_authorize",help:"Put here endpoint used for authorization ie. login.salesforce.com"},{oauth_field:"oauth_some_text",label:"Disabled on edit for oauth",help:"Enter text for field disabled on edit",field:"oauth_oauth_text",required:!1,options:{disableonEdit:!0,enable:!1}}],auth_code_endpoint:"/services/oauth2/authorize",access_token_endpoint:"/services/oauth2/token",oauth_timeout:30,oauth_state_enabled:!1}}],title:"Account",restHandlerModule:"splunk_ta_uccexample_validate_account_rh",restHandlerClass:"CustomAccountValidator"}],title:"Configuration",description:"Set up your add-on"},inputs:{services:[{name:"example_input_one",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0},{type:"checkbox",label:"Example Checkbox",field:"input_one_checkbox",help:"This is an example checkbox for the input one entity",defaultValue:!0}],title:"Example Input One"}],title:"Inputs",description:"Manage your data inputs",subDescription:{text:`Input page - Ingesting data from to Splunk Cloud? Have you tried the new Splunk Data Manager yet?
Data Manager makes AWS data ingestion simpler, more automated and centrally managed for you, while co-existing with AWS and/or Kinesis TAs.
Read our [[blogPost]] to learn more about Data Manager and it's availability on your Splunk Cloud instance.`,links:[{slug:"blogPost",link:"https://splk.it/31oy2b2",linkText:"blog post"}]},table:{actions:["edit","delete","search","clone"],header:[{label:"Name",field:"name"}],moreInfo:[{label:"Name",field:"name"}]}}},meta:{name:"Splunk_TA_UCCExample",restRoot:"splunk_ta_uccexample",version:"5.41.0R9c5fbfe0",displayName:"Splunk UCC test Add-on",schemaVersion:"0.0.3",_uccVersion:"5.41.0"}},h=()=>{const e=JSON.parse(JSON.stringify(g));return e.pages.configuration.tabs[0].entity[2].options?.auth_type&&(e.pages.configuration.tabs[0].entity[2].options.auth_type=["basic"]),e},M=()=>{const e=JSON.parse(JSON.stringify(g));return e.pages.configuration.tabs[0].entity[2].options?.auth_type&&(e.pages.configuration.tabs[0].entity[2].options.auth_type=["oauth"]),e},_=({entitiesConfig:e,entityGroupsConfig:x,entitiesInputs:a,entityGroupsInputs:f})=>({pages:{configuration:{tabs:[{name:"account",table:{actions:["edit","delete","clone"],header:[{label:"Name",field:"name"}]},entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Account Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"}],field:"name",help:"A unique name for the account.",required:!0},...e||[]],groups:x,title:"Accounts"}],title:"Configuration",description:"Set up your add-on"},inputs:{services:[{name:"demo_input",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0,encrypted:!1},...a||[]],groups:f,title:"demo_input"}],title:"Inputs",description:"Manage your data inputs",table:{actions:["edit","delete","clone"],header:[{label:"Name",field:"name"}]}}},meta:{name:"demo_addon_for_splunk",restRoot:"demo_addon_for_splunk",version:"5.31.1R85f0e18e",displayName:"Demo Add-on for Splunk",schemaVersion:"0.0.3",checkForUpdates:!1,searchViewDefault:!1}}),S=[{type:"text",label:"Text 1 Group 2",field:"text_field_1_group_2",required:!1},{type:"text",label:"Text 2 Group 2",field:"text_field_2_group_2",required:!1},{type:"text",label:"Text 1 Group 1",field:"text_field_1_group_1",required:!1},{type:"text",label:"Text 2 Group 1",field:"text_field_2_group_1",required:!1},{type:"text",label:"Text 1 Group 3",field:"text_field_1_group_3",required:!1},{type:"text",label:"Text 2 Group 3",field:"text_field_2_group_3",required:!1}],b=[{label:"Group 1",fields:["text_field_1_group_1","text_field_2_group_1"]},{label:"Group 2",fields:["text_field_1_group_2","text_field_2_group_2"],options:{isExpandable:!0,expand:!0}},{label:"Group 3",fields:["text_field_1_group_3","text_field_2_group_3"],options:{isExpandable:!0,expand:!1}}];function G(){return m.parse(_({entitiesConfig:S,entityGroupsConfig:b}))}function I(){return m.parse(_({entitiesInputs:S,entityGroupsInputs:b}))}const z=[{type:"text",label:"Text 1 Group 2",field:"text_field_1_group_2",required:!1,modifyFieldsOnValue:[{fieldValue:"[[any_other_value]]",fieldsToModify:[{fieldId:"text_field_2_group_2",disabled:!1,required:!1,help:"help after mods 2-2",label:"label after mods 2-2",markdownMessage:{text:"markdown message after mods 2-2"}},{fieldId:"text_field_2_group_1",disabled:!1,required:!0,help:"help after mods 2-1",label:"label after mods 2-1",markdownMessage:{text:"markdown message after mods 2-1"}},{fieldId:"text_field_1_group_1",disabled:!0}]}]},{type:"text",label:"Text 2 Group 2",field:"text_field_2_group_2",required:!1},{type:"text",label:"Text 1 Group 1",field:"text_field_1_group_1",required:!1},{type:"text",label:"Text 2 Group 1",field:"text_field_2_group_1",required:!1,options:{enable:!1}},{type:"text",label:"Text 1 Group 3",field:"text_field_1_group_3",required:!1,options:{enable:!1}},{type:"text",label:"Text 2 Group 3",field:"text_field_2_group_3",required:!1}];function O(){return m.parse(_({entitiesConfig:z,entityGroupsConfig:b}))}const F={pages:{configuration:{tabs:[{name:"account",table:{actions:["edit","delete","clone"],header:[{label:"Name",field:"name"}]},entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Account Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the account.",required:!0},{type:"text",label:"Example text field",field:"text_field_with_modifications",help:"Example text field with modification",required:!1,defaultValue:"default value",modifyFieldsOnValue:[{fieldValue:"default value",fieldsToModify:[{fieldId:"text_field_with_modifications",disabled:!1,required:!1,help:"default help",label:"default label",markdownMessage:{text:"default markdown message"}}]},{fieldValue:"modify itself",fieldsToModify:[{fieldId:"text_field_with_modifications",disabled:!1,required:!0,help:"help after modification",label:"label after modification",markdownMessage:{text:"markdown message after modification"}}]}]},{type:"text",label:"Example text field to be modified",field:"text_field_to_be_modified",help:"Example text field to be modified",required:!1,modifyFieldsOnValue:[{fieldValue:"[[any_other_value]]",fieldsToModify:[{fieldId:"text_field_to_be_modified",required:!0}]}]}],title:"Accounts"}],title:"Configuration",description:"Set up your add-on"},inputs:{services:[{name:"demo_input",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0,encrypted:!1}],title:"demo_input"}],title:"Inputs",description:"Manage your data inputs",table:{actions:["edit","delete","clone"],header:[{label:"Name",field:"name"}],moreInfo:[{label:"Name",field:"name"}]}}},meta:{name:"demo_addon_for_splunk",restRoot:"demo_addon_for_splunk",version:"5.31.1R85f0e18e",displayName:"Demo Add-on for Splunk",schemaVersion:"0.0.3",checkForUpdates:!1,searchViewDefault:!1}};function E(){return m.parse(F)}const tt={title:"BaseFormView",render:e=>(C(e.config),v.jsx(k,{serviceName:e.serviceName,mode:e.mode,page:e.page,stanzaName:e.stanzaName,handleFormSubmit:e.handleFormSubmit,pageContext:{platform:e.platform},customComponentContext:void 0}))},o={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:h(),platform:"enterprise"}},r={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:M()}},i={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:g}},s={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:h(),platform:"enterprise"}},l={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:h(),platform:"cloud"}},u={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:G(),platform:"cloud"}},d={args:{currentServiceState:{},serviceName:"demo_input",mode:"create",page:"inputs",stanzaName:"unknownStanza",handleFormSubmit:t(),config:I(),platform:"cloud"}},c={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:O(),platform:"cloud"}},n={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:E()}},p={args:n.args,play:async({canvasElement:e})=>{const a=N(e).getAllByRole("textbox").find(f=>f.getAttribute("value")==="default value");w(a,"modification input field should be defined"),await y.clear(a),await y.type(a,"modify itself")}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    currentServiceState: {},
    serviceName: 'account',
    mode: 'create' as Mode,
    page: 'configuration',
    stanzaName: 'unknownStanza',
    handleFormSubmit: fn(),
    config: getConfigOauthBasic() as GlobalConfig,
    platform: 'enterprise'
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    currentServiceState: {},
    serviceName: 'account',
    mode: 'create' as Mode,
    page: 'configuration',
    stanzaName: 'unknownStanza',
    handleFormSubmit: fn(),
    config: getConfigOauthOauth() as GlobalConfig
  }
}`,...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    currentServiceState: {},
    serviceName: 'account',
    mode: 'create' as Mode,
    page: 'configuration',
    stanzaName: 'unknownStanza',
    handleFormSubmit: fn(),
    config: PAGE_CONFIG_BOTH_OAUTH as GlobalConfig
  }
}`,...i.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    currentServiceState: {},
    serviceName: 'account',
    mode: 'create' as Mode,
    page: 'configuration',
    stanzaName: 'unknownStanza',
    handleFormSubmit: fn(),
    config: getConfigOauthBasic() as GlobalConfig,
    platform: 'enterprise'
  }
}`,...s.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    currentServiceState: {},
    serviceName: 'account',
    mode: 'create' as Mode,
    page: 'configuration',
    stanzaName: 'unknownStanza',
    handleFormSubmit: fn(),
    config: getConfigOauthBasic() as GlobalConfig,
    platform: 'cloud'
  }
}`,...l.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    currentServiceState: {},
    serviceName: 'account',
    mode: 'create' as Mode,
    page: 'configuration',
    stanzaName: 'unknownStanza',
    handleFormSubmit: fn(),
    config: getGlobalConfigMockGroupsForConfigPage(),
    platform: 'cloud'
  }
}`,...u.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    currentServiceState: {},
    serviceName: 'demo_input',
    mode: 'create' as Mode,
    page: 'inputs',
    stanzaName: 'unknownStanza',
    handleFormSubmit: fn(),
    config: getGlobalConfigMockGroupsForInputPage(),
    platform: 'cloud'
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    currentServiceState: {},
    serviceName: 'account',
    mode: 'create' as Mode,
    page: 'configuration',
    stanzaName: 'unknownStanza',
    handleFormSubmit: fn(),
    config: getGlobalConfigMockModificationToGroupsConfig(),
    platform: 'cloud'
  }
}`,...c.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    currentServiceState: {},
    serviceName: 'account',
    mode: 'create' as Mode,
    page: 'configuration',
    stanzaName: 'unknownStanza',
    handleFormSubmit: fn(),
    config: getGlobalConfigMockModificationToFieldItself()
  }
}`,...n.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: FieldModifyItself.args,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const modifyInputText = canvas.getAllByRole('textbox').find(el => el.getAttribute('value') === 'default value');
    invariant(modifyInputText, 'modification input field should be defined');
    await userEvent.clear(modifyInputText);
    await userEvent.type(modifyInputText, 'modify itself');
  }
}`,...p.parameters?.docs?.source}}};const at=["OuathBasic","OauthOauth","BothOauth","OuathBasicEnterprise","OuathBasicCloud","ConfigPageGroups","InputPageGroups","GroupModificationsConfig","FieldModifyItself","FieldModifyItselfAfterMods"];export{i as BothOauth,u as ConfigPageGroups,n as FieldModifyItself,p as FieldModifyItselfAfterMods,c as GroupModificationsConfig,d as InputPageGroups,r as OauthOauth,o as OuathBasic,l as OuathBasicCloud,s as OuathBasicEnterprise,at as __namedExportsOrder,tt as default};
