/**
 * Contents component of a permissions dialog or page that contains various input and display
 * controls for Owner, App, Permissions, etc.
 */

define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/shared/Permissions',
        'views/shared/controls/ControlGroup',
        'views/shared/permissions/ACL',
        'views/Base',
        'util/splunkd_utils',
        'uri/route',
        'splunk.util'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        PermissionsModel,
        ControlGroup,
        ACL,
        BaseView,
        splunkd_utils,
        route,
        splunkUtils
        ) {
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @constructor
             * @param options {
             *     displayForControlClass: <string> CSS class name for Control
             *     displayForLabel: <string> Label for name
             *     showDispatchAs: <boolean> to determine if the dispatchas control should be shown
             *     model: {
             *         serverInfo <models.services.server>
             *         user <models.services.authentication.User>
             *         inmem <models.ACLReadOnly>
             *         inmemDocument <models.report> (only required if showDispatchAs=true),
             *         application: <models.Application> (only required if showDispatchAs=true)
             *         searchLimit: <models.services.configs.searchLimit> (only required if showDispatchAs=true)
             *     }
             *     collection: <collections.services.authorization.Roles>
             * }
             */
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);

                var permission_tabs;

                this.model.perms = new PermissionsModel();

                this.model.perms.translateToPermsModel({
                    perms: this.model.inmem.permsToObj(),
                    rolesCollection: this.collection
                });

                this.children.owner = new ControlGroup({
                    controlType: 'Label',
                    controlOptions: {
                        modelAttribute: 'owner',
                        model: this.model.inmem
                    },
                    label: _('Owner').t()
                });

                if(this.model.user.canUseApps()){
                    this.children.app = new ControlGroup({
                        controlType: 'Label',
                        controlOptions: {
                            modelAttribute: 'app',
                            model: this.model.inmem
                        },
                        label: _('App').t()
                    });
                    permission_tabs = [
                        { label: _('Owner').t(), value: splunkd_utils.USER, className: 'user' },
                        { label: _('App').t(), value: splunkd_utils.APP, className: 'app' },
                        { label: _('All apps').t(), value: splunkd_utils.GLOBAL, className: 'global' }
                    ];
                }else{
                    if (this.model.inmem.get("sharing") === splunkd_utils.APP) {
                        this.model.inmem.set("sharing", splunkd_utils.GLOBAL);
                    }
                    permission_tabs = [
                        { label: _('Owner').t(), value: splunkd_utils.USER, className: 'user' },
                        { label: _('Global').t(), value: splunkd_utils.GLOBAL, className: 'global' }
                    ];
                }

                this.children.display_for = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    controlClass: this.options.displayForControlClass,
                    controlOptions: {
                        modelAttribute: 'sharing',
                        model: this.model.inmem,
                        items: permission_tabs,
                        save: false
                    },
                    label: this.options.displayForLabel
                });

                if (this.options.showDispatchAs && this.model.user.canEditDispatchAs()) {
                    var configDispatchAsHelpLink = route.docHelp(
                            this.model.application.get("root"),
                            this.model.application.get("locale"),
                            'learnmore.manager.saved.searches.dispatchAs'
                    );

                    if (this.model.inmemDocument.entry.content.get('is_scheduled')) {
                        this.children.dispatchAsOwnerOnly = new ControlGroup({
                            label: _("Run As").t(),
                            controlType:'Label',
                            controlOptions: {
                                defaultValue: _('Owner').t(),
                                tooltip: _("Scheduled reports must Run as Owner.").t()
                            },
                            help: '<a href="' + configDispatchAsHelpLink + '" target="_blank">' + _("Learn More").t() + ' <i class="icon-external"></i></a>'
                        });
                    } else if (splunkUtils.normalizeBoolean(this.model.searchLimit.entry.content.get('force_saved_search_dispatch_as_user'))) {
                        this.children.dispatchAsUserOnly = new ControlGroup({
                            label: _("Run As").t(),
                            controlType:'Label',
                            controlOptions: {
                                defaultValue: _('User').t(),
                                tooltip: _("Your Splunk administrator has forced shared searches to run as User.").t()
                            },
                            help: '<a href="' + configDispatchAsHelpLink + '" target="_blank">' + _("Learn More").t() + ' <i class="icon-external"></i></a>'
                        });
                    } else {
                        this.children.dispatchAs = new ControlGroup({
                            controlType: 'SyntheticRadio',
                            controlOptions: {
                                modelAttribute: 'dispatchAs',
                                model: this.model.inmemDocument.entry.content,
                                items: [
                                    { label: _('Owner').t(), value: 'owner' },
                                    { label: _('User').t(), value: 'user' }
                                ]
                            },
                            label: _('Run As').t(),
                            help: '<a href="' + configDispatchAsHelpLink + '" target="_blank">' + _("Learn More").t() + ' <i class="icon-external"></i></a>'
                        });
                    }
                }

                this.children.acl = new ACL({
                    model : {
                        inmem: this.model.inmem,
                        perms: this.model.perms,
                        serverInfo: this.model.serverInfo
                    },
                    collection: this.collection
                });

                this.listenTo(this.model.perms, 'change', function() {
                    var perms = this.model.perms.translateFromPermsModel();
                    this.model.inmem.set('perms', perms);
                });

                this.listenTo(this.model.inmem, 'change:sharing', this.toggleSharingViews);
            },

            setView: function() {
                if (!this.model.inmem.get("can_share_user")) {
                    this.children.display_for.$('.user').attr('disabled', true);
                }
                if (!this.model.inmem.get("can_share_app")) {
                    this.children.display_for.$('.app').attr('disabled', true);
                }
                if (!this.model.inmem.get("can_share_global")) {
                    this.children.display_for.$('.global').attr('disabled', true);
                }
                if(!this.model.inmem.get("modifiable")) {
                    this.children.display_for.$('.btn').attr('disabled', true);
                }
                this.toggleSharingViews();
            },
            toggleSharingViews: function() {
                if (this.model.inmem.get("sharing") === splunkd_utils.USER) {
                    this.children.acl.$el.hide();
                    if (this.children.dispatchAs) {
                        this.children.dispatchAs.$el.hide();
                    }
                    if (this.children.dispatchAsOwnerOnly) {
                        this.children.dispatchAsOwnerOnly.$el.hide();
                    }
                    if (this.children.dispatchAsUserOnly) {
                        this.children.dispatchAsUserOnly.$el.hide();
                    }
                } else {
                    this.children.acl.$el.show();
                    if (this.children.dispatchAsOwnerOnly) {
                        this.children.dispatchAsOwnerOnly.$el.show();
                    }
                    if (this.children.dispatchAsUserOnly) {
                        this.children.dispatchAsUserOnly.$el.show();
                    }
                    if (this.children.dispatchAs) {
                        this.children.dispatchAs.$el.show();
                    }
                }
            },
            render: function() {
                var template = _.template(this.template, {});
                this.$el.html(template);
                this.children.owner.render().appendTo(this.$('.permissions-view-container'));

                if (this.children.app) {
                    this.children.app.render().appendTo(this.$('.permissions-view-container'));
                }

                this.children.display_for.render().appendTo(this.$('.permissions-view-container'));

                if (this.children.dispatchAs) {
                    this.children.dispatchAs.render().appendTo(this.$('.permissions-view-container'));
                }

                if (this.children.dispatchAsOwnerOnly) {
                    this.children.dispatchAsOwnerOnly.render().appendTo(this.$('.permissions-view-container'));
                }

                if (this.children.dispatchAsUserOnly) {
                    this.children.dispatchAsUserOnly.render().appendTo(this.$('.permissions-view-container'));
                }

                if(this.model.user.canViewACL()){
                    this.children.acl.render().appendTo(this.$('.permissions-view-container'));
                }

                this.setView();

                return this;
            },
            template: '\
                <div class="permissions-view-container"></div>\
            '
        });
    });
