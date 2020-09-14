// Modal wizard stack
// @author: nmistry
define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/shared/Modal',
    'views/shared/FlashMessages',
    'views/shared/waitspinner/Master',
    'views/shared/controls/StepWizardControl',
    './Master.pcss'
], function (
    _,
    $,
    Backbone,
    module,
    Modal,
    FlashMessages,
    Spinner,
    StepWizardControl
) {
    var strings = {
        previous: _('Previous').t(),
        next: _('Next').t(),
        save: _('Save').t(),
        saving: _('Saving').t(),
        close: _('Close').t(),
        step: _('Step #').t()
    };

    var BUTTON_PREVIOUS = '<a href="#" class="btn previous modal-btn-previous pull-right" style="display:none;">' + strings.previous + '</a>';
    var BUTTON_NEXT = '<a href="#" class="btn btn-primary next pull-right" style="display:none;">' + strings.next + '</a>';
    var BUTTON_SAVE = '<a href="#" class="btn btn-primary save pull-right" style="display:none;">' + strings.save + '</a>';

    return Modal.extend({
        moduleId: module.id,

        className: Modal.CLASS_NAME + ' modal-wizard',

        events: $.extend(true, {}, Modal.prototype.events, {
            'click a.btn.next': function (e) {
                e.preventDefault();
                var $e = $(e.currentTarget);
                this.children.stepWizard.stepForward();
            },
            'click a.btn.previous': function (e) {
                e.preventDefault();
                var $e = $(e.currentTarget);
                this.children.stepWizard.stepBack();
            },
            'click a.btn.save': function (e) {
                e.preventDefault();
                var $e = $(e.currentTarget);
                this.saveEntity();
            }
        }),

        initialize: function (options) {
            options = _.defaults(options, {
                keyboard: false,
                backdrop: 'static',
                onHiddenRemove: true
            });
            Modal.prototype.initialize.call(this, options);

            this.views = this.views || this.options.views;
            this.title = this.options.title || '';

            // modal wizard handling
            this.model = this.model || {};
            this.model.wizard = this.model.wizard || new Backbone.Model();
            this.model.wizard.set('total', this.views.length);
            this.model.wizard.set('index', 0);
            this.model.wizard.set('viewsrendered',
                _.range(this.views.length).map(function () {
                    return false;
                }));

            // manage views
            if (this.model.entity) {
                this.children.flashMessages = new FlashMessages({
                    model: [
                        this.model.entity,
                        this.model.entity.entry,
                        this.model.entity.entry.acl,
                        this.model.entity.entry.content
                    ]
                });
            }
            this.children.spinner = new Spinner();

            // Initialize step wizard
            this.collection = this.collection || {};
            this.collection.steps = new Backbone.Collection();
            _.each(this.views, function addToCollection(view, i) {
                this.collection.steps.push({
                    label: view.label,
                    value: i,
                    validate: this.validateStep.bind(this)
                });
            }, this);
            this.children.stepWizard = new StepWizardControl({
                model: this.model.wizard,
                modelAttribute: 'index',
                collection: this.collection.steps
            });

            // radio
            this.radio = this.options.radio || _.extend({}, Backbone.Events);
            this.listenTo(this.model.wizard, 'change:index', this.step);
        },

        validateStep: function(model, isSteppingNext) {
            var dfd = $.Deferred();
            if (isSteppingNext) {
                if (this.model.entity && this.model.entity.validate) {
                    this.model.entity.validate() ? dfd.fail() : dfd.resolve();
                }
            } else {
                dfd.resolve();
            }
            return dfd;
        },
        startSpinner: function () {
            this.children.spinner.start();
            this.children.spinner.$el.show();
        },

        stopSpinner: function () {
            this.children.spinner.stop();
            this.children.spinner.$el.hide();
        },

        step: function () {
            var index = this.model.wizard.get('index');
            var total = this.model.wizard.get('total');
            var showPrev = total > 1 && index > 0;
            var showSave = index + 1 === total;
            var showNext = !showSave;
            var rendered = this.model.wizard.get('viewsrendered');
            var currentStepClass = 'step-' + index;
            var $wrapper;

            this.model.entity.setStep(index);

            // hide away the current step;
            this.$('.wizard-steps').hide();

            // render the view if not rendered already
            if (!rendered[index] || this.views[index].forceRender) {
                if (!rendered[index]) {
                    $wrapper = $('<div class="wizard-steps ' + currentStepClass + '"></div>');
                } else {
                    $wrapper = this.$('.wizard-steps.' + currentStepClass);
                }
                $wrapper.html(this.views[index].view.render().el);
                this.$('.wizard-body').append($wrapper);
                rendered[index] = true;
            }

            // show the current step
            this.$('.' + currentStepClass).show();

            // update the footer
            showPrev ? this.$BUTTON_PREVIOUS.show() : this.$BUTTON_PREVIOUS.hide();
            showNext ? this.$BUTTON_NEXT.show() : this.$BUTTON_NEXT.hide();
            showSave ? this.$BUTTON_SAVE.show() : this.$BUTTON_SAVE.hide();
        },

        saveEntity: function () {
            var action = this.model.entity.isNew() ? 'created': 'updated';
            this.startSpinner();

            var dfd = this.model.entity.save();
            dfd
                .done(_(function handleSaveSuccess(model, status, response) {
                    // inform the modal about save successful
                    this.stopSpinner();
                    this.radio.trigger('wizard:saved', action);
                }).bind(this))
                .fail(_(function handleSaveFailure() {
                    // NMTODO: how should modal handle failure
                    this.stopSpinner();
                    this.radio.trigger('wizard:savefailed', action);
                }).bind(this));
        },

        render: function () {
            this.$el.html(Modal.TEMPLATE);

            this.$(Modal.HEADER_TITLE_SELECTOR).html(this.title);
            this.$(Modal.HEADER_SELECTOR).append(this.children.stepWizard.render().el);
            if (!this.options.showStepWizard) {
                this.children.stepWizard.$el.hide();
            }
            // render the body
            this.$(Modal.BODY_SELECTOR).append(_.template(this.bodyTemplate));
            if (this.children.flashMessages) {
                this.$('.flashmessages-container').append(this.children.flashMessages.render().el);
            }
            // render footer
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append(BUTTON_NEXT);
            this.$(Modal.FOOTER_SELECTOR).append(BUTTON_SAVE);
            this.$(Modal.FOOTER_SELECTOR).append(BUTTON_PREVIOUS);
            this.$(Modal.FOOTER_SELECTOR).append(this.children.spinner.render().el);
            this.children.spinner.$el.hide();

            // please store the reference
            this.$BUTTON_NEXT = this.$('a.btn.next');
            this.$BUTTON_PREVIOUS = this.$('a.btn.previous');
            this.$BUTTON_SAVE = this.$('a.btn.save');

            this.step();
            return this;
        },

        bodyTemplate: '<div class="wizard"><div class="flashmessages-container"></div><div class="wizard-body"></div></div>'
    });
});
