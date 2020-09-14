define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/managementconsole/DmcBase',
    'models/managementconsole/AddEditOutput',
    'views/shared/Modal',
    'views/shared/FlashMessages',
    'views/managementconsole/shared/Accordion',
    'views/shared/waitspinner/Master',
    'views/shared/controls/ControlGroup'
], function (
    $,
    _,
    Backbone,
    module,
    DmcBaseModel,
    WorkingModel,
    Modal,
    FlashMessages,
    Accordion,
    Spinner,
    ControlGroup
) {
    var STRINGS = {
        NEW_TITLE: _('Create an output group').t(),
        EDIT_TITLE: _('Edit an output group').t(),
        ADVANCED_HEADER: _('Advanced').t()
    };
    return Modal.extend({
        moduleId: module.id,
        className: Modal.CLASS_NAME + ' ' + 'dmc-outputs modal-medium modal-with-spinner',

        events: $.extend({}, Modal.prototype.events, {
            'click .btn-primary': function (e) {
                e.preventDefault();
                if (this.model._working.set({}, { validate: true })) {
                    this.children.spinner.start();
                    this.children.spinner.$el.show();
                    this.model._working.saveToOriginalModel();
                    this.model.entity.save()
                        .done(_(function () {
                            this.children.spinner.$el.hide();
                            this.children.spinner.stop();
                            this.trigger('entitySaved', this.model.entity.get('name'));
                            this.hide();
                        }).bind(this))
                        .fail(_(function () {
                            this.children.spinner.$el.hide();
                            this.children.spinner.stop();
                            this.$el.find('.modal-body').animate({ scrollTop: 0 }, 'fast');
                        }).bind(this));
                }
            }
        }),

        initialize: function (options) {
            options = _.defaults(options, {
                keyboard: false,
                backdrop: 'static'
            });
            Modal.prototype.initialize.call(this, options);

            this._isNew = this.model.entity.isNew();
            this.model._working = new WorkingModel({
                isNew: this._isNew,
                originalModel: this.model.entity
            });

            this.children.flashMessages = new FlashMessages({
                model: [this.model._working, this.model.entity]
            });

            this.children.spinner = new Spinner();

            this.children.name = new ControlGroup({
                controlType: 'Text',
                controlOptions: {
                    modelAttribute: 'name',
                    model: this.model._working
                },
                enabled: this._isNew,
                controlClass: 'controls-block',
                label: this.model.entity.getLabel('name'),
                help: this.model.entity.getHelpText('name'),
                disabled: this._isNew
            });

            this.children.server = new ControlGroup({
                controlType: 'Text',
                controlOptions: {
                    modelAttribute: 'server',
                    model: this.model._working
                },
                controlClass: 'controls-block',
                label: this.model.entity.getLabel('server'),
                help: this.model.entity.getHelpText('server'),
                tooltip: this.model.entity.getTooltip('server')
            });

            this.children.advancedView = new Accordion({
                heading: STRINGS.ADVANCED_HEADER,
                initialState: Accordion.DETAILS_COLLAPSED
            });

            this.children.autoLBFrequency = new ControlGroup({
                controlType: 'Text',
                controlOptions: {
                    modelAttribute: 'autoLBFrequency',
                    model: this.model._working,
                    placeholder: this.model.entity.getPlaceholder('autoLBFrequency')
                },
                controlClass: 'controls-block',
                label: this.model.entity.getLabel('autoLBFrequency'),
                help: this.model.entity.getHelpText('autoLBFrequency')
            });

            this.children.useACK = new ControlGroup({
                controlType: 'SyntheticCheckbox',
                controlOptions: {
                    modelAttribute: 'useACK',
                    model: this.model._working
                },
                controlClass: 'controls-block',
                label: this.model.entity.getLabel('useACK'),
                tooltip: this.model.entity.getTooltip('useACK')
            });

            this.children.maxQueueSize = new ControlGroup({
                controlType: 'Text',
                controlOptions: {
                    modelAttribute: 'maxQueueSize',
                    model: this.model._working,
                    placeholder: this.model.entity.getPlaceholder('maxQueueSize')
                },
                controlClass: 'controls-block',
                label: this.model.entity.getLabel('maxQueueSize'),
                help: this.model.entity.getHelpText('maxQueueSize')
            });

            var defaultGroupItems = [];

            defaultGroupItems.push({label: _('No forwarders').t(), value: ''});

            if (!_.isUndefined(this.model._working.get('bundleLabel'))) {
                defaultGroupItems.push({label: this.model._working.get('bundleLabel'), value: this.model._working.get('bundleValue')});
            } else {
                if (this.model.user.canEditDMCForwarders()) {
                    defaultGroupItems.push({label: _('All forwarders').t(), value: DmcBaseModel.BUILTIN_BUNDLE_NAMES.FORWARDERS});
                }

                if (this.collection.serverclasses.canCreate()) {
                    defaultGroupItems.push({label: _('Server class').t(), value: 'custom'});

                    var data = [];
                    this.collection.serverclasses.each(function (model) {
                        var name = model.getDisplayName();
                        var bundleValue = model.getBundleName();
                        if (!_.isUndefined(name) && !_.isUndefined(bundleValue)) {
                            data.push({id: bundleValue, text: name});
                        }
                    });
                    this.children.serverclasses = new ControlGroup({
                        controlType: 'MultiInput', controlClass: '', controlOptions: {
                            model: this.model._working,
                            modelAttribute: 'serverclass',
                            placeholder: _('Select a server class').t(),
                            data: data
                        }
                    });
                }
            }
            if (this.model._working.get('selectedDefaultGroup') === 'custom' && !this.collection.serverclasses.canCreate()) {
                this.children.defaultGroup = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'serverclassLabels',
                        model: this.model._working
                    },
                    controlClass: 'controls-block',
                    label: this.model.entity.getLabel('defaultGroup'),
                    enabled: false
                });
                // set the default group to
                // selected server classes.Note user cannot edit these server classes
                // this.model._working.set('selectedDefaultGroup', this.model._working.get('serverclass'));
            } else {
                this.children.defaultGroup = new ControlGroup({
                    className: 'defaultGroup control-group',
                    controlType: 'SyntheticRadio',
                    controlOptions: {
                        model: this.model._working,
                        modelAttribute: 'selectedDefaultGroup',
                        items: defaultGroupItems
                    }, label: this.model.entity.getLabel('defaultGroup')
                });
            }

            this.listenTo(this.model._working, 'validated', this.replaceErrorLabel);
            this.listenTo(this.model._working, 'change:selectedDefaultGroup', this.showHideServerClasses);
        },

        replaceErrorLabel: function (isValid, model, invalidAttrs) {
            _.each(invalidAttrs, function (error, invalidAttr) {
                var viewName = invalidAttr;
                var label = invalidAttr;
                if (_.has(this.children, viewName)) {
                    label = this.children[viewName].options.label;
                }
                invalidAttrs[invalidAttr] = error.replace(/\{(label)\}/g, label);
            }, this);
        },

        showHideServerClasses: function (model, value, options) {
            if (this.children.serverclasses) {
                if (value === 'custom') {
                    this.children.serverclasses.$el.show();
                } else {
                    this.children.serverclasses.$el.hide();
                }
            }
        },

        render: function () {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(this._isNew ? STRINGS.NEW_TITLE : STRINGS.EDIT_TITLE);
            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
            this.$(Modal.BODY_FORM_SELECTOR).html(_(this.dialogFormBodyTemplate).template({}));
            this.$('.flash-messages-view-placeholder').html(this.children.flashMessages.render().el);

            var $general = this.$('.general-settings');
            $general.append(this.children.name.render().el);
            $general.append(this.children.server.render().el);
            $general.append(this.children.defaultGroup.render().el);
            if (this.children.serverclasses) {
                $general.append(this.children.serverclasses.render().el);
                this.showHideServerClasses(this.model._working, this.model._working.get('selectedDefaultGroup'));
            }

            this.$('.advanced-settings').append(this.children.advancedView.render().el);

            var $advanced = this.$(Accordion.ACCORDION_BODY_SELECTOR);
            $advanced.append(this.children.useACK.render().el);
            $advanced.append(this.children.autoLBFrequency.render().el);
            $advanced.append(this.children.maxQueueSize.render().el);

            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
            this.$(Modal.FOOTER_SELECTOR).append(this.children.spinner.render().el);
            this.children.spinner.$el.hide();

            return this;
        },

        dialogFormBodyTemplate: '<div class="flash-messages-view-placeholder"></div>' +
        '<div class="general-settings"></div>' +
        '<div class="advanced-settings"></div>'
    });
});
