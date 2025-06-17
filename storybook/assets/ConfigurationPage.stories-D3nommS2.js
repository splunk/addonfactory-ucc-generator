import{j as x}from"./jsx-runtime-ClejQJRV.js";import{h as l,H as r}from"./index-DgRvTSw_.js";import{a as c,u as o,e as _}from"./index-y4Yn5WZ1.js";import{s as w}from"./util-DfUvgPwM.js";import{C as f}from"./ConfigurationPage-BEsyy1LH.js";import{m as h,a as b}from"./server-response-Cmhjwb6A.js";import"./index-BnZYiL63.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./iframe-B0-yMJSF.js";import"./index-BAMY2Nnw.js";import"./Clickable-wzamu0qE.js";import"./index-C6Xwkj2v.js";import"./index-BeaWwRds.js";import"./invariant-Cbo0Fu-i.js";import"./messageUtil-CXCS-b_z.js";import"./usePlatform-Cun2Z0Y_.js";import"./SearchJob-C6bkeSKm.js";import"./DotsThreeVertical-B8vz7m0Y.js";import"./IconProvider-D1bqsLqQ.js";import"./ErrorBoundary-DmKTu_kt.js";import"./Search-DJ2srasI.js";import"./Heading-CGvLoTK9.js";import"./Heading-2h2rzLUR.js";import"./Box-9y-3oeI2.js";import"./Tooltip-s2-C62Iv.js";import"./ScreenReaderContent-DTnCP1nJ.js";import"./Button-JhicfZMm.js";import"./style-gy5-imeJ.js";import"./External-CaozYYRu.js";import"./Warning-CEMYJjjT.js";import"./Link-COq5B319.js";import"./Link-B3IMA5iK.js";import"./ArrowSquareTopRight-cE1IFp2S.js";import"./variables-BlEdyhR1.js";import"./pick-BPsdbB5n.js";import"./CollapsiblePanel-BPnrRfFA.js";import"./usePrevious-T3tkdeEg.js";import"./ChevronRight-BZ9dd8ev.js";import"./Search-ICZjcVxg.js";import"./extend-BCHzQ2P0.js";import"./TextArea-WoYN_p44.js";import"./ControlGroup-D1l7iBTi.js";import"./find-D36SYLnv.js";import"./Close-CPSltoSy.js";import"./Menu-CO_c8kuU.js";import"./Divider-BxwkhgHI.js";import"./Switch-DAz2gr6S.js";import"./WaitSpinner-pc6awGU8.js";import"./format-pOB4dcXd.js";import"./index-k--C9drU.js";import"./Message-BhItrygt.js";import"./ChevronLeft-CJRd2xhe.js";import"./ComboBox-CmYP-_Jn.js";import"./Text-CXLzpk1L.js";import"./url-CzOjCGiC.js";import"./CustomTableStyle-CEvuKrAz.js";import"./Button-BHr02HYf.js";import"./modes-torNl340.js";import"./EntityPage-CMgabuDT.js";import"./BaseFormView-DA41Yo12.js";import"./TableContext-BmRe0wAG.js";import"./ControlWrapper-CVzGeWh8.js";import"./ControlGroup-a8oyWZe3.js";import"./MarkdownMessage-KWXjiEhM.js";import"./CheckboxTree-CsvFXcxD.js";import"./Switch-CnzSxpRR.js";import"./HelpLinkComponent-dsK2_iXH.js";import"./textUtils-DUUDexJ9.js";import"./TextComponent-BxD6sPuy.js";import"./utils-CEqOZghX.js";import"./TextAreaComponent-D398mJR1.js";import"./SingleInputComponent-B52slQX9.js";import"./api-D6WilaDV.js";import"./considerFalseAndTruthy-D4Pwj1gQ.js";import"./MultiInputComponent-T90e_uJj.js";import"./Multiselect-DzTVP2xI.js";import"./CheckBoxComponent-Y9tZdK2B.js";import"./RadioComponent-BlPsbW1_.js";import"./RadioBar-C-BIDM59.js";import"./script-Dpip0sFJ.js";import"./CustomComponentContext-DUBuY9CR.js";import"./FileInputComponent-CoOmUzrQ.js";import"./File-B2KlQZ1a.js";import"./CheckboxGroup-DBkKfCe4.js";import"./Group-B0Pjm6PE.js";import"./Number-CBlFIa2o.js";import"./pageContext-DllO6PNg.js";import"./PageContext-BOYMoToK.js";import"./UCCButton-ETWJiCtC.js";import"./TableWrapper-sZHQWMyc.js";import"./AcceptModal-DNDhPNuz.js";import"./Modal-CKUr12g2.js";import"./EntityModal-z45CIM9M.js";import"./DeleteModal-DXM0EsBy.js";import"./DownloadButton-BOgMfJCT.js";import"./ArrowBroadUnderbarDown-Bj9Ax1Hn.js";import"./SubDescription-kOyetVWb.js";const k=JSON.parse(`{"configuration":{"tabs":[{"name":"account","warning":{"create":{"message":"Some warning for account text create"},"edit":{"message":"Some warning for account text edit","alwaysDisplay":true},"clone":{"message":"Some warning for account text clone"}},"table":{"actions":["edit","delete","clone"],"header":[{"label":"Name","field":"name"},{"label":"Auth Type","field":"auth_type"}]},"entity":[{"type":"text","label":"Name","validators":[{"type":"string","errorMsg":"Length of ID should be between 1 and 50","minLength":1,"maxLength":50},{"type":"regex","errorMsg":"Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.","pattern":"^[a-zA-Z]\\\\w*$"}],"field":"name","help":"Enter a unique name for this account.","required":true},{"type":"singleSelect","label":"Example Environment","options":{"disableSearch":true,"autoCompleteFields":[{"value":1,"label":"Value1"},{"value":"test.example.com","label":"Value2"},{"value":"other","label":"Other"}],"display":true},"help":"","field":"custom_endpoint","defaultValue":1,"required":true},{"type":"text","label":"Endpoint URL","help":"Enter the endpoint URL.","field":"endpoint","options":{"display":false,"requiredWhenVisible":true}},{"field":"url","label":"URL","type":"text","help":"Enter the URL, for example","required":false,"validators":[{"errorMsg":"Invalid URL provided. URL should start with 'https' as only secure URLs are supported. Provide URL in this format","type":"regex","pattern":"^(https://)[^/]+/?$"}]},{"type":"checkbox","label":"Example Checkbox","field":"account_checkbox","help":"This is an example checkbox for the account entity","modifyFieldsOnValue":[{"fieldValue":1,"fieldsToModify":[{"fieldId":"account_radio","disabled":false},{"fieldId":"endpoint","display":true}]},{"fieldValue":0,"mode":"edit","fieldsToModify":[{"fieldId":"account_radio","disabled":true},{"fieldId":"endpoint","display":false}]}]},{"type":"radio","label":"Example Radio","field":"account_radio","defaultValue":"yes","help":"This is an example radio button for the account entity","required":true,"options":{"items":[{"value":"yes","label":"Yes"},{"value":"no","label":"No"}],"display":true}},{"type":"multipleSelect","label":"Example Multiple Select","field":"account_multiple_select","help":"default value is Numeric Two","required":true,"defaultValue":"2","options":{"items":[{"value":1,"label":"Option One"},{"value":2,"label":"Option Two"}]}},{"type":"oauth","field":"oauth","label":"Not used","options":{"auth_type":["basic","oauth"],"basic":[{"oauth_field":"username","label":"Username","help":"Enter the username for this account.","field":"username","modifyFieldsOnValue":[{"fieldValue":"[[any_other_value]]","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":false,"display":true,"label":"Disabled on edit for oauth 1111","value":"test","help":"Disabled on edit for test 1","markdownMessage":{"markdownType":"text","text":"markdown message test","color":"red"}}]},{"fieldValue":"a","fieldsToModify":[{"fieldId":"oauth_oauth_text","display":true,"disabled":true,"label":"Disabled on edit for oauth 2222","value":"test 2","help":"Disabled on edit for test 2","markdownMessage":{"markdownType":"link","text":"markdown message test conf page","link":"http://localhost:8000/en-GB/app/Splunk_TA_UCCExample/configuration"}}]},{"fieldValue":"aa","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":false,"display":false,"label":"Disabled on edit for oauth 3333","value":"test 3","help":"Disabled on edit for test 3"}]},{"fieldValue":"aaa","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":true,"display":true,"label":"Disabled on edit for oauth 4444","value":"test 4","help":"Disabled on edit for test 4","markdownMessage":{"markdownType":"hybrid","text":"markdown message to open token and explain sth","link":"http://localhost:8000/en-GB/app/Splunk_TA_UCCExample/configuration","token":"token","linkText":"conf page"}}]},{"fieldValue":"aaaa","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":false,"display":false,"label":"Disabled on edit for oauth 44444","value":"test 5","help":"Disabled on edit for test 5","markdownMessage":{"text":"markdown message plain text"}}]}]},{"oauth_field":"password","label":"Password","encrypted":true,"help":"Enter the password for this account.","field":"password"},{"oauth_field":"security_token","label":"Security Token","encrypted":true,"help":"Enter the security token.","field":"token"},{"oauth_field":"some_text","label":"Disabled on edit for oauth","help":"Enter text for field disabled on edit","field":"basic_oauth_text","required":false,"options":{"disableonEdit":true}}],"oauth":[{"oauth_field":"client_id","label":"Client Id","field":"client_id","help":"Enter the Client Id for this account."},{"oauth_field":"client_secret","label":"Client Secret","field":"client_secret","encrypted":true,"help":"Enter the Client Secret key for this account."},{"oauth_field":"redirect_url","label":"Redirect url","field":"redirect_url","help":"Copy and paste this URL into your app."},{"oauth_field":"endpoint_token","label":"Token endpoint","field":"endpoint_token","help":"Put here endpoint used for token acqusition ie. login.salesforce.com","modifyFieldsOnValue":[{"fieldValue":"[[any_other_value]]","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":false,"label":"Disabled on edit for oauth 55555"},{"fieldId":"endpoint_authorize","display":true}]},{"fieldValue":"aaaaaa","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":false,"label":"Disabled on edit for oauth 1111"},{"fieldId":"endpoint_authorize","display":true}]},{"fieldValue":"bbbbb","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":true,"label":"Disabled on edit for oauth 2222"},{"fieldId":"endpoint_authorize","display":false}]},{"fieldValue":"ccccc","mode":"edit","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":false,"label":"Disabled on edit for oauth 3333"},{"fieldId":"endpoint_authorize","display":false}]},{"fieldValue":"dddddd","mode":"create","fieldsToModify":[{"fieldId":"oauth_oauth_text","disabled":true,"label":"Disabled on edit for oauth 44444"},{"fieldId":"endpoint_authorize","display":false}]}]},{"oauth_field":"endpoint_authorize","label":"Authorize endpoint","field":"endpoint_authorize","help":"Put here endpoint used for authorization ie. login.salesforce.com"},{"oauth_field":"oauth_some_text","label":"Disabled on edit for oauth","help":"Enter text for field disabled on edit","field":"oauth_oauth_text","required":false,"options":{"disableonEdit":true,"enable":false}}],"auth_code_endpoint":"/services/oauth2/authorize","access_token_endpoint":"/services/oauth2/token","oauth_timeout":30,"oauth_state_enabled":false}},{"field":"example_help_link","label":"","type":"helpLink","options":{"text":"Help Link","link":"https://docs.splunk.com/Documentation"}},{"field":"config1_help_link","type":"helpLink","options":{"text":"Add-on configuration documentation","link":"https://docs.splunk.com/Documentation"}},{"field":"config2_help_link","type":"helpLink","options":{"text":"SSL configuration documentation","link":"https://docs.splunk.com/Documentation"}}],"title":"Account","restHandlerModule":"splunk_ta_uccexample_validate_account_rh","restHandlerClass":"CustomAccountValidator"},{"name":"proxy","warning":{"config":{"message":"Some warning for account text config"}},"entity":[{"type":"checkbox","label":"Enable","field":"proxy_enabled"},{"type":"singleSelect","label":"Proxy Type","options":{"disableSearch":true,"autoCompleteFields":[{"value":"http","label":"http"},{"value":"socks4","label":"socks4"},{"value":"socks5","label":"socks5"}]},"defaultValue":"http","field":"proxy_type"},{"type":"text","label":"Host","validators":[{"type":"string","errorMsg":"Max host length is 4096","minLength":0,"maxLength":4096},{"type":"regex","errorMsg":"Proxy Host should not have special characters","pattern":"^[a-zA-Z]\\\\w*$"}],"field":"proxy_url"},{"type":"text","label":"Port","validators":[{"type":"number","range":[1,65535],"isInteger":true}],"field":"proxy_port"},{"type":"text","label":"Username","validators":[{"type":"string","errorMsg":"Max length of username is 50","minLength":0,"maxLength":50}],"field":"proxy_username"},{"type":"text","label":"Password","validators":[{"type":"string","errorMsg":"Max length of password is 8192","minLength":0,"maxLength":8192}],"encrypted":true,"field":"proxy_password"},{"type":"checkbox","label":"DNS resolution","field":"proxy_rdns"}],"options":{"saveValidator":"function(formData) { if(!formData.proxy_enabled || formData.proxy_enabled === '0') {return true; } if(!formData.proxy_url) { return 'Proxy Host can not be empty'; } if(!formData.proxy_port) { return 'Proxy Port can not be empty'; } return true; }"},"title":"Proxy"},{"name":"custom_abc","title":"Customized tab","entity":[{"field":"testString","label":"Test String","type":"text","validators":[{"type":"string","maxLength":10,"minLength":5}]},{"field":"testNumber","label":"Test Number","type":"text","validators":[{"type":"number","range":[1,10]}]},{"field":"testRegex","label":"Test Regex","type":"text","validators":[{"type":"regex","pattern":"^\\\\w+$","errorMsg":"Characters of Name should match regex ^\\\\w+$ ."}]},{"field":"testEmail","label":"Test Email","type":"text","validators":[{"type":"email"}]},{"field":"testIpv4","label":"Test Ipv4","type":"text","validators":[{"type":"ipv4"}]},{"field":"testDate","label":"Test Date","type":"text","validators":[{"type":"date"}]},{"field":"testUrl","label":"Test Url","type":"text","validators":[{"type":"url"}]}]},{"name":"custom_header","title":"Custom header tab","warning":{"create":{"message":"Some warning for account text create"},"edit":{"message":"Some warning for account text edit","alwaysDisplay":true},"clone":{"message":"Some warning for account text clone"}},"table":{"actions":["edit","delete","clone"],"header":[{"label":"Name","field":"name"},{"label":"Auth Type","field":"auth_type"}]},"entity":[{"type":"text","label":"Name","validators":[{"type":"string","errorMsg":"Length of ID should be between 1 and 50","minLength":1,"maxLength":50},{"type":"regex","errorMsg":"Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.","pattern":"^[a-zA-Z]\\\\w*$"}],"field":"name","help":"Enter a unique name for this account.","required":true},{"type":"singleSelect","label":"Example Environment","options":{"disableSearch":true,"autoCompleteFields":[{"value":1,"label":"Value1"},{"value":"test.example.com","label":"Value2"},{"value":"other","label":"Other"}],"display":true},"help":"","field":"custom_endpoint","defaultValue":1,"required":true}],"formTitle":"custom header"}],"title":"Configuration","description":"Set up your add-on","subDescription":{"text":"Configuration page - Ingesting data from to Splunk Cloud? Have you tried the new Splunk Data Manager yet?\\nData Manager makes AWS data ingestion simpler, more automated and centrally managed for you, while co-existing with AWS and/or Kinesis TAs.\\nRead our [[blogPost]] to learn more about Data Manager and it's availability on your Splunk Cloud instance.","links":[{"slug":"blogPost","link":"https://splk.it/31oy2b2","linkText":"blog post"}]}},"inputs":{"services":[{"name":"example_input_one","entity":[{"type":"text","label":"Name","validators":[{"type":"regex","errorMsg":"Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.","pattern":"^[a-zA-Z]\\\\w*$"},{"type":"string","errorMsg":"Length of input name should be between 1 and 100","minLength":1,"maxLength":100}],"field":"name","help":"A unique name for the data input.","required":true}],"title":"Example Input One"}],"title":"Inputs","description":"Manage your data inputs","table":{"actions":["edit","delete","search","clone"],"header":[{"label":"Name","field":"name"}],"moreInfo":[{"label":"Name","field":"name"}]}}}`),v={name:"Splunk_TA_UCCExample",restRoot:"splunk_ta_uccexample",version:"5.41.0R9c5fbfe0",displayName:"Splunk UCC test Add-on",schemaVersion:"0.0.3",_uccVersion:"5.41.0"},n={pages:k,meta:v},ct={component:f,title:"ConfigurationPage",render:t=>(w(JSON.parse(JSON.stringify(t.globalConfig))),x.jsx(f,{})),args:{globalConfig:n},parameters:{msw:{handlers:[l.get("/servicesNS/nobody/-/:name",()=>r.json(h)),l.get("/servicesNS/nobody/-/:name/:tabName",()=>r.json(b)),l.post("/servicesNS/nobody/-/:name",()=>r.json(h)),l.post("/servicesNS/nobody/-/:name/:tabName",()=>r.json(b))]},snapshots:{width:1200,height:1200}}},s={},d={play:async({canvasElement:t})=>{const e=c(t),a=e.queryByRole("button",{name:/(Close)|(Cancel)/});a&&await o.click(a);const i=await e.findByRole("button",{name:"Add"});await o.click(i)}},p={play:async({canvasElement:t})=>{const e=c(t.ownerDocument.body),a=c(t),i=a.queryByRole("button",{name:/(Close)|(Cancel)/});i&&await o.click(i);const y=await a.findByRole("tab",{name:"Custom header tab"});await o.click(y);const g=await a.findByRole("button",{name:"Add"});await o.click(g),await _(await e.findByRole("dialog",{name:"Add custom header"})).toBeInTheDocument()}},u={args:{globalConfig:{...n,pages:{configuration:{...n.pages.configuration,tabs:Array.from({length:12},(t,e)=>({name:`tab${e+1}`,title:`this is tab ${e+1}`,entity:[{type:"text",label:`Name ${e+1}`,field:"name",help:"Enter a unique name for this account.",required:!0}]}))}}}},parameters:{snapshots:{width:1e3,height:600}}},m={args:{globalConfig:{...n,pages:{configuration:{...n.pages.configuration,tabs:[{name:"tab1",title:"This is tab with long name",entity:[{type:"text",label:"Name 1",field:"name",help:"Enter a unique name for this account.",required:!0}]},{name:"tab2",title:"Lorem Ipsum is simply dummy text of the printing and type setting industry",entity:[{type:"text",label:"Name 2",field:"name",help:"Enter a unique name for this account.",required:!0}]},{name:"tab3",title:"Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book",entity:[{type:"text",label:"Name 3",field:"name",help:"Enter a unique name for this account.",required:!0}]}]}}}},parameters:{snapshots:{width:1e3,height:600}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const ft=["ConfigurationPageView","ConfigurationViewAdd","ConfigurationCustomHeader","MultiTabsStory","LongTabNameStory"];export{p as ConfigurationCustomHeader,s as ConfigurationPageView,d as ConfigurationViewAdd,m as LongTabNameStory,u as MultiTabsStory,ft as __namedExportsOrder,ct as default};
