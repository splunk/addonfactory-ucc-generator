define(
    [
        'module',
        'jquery',
        'underscore',
        'backbone',
        'models/services/data/ui/Panel',
        'views/Base',
        'views/shared/Modal',
        'views/shared/MultiStepModal',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/TextControl',
        'views/shared/FlashMessages',
        'util/splunkd_utils',
        'splunk.util',
        'uri/route'
    ],
    function(module,
             $,
             _,
             Backbone,
             PanelModel,
             BaseView,
             Modal,
             MultiStepModal,
             ControlGroup,
             TextControl,
             FlashMessages,
             splunkd_utils,
             splunkUtil,
             route) {
        var sprintf = splunkUtil.sprintf;
        
        var CreateDialog = BaseView.extend({
            className: 'step step-create',
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.panelComponent = options.panelComponent;

                this.children.flashMessage = new FlashMessages({
                    model: {
                        panel: this.model.panelModel
                    }
                });

                this.children.panelNameTextControl = new TextControl({
                    model: this.model.panelProperties,
                    modelAttribute: 'panelName'
                });

                this.children.panelName = new ControlGroup({
                    label: _("ID").t(),
                    controlClass: 'controls-block',
                    controls: this.children.panelNameTextControl,
                    tooltip: _('The ID is used as the filename on disk. Cannot be changed later.').t(),
                    help: _('Can only contain letters, numbers and underscores.').t()
                });

                this.children.panelPerm = new ControlGroup({
                    label: _("Permissions").t(),
                    controlType: 'SyntheticRadio',
                    controlClass: 'controls-halfblock',
                    controlOptions: {
                        className: "btn-group btn-group-2",
                        items: [
                            {value: "private", label: _("Private").t()},
                            {
                                value: "shared",
                                label: (this.model.user.canUseApps()) ? _('Shared in App').t() : _('Shared').t()
                            }
                        ],
                        model: this.model.panelProperties,
                        modelAttribute: 'panelPerm'
                    }
                });
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Convert to Prebuilt Panel").t());
                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL_JUSTIFIED);
                var $form = this.$(Modal.BODY_FORM_SELECTOR);
                this.children.panelName.render().appendTo($form);
                this.children.panelPerm.render().appendTo($form);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_APPLY);
                return this;
            },
            setSelected: function(selected) {
                this.$el[selected ? 'addClass' : 'removeClass']('active-step');
            },
            events: {
                "click .modal-btn-primary": function(e) {
                    e.preventDefault();
                    this.createPrebuiltPanel();
                }
            },
            createPrebuiltPanel: function() {
                // controller will emit events on panelModel that move to next step
                this.model.controller.trigger('edit:make-prebuilt-panel', {
                    panelId: this.panelComponent.id,
                    panelComponent: this.panelComponent,
                    panelModel: this.model.panelModel,
                    panelProperties: this.model.panelProperties
                });
            }
        });

        var SuccessDialog = BaseView.extend({
            className: 'step step-success',
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            updateContent: function() {
                this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
                    msgHTML: _('You may now add your reference panel to other dashboards.').t()
                }));
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).text(_("Your Panel Has Been Created").t());
                this.$(Modal.FOOTER_SELECTOR).append($('<a href="#" class="btn cancel btn-primary modal-btn-primary pull-right" data-dismiss="modal"></a>').text(_('OK').t()));
                return this;
            }, setSelected: function(selected) {
                this.$el[selected ? 'addClass' : 'removeClass']('active-step');
            },
            template: '<p class="convert-panel-success-message"><%= msgHTML %></p>'
        });

        return MultiStepModal.extend({
            moduleId: module.id,
            initialize: function(options) {
                MultiStepModal.prototype.initialize.apply(this, arguments);
                this.panelComponent = options.panelComponent;
                this.model = _.extend({
                    panelModel: new PanelModel(),
                    panelProperties: new Backbone.Model({
                        panelPerm: 'private',
                        panelTitle: this.panelComponent.settings.get('title'),
                        panelName: splunkd_utils.nameFromString(this.panelComponent.settings.get('title'))
                    })
                }, this.model);
                this.children.createDialog = new CreateDialog({
                    model: this.model,
                    panelComponent: this.panelComponent
                });
                this.children.successDialog = new SuccessDialog({
                    model: this.model,
                    panelComponent: this.panelComponent
                });

                this.listenTo(this.model.panelModel, 'createSuccess', this._onPrebuiltPanelCreated);
            },
            _onPrebuiltPanelCreated: function() {
                this.children.successDialog.updateContent();
                this.stepViewStack.setSelectedView(this.children.successDialog);
            },
            events: {
                'hidden.bs.modal': function(e) {
                    if (e.target === this.el) {
                        this.stepViewStack.remove();
                        this.remove();
                    }
                }
            },
            getStepViews: function() {
                return [this.children.createDialog, this.children.successDialog];
            }
        });
    });