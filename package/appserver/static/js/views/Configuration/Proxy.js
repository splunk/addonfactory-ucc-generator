import {defaultProxyTabEntity} from 'app/constants/defaultEntities';
import {configManager} from 'app/util/configManager';
import {generateModel} from 'app/util/backboneHelpers';
import {generateValidators} from 'app/util/validators';

define([
    'jquery',
    'lodash',
    'backbone',
    'app/views/configuration/ProxyTemplate.html',
    'app/templates/messages/SavingMsg.html',
    'app/templates/messages/ErrorMsg.html',
    'app/views/controls/ControlWrapper'
], function (
    $,
    _,
    Backbone,
    ProxyTemplate,
    SavingMsgTemplate,
    ErrorMsgTemplate,
    ControlWrapper
) {
    return Backbone.View.extend({
        initialize: function () {
            this.proxyConfig = _.find(configManager.unifiedConfig.pages.configuration.tabs, tab => {
                return tab.name === 'proxy';
            });
            const validators = generateValidators(this.proxyConfig.entity);
            const proxySettingModel = generateModel('settings', {validators});
            this.proxy = new proxySettingModel({
                name: "proxy"
            }, {});
            this.proxy.on("invalid", this.displayValidationError.bind(this));
        },

        render: function () {
            var deferred = this.proxy.fetch();
            deferred.done(function () {
                var controlOptions, entity, controlWrapper;
                this.model = this.proxy.entry.content.clone();

                this.model.set("disabled", !this.model.get("enable"));

                this.$el.html(_.template(ProxyTemplate));

                entity = this.proxyConfig.entity || defaultProxyTabEntity;

                this.children = [];
                _.each(entity, function (e) {
                    if (e.encrypted) {
                        this.encrypted_field = e.field;
                    }

                    controlOptions = {
                        model: this.model,
                        modelAttribute: e.field,
                        password: e.encrypted ? true : false
                    };
                    var option;
                    for (option in e.options) {
                        if (e.options.hasOwnProperty(option)) {
                            controlOptions[option] = e.options[option];
                        }
                    }
                    controlWrapper = new ControlWrapper({
                        label: e.label,
                        controlType: e.type,
                        required: e.required ? true : false,
                        help: e.help || null,
                        controlOptions: controlOptions
                    });
                    if (this.model.get(e.field) === undefined && e.defaultValue) {
                        this.model.set(e.field, e.defaultValue);
                    }
                    this.children.push(controlWrapper);
                }.bind(this));

                _.each(this.children, function (child) {
                    // Disable auto complete by browser when click the proxy type select
                    if (child.label === 'Username') {
                        this.$('.modal-body').append($('<input type="password" id="proxy_password" style="display: none" />'));
                    }
                    this.$('.modal-body').append(child.render().$el);
                }.bind(this));

                this.$("input[type=submit]").on("click", this.saveProxy.bind(this));

            }.bind(this));

            return this;
        },

        saveProxy: function () {
            var json, entity, attr_labels, self;
            this.model.set("disabled", !this.model.get("enable"));
            json = this.model.toJSON();

            this.proxy.entry.content.set(json);
            //Add label attribute for validation prompt
            entity = defaultProxyTabEntity;
            attr_labels = {};
            _.each(entity, function (e) {
                attr_labels[e.field] = e.label;
            });
            this.proxy.attr_labels = attr_labels;

            self = this;
            self.removeErrorMsg('.modal-body');
            self.addSavingMsg('.modal-body', 'Proxy Information');
            this.proxy.save(null, {
                success: function () {
                    self.removeSavingMsg('.modal-body');
                },
                error: function (model, response) {
                    self.removeSavingMsg('.modal-body');
                    self.addErrorMsg('.modal-body', self.parseErrorMsg(response));
                }
            });
        },

        displayValidationError: function (error) {
            this.removeSavingMsg('.modal-body');
            if (this.$('.msg-text').length) {
                this.$('.msg-text').text(error.validationError);
            } else {
                this.$(".modal-body").prepend(_.template(ErrorMsgTemplate)({msg: error.validationError}));
            }
        },

        addErrorMsg: function (container, text) {
            if (this.$(container + ' .msg-error').length) {
                this.$(container + ' .msg-text').text(text);
            } else {
                this.$(container + ".modal-body").prepend(_.template(ErrorMsgTemplate)({msg: text}));
            }
        },

        removeErrorMsg: function (container) {
            if (this.$(container + ' .msg-error').length) {
                this.$(container + ' .msg-error').remove();
            }
        },

        addSavingMsg: function (container, text) {
            if (this.$(container + ' .msg-loading').length) {
                this.$(container + ' .msg-text').text('Saving ' + text);
            } else {
                this.$(container + '.modal-body').prepend(_.template(SavingMsgTemplate)({msg: text}));
            }
        },

        removeSavingMsg: function (container) {
            if (this.$(container + ' .msg-loading').length) {
                this.$(container + ' .msg-loading').remove();
            }
        },

        parseErrorMsg: function (data) {
            var error_msg = '', rsp, regex, msg, matches;
            try {
                rsp = JSON.parse(data.responseText);
                regex = /In handler.+and output:\s+\'([\s\S]*)\'\.\s+See splunkd\.log for stderr output\./;
                msg = String(rsp.messages[0].text);
                matches = regex.exec(msg);
                if (!matches || !matches[1]) {
                    // try to extract another one
                    regex = /In handler[^:]+:\s+(.*)/;
                    matches = regex.exec(msg);
                    if (!matches || !matches[1]) {
                        matches = [msg];
                    }
                }
                error_msg = matches[1];
            } catch (err) {
                error_msg = "ERROR in processing the request";
            }
            return error_msg.replace(/Splunk Add-on REST Handler ERROR\[\d{1,6}\]\: /, '');
        }

    });
});
