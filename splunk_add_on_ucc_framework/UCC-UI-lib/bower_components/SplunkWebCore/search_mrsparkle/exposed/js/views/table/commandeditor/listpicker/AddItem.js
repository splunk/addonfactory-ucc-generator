define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/Base',
    'views/Base',
    'views/shared/controls/ControlGroup',
    'views/shared/FlashMessages',
    'util/keyboard',
    'util/splunkd_utils'
],
function(
    $,
    _,
    Backbone,
    module,
    BaseModel,
    BaseView,
    ControlGroup,
    FlashMessagesView,
    keyboardUtils,
    splunkdUtils
) {
    return BaseView.extend({
        moduleId: module.id,

        initialize: function(options) {
            this.children.addFieldTextView = new ControlGroup({
                controlType: 'Text',
                additionalClassNames: ['add-field-control'],
                controlOptions: {
                    model: this.model.state,
                    modelAttribute: 'itemToAdd'
                }
            });

            this.children.flashMessages = new FlashMessagesView();
            
            BaseView.prototype.initialize.apply(this, arguments);
        },

        events: {
            'click .open-add-item': function (e) {
                e.preventDefault();

                this.$('.open-add-item').hide();
                this.$('.enter-field-container').show();
                this.$('.enter-field-container')[ 0 ].scrollIntoView(false);
            },

            'click .add-item-remove': function(e) {
                e.preventDefault();
                this.reset();
            },

            'click .add-item-button': function (e) {
                e.preventDefault();
                this.attemptAddItem();
            },

            'keyup .enter-field': function (e) {
                e.preventDefault();

                if (!e.shiftKey && e.which === keyboardUtils.KEYS["ENTER"]) {
                    this.attemptAddItem();
                }
            }
        },

        startListening: function() {
            this.listenTo(this.collection.customAddedFieldPickerItems, 'add', this.reset);
        },

        attemptAddItem: function() {
            this.model.state.trigger('attemptAddItem');
        },

        addError: function(html) {
            this.children.flashMessages.flashMsgHelper.addGeneralMessage('addItem', {
                type: splunkdUtils.ERROR,
                html: html
            });
        },

        reset: function() {
            this.model.state.unset('itemToAdd');
            this.$('.enter-field-container').hide();
            this.children.flashMessages.flashMsgHelper.removeGeneralMessage('addItem');
            this.$('.open-add-item').show();
        },

        render: function() {
            this.$el.html(this.compiledTemplate({
                _: _,
                options: this.options
            }));

            this.children.addFieldTextView.activate({ deep: true }).render().prependTo(this.$('.enter-field'));
            this.children.flashMessages.activate({ deep: true }).render().prependTo(this.$('.enter-field-container'));

            return this;
        },

        template: '\
            <div class="add-missing-item">\
                <div class="enter-field-container" style="display: none;">\
                    <a href="#" class="add-item-remove">\
                        <i class="icon-x"></i>\
                    </a>\
                    <div class="enter-field" >\
                        <a href="#" class="btn add-item-button"> <%- _("Add").t() %> </a>\
                    </div>\
                </div>\
                <a href="#" class="open-add-item">\
                    <i class="icon-plus"></i>\
                    <%= _("Add a missing existing field").t() %>\
                </a>\
            </div>\
        '
    });
});
