define(
    [
        'underscore',
        'jquery',
        'module',
        'models/Base',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'splunk.util',
        'uri/route',
        'util/dom_utils',
        'util/keyboard',
        'util/validation'
    ],
    function(_, $, module, BaseModel, Modal, ControlGroup, FlashMessages, splunkUtil, route, domUtils, keyboardUtils, validationUtils) {
        return Modal.extend({
            moduleId: module.id,
            /**
             * @constructor
             * @param options {
             *     model: {
             *         report: <models.search.Report>
             *         application: <models.Application>
             *     }
             * }
             */
            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
                var Inmem = BaseModel.extend({
                    validation: {
                        ratio: 'validateRatio'
                    },
                    validateRatio: function(value, attr, computedState) {
                        if ((!validationUtils.isNonNegValidInteger(value)) || parseInt(value, 10) <= 1) {
                            return _(' Sample ratio must be an integer greater than 1').t();
                        } 
                    }
                });

                this.model.inmem = new Inmem();
                this.model.inmem.set('ratio', this.model.report.entry.content.get('display.prefs.customSampleRatio'));
               
                var docRoute = route.docHelp(this.model.application.get("root"), this.model.application.get("locale"), 'learnmore.search_app.event.sampling');
                this.children.sampleRatioInput = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        additionalClassNames: 'ratio-input-control',
                        modelAttribute: 'ratio',
                        model: this.model.inmem
                    },
                    label: 'Sample Ratio',
                    help: '<a href="' + docRoute +'" target="_blank" title="'+_("Splunk help").t()+'">' + _("Learn More").t() + ' <i class="icon-external"></i></a>'
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
                    if(e.keyCode === keyboardUtils.KEYS.ENTER) {
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
                    var sampleRatio = this.model.inmem.get('ratio');
                    this.model.report.entry.content.set({
                        'dispatch.sample_ratio': sampleRatio,
                        'display.prefs.customSampleRatio': sampleRatio
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
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Set Event Sampling Ratio").t());

                // Add flash message to body
                this.children.flashMessages.render().prependTo(this.$(Modal.BODY_SELECTOR));

                // Add content to body
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.children.sampleRatioInput.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.sampleRatioInput.$el.find('.ratio-input-control').before('<span>' + _("1 : ").t() + '</span>');
                this.children.sampleRatioInput.$el.find('.ratio-input-control').after('<span>' + _("events").t() + '</span>');
                
                // Add footer buttons
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="edit-apply btn btn-primary pull-right" tabindex="0"> '+_("Apply").t()+'</a>');

                return this;
            }
        });
    }
);