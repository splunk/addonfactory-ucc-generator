define(
    [
        'underscore',
        'jquery',
        'module',
        'models/datasets/EventLimit',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'splunk.util',
        'util/dom_utils',
        'util/keyboard'
    ],
    function(_,
             $,
             module,
             EventLimitModel,
             Modal,
             ControlGroup,
             FlashMessages,
             splunkUtil,
             domUtils,
             keyboardUtils
    ) {
        return Modal.extend({
            moduleId: module.id,
            
            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);

                var limit = this.model.get('dataset.display.limiting');
                this.model.inmem = new EventLimitModel({
                    limit: _.isFinite(parseInt(limit, 10)) ? limit : "100000"
                });

                this.children.eventLimitInput = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'limit',
                        model: this.model.inmem
                    },
                    label: 'Event Limit'
                });

                this.children.flashMessages = new FlashMessages({ model: this.model.inmem });
            },

            events: $.extend({}, Modal.prototype.events, {
                'focus input': function(e) {
                    this.setCaretPositionToEnd();
                },
                'click .edit-cancel': function(e) {
                    e.preventDefault();
                    this.hide();
                },
                'click .edit-apply': function(e) {
                    e.preventDefault();
                    this.applyChanges();
                },
                'keypress input:text': function(e) {
                    if (e.keyCode === keyboardUtils.KEYS.ENTER) {
                        $(e.target).blur();
                        e.preventDefault();
                        this.applyChanges();
                    }
                }
            }),

            setCaretPositionToEnd: function() {
                var $inputField = this.$('input');
                domUtils.setCaretPosition($inputField.get(0), $inputField.val().length);                
            },

            applyChanges: function() {
                if (this.model.inmem.isValid(true)) {
                    var eventLimit = this.model.inmem.get('limit');
                    this.trigger('updateListItems', eventLimit);
                    this.model.set({
                        'dataset.display.limiting': eventLimit
                    });
                    this.hide();
                } else {
                    this.$('input').focus();
                }
            },
            
            render: function() {
                // Modal template
                this.$el.html(Modal.TEMPLATE);

                // Add header title
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Set Event Limit").t());

                // Add flash message to body
                this.children.flashMessages.render().prependTo(this.$(Modal.BODY_SELECTOR));

                // Add content to body
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.children.eventLimitInput.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.eventLimitInput.$el.find('.ratio-input-control').after('<span>' + _("events").t() + '</span>');
                
                // Add footer buttons
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="edit-apply btn btn-primary pull-right" tabindex="0"> '+_("Apply").t()+'</a>');

                return this;
            }
        });
    }
);