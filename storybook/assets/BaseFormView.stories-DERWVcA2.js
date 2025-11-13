import{j as N}from"./jsx-runtime-1FKYbnEZ.js";import{f as t,a as k,u as S}from"./index-CbXqJOWQ.js";import{B as C}from"./BaseFormView-VxTL8USs.js";import{G as f,s as w,i as M}from"./util-DDtLIPUa.js";import"./index-prPvd6Su.js";import"./_commonjsHelpers-CE1G-McA.js";import"./iframe-DjmNRUro.js";import"./index-BAMY2Nnw.js";import"./TableContext-ChDLO5uF.js";import"./index-CgKxIibQ.js";import"./Clickable-DCLrgFHL.js";import"./omit-CSe7u5nZ.js";import"./ControlWrapper-D33h4I9C.js";import"./Date-Cmj0Txw8.js";import"./_baseIteratee-ksDslDTl.js";import"./includes-BAN5eljv.js";import"./ScreenReaderContent-DTgcavZU.js";import"./ChevronLeft-Ct0yUEYy.js";import"./ChevronRight-DDG3shYt.js";import"./isEqual-BwSphrxz.js";import"./Button-B9G_4Mfe.js";import"./ButtonSimple-DKTsOMzA.js";import"./Popover-FB-oYrLK.js";import"./_arrayIncludesWith-CeAjGiZp.js";import"./Box-BIQRv08s.js";import"./index-BQPxV8oF.js";import"./AnimationToggle-C6vyuf54.js";import"./ScrollContainerContext-XRarVF06.js";import"./ExclamationTriangle-D5UvzwJa.js";import"./Tooltip-B7RmVpsU.js";import"./InformationCircle-B-Mq5DmP.js";import"./index-CMxbcET4.js";import"./MarkdownMessage-r_yijvo_.js";import"./Link-BguIxQc6.js";import"./Divider-BmXthNdG.js";import"./Button-VhSyjuIj.js";import"./CollapsiblePanel-aG-BiLiH.js";import"./variables-BwqdKhvQ.js";import"./pick-BmRvtkqO.js";import"./Menu-IFF89z9L.js";import"./Dropdown-_2BgLkF4.js";import"./textUtils-LveNtyW9.js";import"./Number-BH7oUVAk.js";import"./url-cUhQ41mg.js";import"./_baseDifference-B9g_NAZa.js";import"./WaitSpinner-D3j-Jqu7.js";import"./api-BLOSKcgX.js";import"./url-xolDOGfA.js";import"./messageUtil-CQS9-IEm.js";import"./DatePickerComponent-CboCMxQ5.js";import"./script-wa9wuYzj.js";import"./Group-VVWCvCTc.js";import"./Message-D5weHIvU.js";import"./Message-YpcZhUvQ.js";import"./pageContext-DllO6PNg.js";const g={pages:{configuration:{tabs:[{name:"account",table:{actions:["edit","delete","clone"],header:[{label:"Name",field:"name"},{label:"Auth Type",field:"auth_type"}]},entity:[{type:"text",label:"Name",validators:[{type:"string",errorMsg:"Length of ID should be between 1 and 50",minLength:1,maxLength:50},{type:"regex",errorMsg:"Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"}],field:"name",help:"Enter a unique name for this account.",required:!0},{type:"text",label:"Endpoint URL",help:"Enter the endpoint URL.",field:"endpoint",options:{display:!1,requiredWhenVisible:!0}},{type:"oauth",field:"oauth",label:"Not used",options:{auth_type:["basic","oauth"],basic:[{label:"Username",help:"Enter the username for this account.",field:"username"},{label:"Password",encrypted:!0,help:"Enter the password for this account.",field:"password"},{label:"Security Token",encrypted:!0,help:"Enter the security token.",field:"token"},{label:"Disabled on edit for oauth",help:"Enter text for field disabled on edit",field:"basic_oauth_text",required:!1,options:{disableonEdit:!0}}],oauth:[{label:"Client Id",field:"client_id",help:"Enter the Client Id for this account."},{label:"Client Secret",field:"client_secret",encrypted:!0,help:"Enter the Client Secret key for this account."},{label:"Redirect url",field:"redirect_url",help:"Copy and paste this URL into your app."},{label:"Token endpoint",field:"endpoint_token",help:"Put here endpoint used for token acqusition ie. login.salesforce.com"},{label:"Authorize endpoint",field:"endpoint_authorize",help:"Put here endpoint used for authorization ie. login.salesforce.com"},{label:"Disabled on edit for oauth",help:"Enter text for field disabled on edit",field:"oauth_oauth_text",required:!1,options:{disableonEdit:!0,enable:!1}}],auth_code_endpoint:"/services/oauth2/authorize",access_token_endpoint:"/services/oauth2/token",oauth_timeout:30,oauth_state_enabled:!1}}],title:"Account",restHandlerModule:"splunk_ta_uccexample_validate_account_rh",restHandlerClass:"CustomAccountValidator"}],title:"Configuration",description:"Set up your add-on"},inputs:{services:[{name:"example_input_one",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0},{type:"checkbox",label:"Example Checkbox",field:"input_one_checkbox",help:"This is an example checkbox for the input one entity",defaultValue:!0}],title:"Example Input One"}],title:"Inputs",description:"Manage your data inputs",subDescription:{text:`Input page - Ingesting data from to Splunk Cloud? Have you tried the new Splunk Data Manager yet?
Data Manager makes AWS data ingestion simpler, more automated and centrally managed for you, while co-existing with AWS and/or Kinesis TAs.
Read our [[blogPost]] to learn more about Data Manager and it's availability on your Splunk Cloud instance.`,links:[{slug:"blogPost",link:"https://splk.it/31oy2b2",linkText:"blog post"}]},table:{actions:["edit","delete","search","clone"],header:[{label:"Name",field:"name"}],moreInfo:[{label:"Name",field:"name"}]}}},meta:{name:"Splunk_TA_UCCExample",restRoot:"splunk_ta_uccexample",version:"5.41.0R9c5fbfe0",displayName:"Splunk UCC test Add-on",schemaVersion:"0.0.3",_uccVersion:"5.41.0"}},_=()=>{const e=JSON.parse(JSON.stringify(g));return e.pages.configuration.tabs[0].entity[2].options?.auth_type&&(e.pages.configuration.tabs[0].entity[2].options.auth_type=["basic"]),e},O=()=>{const e=JSON.parse(JSON.stringify(g));return e.pages.configuration.tabs[0].entity[2].options?.auth_type&&(e.pages.configuration.tabs[0].entity[2].options.auth_type=["oauth"]),e},G=()=>{const e=JSON.parse(JSON.stringify(g));return e.pages.configuration.tabs[0].entity[2].options?.auth_type&&(e.pages.configuration.tabs[0].entity[2].options.auth_type=["basic"],e.pages.configuration.tabs[0].entity[2].options.basic.push({label:"Additional Text Field",field:"additional_text",type:"text",help:"This is an additional text field for basic auth."},{label:"Security Token certificate",encrypted:!0,help:"Enter the security certificate token.",field:"token_cert_2"},{label:"Text Area Token",help:"Enter Text Area Token",field:"text_area_test_basic_oauth",type:"textarea",options:{rowsMin:3,rowsMax:5},required:!1},{label:"Basic Oauth select",help:"additiona oauth select",field:"select_test_basic_oauth",type:"singleSelect",options:{items:[{label:"Option 1",value:"option1"},{label:"Option 2",value:"option2"},{label:"Option 3",value:"option3"}]}},{label:"Basic Oauth radio",help:"Additiona oauth radio",field:"radio_test_basic_oauth",type:"radio",options:{items:[{label:"Left",value:"left"},{label:"Middle",value:"middle"},{label:"Right",value:"right"}]}})),e},b=({entitiesConfig:e,entityGroupsConfig:x,entitiesInputs:a,entityGroupsInputs:h})=>({pages:{configuration:{tabs:[{name:"account",table:{actions:["edit","delete","clone"],header:[{label:"Name",field:"name"}]},entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Account Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"}],field:"name",help:"A unique name for the account.",required:!0},...e||[]],groups:x,title:"Accounts"}],title:"Configuration",description:"Set up your add-on"},inputs:{services:[{name:"demo_input",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0,encrypted:!1},...a||[]],groups:h,title:"demo_input"}],title:"Inputs",description:"Manage your data inputs",table:{actions:["edit","delete","clone"],header:[{label:"Name",field:"name"}]}}},meta:{name:"demo_addon_for_splunk",restRoot:"demo_addon_for_splunk",version:"5.31.1R85f0e18e",displayName:"Demo Add-on for Splunk",schemaVersion:"0.0.3",checkForUpdates:!1,searchViewDefault:!1}}),v=[{type:"text",label:"Text 1 Group 2",field:"text_field_1_group_2",required:!1},{type:"text",label:"Text 2 Group 2",field:"text_field_2_group_2",required:!1},{type:"text",label:"Text 1 Group 1",field:"text_field_1_group_1",required:!1},{type:"text",label:"Text 2 Group 1",field:"text_field_2_group_1",required:!1},{type:"text",label:"Text 1 Group 3",field:"text_field_1_group_3",required:!1},{type:"text",label:"Text 2 Group 3",field:"text_field_2_group_3",required:!1}],y=[{label:"Group 1",fields:["text_field_1_group_1","text_field_2_group_1"]},{label:"Group 2",fields:["text_field_1_group_2","text_field_2_group_2"],options:{isExpandable:!0,expand:!0}},{label:"Group 3",fields:["text_field_1_group_3","text_field_2_group_3"],options:{isExpandable:!0,expand:!1}}];function T(){return f.parse(b({entitiesConfig:v,entityGroupsConfig:y}))}function I(){return f.parse(b({entitiesInputs:v,entityGroupsInputs:y}))}const z=[{type:"text",label:"Text 1 Group 2",field:"text_field_1_group_2",required:!1,modifyFieldsOnValue:[{fieldValue:"[[any_other_value]]",fieldsToModify:[{fieldId:"text_field_2_group_2",disabled:!1,required:!1,help:"help after mods 2-2",label:"label after mods 2-2",markdownMessage:{text:"markdown message after mods 2-2"}},{fieldId:"text_field_2_group_1",disabled:!1,required:!0,help:"help after mods 2-1",label:"label after mods 2-1",markdownMessage:{text:"markdown message after mods 2-1"}},{fieldId:"text_field_1_group_1",disabled:!0}]}]},{type:"text",label:"Text 2 Group 2",field:"text_field_2_group_2",required:!1},{type:"text",label:"Text 1 Group 1",field:"text_field_1_group_1",required:!1},{type:"text",label:"Text 2 Group 1",field:"text_field_2_group_1",required:!1,options:{enable:!1}},{type:"text",label:"Text 1 Group 3",field:"text_field_1_group_3",required:!1,options:{enable:!1}},{type:"text",label:"Text 2 Group 3",field:"text_field_2_group_3",required:!1}];function F(){return f.parse(b({entitiesConfig:z,entityGroupsConfig:y}))}const A={pages:{configuration:{tabs:[{name:"account",table:{actions:["edit","delete","clone"],header:[{label:"Name",field:"name"}]},entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Account Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the account.",required:!0},{type:"text",label:"Example text field",field:"text_field_with_modifications",help:"Example text field with modification",required:!1,defaultValue:"default value",modifyFieldsOnValue:[{fieldValue:"default value",fieldsToModify:[{fieldId:"text_field_with_modifications",disabled:!1,required:!1,help:"default help",label:"default label",markdownMessage:{text:"default markdown message"}}]},{fieldValue:"modify itself",fieldsToModify:[{fieldId:"text_field_with_modifications",disabled:!1,required:!0,help:"help after modification",label:"label after modification",markdownMessage:{text:"markdown message after modification"}}]}]},{type:"text",label:"Example text field to be modified",field:"text_field_to_be_modified",help:"Example text field to be modified",required:!1,modifyFieldsOnValue:[{fieldValue:"[[any_other_value]]",fieldsToModify:[{fieldId:"text_field_to_be_modified",required:!0}]}]}],title:"Accounts"}],title:"Configuration",description:"Set up your add-on"},inputs:{services:[{name:"demo_input",entity:[{type:"text",label:"Name",validators:[{type:"regex",errorMsg:"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",pattern:"^[a-zA-Z]\\w*$"},{type:"string",errorMsg:"Length of input name should be between 1 and 100",minLength:1,maxLength:100}],field:"name",help:"A unique name for the data input.",required:!0,encrypted:!1}],title:"demo_input"}],title:"Inputs",description:"Manage your data inputs",table:{actions:["edit","delete","clone"],header:[{label:"Name",field:"name"}],moreInfo:[{label:"Name",field:"name"}]}}},meta:{name:"demo_addon_for_splunk",restRoot:"demo_addon_for_splunk",version:"5.31.1R85f0e18e",displayName:"Demo Add-on for Splunk",schemaVersion:"0.0.3",checkForUpdates:!1,searchViewDefault:!1}};function E(){return f.parse(A)}const Be={title:"BaseFormView",render:e=>(w(e.config),N.jsx(C,{serviceName:e.serviceName,mode:e.mode,page:e.page,stanzaName:e.stanzaName,handleFormSubmit:e.handleFormSubmit,pageContext:{platform:e.platform},customComponentContext:void 0}))},o={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:_(),platform:"enterprise"}},i={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:O()}},r={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:g}},s={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:_(),platform:"enterprise"}},l={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:_(),platform:"cloud"}},u={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:G(),platform:"cloud"}},d={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:T(),platform:"cloud"}},c={args:{currentServiceState:{},serviceName:"demo_input",mode:"create",page:"inputs",stanzaName:"unknownStanza",handleFormSubmit:t(),config:I(),platform:"cloud"}},p={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:F(),platform:"cloud"}},n={args:{currentServiceState:{},serviceName:"account",mode:"create",page:"configuration",stanzaName:"unknownStanza",handleFormSubmit:t(),config:E()}},m={args:n.args,play:async({canvasElement:e})=>{const a=k(e).getAllByRole("textbox").find(h=>h.getAttribute("value")==="default value");M(a,"modification input field should be defined"),await S.clear(a),await S.type(a,"modify itself")}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    currentServiceState: {},
    serviceName: 'account',
    mode: 'create' as Mode,
    page: 'configuration',
    stanzaName: 'unknownStanza',
    handleFormSubmit: fn(),
    config: getConfigOauthOauth() as GlobalConfig
  }
}`,...i.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    currentServiceState: {},
    serviceName: 'account',
    mode: 'create' as Mode,
    page: 'configuration',
    stanzaName: 'unknownStanza',
    handleFormSubmit: fn(),
    config: PAGE_CONFIG_BOTH_OAUTH as GlobalConfig
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
    config: getConfigOauthBasicWithAdditionalFieldTypes(),
    platform: 'cloud'
  }
}`,...u.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    currentServiceState: {},
    serviceName: 'account',
    mode: 'create' as Mode,
    page: 'configuration',
    stanzaName: 'unknownStanza',
    handleFormSubmit: fn(),
    config: getGlobalConfigMockModificationToFieldItself()
  }
}`,...n.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const Le=["OuathBasic","OauthOauth","BothOauth","OuathBasicEnterprise","OuathBasicCloud","OauthBasicWithAdditionalFieldTypes","ConfigPageGroups","InputPageGroups","GroupModificationsConfig","FieldModifyItself","FieldModifyItselfAfterMods"];export{r as BothOauth,d as ConfigPageGroups,n as FieldModifyItself,m as FieldModifyItselfAfterMods,p as GroupModificationsConfig,c as InputPageGroups,u as OauthBasicWithAdditionalFieldTypes,i as OauthOauth,o as OuathBasic,l as OuathBasicCloud,s as OuathBasicEnterprise,Le as __namedExportsOrder,Be as default};
