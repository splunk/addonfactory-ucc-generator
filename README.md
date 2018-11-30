Table of contents

- [Release notes](#release-notes)
    - [3.2.0](#320)
        - [Features:](#features)
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

### Release notes
#### 3.2.0
##### Features:
* OAuth2.0 support
* Custom hook support in the configuration tab
* Deep link support for input and tab view page.

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


You can always refer to [ta-salesforce](https://git.splunk.com/projects/FINGALS/repos/ta-salesforce/browse) as a reference for featured UCC use cases.


Note:
* Replace ${SPLUNK_HOME} with real Splunk home path.
* Replace ${UCC_GENERATED_APP} with UCC Generated App name.
