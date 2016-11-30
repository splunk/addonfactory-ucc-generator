import {configManager} from 'app/util/configManager';
import restEndpointMap from 'app/constants/restEndpointMap';
import {generateModel, generateCollection} from 'app/util/backboneHelpers';
import {generateValidators} from 'app/util/validators';

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
    'app/templates/messages/ErrorMsg.html',
    'app/templates/messages/LoadingMsg.html',
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
    ErrorMsg,
    LoadingMsg,
    ControlWrapper
) {
    return Backbone.View.extend({
        initialize: function (options) {
            this.unifiedConfig = configManager.unifiedConfig;
            this.appData = configManager.getAppData();
            _.extend(this, options);

            //guid of current dialog
            this.currentWindow = Util.guid();
            //Encrypted field list
            this.encryptedFields = [];
            _.each(this.component.entity, e => {
                if (e.encrypted) {
                    this.encryptedFields.push(e.field);
                }
            });

            //Delete encrypted field in delete or clone mode
            if (options.model && this.encryptedFields.length) {
                _.each(this.encryptedFields, f => {
                    delete options.model.entry.content.attributes[f];
                });
            }

            this.model = new Backbone.Model({});

            const validators = generateValidators(this.component.entity);
            const customizedUrl = restEndpointMap[this.component.name];
            const InputType = generateModel(customizedUrl ? '' : this.component.name, {customizedUrl, validators});

            if (!options.model) { //Create mode
                this.mode = "create";
                this.model = new Backbone.Model({});
                this.real_model = new InputType(null, {
                    appData: this.appData,
                    collection: this.collection
                });
            } else if (this.mode === "edit") { //Edit mode
                this.model = options.model.entry.content.clone();
                this.model.set({name: options.model.entry.get("name")});
                this.real_model = options.model;
            } else if (this.mode === "clone") { //Clone mode
                this.model = options.model.entry.content.clone();
                //Unset the name attribute if the model is newly created
                if (this.model.get("name")) {
                    this.model.unset("name");
                }
                //Unset the refCount attribute
                if (this.model.get("refCount")) {
                    this.model.unset("refCount");
                }
                this.cloneName = options.model.entry.get("name");
                this.real_model = new InputType({
                    appData: this.appData,
                    collection: this.collection
                });
            }
            this.real_model.on("invalid", this.displayValidationError.bind(this));
        },

        modal: function () {
            this.$("[role=dialog]").modal({backdrop: 'static', keyboard: false});
        },

        submitTask: function () {
            //Disable the button to prevent repeat submit
            this.$("input[type=submit]").attr('disabled', true);
            // Remove loading and error message
            this.removeErrorMsg();
            this.removeLoadingMsg();
            //Save the model
            this.saveModel();
        },

        saveModel: function () {
            var input = this.real_model,
                new_json = this.model.toJSON(),
                original_json = input.entry.content.toJSON(),
                //Add label attribute for validation prompt
                entity = this.component.entity,
                attr_labels = {};
            _.each(entity, function (e) {
                attr_labels[e.field] = e.label;
            });

            input.entry.content.set(new_json);
            input.attr_labels = attr_labels;

            return this.save(input, original_json);
        },

        save: function (input, original_json) {
            var deffer = input.save();

            if (!deffer.done) {
                input.entry.content.set(original_json);
                input.trigger('change');
                //Re-enable when failed
                this.$("input[type=submit]").removeAttr('disabled');
            } else {
                this.addLoadingMsg("Saving...");
                deffer.done(function () {
                    //Delete encrypted field before adding to collection
                    if (this.encryptedFields.length) {
                        _.each(this.encryptedFields, f => {
                            delete input.entry.content.attributes[f];
                        });
                    }
                    this.collection.trigger('change');

                    //Add model to collection
                    if (this.mode !== 'edit') {
                        this.collection.add(input);
                        if (this.collection.length !== 0) {
                            _.each(this.collection.models, function (model) {
                                model.paging.set('total', this.collection.length);
                            }.bind(this));
                        }

                        //Trigger collection page change event to refresh the count in table caption
                        this.collection.paging.set('total', this.collection.models.length);
                        //Rerender the table
                        this.collection.reset(this.collection.models);

                        //trigger type change event
                        // TODO: Change me
                        //if (this.dispatcher) {
                        //this.dispatcher.trigger('filter-change',this.service_type);
                        //}
                    }
                    this.$("[role=dialog]").modal('hide');
                    this.undelegateEvents();
                }.bind(this)).fail(function (model, response) {
                    input.entry.content.set(original_json);
                    input.trigger('change');
                    // re-enable when failed
                    this.$("input[type=submit]").removeAttr('disabled');
                    this.removeLoadingMsg();
                    this.displayError(model, response);
                }.bind(this));
            }
            return deffer;
        },

        render: function () {
            var templateMap = {
                    "create": AddDialogTemplate,
                    "edit": EditDialogTemplate,
                    "clone": CloneDialogTemplate
                },
                template = _.template(templateMap[this.mode]),
                jsonData = this.mode === "clone" ? {
                    name: this.cloneName,
                    title: this.component.title
                } : {
                    title: this.component.title,
                    isInput: this.isInput
                },
                entity = this.component.entity;

            this.$el.html(template(jsonData));

            this.$("[role=dialog]").on('hidden.bs.modal', () => {
                this.undelegateEvents();
            });

            this.children = [];
            _.each(entity, function (e) {
                var option, controlWrapper, controlOptions;
                if (this.model.get(e.field) === undefined && e.defaultValue) {
                    this.model.set(e.field, e.defaultValue);
                }

                controlOptions = {
                    model: this.model,
                    modelAttribute: e.field,
                    password: e.encrypted ? true : false,
                    displayText: e.displayText,
                    helpLink: e.helpLink
                };
                _.extend(controlOptions, e.options);

                controlWrapper = new ControlWrapper({...e, controlOptions});

                if (e.display !== undefined) {
                    controlWrapper.$el.css("display", "none");
                }

                this.children.push(controlWrapper);
            }.bind(this));

            _.each(this.children, function (child) {
                this.$('.modal-body').append(child.render().$el);
            }.bind(this));

            //Disable the name field in edit mode
            if (this.mode === 'edit') {
                this.$("input[name=name]").attr("readonly", "readonly");
            }
            this.$("input[type=submit]").on("click", this.submitTask.bind(this));
            //Add hidden input field to disable autocomplete
            // if (this.component.model === Account) {
            //     this.$('.modal-body').prepend('<input type="password" id="password" style="display: none"/>');
            // }
            //Add guid to current dialog
            this.$(".modal-body").addClass(this.currentWindow);

            return this;
        },

        displayValidationError: function (error) {
            this.removeLoadingMsg();
            if (this.$('.msg-text').length) {
                this.$('.msg-text').text(_(error.validationError).t());
            } else {
                this.$("." + this.currentWindow).prepend(_.template(ErrorMsg)({
                    msg: _(error.validationError).t()
                }));
            }
        },

        addErrorMsg: function (text, guid) {
            if (this.$('.msg-error').length) {
                this.$('.msg-error > .msg-text').text(_(text).t());
            } else {
                this.$("." + guid).prepend(_.template(ErrorMsg)({msg: _(text).t()}));
            }
        },

        removeErrorMsg: function () {
            if (this.$('.msg-error').length) {
                this.$('.msg-error').remove();
            }
        },

        addLoadingMsg: function (text) {
            if (this.$('.msg-loading').length) {
                this.$('.msg-loading > .msg-text').text(_(text).t());
            } else {
                this.$("." + this.currentWindow).prepend(_.template(LoadingMsg)({msg: _(text).t()}));
            }
        },

        removeLoadingMsg: function () {
            if (this.$('.msg-loading').length) {
                this.$('.msg-loading').remove();
            }
        },

        parseAjaxError: function (model) {
            var rsp = JSON.parse(model.responseText),
                regx = /In handler.+and output:\s+\'([\s\S]*)\'\.\s+See splunkd\.log for stderr output\./,
                msg = String(rsp.messages[0].text),
                matches = regx.exec(msg);
            if (!matches || !matches[1]) {
                // try to extract another one
                regx = /In handler[^:]+:\s+(.*)/;
                matches = regx.exec(msg);
                if (!matches || !matches[1]) {
                    return msg;
                }
            }
            return matches[1];
        },

        displayError: function (model) {
            this.addErrorMsg(this.parseAjaxError(model), this.currentWindow);
        },

        // TODO: delete this method after we fix the missing "default" in index selector.
        _loadIndex: function (controlWrapper) {
            const indexes = generateCollection('indexes');
            const indexDeferred = indexes.fetch();
            indexDeferred.done(function () {
                let id_lst = _.map(indexes.models, model => {
                    return {
                        label: model.entry.attributes.name,
                        value: model.entry.attributes.name
                    };
                });

                //Ensure the model's index value in list
                id_lst = this._ensureIndexInList(id_lst);

                if (_.find(id_lst, function (item) {
                        return item.value === "default";
                    }) === undefined) {
                    id_lst = id_lst.concat({
                        label: "default",
                        value: "default"
                    });
                }
                controlWrapper.control.setAutoCompleteFields(id_lst, true);
            }.bind(this)).fail(function () {
                this.addErrorMsg("Failed to load index", this.currentWindow);
            }.bind(this));
        },

        _ensureIndexInList: function (data) {
            var selected_value = this.model.get('index'),
                selected_value_item = [];
            if (selected_value) {
                selected_value_item = {label: selected_value, value: selected_value};
            }
            if (_.find(data, function (item) {
                    return item.value === selected_value_item.value;
                }) === undefined) {
                data = data.concat(selected_value_item);
            }
            return data;
        }
    });
});
