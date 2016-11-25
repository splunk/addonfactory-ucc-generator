import {configManager} from 'app/util/configManager';
import {generateModel} from 'app/util/backboneHelpers';
import {
    addErrorMsg,
    removeErrorMsg,
    addSavingMsg,
    removeSavingMsg,
    displayValidationError
} from 'app/util/promptMsgController';

define([
    'jquery',
    'lodash',
    'backbone',
    'app/views/configuration/LoggingTemplate.html',
    'app/views/controls/ControlWrapper',
], function (
    $,
    _,
    Backbone,
    LoggingTemplate,
    ControlWrapper,
) {
    return Backbone.View.extend({
        initialize: function ({containerId}) {
            this.loggingConfig = _.find(configManager.unifiedConfig.pages.configuration.tabs, tab => {
                return tab.name === 'logging';
            });
            const loggingSettingModel = generateModel('settings');
            this.logging = new loggingSettingModel({name: 'logging'});
            this.logging.on('invalid', this.onValidationInvalid.bind(this));
            this.msgContainerId = `${containerId} .modal-body`;
        },

        render: function () {
            var deferred = this.logging.fetch();
            deferred.done(function () {
                this.model = this.logging.entry.content.clone();

                this.$el.html(_.template(LoggingTemplate));
                entity = this.loggingConfig.entity;
                this.children = [];
                _.each(entity, function (e) {
                    controlOptions = {
                        ...e.options,
                        model: this.model,
                        modelAttribute: e.field,
                        password: !!e.encrypted
                    };
                    this.children.push(new ControlWrapper({...e, controlOptions}));
                    if (this.model.get(e.field) === undefined && e.defaultValue) {
                        this.model.set(e.field, e.defaultValue);
                    }
                }.bind(this));

                _.each(this.children, function (child) {
                    this.$('.modal-body').append(child.render().$el);
                }.bind(this));

                this.$('input[type=submit]').on('click', this.saveLogging.bind(this));
            }.bind(this));

            return this;
        },

        saveLogging: function () {
            var json, entity, attr_labels;
            json = this.model.toJSON();
            this.logging.entry.content.set(json);
            //Add label attribute for validation prompt
            entity = this.loggingConfig.entity;
            attr_labels = {};
            _.each(entity, function (e) {
                attr_labels[e.field] = e.label;
            });
            this.logging.attr_labels = attr_labels;

            removeErrorMsg(this.msgContainerId);
            addSavingMsg(this.msgContainerId, 'Saving');
            this.logging.save(null, {
                success: () => removeSavingMsg(this.msgContainerId),
                error: (model, response) => {
                    removeSavingMsg(this.msgContainerId);
                    addErrorMsg(this.msgContainerId, response, true);
                }
            });
        },

        onValidationInvalid: function (error) {
            displayValidationError(this.msgContainerId,  error);
        }
    })
})
