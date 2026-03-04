import{j as x}from"./jsx-runtime-ojCMydbh.js";import{h as l,H as r}from"./index-kle9pbY7.js";import{a as c,u as n,e as _}from"./index-DpwipV_e.js";import{s as w}from"./util-CGkFfNTa.js";import{C as f}from"./ConfigurationPage-DBSZAYb3.js";import{m as h,a as b}from"./server-response-Cmhjwb6A.js";import"./index-DI6txC9U.js";import"./_commonjsHelpers-CE1G-McA.js";import"./index-BAMY2Nnw.js";import"./iframe-BVJboWvC.js";import"./_baseIteratee-BgljbWfr.js";import"./omit-ztEEjYnI.js";import"./messageUtil-8kA0E4H4.js";import"./usePlatform-C3ZHxJkM.js";import"./ControlWrapper-Ci-zlHqj.js";import"./Text-BOUR33a1.js";import"./times-DEtgg_I4.js";import"./includes-Clo6__ke.js";import"./Clickable-m7b-p22w.js";import"./ExclamationTriangle-DaHVRaQA.js";import"./Button-BVwbUX9I.js";import"./ScreenReaderContent-DYUfzbCm.js";import"./ButtonSimple-Bnkbn06o.js";import"./Box-dCuMX_uk.js";import"./index-CujC5SV_.js";import"./AnimationToggle-Dgpdi4Ip.js";import"./Tooltip-DNvjBS2i.js";import"./Popover-CmySphiq.js";import"./_arrayIncludesWith-D7mRho23.js";import"./ScrollContainerContext-Cdp9tX0F.js";import"./InformationCircle-gwQHWa7p.js";import"./ChevronRight-B2uYXglV.js";import"./isEqual-Q2uatnfO.js";import"./index-s8iMx1jP.js";import"./MarkdownMessage-vKaL8cy0.js";import"./Link-BMz1NHYV.js";import"./Divider-wHm8s2UO.js";import"./Button-zWON0gNY.js";import"./CollapsiblePanel-CBq0y_BG.js";import"./variables-BfrwVMxe.js";import"./pick-B2D4nEtf.js";import"./Menu-DJUgZFWQ.js";import"./Dropdown-ChHUzFro.js";import"./textUtils-BIiSxj3a.js";import"./toUpper-DNM9XKBs.js";import"./_baseDifference-BucyWK35.js";import"./url-Dlk_22OB.js";import"./scroll-D_om4I15.js";import"./WaitSpinner-BSmPTg-B.js";import"./api-D_ndwf0a.js";import"./url-1MEF4Ke-.js";import"./DatePickerComponent-Bm9AYacc.js";import"./ChevronLeft-CjhuJSXo.js";import"./script-BkARDwkC.js";import"./Group-RnZmXvj5.js";import"./ErrorBoundary-D3MpB3IP.js";import"./DotsThreeVertical-CiIS6iBf.js";import"./searchUtil-NABkgmcP.js";import"./Heading-CQbFkV0J.js";import"./index-CTHfhRPv.js";import"./TabBar--MTsurMI.js";import"./index-PKf9zeTC.js";import"./EntityPage-CJIOfApT.js";import"./BaseFormView-CgtB-qxT.js";import"./TableContext-DvDGRd0l.js";import"./index-DBQfC_yZ.js";import"./Message-Cv3I_ntp.js";import"./pageContext-DllO6PNg.js";import"./PageContext-BspKImV7.js";import"./UCCButton-C-pV6XSt.js";import"./CustomTableStyle-p7X-pblC.js";import"./TableWrapper-em9ZDpLq.js";import"./utilities.esm-CpsBEvtb.js";import"./AcceptModal-B0mIPAx-.js";import"./Modal-DCdZgbXq.js";import"./EntityModal-B4vcWqfM.js";import"./DeleteModal-CZROTYQp.js";import"./Search-B0muHIml.js";import"./DownloadButton-BRIZTFPV.js";import"./SubDescription-BAJnO2mb.js";const k=JSON.parse(`{"configuration":{"tabs":[{"name":"account","warning":{"create":{"message":"Some warning for account text create"},"edit":{"message":"Some warning for account text edit","alwaysDisplay":true},"clone":{"message":"Some warning for account text clone"}},"table":{"actions":["edit","delete","clone"],"header":[{"label":"Name","field":"name"},{"label":"Auth Type","field":"auth_type"}]},"entity":[{"type":"text","label":"Name","validators":[{"type":"string","errorMsg":"Length of ID should be between 1 and 50","minLength":1,"maxLength":50},{"type":"regex","errorMsg":"Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.","pattern":"^[a-zA-Z]\\\\w*$"}],"field":"name","help":"Enter a unique name for this account.","required":true},{"type":"singleSelect","label":"Example Environment","options":{"disableSearch":true,"autoCompleteFields":[{"value":1,"label":"Value1"},{"value":"test.example.com","label":"Value2"},{"value":"other","label":"Other"}],"display":true},"help":"","field":"custom_endpoint","defaultValue":1,"required":true},{"type":"text","label":"Endpoint URL","help":"Enter the endpoint URL.","field":"endpoint","options":{"display":false,"requiredWhenVisible":true}},{"field":"url","label":"URL","type":"text","help":"Enter the URL, for example","required":false,"validators":[{"errorMsg":"Invalid URL provided. URL should start with 'https' as only secure URLs are supported. Provide URL in this format","type":"regex","pattern":"^(https://)[^/]+/?$"}]},{"type":"checkbox","label":"Example Checkbox","field":"account_checkbox","help":"This is an example checkbox for the account entity","modifyFieldsOnValue":[{"fieldValue":1,"fieldsToModify":[{"fieldId":"account_radio","disabled":false},{"fieldId":"endpoint","display":true}]},{"fieldValue":0,"mode":"edit","fieldsToModify":[{"fieldId":"account_radio","disabled":true},{"fieldId":"endpoint","display":false}]}]},{"type":"radio","label":"Example Radio","field":"account_radio","defaultValue":"yes","help":"This is an example radio button for the account entity","required":true,"options":{"items":[{"value":"yes","label":"Yes"},{"value":"no","label":"No"}],"display":true}},{"type":"multipleSelect","label":"Example Multiple Select","field":"account_multiple_select","help":"default value is Numeric Two","required":true,"defaultValue":"2","options":{"items":[{"value":1,"label":"Option One"},{"value":2,"label":"Option Two"}]}},{"type":"oauth","field":"oauth","label":"Not used","options":{"auth_type":["basic","oauth"],"basic":[{"label":"Username","help":"Enter the username for this account.","field":"username","modifyFieldsOnValue":[{"fieldValue":"[[any_other_value]]","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":false,"display":true,"label":"Disabled on edit for oauth 1111","value":"test","help":"Disabled on edit for test 1","markdownMessage":{"markdownType":"text","text":"markdown message test","color":"red"}}]},{"fieldValue":"a","fieldsToModify":[{"fieldId":"oauth_oauth_text","display":true,"disabled":true,"label":"Disabled on edit for oauth 2222","value":"test 2","help":"Disabled on edit for test 2","markdownMessage":{"markdownType":"link","text":"markdown message test conf page","link":"http://localhost:8000/en-GB/app/Splunk_TA_UCCExample/configuration"}}]},{"fieldValue":"aa","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":false,"display":false,"label":"Disabled on edit for oauth 3333","value":"test 3","help":"Disabled on edit for test 3"}]},{"fieldValue":"aaa","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":true,"display":true,"label":"Disabled on edit for oauth 4444","value":"test 4","help":"Disabled on edit for test 4","markdownMessage":{"markdownType":"hybrid","text":"markdown message to open token and explain sth","link":"http://localhost:8000/en-GB/app/Splunk_TA_UCCExample/configuration","token":"token","linkText":"conf page"}}]},{"fieldValue":"aaaa","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":false,"display":false,"label":"Disabled on edit for oauth 44444","value":"test 5","help":"Disabled on edit for test 5","markdownMessage":{"text":"markdown message plain text"}}]}]},{"label":"Password","encrypted":true,"help":"Enter the password for this account.","field":"password"},{"label":"Security Token","encrypted":true,"help":"Enter the security token.","field":"token"},{"label":"Disabled on edit for oauth","help":"Enter text for field disabled on edit","field":"basic_oauth_text","required":false,"options":{"disableonEdit":true}}],"oauth":[{"label":"Client Id","field":"client_id","help":"Enter the Client Id for this account."},{"label":"Client Secret","field":"client_secret","encrypted":true,"help":"Enter the Client Secret key for this account."},{"label":"Redirect url","field":"redirect_url","help":"Copy and paste this URL into your app."},{"label":"Token endpoint","field":"endpoint_token","help":"Put here endpoint used for token acqusition ie. login.salesforce.com","modifyFieldsOnValue":[{"fieldValue":"[[any_other_value]]","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":false,"label":"Disabled on edit for oauth 55555"},{"fieldId":"endpoint_authorize","display":true}]},{"fieldValue":"aaaaaa","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":false,"label":"Disabled on edit for oauth 1111"},{"fieldId":"endpoint_authorize","display":true}]},{"fieldValue":"bbbbb","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":true,"label":"Disabled on edit for oauth 2222"},{"fieldId":"endpoint_authorize","display":false}]},{"fieldValue":"ccccc","mode":"edit","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":false,"label":"Disabled on edit for oauth 3333"},{"fieldId":"endpoint_authorize","display":false}]},{"fieldValue":"dddddd","mode":"create","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":true,"label":"Disabled on edit for oauth 44444"},{"fieldId":"endpoint_authorize","display":false}]}]},{"label":"Authorize endpoint","field":"endpoint_authorize","help":"Put here endpoint used for authorization ie. login.salesforce.com"},{"label":"Disabled on edit for oauth","help":"Enter text for field disabled on edit","field":"oauth_oauth_text","required":false,"options":{"disableonEdit":true,"enable":false}}],"auth_code_endpoint":"/services/oauth2/authorize","access_token_endpoint":"/services/oauth2/token","oauth_timeout":30,"oauth_state_enabled":false}},{"field":"example_help_link","label":"","type":"helpLink","options":{"text":"Help Link","link":"https://docs.splunk.com/Documentation"}},{"field":"config1_help_link","type":"helpLink","options":{"text":"Add-on configuration documentation","link":"https://docs.splunk.com/Documentation"}},{"field":"config2_help_link","type":"helpLink","options":{"text":"SSL configuration documentation","link":"https://docs.splunk.com/Documentation"}}],"title":"Account","restHandlerModule":"splunk_ta_uccexample_validate_account_rh","restHandlerClass":"CustomAccountValidator"},{"name":"proxy","warning":{"config":{"message":"Some warning for account text config"}},"entity":[{"type":"checkbox","label":"Enable","field":"proxy_enabled"},{"type":"singleSelect","label":"Proxy Type","options":{"disableSearch":true,"autoCompleteFields":[{"value":"http","label":"http"},{"value":"socks4","label":"socks4"},{"value":"socks5","label":"socks5"}]},"defaultValue":"http","field":"proxy_type"},{"type":"text","label":"Host","validators":[{"type":"string","errorMsg":"Max host length is 4096","minLength":0,"maxLength":4096},{"type":"regex","errorMsg":"Proxy Host should not have special characters","pattern":"^[a-zA-Z]\\\\w*$"}],"field":"proxy_url"},{"type":"text","label":"Port","validators":[{"type":"number","range":[1,65535],"isInteger":true}],"field":"proxy_port"},{"type":"text","label":"Username","validators":[{"type":"string","errorMsg":"Max length of username is 50","minLength":0,"maxLength":50}],"field":"proxy_username"},{"type":"text","label":"Password","validators":[{"type":"string","errorMsg":"Max length of password is 8192","minLength":0,"maxLength":8192}],"encrypted":true,"field":"proxy_password"},{"type":"checkbox","label":"DNS resolution","field":"proxy_rdns"}],"options":{"saveValidator":"function(formData) { if(!formData.proxy_enabled || formData.proxy_enabled === '0') {return true; } if(!formData.proxy_url) { return 'Proxy Host can not be empty'; } if(!formData.proxy_port) { return 'Proxy Port can not be empty'; } return true; }"},"title":"Proxy"},{"name":"custom_abc","title":"Customized tab","entity":[{"field":"testString","label":"Test String","type":"text","validators":[{"type":"string","maxLength":10,"minLength":5}]},{"field":"testNumber","label":"Test Number","type":"text","validators":[{"type":"number","range":[1,10]}]},{"field":"testRegex","label":"Test Regex","type":"text","validators":[{"type":"regex","pattern":"^\\\\w+$","errorMsg":"Characters of Name should match regex ^\\\\w+$ ."}]},{"field":"testEmail","label":"Test Email","type":"text","validators":[{"type":"email"}]},{"field":"testIpv4","label":"Test Ipv4","type":"text","validators":[{"type":"ipv4"}]},{"field":"testDate","label":"Test Date","type":"text","validators":[{"type":"date"}]},{"field":"testUrl","label":"Test Url","type":"text","validators":[{"type":"url"}]}]},{"name":"custom_header","title":"Custom header tab","warning":{"create":{"message":"Some warning for account text create"},"edit":{"message":"Some warning for account text edit","alwaysDisplay":true},"clone":{"message":"Some warning for account text clone"}},"table":{"actions":["edit","delete","clone"],"header":[{"label":"Name","field":"name"},{"label":"Auth Type","field":"auth_type"}]},"entity":[{"type":"text","label":"Name","validators":[{"type":"string","errorMsg":"Length of ID should be between 1 and 50","minLength":1,"maxLength":50},{"type":"regex","errorMsg":"Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.","pattern":"^[a-zA-Z]\\\\w*$"}],"field":"name","help":"Enter a unique name for this account.","required":true},{"type":"singleSelect","label":"Example Environment","options":{"disableSearch":true,"autoCompleteFields":[{"value":1,"label":"Value1"},{"value":"test.example.com","label":"Value2"},{"value":"other","label":"Other"}],"display":true},"help":"","field":"custom_endpoint","defaultValue":1,"required":true}],"formTitle":"custom header"}],"title":"Configuration","description":"Set up your add-on","subDescription":{"text":"Configuration page - Ingesting data from to Splunk Cloud? Have you tried the new Splunk Data Manager yet?\\nData Manager makes AWS data ingestion simpler, more automated and centrally managed for you, while co-existing with AWS and/or Kinesis TAs.\\nRead our [[blogPost]] to learn more about Data Manager and it's availability on your Splunk Cloud instance.","links":[{"slug":"blogPost","link":"https://splk.it/31oy2b2","linkText":"blog post"}]}},"inputs":{"services":[{"name":"example_input_one","entity":[{"type":"text","label":"Name","validators":[{"type":"regex","errorMsg":"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.","pattern":"^[a-zA-Z]\\\\w*$"},{"type":"string","errorMsg":"Length of input name should be between 1 and 100","minLength":1,"maxLength":100}],"field":"name","help":"A unique name for the data input.","required":true}],"title":"Example Input One"}],"title":"Inputs","description":"Manage your data inputs","table":{"actions":["edit","delete","search","clone"],"header":[{"label":"Name","field":"name"}],"moreInfo":[{"label":"Name","field":"name"}]}}}`),v={name:"Splunk_TA_UCCExample",restRoot:"splunk_ta_uccexample",version:"5.41.0R9c5fbfe0",displayName:"Splunk UCC test Add-on",schemaVersion:"0.0.3",_uccVersion:"5.41.0"},o={pages:k,meta:v},Ke={component:f,title:"ConfigurationPage",render:t=>(w(JSON.parse(JSON.stringify(t.globalConfig))),x.jsx(f,{})),args:{globalConfig:o},parameters:{msw:{handlers:[l.get("/servicesNS/nobody/-/:name",()=>r.json(h)),l.get("/servicesNS/nobody/-/:name/:tabName",()=>r.json(b)),l.post("/servicesNS/nobody/-/:name",()=>r.json(h)),l.post("/servicesNS/nobody/-/:name/:tabName",()=>r.json(b))]},snapshots:{width:1200,height:1200}}},s={},d={play:async({canvasElement:t})=>{const e=c(t),a=e.queryByRole("button",{name:/(Close)|(Cancel)/});a&&await n.click(a);const i=await e.findByRole("button",{name:"Add"});await n.click(i)}},p={play:async({canvasElement:t})=>{const e=c(t.ownerDocument.body),a=c(t),i=a.queryByRole("button",{name:/(Close)|(Cancel)/});i&&await n.click(i);const y=await a.findByRole("tab",{name:"Custom header tab"});await n.click(y);const g=await a.findByRole("button",{name:"Add"});await n.click(g),await _(await e.findByRole("dialog",{name:"Add custom header"})).toBeInTheDocument()}},u={args:{globalConfig:{...o,pages:{configuration:{...o.pages.configuration,tabs:Array.from({length:12},(t,e)=>({name:`tab${e+1}`,title:`this is tab ${e+1}`,entity:[{type:"text",label:`Name ${e+1}`,field:"name",help:"Enter a unique name for this account.",required:!0}]}))}}}},parameters:{snapshots:{width:1e3,height:600}}},m={args:{globalConfig:{...o,pages:{configuration:{...o.pages.configuration,tabs:[{name:"tab1",title:"This is tab with long name",entity:[{type:"text",label:"Name 1",field:"name",help:"Enter a unique name for this account.",required:!0}]},{name:"tab2",title:"Lorem Ipsum is simply dummy text of the printing and type setting industry",entity:[{type:"text",label:"Name 2",field:"name",help:"Enter a unique name for this account.",required:!0}]},{name:"tab3",title:"Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book",entity:[{type:"text",label:"Name 3",field:"name",help:"Enter a unique name for this account.",required:!0}]}]}}}},parameters:{snapshots:{width:1e3,height:600}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const closeBtn = canvas.queryByRole('button', {
      name: /(Close)|(Cancel)/
    });
    if (closeBtn) {
      await userEvent.click(closeBtn);
    }
    const addButton = await canvas.findByRole('button', {
      name: 'Add'
    });
    await userEvent.click(addButton);
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const body = within(canvasElement.ownerDocument.body);
    const canvas = within(canvasElement);
    const closeBtn = canvas.queryByRole('button', {
      name: /(Close)|(Cancel)/
    });
    if (closeBtn) {
      await userEvent.click(closeBtn);
    }
    const findTab = await canvas.findByRole('tab', {
      name: 'Custom header tab'
    });
    await userEvent.click(findTab);
    const addButton = await canvas.findByRole('button', {
      name: 'Add'
    });
    await userEvent.click(addButton);
    await expect(await body.findByRole('dialog', {
      name: 'Add custom header'
    })).toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    globalConfig: {
      ...globalConfig,
      pages: {
        configuration: {
          ...globalConfig.pages.configuration,
          tabs: Array.from({
            length: 12
          }, (_, i) => ({
            name: \`tab\${i + 1}\`,
            title: \`this is tab \${i + 1}\`,
            entity: [{
              type: 'text',
              label: \`Name \${i + 1}\`,
              field: 'name',
              help: 'Enter a unique name for this account.',
              required: true
            }]
          }))
        }
      }
    }
  },
  parameters: {
    snapshots: {
      width: 1000,
      height: 600
    }
  }
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    globalConfig: {
      ...globalConfig,
      pages: {
        configuration: {
          ...globalConfig.pages.configuration,
          tabs: [{
            name: \`tab1\`,
            title: \`This is tab with long name\`,
            entity: [{
              type: 'text',
              label: \`Name 1\`,
              field: 'name',
              help: 'Enter a unique name for this account.',
              required: true
            }]
          }, {
            name: \`tab2\`,
            title: \`Lorem Ipsum is simply dummy text of the printing and type setting industry\`,
            entity: [{
              type: 'text',
              label: \`Name 2\`,
              field: 'name',
              help: 'Enter a unique name for this account.',
              required: true
            }]
          }, {
            name: \`tab3\`,
            title: \`Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book\`,
            entity: [{
              type: 'text',
              label: \`Name 3\`,
              field: 'name',
              help: 'Enter a unique name for this account.',
              required: true
            }]
          }]
        }
      }
    }
  },
  parameters: {
    snapshots: {
      width: 1000,
      height: 600
    }
  }
}`,...m.parameters?.docs?.source}}};const Ye=["ConfigurationPageView","ConfigurationViewAdd","ConfigurationCustomHeader","MultiTabsStory","LongTabNameStory"];export{p as ConfigurationCustomHeader,s as ConfigurationPageView,d as ConfigurationViewAdd,m as LongTabNameStory,u as MultiTabsStory,Ye as __namedExportsOrder,Ke as default};
