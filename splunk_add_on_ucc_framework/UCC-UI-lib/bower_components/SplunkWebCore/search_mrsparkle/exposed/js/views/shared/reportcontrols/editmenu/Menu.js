define(
    [
        'module',
        'jquery',
        'underscore',
        'models/classicurl',
        'views/shared/PopTart',
        'views/shared/basemanager/MoveDialog',
        'views/shared/documentcontrols/dialogs/EditSearchDialog',
        'views/shared/documentcontrols/dialogs/permissions_dialog/Master',
        'views/shared/reportcontrols/dialogs/schedule_dialog/Master',
        'views/shared/reportcontrols/dialogs/AccelerationDialog',
        'views/shared/documentcontrols/dialogs/DeleteDialog',
        'views/shared/reportcontrols/dialogs/clone_dialog/Master',
        'views/shared/reportcontrols/dialogs/embed_dialog/Master',
        'views/shared/reportcontrols/dialogs/EnableDisableDialog',
        'uri/route',
        'util/general_utils',
        'bootstrap.modal'
    ],
    function(
        module,
        $,
        _,
        classicUrlModel,
        PopTartView,
        MoveDialog,
        EditSearchDialog,
        PermissionsDialog,
        ScheduleDialog,
        AccelerationDialog,
        DeleteDialog,
        CloneDialog,
        EmbedDialog,
        EnableDisableDialog,
        route,
        util,
        bootstrapModal
    )
    {
        return PopTartView.extend({
            moduleId: module.id,
             /**
             * @param {Object} options {
             *      model: {
             *          report: <models.Report>,
             *          application: <models.Application>,
             *          searchJob: <models.services.search.Job> (Optional),
             *          appLocal: <models.services.AppLocal>,
             *          user: <models.service.admin.user>,
             *          serverInfo: <models.services.server.ServerInfo>,
             *          controller: <Backbone.Model> (Optional)
             *      },
             *      collection: {
             *          roles: <collections.services.authorization.Roles>,
             *          appLocals: <collections.appLocals>
             *      },
             *      {Boolean} button: (Optional) Whether or not the Edit dropdown has class btn-pill. Default is false and class is btn.
             *      {Boolean} showOpenActions: (Optional) Whether or not the open actions links are visable. Default is true.
             *      {Boolean} deleteRedirect: (Optional) Whether or not to redirect to reports page after delete. Default is false.
             *      {Boolean} showDisable: (optional) Whether or not to show the enable/disable option. Default is false.
             *      {Boolean} showMove: (optional) Whether or not to show the move option. Default is false.
             *      {Boolean} showAdvancedEdit: (Optional) Whether or not to show the advanced edit option. Default is false.
             *      {Boolean} showSearchField: (Optional) Whether to display a field to the user for entering the search string.
             *                                    Default is false
             *      {String} entitySingular: Title of the type of entity.
             * }
             */
            className: 'dropdown-menu dropdown-menu-narrow',
            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);
                var defaults = {
                        button: true,
                        showOpenActions: true,
                        deleteRedirect: false,
                        showDisable: false,
                        showMove: false,
                        showAdvancedEdit: false,
                        showSearchField: false
                    };

                _.defaults(this.options, defaults);

                if (this.model.searchJob){
                    this.model.searchJob.on("prepared", function() {
                        this.$('a.clone').removeClass('disabled');
                        this.$('a.edit-acceleration').removeClass('disabled');
                    }, this);
                }
            },
            events: {
                'click a.edit-description': function(e) {
                    this.hide();
                    this.children.editSearchDialog = new EditSearchDialog({
                        model: {
                            report: this.model.report,
                            user: this.model.user,
                            application: this.model.application
                        },
                        collection: this.collection,
                        onHiddenRemove: true,
                        showSearchField: this.options.showSearchField
                    });

                    this.children.editSearchDialog.render().appendTo($("body"));
                    this.children.editSearchDialog.show();

                    e.preventDefault();

                },
                'click a.edit-permissions': function(e) {
                    this.hide();
                    this.children.permissionsDialog = new PermissionsDialog({
                        model: {
                            document: this.model.report,
                            nameModel: this.model.report.entry,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo,
                            application: this.model.application
                        },
                        collection: this.collection.roles,
                        onHiddenRemove: true,
                        nameLabel: _('Report').t(),
                        showDispatchAs: true
                    });

                    this.children.permissionsDialog.render().appendTo($("body"));
                    this.children.permissionsDialog.show();
                    this.listenTo(this.children.permissionsDialog, 'hidden', function() {
                        // SPL-111103: Set dispatchAs to owner if report is scheduled.
                        if (this.model.report.entry.content.get('is_scheduled') && this.model.report.entry.content.get('dispatchAs') === 'user') {
                            this.model.report.entry.content.set('dispatchAs', 'owner');
                            this.model.report.save();
                        }
                    });

                    e.preventDefault();
                },
                'click a.edit-schedule': function(e) {
                    this.hide();
                    this.children.scheduleDialog = new ScheduleDialog({
                        model: {
                            report: this.model.report,
                            application: this.model.application,
                            user: this.model.user,
                            appLocal: this.model.appLocal,
                            serverInfo: this.model.serverInfo,
                            controller: this.model.controller
                        },
                        onHiddenRemove: true
                    });

                    this.children.scheduleDialog.render().appendTo($("body"));
                    this.children.scheduleDialog.show();

                    e.preventDefault();
                },
                'click a.edit-acceleration': function(e) {
                    this.hide();
                    this.children.accelerationDialog = new AccelerationDialog({
                        model: {
                            report: this.model.report,
                            searchJob: this.model.searchJob,
                            application: this.model.application,
                            controller: this.model.controller
                        },
                        onHiddenRemove: true
                    });

                    this.children.accelerationDialog.render().appendTo($("body"));
                    this.children.accelerationDialog.show();

                    e.preventDefault();
                },
                'click a.clone': function(e) {
                    this.hide();
                    this.children.cloneDialog = new CloneDialog({
                        model: {
                            report: this.model.report,
                            searchJob: this.model.searchJob,
                            application: this.model.application,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo
                        },
                        onHiddenRemove: true
                    });

                    this.children.cloneDialog.render().appendTo($("body"));
                    this.children.cloneDialog.show();

                    e.preventDefault();
                },
                'click a.embed': function(e) {
                    this.hide();
                    this.children.embedDialog = new EmbedDialog({
                        model: this.model,
                        onHiddenRemove: true
                    });

                    this.children.embedDialog.render().appendTo($("body"));
                    this.children.embedDialog.show();

                    e.preventDefault();
                },
                'click a.delete': function(e){
                    this.hide();
                    this.children.deleteDialog = new DeleteDialog({
                        model: {
                            report: this.model.report,
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
                'click a.open-in-search': function(e) {
                    var data = {};
                    if (this.model.searchJob && !this.model.searchJob.isNew()) {
                        data = classicUrlModel.toJSON();
                    } else {
                        data = {s: this.model.report.id};
                    }
                    var routeString = route.search(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            this.model.application.get('app'),
                            {data: data}
                        );
                    window.location = routeString;

                    e.preventDefault();
                },
                'click a.enable-disable': function(e) {
                    this.hide();
                    this.children.enableDisableDialog = new EnableDisableDialog({
                        model: this.model.report,
                        onHiddenRemove: true
                    });

                    this.children.enableDisableDialog.render().appendTo($("body"));
                    this.children.enableDisableDialog.show();

                    e.preventDefault();
                },
                'click a.move': function(e) {
                    this.hide();
                    this.children.moveDialog = new MoveDialog({
                        model: {
                            entity: this.model.report,
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
                    window.open(window.location.pathname + '/advancededit?s=' + encodeURI(this.model.report.id));
                    e.preventDefault();
                }
            },
            render: function() {
                var openInPivot = route.pivot(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        this.model.application.get("app"),
                        {data: {s: this.model.report.id}}
                     ),
                    canWrite = this.model.report.canWrite(this.model.user.canScheduleSearch(), this.model.user.canRTSearch()),
                    canClone = this.model.report.canClone(this.model.user.canScheduleSearch(), this.model.user.canRTSearch()),
                    canEmbed = this.model.report.canEmbed(this.model.user.canScheduleSearch(), this.model.user.canEmbed()),
                    canDelete = this.model.report.canDelete(),
                    canMove = this.model.report.canMove(),
                    canAdvancedEdit = this.model.report.canAdvancedEdit(),
                    isEmbedded = util.normalizeBoolean(this.model.report.entry.content.get('embed.enabled')),
                    isDisabled = this.model.report.entry.content.get('disabled');
                var html = this.compiledTemplate({
                    _: _,
                    button: this.options.button,
                    report: this.model.report,
                    user: this.model.user,
                    openInPivot: openInPivot
                });
                this.$el.html(PopTartView.prototype.template_menu);
                this.$el.append(html);
                
                if (isEmbedded) {
                    this.$('.edit_messages').append('<li class="message">' + _("Disable embedding to edit report.").t() + '</li>');
                    if (this.options.showDisable && isDisabled) {
                        this.$('.edit_messages').append('<li class="message">' + _('Disable embedding to disable report.').t() + '</li>');
                    }
                } else {
                    this.$('.edit_messages').remove();
                }

                if (this.options.showOpenActions) {
                    this.$('.open_actions').show();
                } else {
                    this.$('.open_actions').remove();
                }

                if (canWrite && !isEmbedded) {
                    var editDescriptionText = this.options.showSearchField ? _("Edit Search").t() : _("Edit Description").t();
                    this.$('.edit_actions').append('<li><a class="edit-description" href="#">' + editDescriptionText + '</a></li>');
                    
                    // Only show if user has perm to change perms
                    if (this.model.report.entry.acl.get('can_change_perms')) {
                        this.$('.edit_actions').append('<li><a class="edit-permissions" href="#">' + _("Edit Permissions").t() + '</a></li>');
                    }
                    if (this.model.user.canScheduleSearch() && !this.model.report.isRealTime()) {
                    // Check if real-time. User can not schedule a real-time search
                        this.$('.edit_actions').append('<li><a class="edit-schedule" href="#">' + _("Edit Schedule").t() + '</a></li>');
                    }
                    if (!this.model.report.isPivotReport() && this.model.user.canAccelerateReport()) {
                        this.$('.edit_actions').append('<li><a class="edit-acceleration" href="#">' + _("Edit Acceleration").t() + '</a></li>');
                    }

                    var enableText = isDisabled ? _('Enable').t() : _('Disable').t();
                    this.$('.edit_actions').append('<li><a class="enable-disable" href="#">' + enableText  + '</a></li>');

                    if (this.options.showAdvancedEdit && canAdvancedEdit) {
                        this.$('.edit_actions').append('<li><a href="#" class="advanced-edit">' + _("Advanced Edit").t() + ' <i class="icon-external"></i></a></li>');
                    }
                        
                } else {
                    this.$('.edit_actions').remove();
                }

                if (canClone) {
                    this.$('.other_actions').append('<li><a href="#" class="clone">' + _("Clone").t() + '</a></li>');
                }

                if (canEmbed) {
                    this.$('.other_actions').append('<li><a href="#" class="embed">' + _("Embed").t() + '</a></li>');
                }

                if (this.options.showMove && canMove) {
                    this.$('.other_actions').append('<li><a href="#" class="move">' + _("Move").t() + '</a></li>');
                }

                if (canDelete && !isEmbedded) {
                    this.$('.other_actions').append('<li><a href="#" class="delete">' + _("Delete").t() + '</a></li>');
                }

                if (this.model.searchJob && this.model.searchJob.isPreparing()) {
                    this.$('a.clone').addClass('disabled');
                    this.$('a.edit-acceleration').addClass('disabled');
                }
                return this;
            },
            template: '\
                <ul class="edit_messages ">\
                </ul>\
                <ul class="open_actions">\
                    <% if (report.openInView(user) === "pivot") { %>\
                        <li><a href="<%- openInPivot %>"><%- _("Open in Pivot").t() %></a></li>\
                    <% } else { %>\
                        <li><a class="open-in-search" href="#"><%- _("Open in Search").t() %></a></li>\
                    <% } %>\
                </ul>\
                <ul class="edit_actions">\
                </ul>\
                <ul class="other_actions">\
                </ul>\
            '
        });
    }
);
