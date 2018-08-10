import {configManager} from 'app/util/configManager';
import restEndpointMap from 'app/constants/restEndpointMap';
import {
    MODE_CLONE,
    MODE_CREATE,
    MODE_EDIT
} from 'app/constants/modes';
import {PAGE_STYLE} from 'app/constants/pageStyle';
import {generateModel} from 'app/util/backboneHelpers';
import {generateValidators} from 'app/util/modelValidators';
import {parseFuncRawStr} from 'app/util/script';
import {
    addErrorMsg,
    removeErrorMsg,
    addSavingMsg,
    removeSavingMsg,
    displayValidationError
} from 'app/util/promptMsgController';
import {getFormattedMessage} from 'app/util/messageUtil';
import GroupSection from 'app/views/component/GroupSection';
import OAuth from 'app/views/component/OAuth';
import {
    ERROR_REQUEST_TIMEOUT_TRY_AGAIN,
    ERROR_REQUEST_TIMEOUT_ACCESS_TOKEN_TRY_AGAIN,
    ERROR_OCCURRED_TRY_AGAIN,
    ERROR_AUTH_PROCESS_TERMINATED_TRY_AGAIN
} from 'app/constants/oAuthErrorMessage';

define([
    'jquery',
    'lodash',
    'backbone',
    'app/util/Util',
    'app/views/controls/ControlWrapper',
    'app/views/component/SavingDialog',
    "splunkjs/mvc",
    "underscore"
], function (
    $,
    _,
    Backbone,
    Util,
    ControlWrapper,
    SavingDialog,
    mvc,
    underscore
) {
    return Backbone.View.extend({
        initialize: function (options) {
            this.appData = configManager.getAppData();
            _.extend(this, options);

            // Guid of current dialog
            this.curWinId = Util.guid();
            this.curWinSelector = '.' + this.curWinId;

            // Encrypted field list
            this.encryptedFields = [];
            _.each(this.component.entity, e => {
                if (e.encrypted) {
                    this.encryptedFields.push(e.field);
                }
                if(e.field === "oauth") {
                    let encryptedFieldDict = {"basic": "password", "oauth": "client_secret"}
                     _.each(encryptedFieldDict, (key, value) => {
                        if (e.options.auth_type.indexOf(key) != -1) {
                            this.encryptedFields.push(
                                e.options[key].filter(function (auth_fields) {
                                    return auth_fields.field === value;
                                }).map(function (auth_fields) { return auth_fields.field})
                            );
                        }
                    });
                }
            });
            this.customValidators = [];
            this.model = new Backbone.Model({});

            const {entity, name, options: comOpt} = this.component;
            const validators = generateValidators(entity);
            const endpointUrl = restEndpointMap[name];
            const formValidator = comOpt ? comOpt.saveValidator : undefined;
            const InputType = generateModel(
                endpointUrl ? '' : this.component.name,
                {
                    modelName: name,
                    fields: entity,
                    endpointUrl,
                    formDataValidatorRawStr: formValidator,
                    onLoadRawStr: comOpt ? comOpt.onLoad : undefined,
                    shouldInvokeOnload: true,
                    validators
                }
            );

            if (this.mode === MODE_CREATE || !options.model) {
                this.mode = MODE_CREATE;
                this.model = new Backbone.Model({});
                this.real_model = new InputType(null, {
                    appData: this.appData,
                    collection: this.collection
                });
            } else if (this.mode === MODE_EDIT && options.model) {
                this.model = options.model.entry.content.clone();
                this.model.set({name: options.model.entry.get("name")});
                this.real_model = options.model;
                (validators || []).forEach(({fieldName, validator}) => {
                    this.real_model.addValidation(fieldName, validator);
                });
                // Add saveValidator
                this.real_model.validateFormData =
                    parseFuncRawStr(formValidator);
            } else if (this.mode === MODE_CLONE && options.model) {
                this.model = options.model.entry.content.clone();

                // Clean encrypted fields
                _.forEach(this.encryptedFields, d => {
                    delete this.model.attributes[d];
                });

                // Unset the name attribute if the model is newly created
                if (this.model.get("name")) {
                    this.model.unset("name");
                }
                // Unset the refCount attribute
                if (this.model.get("refCount")) {
                    this.model.unset("refCount");
                }
                this.cloneName = options.model.entry.get("name");
                this.real_model = new InputType(null, {
                    appData: this.appData,
                    collection: this.collection
                });
            }
            this.real_model.on("invalid", err => {
                this._removeValidationErrorClass(err);
                displayValidationError(this.curWinSelector, err);
                this._highlightError(err);
                if (this.savingDialog) {
                    this.savingDialog.remove();
                }
            });

            /*
                We can't set onChange-hook up in the data fetching model.
                Since it will only be updated when user save form data.
            */
            this.model.on('change', this.onStateChange.bind(this));
            this.initModel();

            if (this.component.hook) {
                this.hookDeferred = this._loadHook(this.component.hook.src);
            }

            // Dependency field list
            this.dependencyMap = new Map();
            /**
                Example: 'account' change triggers load of 'region' and 'SQS'.
                'region' depends on 'account' and
                'SQS' depends on 'account' and 'region'.

                'account': {
                    'region': [
                        'account'
                    ],
                    'SQS': [
                        'account',
                        'region'
                    ]
                }
            **/
            _.each(this.component.entity, e => {
                const fields = _.get(e, ['options', 'dependencies']);

                _.each(fields, field => {
                    const changeFields = this.dependencyMap.get(field);
                    if (changeFields) {
                        changeFields[e.field] = fields;
                    } else {
                        this.dependencyMap.set(field, {[e.field]: fields});
                    }
                });
            });

            // Current loading requests
            this.curRequests = {};
            for (const value of this.dependencyMap.values()) {
                for (const loadField in value) {
                    this.curRequests[loadField] = [];
                }
            }

            // Add change event listener
            for (const [key, value] of this.dependencyMap) {
                this.model.on('change:' + key, () => {
                    for (const loadField in value) {
                        if (!value.hasOwnProperty(loadField)) {
                            continue;
                        }
                        const controlWrapper =
                            this.fieldControlMap.get(loadField);
                        if (!controlWrapper) {
                            continue;
                        }
                        const data = {};
                        let load = true;
                        _.each(value[loadField], dependency => {
                            const required = !!_.find(
                                this.component.entity,
                                e => {
                                    return e.field === dependency;
                                }
                            ).required;
                            if (required && !this.model.get(dependency)) {
                                // Clear the control
                                this.model.set(loadField, '');
                                load = false;
                            } else {
                                data[dependency] = this.model.get(
                                    dependency,
                                    ''
                                );
                            }
                        });
                        if (load) {
                            if (this.curRequests[loadField].length > 0) {
                                _.each(this.curRequests[loadField], request => {
                                    if (request.state() === 'pending') {
                                        request.abort();
                                        this.fieldControlMap
                                            .get(loadField)
                                            .control.enable();
                                    }
                                });
                            }
                            // Add loading message
                            controlWrapper.control.startLoading();
                            const curRequest = controlWrapper.collection.fetch({
                                data,
                                error: (collection, response) => {
                                    this.addErrorToComponent(loadField);
                                    // Do not add errr msg when abort
                                    if (response.statusText !== 'abort') {
                                        addErrorMsg(
                                            this.curWinSelector,
                                            response,
                                            true
                                        )
                                    }
                                }
                            });
                            this.curRequests[loadField].push(curRequest);
                        }
                    }
                });
            }
            // Util used to pass to custom component for displaying error msg
            this.util = {
                displayErrorMsg: (message) => {
                    addErrorMsg(this.curWinSelector, message);
                },
                removeErrorMsg: () => {
                    removeErrorMsg(this.curWinSelector);
                },
                addErrorToComponent: this.addErrorToComponent,
                removeErrorFromComponent: this.removeErrorFromComponent
            }
        },

        events: {
            'click button.close': (e) => {
                if (e.target.hasAttribute('data-dismiss')) {
                    return;
                }
                $(e.target).closest('.msg').remove();
            }
        },

        _removeValidationErrorClass: function(err) {
            const {widgetsIdDict} = err;
            const selectors = [];
            for (const key of Object.keys(widgetsIdDict)) {
                selectors.push(widgetsIdDict[key]);
            }
            _.each(selectors, selector => {
                if ($(selector).length > 0 &&
                        $(selector).hasClass('validation-error')) {
                    $(selector).removeClass('validation-error');
                }
            });
        },

        _highlightError: function(err) {
            const {validationError, widgetsIdDict} = err;
            let errorAttribute, componentId;
            if (typeof validationError === 'object' &&
                    Object.keys(validationError).length > 0) {
                errorAttribute = Object.keys(validationError)[0];
                componentId = widgetsIdDict[errorAttribute];
                $(componentId).addClass('validation-error');
            }
        },

        addErrorToComponent: function (componentName, field) {
            // Get the id for control, constructed in render(): controlOptions
            const selector = `#${componentName}-${field}`;
            $(selector).addClass('validation-error');
        },

        removeErrorFromComponent: function (componentName, field) {
            // Get the id for control, constructed in render(): controlOptions
            const selector = `#${componentName}-${field}`;
            if ($(selector).hasClass('validation-error')) {
                $(selector).addClass('validation-error');
            }
        },

        onStateChange: function() {
            const onChangeHookRawStr = _.get(
                this.component, ['options', 'onChange']
            );
            if (onChangeHookRawStr) {
                const changedField = this.model.changedAttributes();
                const widgetsIdDict = {};
                const {entity, name} = this.component;
                (entity || []).forEach(d => {
                    widgetsIdDict[d.field] = `#${name}-${d.field}`;
                });
                const formData = this.model.toJSON();
                const onChangeHook = parseFuncRawStr(onChangeHookRawStr);
                onChangeHook(formData, changedField, widgetsIdDict);
            }
        },

        submitTask: function () {

            // Load oAuth related field value into model
            if (this.isAuth) {
                this.oauth._load_model(this.model);
            }

            // Add onSave hook if it exists
            if (this.hook && typeof this.hook.onSave === 'function') {
                const validationPass = this.hook.onSave();
                if (!validationPass) {
                    return;
                }
            }
            // Add basic validation for basic and oauth authentication if oauth type is included
            if (this.isAuth && !this._validateAuthFields()) {
                return;
            }

            // Disable the button to prevent repeat submit
            Util.disableElements(
                this.$("button[type=button]"),
                this.$("input[type=submit]")
            );

            // Remove loading and error message
            removeErrorMsg(this.curWinSelector);
            removeSavingMsg(this.curWinSelector);

            // Add saving dialog for page style
            if (this.component.style && this.component.style === PAGE_STYLE) {
                // Scroll up to top to display msg
                this.$('.create-input-body .content').scrollTop(0);
                this.savingDialog = new SavingDialog();
                this.savingDialog.show();
            } else {
                addSavingMsg(this.curWinSelector, getFormattedMessage(108));
            }

            if (this.isAuth && this.model.get("auth_type") === "oauth") {
                const app_name = configManager.unifiedConfig.meta.name
                // Get redirect URI from current window url
				var redirectUri = window.location.href.replace("configuration", app_name.toLowerCase() + "_redirect");
                // Populate the parameter string with client_id, redirect_url and response_type
                var parameters = underscore.template(`?response_type=code&client_id=<%=client_id %>&redirect_uri=` + redirectUri, this.model.toJSON());
                // Method to populate auth code endpoint & accesstoken endpoint variables
                this.getAuthEndpoint();
                var host = "https://" + this.model.get("endpoint") + this.authCodeEndpoint + parameters;
				(async () => {
					this.isCalled = false;
					this.isError = false;
					// Open a popup to make auth request
					this.childWin =  window.open(host, app_name + " OAuth", "width=600, height=600");
					var that = this;
					// Callback to receive data from redirect url
					window.getMessage = function(message) {
						that.isCalled = true;
						// On Call back with Auth code this method will be called.
						that._handleOauthToken(message);

					};
					// Wait till we get auth_code from calling site through redirect url, we will wait for 3 mins
					await this.waitForAuthentication(this, 0);
					if (!this.isCalled && this.childWin.closed) {
					    //Add error message if the user has close the authentication window without taking any action
						removeSavingMsg(this.curWinSelector);
						addErrorMsg(this.curWinSelector, ERROR_AUTH_PROCESS_TERMINATED_TRY_AGAIN);
						return false;
					}

					if (!this.isCalled) {
						//Add timeout error message
						removeSavingMsg(this.curWinSelector);
						addErrorMsg(this.curWinSelector, ERROR_REQUEST_TIMEOUT_TRY_AGAIN);
						return false;
					}
					// Reset called flag as we have to wait till we get the access_token, refresh_token and instance_url
					// Wait till we get the response, here we have added wait for 30 secs
					await this.waitForBackendResponse(this, 30);
					if (!this.isResponse && !this.isError) {
					    //Set error message to prevent saving.
					    this.isError = true;
					    removeSavingMsg(this.curWinSelector);
						//Add timeout error message
						addErrorMsg(this.curWinSelector, ERROR_REQUEST_TIMEOUT_ACCESS_TOKEN_TRY_AGAIN);
						return false;
					}
					return true;
				})().then(() => {
				    if (!this.isError) {
                        this.saveModel();
					} else {
					    Util.enableElements($("button[type=button]"), $("input[type=submit]"));
					}
				});
            } else {

                // Save the model
                this.saveModel();
            }


        },

        /*
         * This function is to validate minimum fields that required for basic and oauth fields
         */
        _validateAuthFields: function() {
            // Variable declaration
            var isValid = true,
                // Basic and oAUth fields that needs to be validate
                basic_fields = ["username", "password"],
                oauth_fields = ["client_id", "client_secret", "endpoint"],
                fieldDict= [],
                basic_fields_dict = [],
                oauth_fields_dict = [];
            // Iterate global config json to get label and field names for the fields for whom the validation is required
            var ta_tabs = configManager.unifiedConfig.pages.configuration.tabs
            var account_tab = _.filter(ta_tabs, (tab) => { return tab.name === "account"});
            var auth_type_element = _.filter(account_tab[0].entity, (ele) => { return ele.type === "oauth"})[0];
            if (auth_type_element.options.basic) {
                auth_type_element.options.basic.map((fields) => {
                    if ($.inArray(fields.oauth_field, basic_fields) >= 0) {
                        basic_fields_dict[fields.oauth_field] = fields.field;
                    }
                    fieldDict[fields.field] = fields.label;
                });
            }
            if (auth_type_element.options.oauth) {
                auth_type_element.options.oauth.map((fields) => {
                    if ($.inArray(fields.oauth_field, oauth_fields) >= 0) {
                        oauth_fields_dict[fields.oauth_field] = fields.field;
                    }
                    fieldDict[fields.field] = fields.label;
                });
            }
            // Validate oauth fields if the auth type if oauth
            if (this.model.get("auth_type") === "oauth") {
                _.each(oauth_fields, field => {
                    if (isValid) {
                        var field_value = this.model.get(oauth_fields_dict[field]);
                        if (field_value === undefined || field_value.trim().length === 0) {
                            var validate_message = fieldDict[oauth_fields_dict[field]] + " is a mandatory field";
                            addErrorMsg(this.curWinSelector, validate_message);
                            isValid = false;
                            return false
                        }
                    }
                 });
            } else if (this.model.get("auth_type") === "basic") { // Validate basic fields if the auth type is basic
                 _.each(basic_fields, field => {
                    if (isValid) {
                        var field_value = this.model.get(basic_fields_dict[field]);
                        if (field_value === undefined || field_value.trim().length === 0 ){
                            var validate_message = fieldDict[basic_fields_dict[field]] + " is a mandatory field";
                            addErrorMsg(this.curWinSelector, validate_message);
                            isValid = false;
                            return false
                        }
                    }
                 });
            }
            return isValid;
        },

        initModel: function() {
            if (this.mode !== MODE_CREATE) {
                return;
            }
            const {content} = this.real_model.entry,
                {entity} = this.component;

            entity.forEach(d => {
                if (content.get(d.field) === undefined &&
                        d.defaultValue !== undefined) {
                    content.set(d.field, d.defaultValue);
                }
            });
        },

        saveModel: function () {
            // Add custom validation to real_model
            (this.customValidators || []).forEach((obj) => {
                for (const prop in obj) {
                    if(obj.hasOwnProperty(prop)){
                        this.real_model.addValidation(prop, obj[prop]);
                    }
                }
            });
            // Prevent redirect url from getting stored in backend as it is not required
            if (this.isAuth) {
				  this.model.set("redirect_url", "");
			}
            var input = this.real_model,
                new_json = this.model.toJSON(),
                original_json = input.entry.content.toJSON(),
                // Add label attribute for validation prompt
                entity = this.component.entity,
                attr_labels = {};
            _.each(entity, function (e) {
                attr_labels[e.field] = e.label;

                // Related JIRA ID: ADDON-12723
                if(new_json[e.field] === undefined) {
                    new_json[e.field] = '';
                }
            });

            input.entry.content.set(new_json, {silent: true});
            input.attr_labels = attr_labels;
            this.save(input, original_json);
        },

        save: function (input, original_json) {
            // When update, disable parameter should be removed from parameter
            if (this.mode === MODE_EDIT || this.mode === MODE_CLONE) {
                input.entry.content.unset('disabled', {silent: true});
            }
            var deffer = input.save();

            if (!deffer.done) {
                input.entry.content.set(original_json);
                // Re-enable buttons when failed
                Util.enableElements(
                    this.$("button[type=button]"),
                    this.$("input[type=submit]")
                );
            } else {
                deffer.done(() => {
                    // Add onSaveSuccess hook if it exists
                    if (this.hook &&
                            typeof this.hook.onSaveSuccess === 'function') {
                        this.hook.onSaveSuccess();
                    }
                    this.successCallback(input);
                }).fail((model) => {
                    // Add onSaveFail hook if it exists
                    if (this.hook &&
                            typeof this.hook.onSaveFail === 'function') {
                        this.hook.onSaveFail();
                    }

                    input.entry.content.set(original_json);
                    // Re-enable buttons when failed
                    Util.enableElements(
                        this.$("button[type=button]"),
                        this.$("input[type=submit]")
                    );
                    // Remove saving dialog or message
                    if (this.savingDialog) {
                        this.savingDialog.remove();
                    } else {
                        removeSavingMsg(this.curWinSelector);
                    }
                    addErrorMsg(this.curWinSelector, model, true);
                });
            }
            return deffer;
        },

        _loadHook: function (module) {
            const deferred = $.Deferred();
            __non_webpack_require__(['custom/' + module], (Hook) => {
                this.hook = new Hook(
                    configManager.unifiedConfig,
                    this.component.name,
                    this.model,
                    this.util
                );
                deferred.resolve(Hook);
            });
            return deferred.promise();
        },

        _loadCustomControl: function (
                module, modelAttribute, model, serviceName, index
            ) {
            const deferred = $.Deferred();
            __non_webpack_require__(['custom/' + module], (CustomControl) => {
                const el = document.createElement("DIV");
                const control = new CustomControl(
                    configManager.unifiedConfig,
                    serviceName,
                    el,
                    modelAttribute,
                    model,
                    this.util,
                    this.mode
                );
                this.fieldControlMap.set(modelAttribute, control);
                // Add custom validation
                if (typeof control.validation === 'function') {
                    this.customValidators.push({
                        [control.field]: control.validation
                    });
                }
                this.children.splice(index, 0, control);
                deferred.resolve(CustomControl);
            });
            return deferred.promise();
        },

        render: function () {
            // Execute the onCreate hook if defined
            if (this.hookDeferred) {
                this.hookDeferred.then(() => {
                    if (typeof this.hook.onCreate === 'function') {
                        this.hook.onCreate();
                    }
                });
            }

            // Render template
            this.renderTemplate();

            // Used to store field to custom control or controlWrapper mapping
            this.fieldControlMap = new Map();
            // Used to store custom control or controlWrapper defined in entity
            this.children = [];
            this.deferreds = [];
            _.each(this.component.entity, (e, index) => {
                let controlWrapper, deferred;
                if (this.mode === MODE_CREATE) {
                    if (this.model.get(e.field) === undefined &&
                        e.defaultValue !== undefined) {
                        this.model.set(e.field, e.defaultValue);
                    }
                }

                const controlOptions = {
                    model: this.model,
                    modelAttribute: e.field,
                    password: e.encrypted ? true : false,
                    displayText: e.displayText,
                    helpLink: e.helpLink,
                    elementId: `${this.component.name}-${e.field}`,
                    curWinSelector: this.curWinSelector,
                    mode: this.mode
                };
                _.extend(controlOptions, e.options);

                if(e.type === 'custom') {
                    deferred = this._loadCustomControl(
                        e.options.src,
                        controlOptions.modelAttribute,
                        controlOptions.model,
                        this.component.name,
                        index
                    );
                    this.deferreds.push(deferred);
                } else if (e.type === 'oauth') {
                    // loading and adding oauth related component in UI.
                    this.isAuth = true;
                    if(this.oauth === undefined) {
                        this.oauth = new OAuth(e.options,this.mode,this.model);
                    }
                    controlWrapper = new ControlWrapper({...e, controlOptions});
                    this.fieldControlMap.set(e.field, controlWrapper);
                    this.children.push(controlWrapper);
                } else {
                    controlWrapper = new ControlWrapper({...e, controlOptions});

                    if (e.options && e.options.display === false) {
                        controlWrapper.$el.css("display", "none");
                    }
                    this.fieldControlMap.set(e.field, controlWrapper);
                    this.children.push(controlWrapper);
                }
            });
            $.when.apply($, this.deferreds).then(() => {
                _.each(this.children, (child) => {
                    // Prevent auto complete for password
                    if (child.controlOptions && child.controlOptions.password) {
                        this.$('.modal-body').prepend(`
                            <input type="password"
                            id="${child.controlOptions.modelAttribute}"
                            style="display: none"/>
                        `);
                    }
                });

                // Group configuration
                const groups = [];
                if (this.component.groups) {
                    _.each(this.component.groups, group => {
                        const {label, options} = group;
                        const controls = [];
                        _.each(group.fields, field => {
                            const control = this.fieldControlMap.get(field);
                            if (control) {
                                controls.push(control);
                                const index = this.children.findIndex((child) => {
                                    return child === control;
                                });
                                if (index > -1) {
                                    this.children.splice(index, 1);
                                }
                            }
                        })
                        groups.push(new GroupSection({
                            label,
                            options,
                            controls
                        }));
                    });
                    _.each(groups, group => {
                        this.$('.modal-body').append(group.render().$el);
                    });
                }

                // Render the controls in this.children
                _.each(this.children, (child) => {
                    const childComponent = child.render();
                    this.$('.modal-body').append(
                        childComponent.$el || childComponent.el
                    );
                });

                // Load dependency endpoint in edit/clone mode
                if (this.mode === MODE_CLONE || this.mode === MODE_EDIT) {
                    _.each(this.component.entity, e => {
                        const fields = _.get(e, ['options', 'dependencies']);
                        if (!fields) return;
                        const data = {};
                        const load = _.every(fields, field => {
                            const required = !!_.find(
                                    this.component.entity,
                                    e => {
                                        return e.field === field;
                                }).required;
                            if (required && !this.model.get(field)) {
                                return false;
                            }
                            // Set the rest required params
                            data[field] = this.model.get(field, '');
                            return true;
                        });
                        if (load) {
                            const controlWrapper =
                                this.fieldControlMap.get(e.field);
                            // Add loading message
                            controlWrapper.control.startLoading();
                            controlWrapper.collection.fetch({
                                data,
                                error: (collection, response) => {
                                    this.addErrorToComponent(e.field);
                                    addErrorMsg(
                                        this.curWinSelector,
                                        response,
                                        true
                                    )
                                }
                            });
                        }
                    });
                    // Execute the onEditLoad hook if defined
                    if (this.hookDeferred) {
                        this.hookDeferred.then(() => {
                            if (typeof this.hook.onEditLoad === 'function') {
                                this.hook.onEditLoad();
                            }
                        });
                    }
                }

                // Disable the name field and other configed fields in edit mode
                if (this.mode === MODE_EDIT) {
                    this.$("input[name=name]").attr("readonly", "readonly");
                    _.each(this.component.entity, e => {
                        const disable = _.get(e, ['options', 'disableonEdit']);
                        if (!disable) {
                            return;
                        }
                        if (e.type === 'singleSelect' ||
                                e.type === 'multipleSelect') {
                            const controlWrapper =
                                this.fieldControlMap.get(e.field);
                            controlWrapper.control.disable();
                        } else {
                            this.$(`input[name=${e.field}]`).attr(
                                "readonly",
                                "readonly"
                            );
                        }
                    });
                }
                this.$("input[type=submit]").on(
                    "click", this.submitTask.bind(this)
                );
                // Add guid to current dialog
                this.addGuid();

                // Add button type to button element, ADDON-13632
                this.$('.modal-body').find('button').prop('type', 'button');

                // Execute the onRender hook if defined
                if (this.hookDeferred) {
                    this.hookDeferred.then(() => {
                        if (typeof this.hook.onRender === 'function') {
                            this.hook.onRender();
                        }
                    });
                }

                // Rendering oauth UI component with provided options
                if (this.isAuth) {
                    this.$('.oauth').html(this.oauth.render().$el);
                    const app_name = configManager.unifiedConfig.meta.name
                    // Set redirect_url value and make it readonly as this value is to display end user which redirect url  should be used
                    this.model.set("redirect_url",
                        window.location.href.replace("configuration", app_name.toLowerCase() + "_redirect"));
                    $(`[data-name="redirect_url"]`).find("input").prop("readonly", "true");
					$(`[data-name="redirect_url"]`).find("input")
					    .val(window.location.href.replace("configuration", app_name.toLowerCase() + "_redirect"));
                }
            });
            return this;
        },


        /*
         * Function to get access token, refresh token and instance url
         * using rest call once oauth code received from child window
         */
        _handleOauthToken: function(message) {

             // Check message for error. If error show error message.
		     if (!message || (message && message.error) || message.code === undefined) {
		        removeSavingMsg(this.curWinSelector);
                addErrorMsg(this.curWinSelector, ERROR_OCCURRED_TRY_AGAIN);
                this.isError = true;
                this.isResponse = true;
                return;
            }
            const app_name = configManager.unifiedConfig.meta.name
            var code = decodeURIComponent(message.code),
                grantType = "authorization_code",
                clientId = this.model.get("client_id"),
                clientSecret = this.model.get("client_secret"),
                redirectUri = window.location.href.replace("configuration", app_name.toLowerCase() + "_redirect"),
                data = {
					"method":"POST",
					"url":"https://"+ this.model.get("endpoint") + this.accessTokenEndpoint,
                    "grant_type": grantType,
                    "client_id": clientId,
                    "client_secret": clientSecret,
                    "code": code,
                    "redirect_uri": redirectUri
                };
            this.isResponse = false;
			var service = mvc.createService();
			// Internal handler call to get the access token and other values
			service.get("/services/" + app_name + "_oauth", data, (err, response) => {
			     // Set the isResponse to true as response is received
                 this.isResponse = true;
				 if (!err) {
				    if (response.data.entry[0].content.error === undefined) {
                        var access_token= response.data.entry[0].content.access_token;
                        var instance_url = response.data.entry[0].content.instance_url;
                        var refresh_token = response.data.entry[0].content.refresh_token;
                        // Set all the model attributes
                        this.model.set("instance_url", instance_url);
                        this.model.set("refresh_token", refresh_token);
                        this.model.set("access_token", access_token);
                        return true;
				    } else {
				        removeSavingMsg(this.curWinSelector);
				        addErrorMsg(this.curWinSelector, response.data.entry[0].content.error);
                        this.isError = true;
                        return false;
				    }
				} else {
				    removeSavingMsg(this.curWinSelector);
				    addErrorMsg(this.curWinSelector, ERROR_OCCURRED_TRY_AGAIN);
					this.isError = true;
					return false;
				}
			});

        },

        /*
         * Function to wait for authentication call back in child window.
         */
		waitForAuthentication: async function(that, count) {
			count++;
			// Check if callback function called if called then exit from wait
			if (that.isCalled === true) {
				return true;
			} else {
			    // If callback function is not called and count is not reached to 180 then return error for timeout
				if (count === 180 || that.childWin.closed) {
					that.isError = true;
					return false;
				}
				// else call sleep and recall the same function
				await that.sleep(that.waitForAuthentication, that, count);
			}
		},

		/*
         * Function to wait for backend call get response from backend
         */
		 waitForBackendResponse: async function(that, count) {
			count++;
			// Check if callback function called if called then exit from wait
			if (that.isResponse === true) {
				return true;
			} else {
			    // If callback function is not called and count is not reached to 60 then return error for timeout
				if (count === 60) {
					return false;
				}
				// else call sleep and recall the same function
				await that.sleep(that.waitForBackendResponse, that, count);
			}
		},

		/*
         * This function first add sleep for 1 secs and the call the function passed in argument
         */
		sleep: async function(fn, ...args) {
			await this.timeout(1000);
			return fn(...args);
		},

        /*
         * This function will resolve the promise once the provided timeout occurs
         */
		timeout: function(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		},

		/*
		 * This function will get auth code end point provided in config file
		 */
		getAuthEndpoint: function() {
		    var ta_tabs = configManager.unifiedConfig.pages.configuration.tabs
            _.each(ta_tabs, (tab) => {
                if (tab.name === 'account') {
                    _.each(tab.entity, (elements) => {
                        if (elements.type === 'oauth') {
                            this.authCodeEndpoint = elements.options.auth_code_endpoint;
                            this.accessTokenEndpoint = elements.options.access_token_endpoint;
                            return false;
                        }
                    });
                    return false;
                }
            });
		}
    });
});
