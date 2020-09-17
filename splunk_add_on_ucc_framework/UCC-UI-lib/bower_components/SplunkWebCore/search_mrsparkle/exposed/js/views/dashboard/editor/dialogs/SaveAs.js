define([
    'jquery',
    'underscore',
    'module',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup',
    'models/Base',
    'models/search/Dashboard',
    'views/shared/FlashMessages',
    'util/splunkd_utils',
    'views/shared/controls/TextControl',
    'views/shared/delegates/PairedTextControls'
], function($,
            _,
            module,
            Modal,
            ControlGroup,
            BaseModel,
            DashboardModel,
            FlashMessagesView,
            splunkDUtils,
            TextControl,
            PairedTextControls) {

    return Modal.extend({
        moduleId: module.id,
        initialize: function() {
            Modal.prototype.initialize.apply(this, arguments);

            this.children.flashMessages = new FlashMessagesView({
                model: {
                    dashboard: this.model.dashboard,
                    dashboardMeta: this.model.dashboard.meta
                }
            });

            this.model.perms = new BaseModel({perms: 'private'});

            this.model.dashboard.meta.set({
                label: this.model.dashboard.meta.get('label') + _(' Copy').t()
            });

            this.children.titleTextControl = new TextControl({
                modelAttribute: 'label',
                model: this.model.dashboard.meta,
                placeholder: _('optional').t(),
                save: false
            });

            this.children.filenameTextControl = new TextControl({
                modelAttribute: 'name',
                model: this.model.dashboard.entry.content,
                save: false
            });
            this.children.filenameTextControl.setValue(
                splunkDUtils.nameFromString(this.model.dashboard.meta.get('label'))
            );

            this.children.title = new ControlGroup({
                controls: this.children.titleTextControl,
                label: _("Title").t()
            });

            this.children.filename = new ControlGroup({
                controls: this.children.filenameTextControl,
                label: _("ID").t(),
                help: _("Can only contain letters, numbers and underscores.").t(),
                tooltip: _("The ID is used as the filename on disk. Cannot be changed later.").t()
            });

            this.children.description = new ControlGroup({
                controlType: 'Textarea',
                controlOptions: {
                    modelAttribute: 'description',
                    model: this.model.dashboard.meta,
                    placeholder: _("optional").t(),
                    save: false
                },
                label: _("New Description").t()
            });

            this.pairedTextControls = new PairedTextControls({
                sourceDelegate: this.children.titleTextControl,
                destDelegate: this.children.filenameTextControl,
                transformFunction: splunkDUtils.nameFromString
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
                        {label: _("Private").t(), value: 'private'},
                        {label: sharedLabel, value: 'shared'}
                    ],
                    save: false
                },
                label: _("Permissions").t()
            });
        },
        events: $.extend({}, Modal.prototype.events, {
            'click a.modal-btn-primary': function(e) {
                e.preventDefault();
                this.submit();
            }
        }),
        createSuccess: function() {
            this.trigger('success');
            this.hide();
            this.remove();
        },
        submit: function() {
            var dashboard = this.model.dashboard;
            dashboard.meta.validate();
            if (dashboard.meta.isValid()) {
                if (dashboard.entry.content.get('eai:type') === 'views') {
                    dashboard.meta.apply();
                }
                dashboard.save({}, {
                    data: this.model.application.getPermissions(this.model.perms.get('perms')),
                    success: function(model, response) {
                        this.createSuccess();
                    }.bind(this)
                });
            }
        },
        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Save As").t());
            this.$(Modal.BODY_SELECTOR).prepend(this.children.flashMessages.render().el);
            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL_JUSTIFIED);

            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.title.render().el);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.filename.render().el);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.description.render().el);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.permissions.render().el);

            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">' + _("Create Dashboard").t() + '</a>');
            return this;
        }
    });

});
