define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/documentcontrols/dialogs/permissions_dialog/Master'
    ],
    function($, _, Backbone, module, Base, PermissionsDialog) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'span',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click a.edit-permissions': function(e) {
                    this.children.permissionsDialog = new PermissionsDialog({
                        model: {
                            document: this.model.report,
                            nameModel: this.model.report.entry,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo,
                            application: this.model.application
                        },
                        collection: this.collection,
                        onHiddenRemove: true,
                        nameLabel: _('Report').t(),
                        showDispatchAs: true
                    });

                    this.children.permissionsDialog.render().appendTo($("body"));
                    this.children.permissionsDialog.show();
                    this.listenTo(this.children.permissionsDialog, 'hidden', function() {
                        // SPL-109045: Set dispatchAs to owner if report is scheduled.
                        if (this.model.report.entry.content.get('is_scheduled') && this.model.report.entry.content.get('dispatchAs') === 'user') {
                            this.model.report.entry.content.set('dispatchAs', 'owner');
                            this.model.report.save();
                        }
                    });

                    e.preventDefault();
                }
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _
                }));
                return this;
            },
            template: '\
                <a class="edit-permissions" href="#"><%- _("Edit").t() %></a>\
            '
        });
    }
);
