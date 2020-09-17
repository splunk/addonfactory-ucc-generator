// splunk bar
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/litebar/SystemSection',
    'views/shared/litebar/Activity',
    'views/shared/ModalConfirmation/Master',
    'views/shared/Restart',
    'views/shared/litebar/Messages',
    'views/shared/splunkbar/noconnection/Master',
    'collections/shared/splunkbar/SystemMenuSections',
    'collections/services/data/ui/Managers',
    'contrib/text!views/shared/litebar/SideNav.html',
    'views/shared/delegates/Accordion',
    './SideNav.pcssm',
    'uri/route',
    'splunk.util',
    'util/splunkd_utils'
],
function(
    $,
    _,
    Backbone,
    module,
    BaseView,
    SystemSection,
    ActivityMenu,
    ConfirmDialog,
    RestartDialog,
    MessagesView,
    NoConnectionOverlay,
    SystemMenuSectionsCollection,
    ManagersCollection,
    sideTemplate,
    Accordion,
    css,
    route,
    splunkUtil,
    splunkDUtils
){
    var View = BaseView.extend({
        moduleId: module.id,
        template: sideTemplate,
        css: css,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.collection.sections = new SystemMenuSectionsCollection();

            this.children.accordion = new Accordion({
                el: this.el,
                inactiveIconName: "chevronRight",
                activeIconName: "chevronDown",
                collapsible: true
            });
            this.children.accordion.on('toggled', function() {
                this.setPrefs();
            }, this);

            this.children.activityMenu = new ActivityMenu({
                model: {
                    user: this.model.user,
                    application: this.model.application
                }
            });

            this.deferreds = {};
            this.deferreds.managers = $.Deferred();

            if (!this.collection.managers) {
                this.collection.managers = new ManagersCollection();
                this.bootstrapManagers();
            } else {
                this.deferreds.managers.resolve();
            }

            //listen for restart events
            $(document).on('restart_failed', function() {
                this.hideRestartModal();
            }.bind(this));

            this.canRestart = this.model.user.canRestart();

            this.children.confirmDialog = new ConfirmDialog({
                text: _("Are you sure you want to restart Splunk Light?").t()
            });
            this.children.confirmDialog.on('success', function() {
                this.showRestartModal();
                splunkUtil.restart_server();
            }.bind(this));

            this.children.messages = new MessagesView({
                collection: {
                    messages: this.collection.messages,
                    legacyMessages: this.collection.legacyMessages,
                    apps: this.collection.apps
                },
                model: {
                    serverInfo: this.model.serverInfo,
                    application: this.model.application,
                    user: this.model.user,
                    userPref: this.model.userPref,
                    updateChecker: this.model.updateChecker,
                    webConf: this.model.webConf
                }
            });
        },

        events: {
            'click #control' : function(e) {
                e.preventDefault();
                if (this.canRestart) {
                    this.children.confirmDialog.render().el;
                    this.children.confirmDialog.show();
                }
            }
        },

        bootstrapManagers: function() {
            this.collection.managers.fetch({
                data: {
                    app: '-',
                    owner: this.model.application.get('owner'),
                    count: 0,
                    digest: 1
                },
                success: function(collection, response, options) {
                    this.deferreds.managers.resolve();
                }.bind(this),
                error: function(collection, response, options) {
                    this.deferreds.managers.resolve();
                }.bind(this)
            });
        },

        buildSections: function() {
            this.collection.sections.add({
                id: 'knowledge_configurations',
                label: _('Knowledge').t(),
                icon: 'bookmark',
                order: 2
            });

            // TODO - ahebert: remove this hack when capabilities are set on each page
            // of the following sections
            if (this.model.user.isAdmin() || this.model.user.isCloudAdmin()) {
                this.collection.sections.add({
                    id: 'data_configurations',
                    label: _('Data').t(),
                    icon: 'data',
                    order: 1
                });
                this.collection.sections.add({
                    id: 'system_configurations',
                    label: _('System').t(),
                    icon: 'settings',
                    order: 3
                });
            }
            _.each(this.collection.managers.models, function(manager) {
                var menuUrl = manager.entry.content.get('menu.url') || '',
                    sectionName = manager.entry.content.get('menu.name'),
                    disabledByLicense = splunkUtil.normalizeBoolean(manager.entry.content.get('disabled_by_license') || false),
                    order = manager.entry.content.get('menu.order') || 1000,
                    pageStart = route.encodeRoot(this.model.application.get('root'), this.model.application.get('locale')),
                    url = pageStart + splunkUtil.sprintf(menuUrl, {namespace: 'search'});

                if (!disabledByLicense && sectionName) {
                    var section = this.collection.sections.get(sectionName);
                    if (section) {
                        var sectionItems = section.get('items');
                        if (sectionItems) {
                            sectionItems.push(manager);
                        }
                    }
                }
                manager.set({
                    url: url,
                    order: order
                });
            }.bind(this));

            this.collection.sections.each(function(section) {
                if (section.get('items') && section.get('items').length === 0) {
                    return;
                }

                var sectionView = new SystemSection({
                    model: section,
                    id: section.get('label').toLowerCase().replace(/ /g,'')
                });

                this.$('[data-role=sidenav-menu]').append(sectionView.render().el);
            }.bind(this));

            var activeSideNavs = this.model.userPref.entry.content.get('display.prefs.activeSideNav') || [];
            _.each(this.$('[data-accordion-role=group]'), function(node) {
                if (activeSideNavs.indexOf(node.id) > -1) {
                    this.children.accordion.showGroup($(node), false);
                }
            }.bind(this));
        },

        showRestartModal: function() {
                this.children.restartDialog = new RestartDialog({
                    model: {
                        serverInfo: this.model.serverInfo
                    }
                });
                // Necessary for modal to render correctly in manager.
                $('body').append('<div class="splunk-components restartModal"></div>');
                $('.restartModal').append(this.children.restartDialog.render().el);
                this.children.restartDialog.show();
        },

        hideRestartModal: function() {
            if (this.children.restartDialog) {
                this.children.restartDialog.hide();
            }
        },

        _setInitials: function() {
            var name = this.model.user.entry.content.get("realname") || this.model.user.entry.get("name") || "",
                names = name.split(/\s/),
                first = (names.length > 0) ? names[0].charAt(0) : "",
                last = (names.length > 1) ? names[names.length - 1].charAt(0) : "";

            this.$('.user-name').html(first + last);
        },

        setPrefs: function(e) {
            var activeNavs = '|',
                elements = this.$('[data-accordion-role=group]');
            for (var i = 0; i < elements.length; i++) {
                if ($(elements[i]).attr('data-active')) {
                    activeNavs = activeNavs.concat($(elements[i]).attr('id')).concat('|');
                }
            }
            this.model.userPref.entry.content.set({
                'display.prefs.activeSideNav': activeNavs
            });
            this.model.userPref.save({}, {silent: true});
        },

        liteMessages: function() {
            this.MAX_RETRIES_BEFORE_FAIL = 3;
            this.MESSAGES_POLLING_DELAY_STANDARD = 60000;
            this.MESSAGES_POLLING_DELAY_HI_FREQ = 1000;
            this.cntRetries = 0;

            this.children.noConnectionOverlay = new NoConnectionOverlay();
            $('body').append(this.children.noConnectionOverlay.render().el);

            this.collection.messages.on('serverValidated', function(success, context, messages) {
                if (success && this.cntRetries > 0) {
                    this.restartMessagePolling(this.MESSAGES_POLLING_DELAY_STANDARD);
                    this.children.noConnectionOverlay.hide();
                    this.cntRetries = 0;
                    return;
                }
                var netErrorMsg = _.find(messages, function(msg) {
                    return msg.type == splunkDUtils.NETWORK_ERROR || 'network_error';
                });
                if (netErrorMsg) {
                    if (this.cntRetries == 0) {
                        this.restartMessagePolling(this.MESSAGES_POLLING_DELAY_HI_FREQ);
                    }
                    if (this.cntRetries >= this.MAX_RETRIES_BEFORE_FAIL) {
                        this.children.noConnectionOverlay.show();
                    }
                    this.cntRetries += 1;
                }
            }, this);
            this.$('[data-role=messages]').replaceWith(this.children.messages.render().el);
            this.restartMessagePolling(this.MESSAGES_POLLING_DELAY_STANDARD);
        },

        restartMessagePolling: function(interval) {
            this.collection.messages.stopPolling();
            this.collection.messages.startPolling({delay: interval, uiInactivity: true, stopOnError: false, data: {count: 1000}});
        },

        render: function() {
            this.$el.html(this.compiledTemplate({
                css: this.css
            }));
            this.liteMessages();

            this.$('[data-role=sidenav-menu]').prepend(this.children.activityMenu.render().el);

            $.when(this.deferreds.managers).then(function() {
                this.buildSections();
            }.bind(this));

            if (!this.canRestart) {
                this.$('#control').remove();
            }

            if (!this.model.user.canEditReceiving()) {
                this.$('#forwardreceive').remove();
            }

            if (!this.model.user.canViewLicense()) {
                this.$('#licensing_stacks').remove();
            }

            if (!this.model.user.canEditUsers()) {
                this.$('#authentication_users').remove();
            }

            if (this.model.serverInfo.isLiteFree()) {
                this.$('[id$=resource_usage]').remove();
                this.$('[id$=forwarder_monitoring]').remove();
                this.$('[id$=platform_alerts]').remove();
            }

            this.$('.sidenav-body a').attr('tabindex', '-1');
            return this;
        }
    });
    return View;
    }
);
