import {defaultLoggingTabEntity} from 'app/constants/defaultEntities';
import {configManager} from 'app/util/configManager';
import {generateModel} from 'app/util/backbone';

define([
    'jquery',
    'lodash',
    'backbone',
    'app/views/configuration/LoggingTemplate.html',
    'app/templates/messages/SavingMsg.html',
    'app/templates/messages/ErrorMsg.html',
    'app/views/controls/ControlWrapper',
    'splunk.util',
    'app/util/Util'
], function (
    $,
    _,
    Backbone,
    LoggingTemplate,
    SavingMsgTemplate,
    ErrorMsgTemplate,
    ControlWrapper,
    SplunkdUtil,
    Util
) {
    return Backbone.View.extend({
        initialize: function () {
            this.loggingConfig = _.find(configManager.unifiedConfig.pages.configuration.tabs, tab => {
                return tab.name === 'logging';
            });
            const loggingSettingModel = generateModel('settings');
            this.logging = new loggingSettingModel({
                name: "logging"
            }, {});
            this.logging.on("invalid", this.displayValidationError.bind(this));
        },

        render: function () {
            var deferred = this.logging.fetch();
            deferred.done(function () {
                this.model = this.logging.entry.content.clone();

                this.$el.html(_.template(LoggingTemplate));
                entity = this.loggingConfig.entity || defaultLoggingTabEntity;
                this.children = [];
                _.each(entity, function (e) {
                    if (e.encrypted) {
                        this.encrypted_field = e.field;
                    }
                    self = this;
                    controlOptions = {
                        model: self.model,
                        modelAttribute: e.field,
                        password: e.encrypted ? true : false
                    };
                    var option;
                    for (option in e.options) {
                        if (e.options.hasOwnProperty(option)) {
                            controlOptions[option] = e.options[option];
                        }
                    }
                    this.children.push(new ControlWrapper({
                        label: e.label,
                        controlType: e.type,
                        wrapperClass: e.field,
                        required: e.required ? true : false,
                        help: e.help || null,
                        controlOptions: controlOptions
                    }));
                    if (this.model.get(e.field) === undefined && e.defaultValue) {
                        this.model.set(e.field, e.defaultValue);
                    }
                }.bind(this));

                _.each(this.children, function (child) {
                    this.$('.modal-body').append(child.render().$el);
                }.bind(this));

                this.$("input[type=submit]").on("click", this.saveLogging.bind(this));
            }.bind(this));

            return this;
        },

        saveLogging: function () {
            var json, entity, attr_labels, self;
            json = this.model.toJSON();
            this.logging.entry.content.set(json);
            //Add label attribute for validation prompt
            entity = defaultLoggingTabEntity;
            attr_labels = {};
            _.each(entity, function (e) {
                attr_labels[e.field] = e.label;
            });
            this.logging.attr_labels = attr_labels;

            self = this;
            self.removeErrorMsg('.modal-body');
            self.addSavingMsg('.modal-body', 'Logging Information');
            this.logging.save(null, {
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
