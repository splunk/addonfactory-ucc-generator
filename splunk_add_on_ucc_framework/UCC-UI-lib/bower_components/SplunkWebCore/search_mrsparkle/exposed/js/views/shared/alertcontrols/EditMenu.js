define(
    [
        'underscore',
        'module',
        'jquery',
        'models/search/Report',
        'views/Base',
        'views/shared/basemanager/MoveDialog',
        'views/shared/delegates/Popdown',
        'views/shared/documentcontrols/dialogs/permissions_dialog/Master',
        'views/shared/alertcontrols/dialogs/edit/Master',
        'views/shared/alertcontrols/dialogs/EnableDisableDialog',
        'views/shared/alertcontrols/dialogs/clone_dialog/Master',
        'views/shared/documentcontrols/dialogs/DeleteDialog',
        'uri/route'
    ],
    function(
        _,
        module,
        $,
        ReportModel,
        BaseView,
        MoveDialog,
        PopdownView,
        PermissionsDialog,
        EditDialog,
        EnableDisableDialog,
        CloneDialog,
        DeleteDialog,
        route
    )
    {
        return BaseView.extend({
            moduleId: module.id,
             /**
             * @param {Object} options {
             *     model: {
             *         savedAlert: <models.Report> type Alert,
             *         application: <models.Application>,
             *         user: <models.services.admin.User>,
             *         controller: <Backbone.Model> (Optional)
             *     },
             *     collection: {
             *         roles: <collections.services.authorization.Roles>,
             *         alertActions: <collections.shared.ModAlertActions>,
             *         appLocals: <collections.appLocals>
             *         searchBNFs: <collections/services/configs/SearchBNFs> (Optional) Only needed if the showSearchField is true.
             *     }
             *     {Boolean} button: (Optional) Whether or not the Edit dropdown has class btn-pill. Default is false and class is btn.
             *     {Boolean} showOpenActions: (Optional) Whether or not the open actions links are visable. Default is true.
             *     {Boolean} deleteRedirect: (Optional) Whether or not to redirect to reports page after delete. Default is false.
             *     {Boolean} showMove: (Optional) Whether or not to show the move option. Default is false.
             *     {Boolean} showAdvancedEdit: (Optional) Whether or not to show the advanced edit option. Default is false.
             *     {Boolean} showSearchField: (Optional) Whether to show an editable search field. Default is false.
             *     {String} entitySingular: Title of the type of entity.
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                var defaults = {
                    button: true,
                    gear: false,
                    showOpenActions: true,
                    deleteRedirect: false,
                    showMove: false,
                    showAdvancedEdit: false,
                    showSearchField: false
                };

                _.defaults(this.options, defaults);

                this.model.savedAlert.entry.content.on('change:disabled', this.render, this);
            },
            events: {
                'click a.edit-permissions': function(e) {
                    this.children.permissionsDialog = new PermissionsDialog({
                        model: {
                            document: this.model.savedAlert,
                            nameModel: this.model.savedAlert.entry,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo
                        },
                        collection: this.collection.roles,
                        onHiddenRemove: true,
                        nameLabel: _('Alert').t()
                    });

                    this.children.permissionsDialog.render().appendTo($("body"));
                    this.children.permissionsDialog.show();

                    e.preventDefault();
                },
                'click a.edit-alert': function(e) {
                    this.children.editAlertDialog = new EditDialog({
                        model:  {
                            alert: this.model.savedAlert,
                            application: this.model.application,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo,
                            controller: this.model.controller
                        },
                        collection: {
                            alertActions: this.collection.alertActions,
                            searchBNFs: this.collection.searchBNFs
                        },
                        onHiddenRemove: true,
                        showSearchField: this.options.showSearchField
                    });

                    this.children.editAlertDialog.render().appendTo($("body"));
                    this.children.editAlertDialog.show();

                    e.preventDefault();
                },
                'click a.enable-disable': function(e) {
                    this.children.enableDisableDialog = new EnableDisableDialog({
                        model: this.model.savedAlert,
                        onHiddenRemove: true
                    });

                    this.children.enableDisableDialog.render().appendTo($("body"));
                    this.children.enableDisableDialog.show();

                    e.preventDefault();
                },
                'click a.clone': function(e) {
                    this.children.cloneDialog = new CloneDialog({
                        model: {
                            savedAlert: this.model.savedAlert,
                            application: this.model.application
                        },
                        onHiddenRemove: true
                    });

                    this.children.cloneDialog.render().appendTo($("body"));
                    this.children.cloneDialog.show();

                    e.preventDefault();
                },
                'click a.delete': function(e){
                    this.children.deleteDialog = new DeleteDialog({
                        model: {
                            report: this.model.savedAlert,
                            application: this.model.application,
                            controller: this.model.controller
                        },
                        deleteRedirect: this.options.deleteRedirect,
                        onHiddenRemove: true
                    });

                    this.children.deleteDialog.render().appendTo($("body"));
                    this.children.deleteDialog.show();

                    e.preventDefault();
                },
                'click a.move': function(e){
                    this.children.moveDialog = new MoveDialog({
                        model: {
                            entity: this.model.savedAlert,
                            application: this.model.application,
                            controller: this.model.controller
                        },
                        collection: {
                            appLocals: this.collection.appLocals
                        },
                        entitySingular: this.options.entitySingular,
                        onHiddenRemove: true
                    });

                    this.children.moveDialog.render().appendTo($("body"));
                    this.children.moveDialog.show();
                    e.preventDefault();
                },
                'click a.advanced-edit': function(e) {
                    window.open(window.location.pathname + '/advancededit?s=' + encodeURI(this.model.savedAlert.id));
                    e.preventDefault();
                }
            },
            render: function() {
                var openInSearch = route.search(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        this.model.application.get("app"),
                        { data: { s: this.model.savedAlert.id }}),
                    canScheduleSearch = this.model.user.canScheduleSearch(),
                    canWrite = this.model.savedAlert.canWrite(canScheduleSearch, this.model.user.canRTSearch()),
                    canClone = this.model.savedAlert.canClone(canScheduleSearch, this.model.user.canRTSearch()),
                    canDelete = this.model.savedAlert.canDelete(),
                    canMove = this.model.savedAlert.canMove(),
                    canAdvancedEdit = this.options.showAdvancedEdit && this.model.savedAlert.canAdvancedEdit();

                if (canWrite || (1 < (0 + this.options.showOpenActions + canDelete + canClone +
                                      (this.options.showMove && canMove) + canAdvancedEdit))) {
                    this.$el.html(this.compiledTemplate({
                        _: _,
                        button: this.options.button,
                        gear: this.options.gear,
                        searchLink: openInSearch,
                        enableDiable: this.model.savedAlert.entry.content.get('disabled') ? _('Enable').t() : _('Disable').t(),
                        canChangePerms: this.model.savedAlert.entry.acl.get('can_change_perms'),
                        canAdvancedEdit: canAdvancedEdit
                    }));

                    if (this.options.showOpenActions) {
                        this.$('.open_actions').show();
                    } else {
                        this.$('.open_actions').remove();
                    }

                    if (!canWrite) {
                        this.$('.second-group').remove();
                    }

                    if (canClone) {
                        this.$('.third-group').append('<li><a href="#" class="clone">' + _("Clone").t() + '</a></li>');
                    }

                    if (this.options.showMove && canMove) {
                        this.$('.third-group').append('<li><a href="#" class="move">' + _("Move").t() + '</a></li>');
                    }

                    if (canDelete) {
                        this.$('.third-group').append('<li><a href="#" class="delete">' + _("Delete").t() + '</a></li>');
                    }
                    this.children.popdown = new PopdownView({ el: this.$el });
                } else {

                    if (this.options.showOpenActions) {
                        this.$el.append('<a class="' + (this.options.button ? "btn" : "") + '" href="' + openInSearch + '">' + _("Open in Search").t() +'</a>');
                    }
                    if (canClone) {
                        this.$el.append('<a class="clone' + (this.options.button ? " btn" : "") + '" href="#">' + _("Clone").t() +'</a>');
                    }
                    if (this.options.showMove && canMove) {
                        this.$el.append('<a class="move' + (this.options.button ? " btn" : "") + '" href="#">' + _("Move").t() +'</a>');
                    }
                    if (canDelete) {
                        this.$el.append('<a class="delete' + (this.options.button ? " btn" : "") + '" href="#">' + _("Delete").t() +'</a>');
                    }
                }

                return this;
            },
            template: '\
                <% if (gear) { %>\
                    <a class="dropdown-toggle <%- button ? "btn" : "" %>" href="#"><i class="icon-large icon-gear"></i> <span class="caret"></span></a>\
                <% } else { %>\
                    <a class="dropdown-toggle <%- button ? "btn" : "" %>" href="#"><%- _("Edit").t() %><span class="caret"></span></a>\
                <% } %>\
                <div class="dropdown-menu dropdown-menu-narrow">\
                    <div class="arrow"></div>\
                    <ul class="open_actions">\
                        <li><a href="<%= searchLink %>"><%- _("Open in Search").t() %></a></li>\
                    </ul>\
                    <ul class="second-group">\
                        <li><a class="edit-alert" href="#"><%- _("Edit Alert").t() %></a></li>\
                        <% if (canChangePerms) { %>\
                            <li><a class="edit-permissions" href="#"><%- _("Edit Permissions").t() %></a></li>\
                        <% } %>\
                        <li><a class="enable-disable" href="#"><%= enableDiable %></a></li>\
                        <% if (canAdvancedEdit) { %>\
                            <li><a class="advanced-edit" href="#"><%- _("Advanced Edit").t() %> <i class="icon-external"></i></a></li>\
                        <% } %>\
                    </ul>\
                    <ul class="third-group">\
                    </ul>\
                </div>\
            '
        });
    }
);
