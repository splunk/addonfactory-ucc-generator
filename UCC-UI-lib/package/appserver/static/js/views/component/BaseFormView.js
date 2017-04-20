import {configManager} from 'app/util/configManager';
import restEndpointMap from 'app/constants/restEndpointMap';
import {
    MODE_CLONE,
    MODE_CREATE,
    MODE_EDIT
} from 'app/constants/modes';
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

define([
    'jquery',
    'lodash',
    'backbone',
    'app/util/Util',
    'app/models/Base.Model',
    'app/templates/common/AddDialog.html',
    'app/templates/common/EditDialog.html',
    'app/templates/common/CloneDialog.html',
    'app/templates/common/TabTemplate.html',
    'app/views/controls/ControlWrapper'
], function (
    $,
    _,
    Backbone,
    Util,
    BaseModel,
    AddDialogTemplate,
    EditDialogTemplate,
    CloneDialogTemplate,
    TabTemplate,
    ControlWrapper
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
            });
            this.customValidators = [];
            this.model = new Backbone.Model({});

            const {entity, name, options: comOpt} = this.component;
            const validators = generateValidators(entity);
            const endpointUrl = restEndpointMap[name];
            const InputType = generateModel(endpointUrl ? '' : this.component.name, {
                modelName: name,
                fields: entity,
                endpointUrl,
                formDataValidatorRawStr: comOpt ? comOpt.saveValidator : undefined,
                onLoadRawStr: comOpt ? comOpt.onLoad : undefined,
                validators
            });

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
                displayValidationError(this.curWinSelector,  err);
            });

            /*
                We can't set onChange-hook up in the data fetching model.
                Since it will only be updated when user save form data.
            */
            this.model.on('change', this.onStateChange.bind(this));
            this.initModel();

            if (this.component.hook) {
                this.hookDeferred = this._load_hook(this.component.hook.src);
            }

            // Dependency field list
            this.dependencyMap = new Map();
            /**
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

                _.each(fields, (field, index) => {
                    let changeFields = this.dependencyMap.get(field);
                    if (changeFields) {
                        changeFields[e.field] = fields;
                    } else {
                        this.dependencyMap.set(field, {[e.field]: fields});
                    }
                });
            });

            // Add change event listener
            for (let [key, value] of this.dependencyMap) {
                this.model.on('change:' + key, () => {
                    for (let loadField in value) {
                        if (!value.hasOwnProperty(loadField)) {
                            continue;
                        }
                        let controlWrapper = _.find(this.children, child => {
                            return child.controlOptions &&
                                child.controlOptions.modelAttribute === loadField;
                        });
                        if (!controlWrapper) {
                            continue;
                        }
                        let data = {},
                            load = true;
                        _.each(value[loadField], dependency => {
                            let required = !!_.find(this.component.entity, e => {
                                return e.field === dependency;
                            }).required;
                            if (required && !this.model.get(dependency)) {
                                // Clear the control
                                this.model.set(loadField, '');
                                load = false;
                            } else {
                                data[dependency] = this.model.get(dependency, '');
                            }
                        });
                        if (load) {
                            // Add loading message
                            controlWrapper.control.startLoading();
                            controlWrapper.collection.fetch({
                                data,
                                error: (collection, response, options) => {
                                    addErrorMsg(
                                        this.curWinSelector,
                                        response,
                                        true
                                    )
                                }
                            });
                        }
                    }
                });
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

        onStateChange: function() {
            const onChangeHookRawStr = _.get(this.component, ['options', 'onChange']);
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
            // Disable the button to prevent repeat submit
            Util.disableElements(
                this.$("button[type=button]"),
                this.$("input[type=submit]")
            );
            // Remove loading and error message
            removeErrorMsg(this.curWinSelector);
            removeSavingMsg(this.curWinSelector);
            // Save the model
            this.saveModel();
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
                for (let prop in obj) {
                    if(obj.hasOwnProperty(prop)){
                        this.real_model.addValidation(prop, obj[prop]);
                    }
                }
            });

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
                addSavingMsg(this.curWinSelector, getFormattedMessage(108));
                // Add onSave hook if it exists
                if (this.hook) {
                    this.hook.onSave();
                }
                deffer.done(() => {
                    // Add onSaveSuccess hook if it exists
                    if (this.hook) {
                        this.hook.onSaveSuccess();
                    }
                    this.successCallback(input);
                }).fail((model, response) => {
                    // Add onSaveSuccess hook if it exists
                    if (this.hook) {
                        this.hook.onSaveSuccess();
                    }

                    input.entry.content.set(original_json);
                    // Re-enable buttons when failed
                    Util.enableElements(
                        this.$("button[type=button]"),
                        this.$("input[type=submit]")
                    );
                    removeSavingMsg(this.curWinSelector);
                    addErrorMsg(this.curWinSelector, model, true);
                });
            }
            return deffer;
        },

        _load_hook: function (module) {
            let deferred = $.Deferred();
            __non_webpack_require__(['custom/' + module], (Hook) => {
                this.hook = new Hook(
                    this.context,
                    this.model,
                    this.component.name
                );
                deferred.resolve(Hook);
            });
            return deferred.promise();
        },

        _load_module: function(module, modelAttribute, model, serviceName, index) {
            let deferred = $.Deferred();
            __non_webpack_require__(['custom/' + module], (CustomControl) => {
                let el = document.createElement("DIV");
                let control = new CustomControl(el, modelAttribute, model, serviceName);
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
            this.renderTemplate();

            this.children = [];
            this.deferreds = [];
            _.each(this.component.entity, (e, index) => {
                let controlWrapper, controlOptions, deferred;
                if (this.mode === MODE_CREATE) {
                    if (this.model.get(e.field) === undefined &&
                        e.defaultValue !== undefined) {
                        this.model.set(e.field, e.defaultValue);
                    }
                }

                controlOptions = {
                    model: this.model,
                    modelAttribute: e.field,
                    password: e.encrypted ? true : false,
                    displayText: e.displayText,
                    helpLink: e.helpLink,
                    elementId: `${this.component.name}-${e.field}`
                };
                _.extend(controlOptions, e.options);

                if(e.type === 'custom') {
                    deferred = this._load_module(
                        e.options.src,
                        controlOptions.modelAttribute,
                        controlOptions.model,
                        this.component.name,
                        index
                    );
                    this.deferreds.push(deferred);
                } else {
                    controlWrapper = new ControlWrapper({...e, controlOptions});

                    if (e.options && e.options.display === false) {
                        controlWrapper.$el.css("display", "none");
                    }
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
                let groups = [];
                if (this.component.groups) {
                    _.each(this.component.groups, group => {
                        const {label, options} = group;
                        let controls = [];
                        _.each(group.fields, field => {
                            let controlDefinition =
                                this.component.entity.find((e) => {
                                    return e.field === field;
                                });
                            let index = this.children.findIndex((child) => {
                                return (controlDefinition &&
                                    controlDefinition.type === 'custom' &&
                                    child.field === field) ||
                                    ('controlOptions' in child &&
                                    child.controlOptions.modelAttribute ===
                                    field);
                            });
                            if (index > -1) {
                                controls.push(this.children[index]);
                                this.children.splice(index, 1);
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
                    let childComponent = child.render();
                    this.$('.modal-body').append(
                        childComponent.$el || childComponent.el
                    );
                });

                // Disable the name field in edit mode
                if (this.mode === MODE_EDIT) {
                    this.$("input[name=name]").attr("readonly", "readonly");
                }
                this.$("input[type=submit]").on("click", this.submitTask.bind(this));
                // Add guid to current dialog
                this.addGuid();
            });

            if (this.hookDeferred) {
                this.hookDeferred.then(() => {
                    this.hook.onCreate();
                });
            }
            return this;
        }
    });
});
