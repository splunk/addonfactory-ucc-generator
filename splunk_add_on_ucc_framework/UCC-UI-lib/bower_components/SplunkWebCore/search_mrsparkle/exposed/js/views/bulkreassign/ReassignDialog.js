/**
 * File description
 * @author nmistry
 * @date 10/4/16
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/Base',
    'views/shared/FlashMessages',
    'views/shared/waitspinner/Master',
    'views/shared/controls/ControlGroup',
    'views/shared/basemanager/SearchableDropdown/Master',
    './BulkProgressSummary',
    'views/shared/Modal',
    'uri/route',
    './ReassignDialog.pcss'
], function(
    $,
    _,
    Backbone,
    module,
    BaseModel,
    FlashMessagesView,
    WaitSpinner,
    ControlGroup,
    SearchableDropdown,
    BulkProgressSummary,
    Modal,
    route
) {
    var ValidUserModel = BaseModel.extend({
        validation: {
            'owner': function (value, attr, computedState) {
                if (_.isEmpty(value)) {
                    return _('Please select the new owner.').t();
                }
            }
        }
    });
    var STATES = {
        REASSIGN_NOT_STARTED: -1,
        REASSIGN_IN_PROGRESS: 0,
        REASSIGN_COMPLETE: 1
    };
    return Modal.extend({
        moduleId: module.id,
        className: Modal.CLASS_NAME + ' modal-with-spinner modal-with-static-warning',

        events: $.extend({}, Modal.prototype.events, {
            'click .modal-btn-primary.save': 'handleSave',
            'hide': function (e) {
                if (this.processingState === STATES.REASSIGN_IN_PROGRESS) {
                    e.preventDefault();
                    return;
                }
                if (this.processingState === STATES.REASSIGN_COMPLETE) {
                    this.trigger('resetBulkSelection');
                }
                if (e.target !== e.currentTarget) return;
                this.trigger("hide");
            }
        }),

        initialize: function(options) {
            options = _.defaults(options, {
                keyboard: false,
                backdrop: 'static',
                onHiddenRemove: true,
                learnMoreTag: ''
            });
            Modal.prototype.initialize.call(this, options);

            // requires
            if (!this.collection.selectedEntities){
                throw new Error('this.collection.selectedEntities is required');
            }

            this.processingState = STATES.REASSIGN_NOT_STARTED;
            this.model._inmem = new ValidUserModel();

            this.isSingleEntity = this.options.mode === 'singleEntity';
            if (this.isSingleEntity) {
                this.model.entity = this.collection.selectedEntities.at(0);
                this.title = _('Reassign Entity').t();

                this.children.flashMessages = new FlashMessagesView({model: [this.model._inmem, this.model.entity]});

                this.children.entityTitle = new ControlGroup({
                    label: _('Name').t(),
                    controlType: 'Label',
                    controlOptions: {
                        model: this.model.entity.entry,
                        modelAttribute: 'name'
                    }
                });

                this.children.entityType = new ControlGroup({
                    label: _('Type').t(),
                    controlType: 'Label',
                    controlOptions: {
                        model: this.model.entity.entry.content,
                        modelAttribute: 'eai:type'
                    }
                });

                this.children.entityOwner = new ControlGroup({
                    label: _('Owner').t(),
                    controlType: 'Label',
                    controlOptions: {
                        model: this.model.entity.entry.acl,
                        modelAttribute: 'owner'
                    }
                });

            } else {
                this.title = _('Reassign Selected Entities').t();
                this.children.flashMessages = new FlashMessagesView({model: [this.model._inmem]});
                this.children.bulkProgress = new BulkProgressSummary({
                    model: this.model,
                    collection: this.collection.selectedEntities
                });

            }

            this.children.newOwner = new SearchableDropdown({
                prompt: _('Select an owner').t(),
                searchPrompt: _('Lookup an owner').t(),
                multiSelect: false,
                model: this.model._inmem,
                modelAttribute: 'owner',
                staticOptions: [{label: _('Nobody').t(), value: 'nobody'}],
                collection: {search: this.collection.usersSearch, listing: this.collection.users},
                popdownOptions: {
                    detachDialog: true
                }
            });

            this.children.ownerSelector = new ControlGroup({
                label: _('New Owner').t(),
                controlType: 'Label',
                controlOptions: {
                    className: 'newOwnerPlaceholder',
                    model: this.model._inmem,
                    modelAttribute: 'owner'
                }
            });

            this.children.spinner = new WaitSpinner();
            this.listenTo(this.collection.selectedEntities, 'bulkreassign:start', this.enableProcessingMode);
            this.listenTo(this.collection.selectedEntities, 'bulkreassign:complete', this.disableProcessingMode);
            this.listenTo(this.collection.selectedEntities, 'add remove reset', this.handleNoEntity);
        },

        handleNoEntity: function () {
            if (this.collection.selectedEntities.length === 0) {
                this.$(Modal.FOOTER_SELECTOR + ' .modal-btn-primary').addClass('disabled');
            }
        },

        enableProcessingMode: function () {
            this.processingState = STATES.REASSIGN_IN_PROGRESS;

            // disable form elements
            this.children.ownerSelector.disable();

            this.$(Modal.FOOTER_SELECTOR + ' .btn').remove();
            this.children.spinner.start();
        },

        disableProcessingMode: function () {
            this.processingState = STATES.REASSIGN_COMPLETE;
            this.children.spinner.stop();
            this.children.spinner.$el.hide();

            // form elements are purposely not enabled.

            // replace Save with Done
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DONE);
        },

        getCombinedOwnerName: function () {
            if (this.collection.selectedEntities.length === 0) {
                return '';
            }
            return this.collection.selectedEntities
                .map(function (entity) {return entity.getOwner();})
                .reduce(function (prev, curr) { return prev === curr ? prev: '<multiple owners>';});
        },

        handleSave: function () {
            if (this.collection.selectedEntities.length === 0) return;
            if (this.model._inmem.isValid(true)) {
                this.children.spinner.start();
                this.children.spinner.$el.show();
                this.model.controller.trigger('bulkReassignOwner', this.model._inmem.get('owner'), this.collection.selectedEntities, this.options.mode);
            }
        },

        render: function () {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(this.title);

            var learnMoreLink = route.docHelp(
                this.model.application.get("root"),
                this.model.application.get("locale"),
                this.options.learnMoreTag
            );
            var compiledBodyTemplate = _.template(this.bodyTemplate);
            var bodyHTML = compiledBodyTemplate({
                learnMoreLink: learnMoreLink
            });
            this.$(Modal.BODY_SELECTOR).html(bodyHTML);

            if (this.children.flashMessages) {
                this.$('.flash-message-placeholder').append(this.children.flashMessages.render().el);
            }
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
            this.$(Modal.FOOTER_SELECTOR + ' .modal-btn-primary').addClass('save');

            this.$(Modal.FOOTER_SELECTOR).append(this.children.spinner.render().el);
            this.children.spinner.$el.hide();

            var $form = this.$('.owner-form');
            if (this.children.entityTitle) {
                $form.append(this.children.entityTitle.render().el);
            }
            if (this.children.entityType) {
                $form.append(this.children.entityType.render().el);
            }
            if (this.children.entityOwner) {
                $form.append(this.children.entityOwner.render().el);
            }
            $form.append(this.children.ownerSelector.render().el);
            $form.find('.newOwnerPlaceholder').replaceWith(this.children.newOwner.render().el);

            if (this.children.bulkProgress) {
                this.$('.bulk-progress').append(this.children.bulkProgress.render().el);
            }
            if (!this.isSingleEntity) {
                this.$el.addClass('modal-wide');
            }

            this.$('.alert-warning .message').append(this.securtiyWarningMessage);
            return this;
        },
        securtiyWarningMessage: _('Knowledge object ownership changes can have side effects such as giving saved searches access to previously inaccessible data or making previously available knowledge objects unavailable. Review your knowledge objects before you reassign them.').t(),
        bodyTemplate: '<div class="security-warning"><div class="alert alert-warning"><i class="icon-alert"></i><span class="message"></span> <a href="<%- learnMoreLink %>" target="_blank" class="external"><%= _("Learn more").t() %></a></div></div></div><div class="flash-message-placeholder"></div><div class="owner-form form-horizontal"></div><div class="bulk-progress"></div>'
    });
});
