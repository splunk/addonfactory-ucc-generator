// displays general & advanced script inputs
// @author: lbudchekno
define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'models/shared/Cron',
    'collections/shared/FlashMessages',
    'views/shared/FlashMessagesLegacy',
    'views/shared/ScheduleSentence',
    'views/Base',
    'views/shared/controls/ControlGroup',
    'views/managementconsole/shared/FileInputControl'
], function (
    _,
    $,
    Backbone,
    module,
    Cron,
    FlashMessagesCollection,
    FlashMessagesLegacyView,
    ScheduleSentence,
    BaseView,
    ControlGroup,
    FileInputControl
) {
    var MAX_PRIVATE_KEY_SIZE = 10000000,
        ERROR_MSG_INVALID_PRIVATE_KEY_SIZE = _('Uploaded script is too large.').t();

    return BaseView.extend({
        moduleId: module.id,
        tagName: 'div',
        className: 'modal-step form-horizontal',

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);

            var isNew = this.model.entity.isNew();

            this.model._upload = new Backbone.Model();

            this.collection = this.collection || {};
            this.collection.flashMessages = new FlashMessagesCollection();

            this.children.flashMessagesLegacy = new FlashMessagesLegacyView({
                collection: this.collection.flashMessages
            });

            if (isNew) {
                this.children.uploadScript = new FileInputControl({
                    modelAttribute: 'script',
                    fileNameModelAttribute: 'filename',
                    model: this.model.entity,
                    label: this.model.entity.getLabel('name'),
                    help: this.model.entity.getHelpText('name'),
                    maxFileSize: MAX_PRIVATE_KEY_SIZE
                });
                this.model.entity.entry.content.set('intervalSelection', 'In Seconds');
            } else {
                this.children.scriptName = new ControlGroup({
                    className: 'scriptname control-group',
                    controlType: 'Text',
                    controlOptions: {
                        model: this.model.entity.entry,
                        modelAttribute: 'name'
                    },
                    label: this.model.entity.getLabel('scriptname'),
                    enabled: false
                });
            }

            // unfortunately backend does not provide us this state.
            // try your best to guess if the interval is in seconds or a cron schedule
            if (_.isEmpty(this.model.entity.entry.content.get('intervalSelection'))) {
                var number = parseInt(this.model.entity.entry.content.get('interval'), 10);
                // cheating
                if (number == this.model.entity.entry.content.get('interval')) {
                    this.model.entity.entry.content.set('intervalSelection', 'In Seconds');
                } else {
                    this.model.entity.entry.content.set('intervalSelection', 'Cron Schedule');
                }
            }
            this.children.intervalSelect = new ControlGroup({
                className: 'net-port control-group interSel',
                controlType: 'SyntheticSelect',
                controlOptions: {
                    modelAttribute: 'intervalSelection',
                    model: this.model.entity.entry.content,
                    items: [
                        {value: 'In Seconds'},
                        {value: 'Cron Schedule'}
                    ],
                    toggleClassName: 'btn',
                    popdownOptions: {
                        attachDialogTo: 'body'
                    }
                },
                controlClass: 'controls-block',
                label: this.model.entity.getLabel('intervalInput'),
                tooltip: this.model.entity.getTooltip('intervalInput')
            });

            // placeholder - value will be overwritten
            this.model.cron = Cron.createFromCronString('0 6 * * 1');
            this.children.intervalCron = new ScheduleSentence({
                model: {
                    cron: this.model.cron,
                    application: this.model.application
                },
                lineOneLabel: this.model.entity.getLabel('interval'),
                popdownOptions: {
                    attachDialogTo: 'body',
                    scrollContainer: 'body'
                },
                tooltip: this.model.entity.getTooltip('interval')
            });

            this.children.intervalManual = new ControlGroup({
                className: 'interval control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entity.entry.content,
                    modelAttribute: 'interval'
                },
                label: this.model.entity.getLabel('interval'),
                tooltip: this.model.entity.getTooltip('interval')
            });

            this.children.source = new ControlGroup({
                className: 'source control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entity.entry.content,
                    modelAttribute: 'source',
                    placeholder: this.model.entity.getPlaceholder('source')
                },
                label: this.model.entity.getLabel('source'),
                tooltip: this.model.entity.getTooltip('source')
            });

            this.model.entity.entry.content.on('change:intervalSelection', function(){
                if (this.model.entity.entry.content.get('intervalSelection') == "In Seconds"){
                    this.children.intervalCron.$el.hide();
                    this.children.intervalManual.show();
                }else{
                    this.children.intervalManual.hide();
                    this.children.intervalCron.$el.show();
                    var newInter = this.model.cron.getCronString();
                    this.model.entity.entry.content.set({'interval': newInter});
                }
            }, this);

            this.model.cron.on('change', function(){
                var newInter = this.model.cron.getCronString();
                this.model.entity.entry.content.set({'interval': newInter});
            }.bind(this));

            if (isNew) {
                this.listenTo(this.children.uploadScript, 'fileSelected', this._validateUploadedFile);
            }
        },

        _validateUploadedFile: function(size)  {
            var errorMsg;

            //reset flash message
            this.collection.flashMessages.reset();
            if ( size > MAX_PRIVATE_KEY_SIZE ) {
                errorMsg = ERROR_MSG_INVALID_PRIVATE_KEY_SIZE;
            }

            // show error message if any
            if (errorMsg) {
                this.collection.flashMessages.reset([{
                    type: 'error',
                    html: errorMsg
                }]);
            }
        },

        render: function () {
            this.$el.html(_.template(this.template, {}));

            var general = this.$('.general-section');

            general.append(this.children.flashMessagesLegacy.render().el);
            if (this.model.entity.isNew()) {
                general.append(this.children.uploadScript.render().el);
            } else {
                general.append(this.children.scriptName.render().el);
            }
            general.append(this.children.intervalSelect.render().el);
            general.append(this.children.intervalManual.render().el);
            general.append(this.children.intervalCron.render().el);
            this.children.intervalCron.$el.hide();
            general.append(this.children.source.render().el);

            return this;
        },

        template: '<div>' +
        '<div class="general-section"></div>' +
        '</div>'
    });
});
