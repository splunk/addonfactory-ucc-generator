define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/TextControl',
        'models/Base',
        'models/search/Dashboard',
        'views/shared/FlashMessages',
        'views/shared/delegates/PairedTextControls',
        'util/splunkd_utils',
        'uri/route'
    ],
    function ($, _, module, Modal, ControlGroup, TextControl, BaseModel, DashboardModel, FlashMessagesView, PairedTextControls, splunkDUtils, route) {
        return Modal.extend({
            moduleId: module.id,
            initialize: function () {
                Modal.prototype.initialize.apply(this, arguments);

                if (!this.model.dashboard) {
                    this.model.dashboard = new DashboardModel();
                }
                this.dashboardFetchDeferred = this.model.dashboard.fetch();

                this.model.perms = new BaseModel({ perms: 'private' });

                this.nameTextControl = new TextControl({
                    modelAttribute: 'name',
                    model: this.model.dashboard.entry.content,
                    save: false
                });

                this.children.name = new ControlGroup({
                    label: _("ID").t(),
                    controls: this.nameTextControl,
                    tooltip: _('The ID is used as the filename on disk. Cannot be changed later.').t(),
                    help: _('Can only contain letters, numbers and underscores.').t()
                });

                this.children.description = new ControlGroup({
                    controlType: 'Textarea',
                    controlOptions: {
                        modelAttribute: 'description',
                        model: this.model.dashboard.meta,
                        placeholder: _('optional').t(),
                        save: false
                    },
                    label: _("Description").t()
                });

                var sharedLabel = this.model.user.canUseApps() ? _('Shared in App').t() : _('Shared').t();
                this.children.permissions = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    controlClass: 'controls-halfblock',
                    controlOptions: {
                        className: "btn-group btn-group-2",
                        modelAttribute: 'perms',
                        model: this.model.perms,
                        items: [
                            { label: _("Private").t(), value: 'private' },
                            { label: sharedLabel, value: 'shared' }
                        ],
                        save: false
                    },
                    label: _("Permissions").t()
                });

                this.titleTextControl = new TextControl({
                    modelAttribute: 'label',
                    model: this.model.dashboard.meta,
                    placeholder: _('optional').t(),
                    save: false
                });

                this.children.title = new ControlGroup({
                    label: _("Title").t(),
                    controls: this.titleTextControl
                });

                this.pairedTextControls = new PairedTextControls({
                    sourceDelegate: this.titleTextControl,
                    destDelegate: this.nameTextControl,
                    transformFunction: splunkDUtils.nameFromString
                });

                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        dashboard: this.model.dashboard,
                        dashboardMeta: this.model.dashboard.meta
                    }
                });
            },
            events: $.extend({}, Modal.prototype.events, {
                'click a.modal-btn-primary': function (e) {
                    this.model.dashboard.meta.validate();
                    if (this.model.dashboard.meta.isValid()) {
                        this.model.dashboard.meta.apply();
                        this.model.dashboard.save({}, {
                            data: this.model.application.getPermissions(this.model.perms.get('perms')),
                            success: function () {
                                this.collection.trigger('dashboard-created');
                                var app = this.model.application;
                                this.hide();
                                this.remove();
                                window.location = route.editDashboard(app.get('root'), app.get('locale'), app.get('app'), this.model.dashboard.entry.content.get('name'));
                            }.bind(this)
                        });
                    }
                    e.preventDefault();
                }
            }),
            render: function () {
                $.when(this.dashboardFetchDeferred).then(function(){
                    this.model.dashboard.setXML('<dashboard></dashboard>');
                    this.model.dashboard.entry.set('name', '');
                    this.model.dashboard.meta.set('label', '');
                    this.$el.html(Modal.TEMPLATE);
                    this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Create New Dashboard").t());
                    this.$(Modal.BODY_SELECTOR).prepend(this.children.flashMessages.render().el);
                    this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL_JUSTIFIED);
                    this.$(Modal.BODY_FORM_SELECTOR).append(this.children.title.render().el);
                    this.$(Modal.BODY_FORM_SELECTOR).append(this.children.name.render().el);
                    this.$(Modal.BODY_FORM_SELECTOR).append(this.children.description.render().el);
                    if (this.model.dashboard.entry.acl.get('can_share_app')) {
                        this.$(Modal.BODY_FORM_SELECTOR).append(this.children.permissions.render().el);
                    }
                    this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                    this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">' + _("Create Dashboard").t() + '</a>');

                }.bind(this));
                return this;
            }
        });
    }
);
