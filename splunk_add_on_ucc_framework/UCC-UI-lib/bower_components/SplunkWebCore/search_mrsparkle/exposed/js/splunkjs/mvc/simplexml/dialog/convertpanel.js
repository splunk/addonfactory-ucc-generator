define(function(require, exports, module) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var Modal = require('views/shared/Modal');
    var MultiStepModal = require('views/shared/MultiStepModal');
    var PanelModel = require('models/services/data/ui/Panel');
    var BaseView = require('views/Base');
    var TextControl = require('views/shared/controls/TextControl');
    var PairedTextControls = require('views/shared/delegates/PairedTextControls');
    var FlashMessages = require('views/shared/FlashMessages');
    var ControlGroup = require('views/shared/controls/ControlGroup');
    var splunkd_utils = require('util/splunkd_utils');
    var SharedModels = require('../../sharedmodels');
    var Serializer = require('../serializer');
    var XML = require('util/xml');
    var sprintf = require('splunk.util').sprintf;
    var route = require('uri/route');
    var Dashboard = require('../controller');

    var CreateDialog = BaseView.extend({
        className: 'step step-create',
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.flashMessage = new FlashMessages({
                model: {
                    panel: this.model.panel
                }
            });

            this.children.panelNameTextControl = new TextControl({
                model: this.model.inmem,
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
                        {value: "shared", label: (this.model.user.canUseApps()) ? _('Shared in App').t() : _('Shared').t()}
                    ],
                    model: this.model.inmem,
                    modelAttribute: 'panelPerm'
                }
            });
        },
        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Convert to Prebuilt Panel").t());
            this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));
            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
            var $form = this.$(Modal.BODY_FORM_SELECTOR);
            
            this.children.panelName.render().appendTo($form);
            this.children.panelPerm.render().appendTo($form);
            
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

            return this;
        },
        setSelected: function(selected) {
            this.$el[selected ? 'addClass' : 'removeClass']('active-step');
        },
        submit: function() {
            var inmemModel = this.model.inmem;
            this.createReferencePanel().then(function() {
                inmemModel.trigger('createSuccess');
            });
        },
        createReferencePanel: function() {
            var dfd = $.Deferred();
            var structure = this.model.inmem.get('panelStructure');
            
            var structureMap = Dashboard.model.view.getCurrentStructureMap();
            var panelXML = Serializer.serializePanelStructure(structure, { tokens: true, structureMap: structureMap });
            var panelXMLStr = XML.serializeDashboardXML(panelXML, true);
            this.model.panel.entry.content.set('eai:data', panelXMLStr);

            this.model.panel.entry.content.set('name', this.model.inmem.get('panelName'));
            var data = this.model.app.getPermissions(this.model.inmem.get('panelPerm'));

            this.model.panel.save({}, {
                data: data,
                success: function() {
                    dfd.resolve();
                }
            });

            return dfd.promise();
        },
        events: {
            "click .modal-btn-primary": function(e) {
                this.submit();
                e.preventDefault();
            }
        }
    });

    var SuccessDialog = BaseView.extend({
        className: 'step step-success',
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
        },
        updateContent: function() {
            var panel = this.model.panel;
            var appModel = this.model.app;
            var root = appModel.get('root');
            var locale = appModel.get('locale');
            var app = appModel.get('app');
            var permsLink = route.managerPermissions(root, locale, app, ['data', 'ui', 'panels'], panel.entry.get('name'), {
                data: {
                    uri: panel.id,
                    return_to: route.editDashboard(root, locale, app, appModel.get('page'))
                }
            });
            this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
                msgHTML: sprintf(_('You may now add your reference panel to other dashboards or refine ' +
                    '<a href="%s">permissions</a>.').t(), permsLink)
            }));
        },
        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Your Panel Has Been Created").t());
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn cancel btn-primary modal-btn-primary pull-right" data-dismiss="modal">' + _('OK').t() + '</a>');
            return this;
        },
        setSelected: function(selected) {
            this.$el[selected ? 'addClass' : 'removeClass']('active-step');
        },
        template: '<p class="convert-panel-success-message"><%= msgHTML %></p>'
    });

    var ConvertPanelDialog = MultiStepModal.extend({
        moduleId: module.id,
        initialize: function(options) {
            MultiStepModal.prototype.initialize.apply(this, options);
            var panel = options.panel;
            this.model = {};
            this.model.panel = new PanelModel();
            this.model.inmem = new Backbone.Model({
                panelPerm: 'private',
                panelTitle: panel.settings.get('title'),
                panelName: splunkd_utils.nameFromString(panel.settings.get('title')),
                panelStructure: panel.serializeStructure()
            });
            this.model.user = SharedModels.get('user');
            this.model.app = SharedModels.get('app');
            this.model.serverInfo = SharedModels.get('serverInfo');

            this.children.create = new CreateDialog({
                model: {
                    panel: this.model.panel,
                    inmem: this.model.inmem,
                    user: this.model.user,
                    app: this.model.app,
                    serverInfo: this.model.serverInfo
                }
            });
            this.children.success = new SuccessDialog({
                model: {
                    panel: this.model.panel,
                    app: this.model.app
                }
            });

            this.listenTo(this.model.inmem, 'createSuccess', function() {
                this.trigger('panelCreated', this.model.panel);
                this.children.success.updateContent();
                this.stepViewStack.setSelectedView(this.children.success);
            }, this);
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
            return [this.children.create, this.children.success];
        }
    });

    return ConvertPanelDialog;
});