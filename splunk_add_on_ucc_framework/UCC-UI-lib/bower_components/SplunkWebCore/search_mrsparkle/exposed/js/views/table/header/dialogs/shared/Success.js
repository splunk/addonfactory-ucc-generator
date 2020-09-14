define(
    [
        'jquery',
        'underscore',
        'module',
        'models/datasets/PolymorphicDataset',
        'views/Base',
        'views/shared/Modal',
        'views/shared/documentcontrols/dialogs/permissions_dialog/Master',
        'uri/route'
    ],
    function(
        $,
        _,
        module,
        PolymorphicDataset,
        Base,
        Modal,
        PermissionsDialogView,
        route
    ) {
        return Base.extend({
            moduleId: module.id,
            BUTTON_OK: '<a href="#" class="btn btn-primary pull-right" data-dismiss="modal">' + _('OK').t() + '</a>',

            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.listenTo(this.model.inmem, 'sync', this.render);
            },

            events: {
                'click a.permissions-link': function(e) {
                    e.preventDefault();
                    this.showPermissionsDialog();
                }
            },

            render: function() {
                var canChangePerms = this.model.inmem.entry.acl.get('can_change_perms'),
                    routeToPivot = route.pivot(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        {
                            data: {
                                dataset: this.model.inmem.entry.get('name'),
                                type: PolymorphicDataset.DATAMODEL
                            }
                        }
                    );

                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(this.options.title);
                this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
                    _: _,
                    model: this.model.inmem,
                    canChangePerms: canChangePerms
                }));

                if (canChangePerms) {
                    this.$('span.save-table-success-message').text(_('You may now view your table, visualize it in Pivot, change additional settings, or continue editing it.').t());
                } else {
                    this.$('span.save-table-success-message').text(_('You may now view your table, visualize your table in Pivot, or continue editing it.').t());
                    this.$('p.additional-settings').remove();
                }

                this.$(Modal.FOOTER_SELECTOR).append(this.BUTTON_OK);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="' + routeToPivot + '" class="btn pull-left">' + _('Pivot').t() + '</a>');

                return this;
            },

            focus: function() {
                this.$('.btn-primary').focus();
            },

            showPermissionsDialog: function() {
                this.permissionsDialog = new PermissionsDialogView({
                        model: {
                            document: this.model.inmem,
                            nameModel: this.model.inmem.entry,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo,
                            application: this.model.application
                        },
                        collection: this.collection.roles,
                        onHiddenRemove: true,
                        nameLabel: this.model.inmem.getDatasetDisplayType()
                    });
                
                    this.trigger('closeModal');
                    this.permissionsDialog.render().appendTo($('body'));
                    this.permissionsDialog.show();
            },

            template: '\
                <p>\
                    <span class="save-table-success-message"></span>\
                </p>\
                <p class="additional-settings">\
                    <%- _("Additional Settings:").t() %>\
                    <ul>\
                        <% if (canChangePerms) { %>\
                            <li><a href="#" class="permissions-link"><%- _("Permissions").t() %></a></li>\
                        <% } %>\
                    </ul>\
                </p>\
            '
        });
    }
);

