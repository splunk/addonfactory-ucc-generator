/*global define,console,window,addEventListener,attachEvent*/
define([
    'jquery',
    'underscore',
    'backbone',
    'app/models/appData',
    'app/util/Util',
    'app/templates/Common/AddDialog.html',
    'app/templates/Common/EditDialog.html',
    'app/templates/Common/CloneDialog.html',
    'app/templates/Common/TabTemplate.html',
    'app/templates/Models/ErrorMsg.html',
    'app/templates/Models/LoadingMsg.html',
    'app/views/Models/ControlWrapper',
    'app/models/Account',
    // 'app/models/Nessus',
    'app/collections/Indexes',
    'app/collections/Accounts'
], function (
    $,
    _,
    Backbone,
    appData,
    Util,
    AddDialogTemplate,
    EditDialogTemplate,
    CloneDialogTemplate,
    TabTemplate,
    ErrorMsg,
    LoadingMsg,
    ControlWrapper,
    Account,
    // Nessus,
    Indexes,
    Accounts
) {
    return Backbone.View.extend({
        initialize: function (options) {
            this.collection = options.collection;
            this.mode = options.mode;
            this.dispatcher = options.dispatcher;
            this.component = options.component;
            this.isInput = options.isInput;

            //guid of current dialog
            this.currentWindow = Util.guid();
            //Encrypted field list
            this.encrypted_field = [];
            _.each(this.component.entity, function(e){
                if (e.encrypted) {
                    this.encrypted_field.push(e.field);
                }
            }.bind(this));

            this.model = new Backbone.Model({});

            var InputType;

            //Delete encrypted field in delete or clone mode
            if (options.model && this.encrypted_field.length) {
                _.each(this.encrypted_field, function (f) {
                    delete options.model.entry.content.attributes[f];
                }.bind(this));
            }

            if (!options.model) { //Create mode
                this.mode = "create";
                this.model = new Backbone.Model({});
                InputType = this.component.model;
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
                InputType = this.component.model;
                this.real_model = new InputType({
                    appData: this.appData,
                    collection: this.collection
                });
            }
            this.real_model.on("invalid", this.displayValidationError.bind(this));
            //Listen to metrics select change
            var self = this;
            this.model.on('change:metric', function () {
                var metric = self.model.get("metric");

                if (metric === 'nessus_scan') {
                    self.model.set('interval', '86400');
                } else {
                    self.model.set('interval', '604800');
                }
            });
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
                    if (this.encrypted_field.length) {
                        _.each(this.encrypted_field, function (f) {
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
            var template_map = {
                    "create": AddDialogTemplate,
                    "edit": EditDialogTemplate,
                    "clone": CloneDialogTemplate
                },
                template = _.template(template_map[this.mode]),
                json_data = this.mode === "clone" ? {
                    name: this.cloneName,
                    title: this.component.title
                } : {
                    title: this.component.title,
                    isInput: this.isInput
                },
                entity = this.component.entity;

            this.$el.html(template(json_data));

            this.$("[role=dialog]").on('hidden.bs.modal', function () {
                this.undelegateEvents();
            }.bind(this));

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

                for (option in e.options) {
                    if (e.options.hasOwnProperty(option)) {
                        controlOptions[option] = e.options[option];
                    }
                }

                controlWrapper = new ControlWrapper({
                    label: _(e.label).t(),
                    controlType: e.type,
                    wrapperClass: e.field,
                    required: e.required ? true : false,
                    help: e.help || null,
                    controlOptions: controlOptions
                });

                if (e.field === 'index') {
                    this._loadIndex(controlWrapper);
                }
                if (e.field === 'account') {
                    this._loadAccount(controlWrapper);
                }
                if (e.display !== undefined) {
                    controlWrapper.$el.css("display", "none");
                }

                this.children.push(controlWrapper);
            }.bind(this));

            _.each(this.children, function (child) {
                this.$('.modal-body').append(child.render().$el);
            }.bind(this));

            if (this.component.tabs) {
                this.renderSetting();
            }

            //Disable the name field in edit mode
            if (this.mode === 'edit') {
                this.$("input[name=name]").attr("readonly", "readonly");
            }

            this.$("input[type=submit]").on("click", this.submitTask.bind(this));

            //Add hidden input field to disable autocomplete
            if (this.component.model === Account) {
                this.$('.modal-body').prepend('<input type="password" id="password" style="display: none"/>');
            }
            // if (this.component.model === Nessus) {
            //     this.$('.modal-body').prepend('<input type="password" id="access_key" style="display: none"/>');
            // }

            //Add guid to current dialog
            this.$(".modal-body").addClass(this.currentWindow);

            return this;
        },

        renderSetting: function () {
            $(".modal-body").append(_.template(TabTemplate));

            var tab_title_template = '<li <% if (active) { %> class="active" <% } %>><a data-toggle="tab" href="#<%= token%>-tab" id="<%= token%>-li"><%= title%></a></li>',
                tab_content_template = '<div id="<%= token%>-tab" class="tab-pane <% if (active){ %>active<% } %>"></div>',
                tabs = this.component.tabs,
                k,
                token,
                active,
                children,
                i,
                renderTab = function (e) {
                    var option, controlOptions, controlWrapper;

                    controlOptions = {
                        model: this.model,
                        modelAttribute: e.field,
                        password: e.encrypted ? true : false
                    };
                    for (option in e.options) {
                        if (e.options.hasOwnProperty(option)) {
                            controlOptions[option] = e.options[option];
                        }
                    }
                    controlWrapper = new ControlWrapper({
                        label: _(e.label).t(),
                        controlType: e.type,
                        wrapperClass: e.field,
                        required: e.required ? true : false,
                        help: e.help || null,
                        controlOptions: controlOptions
                    });

                    if (e.field === 'index') {
                        this._loadIndex(controlWrapper);
                    }
                    children.push(controlWrapper);
                },
                appendToTab = function (token, child) {
                    $("#" + token + "-tab").append(child.render().$el);
                };

            for (k in tabs) {
                if (tabs.hasOwnProperty(k)) {
                    token = k.toLowerCase().replace(' ', '-');
                    active = tabs[k].active;

                    $(".nav-tabs").append(_.template(tab_title_template, {title: k, token: token, active: active}));
                    $(".tab-content").append(_.template(tab_content_template, {token: token, active: active}));
                    children = [];
                    for (i = 0; i < tabs[k].length; i += 1) {
                        renderTab(tabs[k][i]);
                    }

                    for (i = 0; i < children.length; i += 1) {
                        appendToTab(token, children[i]);
                    }

                    //Make the first tab active
                    $(".modal-body .nav-tabs li:first-child").addClass("active");
                    $(".modal-body .tab-content div:first-child").addClass("active");
                }
            }
        },

        displayValidationError: function (error) {
            this.removeLoadingMsg();
            if (this.$('.msg-text').length) {
                this.$('.msg-text').text(error.validationError);
            } else {
                this.$("." + this.currentWindow).prepend(_.template(ErrorMsg, {msg: error.validationError}));
            }
        },

        addErrorMsg: function (text, guid) {
            if (this.$('.msg-error').length) {
                this.$('.msg-error > .msg-text').text(text);
            } else {
                this.$("." + guid).prepend(_.template(ErrorMsg, {msg: text}));
            }
        },

        removeErrorMsg: function () {
            if (this.$('.msg-error').length) {
                this.$('.msg-error').remove();
            }
        },

        addLoadingMsg: function (text) {
            if (this.$('.msg-loading').length) {
                this.$('.msg-loading > .msg-text').text(text);
            } else {
                this.$("." + this.currentWindow).prepend(_.template(LoadingMsg, {msg: text}));
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

        _loadIndex: function (controlWrapper) {
            var indexes = new Indexes([], {
                appData: {app: appData.get("app"), owner: appData.get("owner")},
                targetApp: Util.getAddonName(),
                targetOwner: "nobody"
            });
            indexes.deferred = indexes.fetch();
            indexes.deferred.done(function () {
                var id_lst = _.map(indexes.models[0].attributes.entry[0].content.indexes, function (index) {
                    return {
                        label: index,
                        value: index
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

        _loadAccount: function (controlWrapper) {
            this.accounts = new Accounts([], {
                appData: {app: appData.get("app"), owner: appData.get("owner")},
                targetApp: this.addonName,
                targetOwner: "nobody"
            });
            var accounts_defered = this.accounts.fetch();
            accounts_defered.done(function () {
                var dic = _.map(this.accounts.models, function (account) {
                    return {
                        label: account.entry.attributes.name,
                        value: account.entry.attributes.name
                    };
                });

                controlWrapper.control.setAutoCompleteFields(dic, true);
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
