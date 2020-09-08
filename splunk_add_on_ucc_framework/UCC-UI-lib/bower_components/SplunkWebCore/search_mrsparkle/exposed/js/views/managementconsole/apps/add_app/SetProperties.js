/**
 * Created by rtran on 2/23/16.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/MultiInputControl',
    'views/shared/controls/SyntheticRadioControl',
    'views/shared/FlashMessagesLegacy',
    'models/managementconsole/App',
    'collections/shared/FlashMessages',
    'splunk.util',
    'contrib/text!views/managementconsole/apps/add_app/SetProperties.html',
    'views/managementconsole/shared.pcss',
    './SetProperties.pcss'
], function(
    $,
    _,
    Backbone,
    module,
    BaseView,
    MultiInputControl,
    SyntheticRadioControl,
    FlashMessagesLegacyView,
    AppModel,
    FlashMessagesCollection,
    splunkUtils,
    Template,
    cssShared,
    css
) {
    var LOCATION = AppModel.LOCATION,
        AFTER_INSTALLATION = AppModel.AFTER_INSTALLATION,
        STRINGS = {
            SELECT_LOCATION: _('Choose context').t(),
            AFTER_INSTALLATION: _('After installation').t(),
            AFTER_INSTALLATION_DESCRIPTION: _('Select an action that will be performed on all selected forwarders once app installation is complete.').t()
        };

    return BaseView.extend({
        template: Template,
        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.showFlashMessages = !!this.options.showFlashMessages;

            this.collection = this.collection || {};
            this.collection.flashMessages = this.collection.flashMessages || new FlashMessagesCollection();

            this.model._workingModel = new Backbone.Model();
            this.hasWizard = !!this.model.wizard;

            var groups = this.model.appModel.entry.content.get('groups'),
                afterInstallation = this.model.appModel.entry.content.get('afterInstallation');

            if (_.contains(groups, '_forwarders')) {
                this.model._workingModel.set('groupLocationType', LOCATION.ALL);
            } else if (_.isArray(groups) && _.isEmpty(groups)) {
                this.model._workingModel.set('groupLocationType', LOCATION.NONE);
            } else if (_.isArray(groups) && !_.isEmpty(groups)) {
                this.model._workingModel.set('groupLocationType', LOCATION.SERVER_CLASS);
                this.model._workingModel.set('groups', splunkUtils.fieldListToString(groups));
            } else {
                this.model._workingModel.set('groupLocationType', LOCATION.NONE);
                this.model.appModel.entry.content.set('groups', []);
            }

            if (_.isUndefined(afterInstallation)) {
                this.model._workingModel.set('afterInstallation', AFTER_INSTALLATION.DO_NOTHING.value);
                this.model.appModel.entry.content.set('afterInstallation', AFTER_INSTALLATION.DO_NOTHING.value);
            } else {
                this.model._workingModel.set('afterInstallation', afterInstallation);
            }

            if (this.showFlashMessages) {
                this.children.flashMessagesLegacyView = new FlashMessagesLegacyView({
                    collection: this.collection.flashMessages
                });
            }

            this.children.locationControl = new SyntheticRadioControl({
                model: this.model._workingModel,
                modelAttribute: 'groupLocationType',
                items: [
                    { label: _('No Forwarders').t(), value: LOCATION.NONE },
                    { label: _('All forwarders').t(), value: LOCATION.ALL },
                    { label: _('Selected server classes').t(), value: LOCATION.SERVER_CLASS }
                ],
                defaultValue: LOCATION.NONE
            });

            var data = [];
            this.collection.groups.each(function (model) {
                var name = model.getDisplayName();
                data.push({id: name, text: name});
            });

            this.children.groupsControl = new MultiInputControl({
                model: this.model._workingModel,
                modelAttribute: 'groups',
                placeholder: _('Enter Server Class Name').t(),
                data: data
            });

            this.children.afterInstallationControl = new SyntheticRadioControl({
                model: this.model._workingModel,
                modelAttribute: 'afterInstallation',
                items: [
                    { label: AFTER_INSTALLATION.DO_NOTHING.label, value: AFTER_INSTALLATION.DO_NOTHING.value },
                    { label: AFTER_INSTALLATION.RESTART_SPLUNKD.label, value: AFTER_INSTALLATION.RESTART_SPLUNKD.value },
                    { label: AFTER_INSTALLATION.ISSUE_RELOAD.label, value: AFTER_INSTALLATION.ISSUE_RELOAD.value }
                ],
                defaultValue: AFTER_INSTALLATION.DO_NOTHING.value
            });

            this.listenTo(this.model._workingModel, 'change:groupLocationType', function(model, groupLocationType) {
                if (groupLocationType === LOCATION.ALL) {
                    this.model.appModel.entry.content.set('groups', ['_forwarders']);
                } else if (groupLocationType === LOCATION.SERVER_CLASS) {
                    var groups = this.model._workingModel.get('groups');
                    if (!_.isUndefined(groups)) {
                        groups = _.filter(groups.split(','), function(group) {
                            return group != '_forwarders';
                        });
                    } else {
                        groups = [];
                    }
                    this.model.appModel.entry.content.set('groups', groups);
                    this.model._workingModel.set('groups', groups.join());
                } else if (groupLocationType === LOCATION.NONE) {
                    this.model.appModel.entry.content.set('groups', []);
                }

                this._renderGroupsInputControl();

            }, this);

            this.listenTo(this.model._workingModel, 'change:groups', function(model, groups) {
                this.model.appModel.entry.content.set('groups', groups.split(','));
            }, this);

            this.listenTo(this.model._workingModel, 'change:afterInstallation', function(model, afterInstallation) {
                this.model.appModel.entry.content.set('afterInstallation', afterInstallation);
            }, this);
        },

        render: function() {
            this.$el.append(this.compiledTemplate({
                Strings: STRINGS
            }));

            if (this.showFlashmessages) {
                this.$('.flash-messages-placeholder').append(this.children.flashMessagesLegacyView.render().el);
            }
            this.$('.radio-container').append(this.children.locationControl.render().el);
            this.$('.groups-container').append(this.children.groupsControl.render().el);
            this.$('.after-installation-container').append(this.children.afterInstallationControl.render().el);

            this._renderGroupsInputControl();

            return this;
        },

        _renderGroupsInputControl: function() {
            this.model._workingModel.get('groupLocationType') === LOCATION.SERVER_CLASS ?
                this.$('.groups-container').show() :
                this.$('.groups-container').hide();
        }
    });
});