Table of contents
- [Release notes](#release-notes)
  - [3.6.2](#361)
    - [Bug Fixes:](#bug-fixes)
  - [3.6.1](#361)
    - [Bug Fixes:](#bug-fixes)
  - [3.6.0](#360)
    - [Feature:](#feature)
  - [3.5.1](#351)
    - [Bug Fixes:](#bug-fixes)
  - [3.5.0](#350)
    - [Features:](#features)
  - [3.4.6](#346)
    - [Bug Fixes:](#bug-fixes)
  - [3.4.5](#345)
    - [Bug Fixes:](#bug-fixes)
  - [3.4.4](#344)
    - [Bug Fixes:](#bug-fixes)
  - [3.4.3](#343)
    - [Features:](#features)
  - [3.4.2](#342)
    - [Features:](#features-1)
  - [3.4.1](#341)
    - [Features:](#features-2)
  - [3.4.0](#340)
    - [Features:](#features-3)
  - [3.3.0](#330)
    - [Features:](#features-4)
  - [3.3.0](#330)
    - [Features:](#features-5)
    - [Bug Fixes:](#bug-fixes)
  - [3.2.0](#320)
    - [Features:](#features-6)
- [Prerequisites](#prerequisites)
- [Install and configure Bower](#install-and-configure-bower)
- [Command to build an example add-on](#command-to-build-an-example-add-on)
- [Implementation of a hook feature](#implementation-of-a-hook-feature)
- [OAuth support for UCC](#oauth-support-for-ucc)
- [Display error messages and highlighted fields with red borders](#display-error-messages-and-highlighted-fields-with-red-borders)
- [Add tooltip on hover](#add-tooltip-on-hover)
- [Providing a link to another configuration page dynamically](#providing-a-link-to-another-configuration-page-dynamically)
- [Show components depending on value of previous component](#show-components-depending-on-value-of-previous-component)
- [Populate dropdown using endpoint](#populate-dropdown-using-endpoint)
- [Show alert icon](#show-alert-icon)
- [Deep link functionality for input page](#deep-link-functionality-for-input-page)
- [Deep link functionality for tab view page](#deep-link-functionality-for-tab-view-page)
- [Alert actions integration with ta-ui-framework](#alert-actions-integration-with-ta-ui-framework)
- [Help link component](#help-link-component)
- [Service name and Appname as column in table](#service-name-and-appname-as-column-in-table)

### Release notes
#### 3.6.2
##### Bug Fixes:
* Fixed basedir for globalConfig.json in splunk_aoblib (ADDON-27495)

### Release notes
#### 3.6.1
##### Bug Fixes:
* Fixed import httplib2_helper related issues. (ADDON-27349)

### Release notes
#### 3.6.0
##### Feature:
* Restructured the Python2 and Python3 3rd party libraries into new structure along with alert actions.

### Release notes
#### 3.5.1
##### Bug Fixes:
* Fixed the vulnerability of httplib2 CVE-2020-11078 found while whitesourcing.

#### 3.5.0  
##### Features:
* Reverted changes made in version 3.4.4 and 3.4.5  regarding the issue where the configuration page was not loading on splunk search head in cloud (ADDON-22233)
* Changed the default landing page for addons to the configuration page.
* Removed the dependency between the input page and the configuration page.
* Adding support for state parameter in OAuth headers
#### 3.4.6
##### Bug Fixes:
* Fixed issue of able to delete the configuration account even if it is linked with an input of an add-on (ADDON-25360)

#### 3.4.5
##### Bug Fixes:
* Fixed CSRF vulnerability with OAuth by changing GET request to a POST request. (ADDON-25548 and ADDON-25549)

#### 3.4.4
##### Bug Fixes:
* Fixed configuration page not loaded when the server role is search_head, search_peer or cluster_search_head (ADDON-22233)

#### 3.4.3
##### Features:
* Upgraded solnlib from 2.0.0 to latest after 2.0.0

#### 3.4.2
##### Features:
* Python 3 migration of UCC framework
* Upgraded solnlib from 1.0.19 to 2.0.0
* Upgraded splunk-sdk from 1.6.0 to 1.6.6
* Added future-0.17.1 Python library
* Added six-1.12.0 Python library
* Added configparser-3.8.1 Python library
* UI Automation framework has been added so that the UCC based addon can clone the framework from repo and extends based on the addon requirements.

#### 3.4.1
##### Features:
* Upgraded solnlib from 1.0.18 to 1.0.19

#### 3.4.0
##### Features:
* Added help link component
* Support of Service name and Appname as a column in table
##### Bug Fixes:
* Add button stops working in configuration tab when tab title is having more than 2 words
* Deep link not working while opening configuration 
* Upgraded the solnlib to version 1.0.18 after fixing requests vulnerabilities.

#### 3.3.0
##### Features:
* Alert Action support
* Deep link support for input and tab view page
##### Bug Fixes:
* Fixed input table not refreshed with a new input added when there is single service used (ADDON-19936)

#### 3.2.0
##### Features:
* OAuth2.0 support
* Custom hook support in the configuration tab

### Prerequisites
We use Bower, Grunt, and Webpack to build the Universal Configuration Console.

### Install and configure Bower

Follow the setup steps here: [http://repo.splunk.com/artifactory/webapp/#/artifacts/browse/tree/General/bower | bower setup]
Note: you must install art-resolver to use splunk bower repo
```
npm install -g bower-art-resolver
```

### Command to build an example add-on

```
python update_version.py
cd ./UCC-UI-lib && npm install && bower install
cd ./UCC-example-addon && python setup.py && source ${SPLUNK_HOME}/bin/setSplunkEnv && python build.py
```

### Implementation of a hook feature

Step 1: Add hook in configuration tab at the entity level.

```
// adding hook in configuration tab

"configuration": {
     "title": "Configurations",
     "description": "Configure your servers and templates.",
      "tabs": [
          {
              "name": "templates",
              "title": "Templates",
               "table": {...
          },
          "entity": [...
          ],
           "hook": {
               "src": "customHook"
          }
       }
    ]
}
```

Step 2: Create custom/customHook.js

* Copy `./UCC-UI-lib/package/appserver/static/js/views/controls/Hook.js` to `${SPLUNK_HOME}/etc/apps/${UCC_GENERATED_APP}/appserver/static/js/build/custom/` folder and rename it to `customHook.js`
* Add app-level business logic in custom code in `customHook.js`.


### OAuth support for UCC
Out of the box support for oauth has been added to the UCC.<br/>
Below is the global config example for the same:

```
// adding oauth support in accounts tab

"configuration": {
     "title": "Configurations",
     "description": "Configure your servers and templates.",
     "tabs": [
          {
              "name": "account",
              "title": "Account",
               "table": {...
               },
              "entity": [
                   {
                            "field": "name",
                            "label": "Name",
                            "type": "text",
                            "required": true,
                            "help": "Enter a unique name for each Crowdstrike falcon host account.",
                        },
                        {
                        type:"oauth",
                        "field": "oauth",
                        "label":"Not used",
                        "options": {
                                "auth_type": ["basic", "oauth"],
                                "basic": [
                                     {
                                        "oauth_field": "username",
                                        "label": "User Name",
                                        "field": "username",
                                        "help": "Enter Account name."
                                    },
                                    {
                                        "oauth_field": "password",
                                        "label": "Password",
                                        "field": "password",
                                        "encrypted": true,
                                        "help": "Enter Password."
                                    },
                                    {
                                        "oauth_field": "security_token",
                                        "label": "Securtiy Token",
                                        "field": "security_token",
                                        "encrypted": true,
                                        "help": "Enter Security Token."
                                    }
                                ],
                                "oauth": [
                                   {
                                        "oauth_field": "client_id",
                                        "label": "Client Id",
                                        "field": "client_id",
                                        "help": "Enter Client Id."
                                    },
                                    {
                                        "oauth_field":"client_secret",
                                        "label": "Client Secret",
                                        "field": "client_secret",
                                        "encrypted": true,
                                        "help": "Enter Client Secret."
                                    },
                                    {
                                        "oauth_field": "redirect_url",
                                        "label": "Redirect url",
                                        "field": "redirect_url",
                                        "help": "Please add this redirect URL in your app."
                                    },
                                    {
                                        "oauth_field": "endpoint",
                                        "label": "Endpoint",
                                        "field": "endpoint",
                                        "help": "Enter Endpoint"
                                    }
                                ],
                                "auth_label": "Auth Type",
                                "oauth_popup_width": 600,
                                "oauth_popup_height": 600,
                                "oauth_timeout": 180,
                                "auth_code_endpoint":"/services/oauth2/authorize",
                                "access_token_endpoint":"/services/oauth2/token"
                            }
                   }

              ],

          }
     ]
}

```
Below is the explanation of each field:
* type field value must be `oauth`.
* Options:
     * `auth_type` must be present. It can have either `["basic", "oauth"]` (if we want basic and oauth both support) or `["oauth"]` (if we want oauth support only).
     * `basic` this must be present only if `basic` is provided in `auth_type`. <br/>
        This will have list of fields you want to add in basic authentication flow. <br/>
        In the given example, it is `username`, `password` and  `security token`. <br/>
        Please not that as of now, if you are selecting basic auth. `username` and `password` is mandatory field.
     * `oauth` this must be present if `oauth` is provided in `auth_type`. <br/>
        This will have list of fields you want to add in oauth authentication flow. <br/>
        In the given example, it is `client_id`,`client_secret`,`redirect_url`,`endpoint`. <br/>
        These fields are mandatory.<br/>
        * `client_id` this is client id for the your app for which you want auth<br/>
        * `client_secret` this is client secret for the your app for which you want auth<br/>
        * `redirect_url` this will show redirect url which needs to be put in app's redirect url.<br/>
        * `endpoint` this will be endpoint for which we want to build oauth support. For example for salesforce that will be either "login.salesforce.com" or "test.salesforce.com" or any other custom endpoint.<br/>
         This field is can be present as part of normal fields as there can be scenario that this is required in both basic and oauth authentication. But it should be present at any of the place to oauth to work.
     *  `auth_code_endpoint` this must be present and its value should be endpoint value for getting the auth_code using the app. If the url to get auth_code is `https://login.salesforce.com/services/oauth2/authorize` then this will have value `/services/oauth2/authorize`
     *  `access_token_endpoint` this must be present and its value should be endpoint value for getting access_token using the auth_code received. If the url to get access token is `https://login.salesforce.com/services/oauth2/token` then this will have value `/services/oauth2/token`
     *  `auth_label` this allow user to have custom label for Auth Type dropdown
     *  `oauth_popup_width` width in pixels of the popup window that will open for oauth authentication(Optional, defaults to 600)
     *  `oauth_popup_height` height in pixels of the popup window that will open for oauth authentication(Optional, defaults to 600)
     *  `oauth_timeout` timeout in seconds for oauth authentication(Optional, defaults to 180 seconds)

* This complete block should be removed if the user does not want this oauth support.

* Fields allowed in `basic` and `oauth` fields as of now:
     * `oauth_field`: This should be kept as it is and without any change.
     * `label`: This can be changed if the user wants to change the label of the field in UI.
     * `field`: For now this user must keep it as it is for mandatory fields as mentioned above.
     * `help` : This can be changed if user wants to change the help text displayed below field.
     * `encrypted` : This should be true if user wants that particular field encrypted else no need to have this parameter.<br/>
    **No other fields apart from above mentioned fields are allowed as of now.**

Once user create/changes globalconfig.json as per above guidance.
Generate a build after adjusting globalconfig.json following instructions above.

### Display error messages and highlighted fields with red borders

In UCC if you are doing some custom validation and want to provide custom error message then you can use this method if you are in hook.
`this.util.displayErrorMsg(validate_message);`
where, validate_message is the message you want to display.
You can also add red border to the input field by adding the CSS class as below:
```$(`[data-name="name"]`).find("input").addClass("validation-error");```

### Add tooltip on hover
To add a tooltip to any field, populate the parameter "tooltip" as shown below
```
{
    "type":"text",
    "label":"Query Start Date",
    "field":"start_date",
    "tooltip": "Changing this parameter may result in gaps or duplication in data collection.",
    "required":false
}
```
### Providing a link to another configuration page dynamically
Create a link for the configuration page with the following code snippet:
```
// This creates a link for the configuration page.
var account_config_url = window.location.href.replace("inputs", "configuration");
// This adds the link using template
$(`[data-name="account"]`).after(_.template(accountHelpText)({account_config_url:account_config_url}));

// accountHelpText template
<div class="help-block">
	Select an account. Additional accounts may be configured from <a href="<%- account_config_url %>">here</a>
</div>
```

### Show components depending on value of previous component

To show or hide a field based on the value of another field, define the field in globalconfig.json. Then, in the hook, write the logic to do so.

ex. This example displays the “Query start date” field only when the "Reset Date input?" value is "Yes”:

globalconfig.json
```
{
    "type":"radio",
    "label":"Reset Data input?",
    "field":"is_reset_date_input",
    "defaultValue": "no",
    "required":false,
    "options": {
        "items":[
            {
                "value":"yes",
                "label":"Yes"
            },
            {
                "value":"no",
                "label":"No"
            }
        ]
    }
},
{
    "type":"text",
    "label":"Query Start Date",
    "field":"start_date",
    "help":"The date and time, in \"YYYY-MM-DDThh:mm:ss.000z\" format, after which to query and index records. \nThe default is 90 days before today.",
    "required":false,
    "options": {
                "display":false
            }
}
```
hook.js
```
onRender() {
    // Bind on change method to the mode;
    this.model.on("change:is_reset_date_input", this._checkpointChange, this);
}

_checkpointChange(){
    if (this.model.get("is_reset_date_input") === "yes") {
        $(`[data-name="start_date"]`).find("input").show();
    } else {
        $(`[data-name="start_date"]`).find("input").hide();
    }
}
```
### Populate dropdown using endpoint
The following example populates one dropdown based on the value of another dropdown:

globalconfig.json
```
 {
    "type": "singleSelect",
    "label": "Credentials",
    "options": {
        "referenceName": "account"
    },
    "field": "google_credentials_name",
    "required": true
},
{
    "type": "singleSelect",
    "label": "Project",
    "field": "google_project",
    "required": true,
    "options": {
        "dependencies": ["google_credentials_name"],
        "endpointUrl": "Splunk_TA_google_cloudplatform_projects",
        "blackList": "^_.*$",
        "createSearchChoice": true
    }
}
```
Here, `endpointUrl` is the url of python endpoint
      A change to the `dependencies` value triggers this endpoint to populate the dropdown values.

### Show alert icon
To show an alert icon for certain field values when working with custom cells, use the following html:

```
<span class="conflict-alert alert alert-error">
    <i class="icon-alert" title="<%- title %>" ></i>
</span> <%- account %>
```

### Deep link functionality for input page
Below are the steps to create deep link url:
window.
1. Get url upto input page using ```window.location.href```
2. Append ```?record=<record-name>``` to URL from step 1.

Example of a complete URL will look like:
* ```https://10.0.11.47:8000/en-US/app/Splunk_TA_salesforce/inputs?record=myrecord```


### Deep link functionality for tab view page
Below are the steps to create deep link url:

1. Get url upto tab page using ```window.location.href```
2. Append ```?tab=<tab-id>&record=<record-name>``` to URL from step 1.

Example of a complete URL will look like:
* ```https://10.0.11.47:8000/en-US/app/Splunk_TA_salesforce/configuration?tab=tabid&record=myrecord```

### Alert actions integration with ta-ui-framework

Alert actions can be generated directly by providing information in globalConfig.json. Following is an example which will generate all the below files required for alert action:
* default/alert_actions.conf
* README/alert_actions.conf.spec 
* default/data/ui/alerts/<alert_name>.html 
* bin/<alert_name>.py
* bin/<TA_Name>/modalert_<alert_name>_helper.py

The main logic for alert action can be written in *bin/<TA_Name>/modalert_<alert_name>_helper.py*. The details have to be provided at the root level (same level as pages and meta). As shown below, we can provide a list of dictionaries of alert actions to create multiple alert actions:

Example:
globalConfig.json
```
"alerts":[
        {
            "name":"test_alert",
            "label":"Test Alert",
            "description":"Description for test Alert Action",
            "activeResponse":{
                "task":[
                    "Create",
                    "Update"
                ],
                "supportsAdhoc":true,
                "subject":[
                    "endpoint"
                ],
                "category":[
                    "Information Conveyance",
                    "Information Portrayal"
                ],
                "technology":[
                    {
                        "version":[
                            "1.0.0"
                        ],
                        "product":"Test Incident Update",
                        "vendor":"Splunk"
                    }
                ],
                "drilldownUri":"search?q=search%20index%3D\"_internal\"&earliest=0&latest=",
                "sourcetype":"test:incident"
            },
            "entity":[
                {
                    "type":"text",
                    "label":"Name",
                    "field":"name",
                    "defaultValue":"xyz",
                    "required":true,
                    "help":"Please enter your name"
                },
                {
                    "type":"checkbox",
                    "label":"All Incidents",
                    "field":"all_incidents",
                    "defaultValue":0,
                    "required":false,
                    "help":"Tick if you want to update all incidents/problems"
                },
                {
                    "type":"singleSelect",
                    "label":"Table List",
                    "field":"table_list",
                    "options":{
                        "items":[
                            {
                                "value":"Incident",
                                "label":"incident"
                            },
                            {
                                "value":"Problem",
                                "label":"problem"
                            }
                        ]
                    },
                    "help":"Please select the table",
                    "required":false,
                    "defaultValue":"problem"
                },
                {
                    "type":"radio",
                    "label":"Action:",
                    "field":"action",
                    "options":{
                        "items":[
                            {
                                "value":"Update",
                                "label":"update"
                            },
                            {
                                "value":"Delete",
                                "label":"delete"
                            }
                        ]
                    },
                    "help":"Select the action you want to perform",
                    "required":true,
                    "defaultValue":"two"
                },
                {
                    "type":"singleSelectSplunkSearch",
                    "label":"Select Account",
                    "field":"account",
                    "search":"| rest /servicesNS/nobody/TA-SNOW/admin/TA_SNOW_account | dedup title",
                    "valueField":"title",
                    "labelField":"title",
                    "help":"Select the account from the dropdown",
                    "required":true
                }
            ]
        }
    ]
```

Following is a brief explanation for each field (All the fields mentioned below are required unless specified otherwise):
* `name`, `label` and `description` denotes the name, friendly name and a brief description of the alert action respectively.
* `activeResponse` field is required to provide support for **adaptive response action** in **Splunk Enterprise Security**. This field is required only if the support for **adaptive response action** is to be provided. Following are the fields for the same (all the fields mentioned below are required unless specified otherwise):
    * `task`: Enter the functions performed by the action, such as "scan".
    * `supportsAdhoc`: Provide **true** if the action supports ad hoc invocation from the Actions menu on the Incident Review dashboard in Splunk Enterprise Security.
    * `subject`: Enter the objects that the action's tasks can be performed on, such as "endpoint.file".
    * `category`: It should contain the categories that the action belongs to, such as **Information Gathering**.
    * `technology` field contains `vendor`, `product` and `version` fields which are explained below:
        * `vendor`: The technology vendor that the action supports.
        * `product`: Enter the product that the action supports.
        * `version`: Enter the versions of the product that the action supports.
    * `drillDownUri`: Enter a URL to a custom drilldown or view for the link that appears in the detailed view of a notable event on the Incident Review dashboard in Splunk Enterprise Security. If you don't specify a URL, the default URL runs a search for the result events created by this response action. It is an optional field.
    * `sourcetype`: Enter the source type to which to assign the events produced as a result of this response action. It is an optional field.
* `entity` field is a list of dictionaries, each containing details about the input fields available on the html form of the alert actions. The details about the various fields of `entity` are mentioned below (all the fields mentioned below are required unless specified otherwise):
    * `field`: The name of the entity.
    * `label`: The friendly name of the entity.
    * `type`: *type* field is used to specify different types of entities. Supported types are: **text, singleSelect, checkbox, radio,** and **singleSelectSplunkSearch**. 
    * `defaultValue`: The default value of the entity. It can be a number, string or boolean value, depending upon the type of entity. It is an optional field.
    * `help`: It is useful for providing friendly help text to the user. It is an optional field.
    * `required`: It specifies whether the given input entity is required or not. It is an optional field. 
    * `search`, `valueField`, and `labelField` fields are only valid for type **singleSelectSplunkSearch**. They are explained below:
        * `search`: It represents the query string to execute. It is useful for querying the REST API, a lookup table, or indexed data.
        * `valueField`: It indicates the field name to use for drop-down option values that correspond to the option labels.
        * `labelField`: It indicates  the field name to use for drop-down option labels. Labels generated from this field are visible in the drop-down interface.
        All the above fields are required.
    * `options` are only valid for type **checkbox** and **radio**. The options available are:
        * `items`: A list of dictionaries consisting of value and label pair, which represents value and label of the option in the above types respectively. 

You can always refer to [ta-salesforce](https://git.splunk.com/projects/FINGALS/repos/ta-salesforce/browse) for featured UCC use cases and [ta-snow](https://git.splunk.com/projects/SOLN/repos/ta-snow/browse) for alert actions.

### Help Link component

Following example populates the help link in the input or configuration page

globalconfig.json
```
{
    "field": "help",
    "type": "helpLink",
    "label": "",
    "options": {
        "text": "Learn more",
        "link": "<link to some page>"
    }
}
```

Here text refers to the text which will be displayed to the user and link refers to the page where user will be redirected after clicking on the text.

Note: If any of the field "text" or "link" is not provided, the component will not appear.

### Service name and Appname as column in table
If one of these 2 field are mentioned as header in corresponding mentioned table, the value will be populated automatically.
* _input_service:
    * The title of the service for which the stanza was created.
    * It is only supported in inputs configuration page.
    * In order to show the service name as a column, developer had to provide "field": "_input_service" as a table header.
* _app_name:
    * The name of the app from which the particular stanza was fetched.
    * Supported in inputs & account configuration page
    * In order to show the service name as a column, developer had to provide "field": "_app_name" as a table header.

GlobalConfig.json example for a table:

```
"header":[
    {
        "label":"Name",
        "field":"name"
    },
    {
        "field": "account",
        "label": "Account"
    },
    {
        "field": "_input_service",
        "label": "Service"
    },
    {
        "field": "_app_name",
        "label": "App"
    },
    {
        "label":"Status",
        "field":"disabled"
    }
] 
```

Reference: 

One can refer [UCC developemnt Guide](https://confluence.splunk.com/display/PROD/Splunk+UCC+3.X+Development+Guide#SplunkUCC3.XDevelopmentGuide-Optionsofeachcontroltypeforentityparameter), [UCC 3.1.0 configuration interface](https://confluence.splunk.com/display/PROD/UCC+3.1+Configuration+Interface) and resources mentioned there for advanced option like custom cell, custom row etc.


Note:
* Replace ${SPLUNK_HOME} with real Splunk home path.
* Replace ${UCC_GENERATED_APP} with UCC Generated App name.
