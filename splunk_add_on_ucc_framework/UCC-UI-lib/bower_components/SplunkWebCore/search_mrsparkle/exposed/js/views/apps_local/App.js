define(
    [
        "jquery",
        "underscore",
        "views/Base",
        'models/apps_remote/Login',
        'views/apps_local/Enable',
        'views/apps_local/ObjectsDropDown',
        'views/apps_local/dialog/Master',
        'contrib/text!views/apps_local/App.html',
        "splunk.util",
        "uri/route"
    ],
    function(
        $,
        _,
        BaseView,
        LoginModel,
        EnableView,
        ObjectsDropDown,
        Dialog,
        AppTemplate,
        splunk_util,
        route
    ) {
        return BaseView.extend({
            className: 'add-on-tile-wrapper',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.enable = new EnableView({
                    model: {
                        local: this.model.local,
                        application: this.model.application
                    }
                });
                this.model.auth = new LoginModel();
                if (this.model.local) {
                    this.children.objectsDropDown = new ObjectsDropDown({
                        model: {
                            application: this.model.application,
                            appObjectsCounts: this.model.appObjectsCounts
                        },
                        appName: this.model.local.getTitle(),
                        appId: this.model.local.getAppId()
                    });
                }

                this.children.enable.on('enableDisable', function(checked) {
                    this.trigger('enableDisable', this.model.remote, checked);
                }.bind(this));
            },

            events: {
                'click .app-more-description, .app-less-description': function(e) {
                    e.preventDefault();
                    this.$('.app-description-short, .app-description-full').toggle();
                },
                'click .obj-btn': function(e) {
                    e.preventDefault();

                    var $target = $(e.currentTarget);
                    if (this.children.objectsDropDown && this.children.objectsDropDown.shown) {
                        this.children.objectsDropDown.hide();
                        return;
                    }
                    if (!this.children.objectsDropDown.$el.html()) {
                        this.children.objectsDropDown.render().hide();
                    }

                    if (!this.children.objectsDropDown.isAddedToDocument()) {
                        this.children.objectsDropDown.appendTo($("body"));
                    }
                    this.children.objectsDropDown.show($target);
                },
                'click .install-btn': function(e) {
                    e.preventDefault();
                    this.children.dialogView = new Dialog({
                        model: {
                            appRemote: this.model.remote,
                            auth: this.model.auth,
                            application: this.model.application,
                            serverInfo: this.model.serverInfo,
                            user: this.model.user
                        },
                        collection: {
                            messages: this.collection.messages
                        },
                        installSuccessCallback: this.options.installSuccessCallback,
                        appType: (this.model.remote.get('type') == 'addon') ? 'add-on' : 'app'
                    });

                    this.children.dialogView.on('onInstallSuccess', function() {
                        this.trigger('installed', this.model.remote);
                    }.bind(this));

                    $('body').append(this.children.dialogView.render().el);
                    this.children.dialogView.show();
                }
            },

            render: function() {
                var disabledApp = splunk_util.make_url("/static/img/skins/default/disabled_app.png"),
                    iconUrl = (this.model.local && this.model.local.isDisabled()) ? disabledApp : this.model.remote.getIcon(),
                    version = (this.model.local) ? this.model.local.getVersion() : this.model.remote.getVersion();

                this.$el.html(this.compiledTemplate({
                    icon: iconUrl,
                    title: _(this.model.remote.getTitle()).t(),
                    version: version,
                    description: this.model.remote.getDescription(),
                    descriptionMaxLength: 380,
                    certified: this.model.remote.get('cert_status')
                }));
                this._renderUpdate();
                this._renderEnable();
                this._renderActions();
                return this;
            },

            _renderUpdate: function() {
                if (this.model.local && this.model.local.getLink("update")) {
                    var implicitIdRequired = this.model.local.entry.content.get("update.implicit_id_required"),
                        updateText = implicitIdRequired ? _("Overwrite with").t() : _("Update to").t(),
                        updateVersion = this.model.local.entry.content.get("update.version"),
                        sbAppId = '',
                        details = this.model.local.getDetails();
                    
                    if (details && details.indexOf('/') != -1) {
                        var detailsParts = details.split('/');
                        sbAppId = detailsParts[detailsParts.length - 1];
                    
                    }
                    var namespace = this.model.application.get("app"),
                        queryStrings = {
                            return_to: "/manager/" + namespace + "/apps/local",
                            implicit_id_required: implicitIdRequired,
                            app_name: this.model.local.getTitle()
                        },
                        link = splunk_util.make_full_url("manager/appinstall/" + sbAppId, queryStrings);
                    
                    var template = _.template(this.updateTemplate, {
                            link: link,
                            updateText: updateText,
                            updateVersion: updateVersion
                        });
                    this.$(".version").append(template);
                }
            },

            _renderEnable: function() {
                var isDefaultApp = false;
                if (this.options && this.options.isDefaultApp) {
                    isDefaultApp = this.options.isDefaultApp;
                }

                // Detaching the children allow for events handlers to stay registered, even after re-rendering.
                if (this.children.enable) {
                    this.children.enable.detach();
                }
                if (this.model.local && (this.model.local.getLink("enable") || this.model.local.getLink("disable"))) {
                    this.$(".app-actions-placeholder").append(this.children.enable.render().$el);
                    this.children.enable.$('.enable-checkbox').attr("disabled", isDefaultApp);
                    this.$('.' + this.children.enable.className).tooltip('destroy');
                    if (isDefaultApp) {
                        this.$('.' + this.children.enable.className).tooltip({
                            title: _('You cannot disable an app if it is the default app.').t()
                        });
                    }
                }
            },

            renderEnable: function(isDefaultApp) {
                this.options.isDefaultApp = isDefaultApp;
                this._renderEnable();
            },

            _renderActions: function() {
                var locale = this.model.application.get("locale"),
                    appId = this.model.remote.getAppId();

                if (this.model.local) { // App is installed
                    if (!this.model.local.isDisabled()) {
                        // For Apps and add-ons that have UI (<=> visible), show the 'Open' link.
                        if (this.model.local.entry.content.get('visible')) {
                            var appLink = route.prebuiltAppLink(this.model.application.get('root'), this.model.application.get('locale'), appId, '');
                            this._addActionButton(_("Open").t(), appLink, 'open-app-btn');
                        }
                        var dropdownTemplate = _.template(this.dropdownTemplate, {
                            text: _("Objects").t(),
                            link: '#',
                            className: 'btn-objects obj-btn'
                        });
                        this.$(".app-actions").append(dropdownTemplate);
                    }
                    if (this.model.local.getLink("setup")) {
                        var queryStrings = {action: "edit"},
                            appName = this.model.local.getAppId(),
                            link = splunk_util.make_full_url("manager/" + appName + "/apps/local/" + appName + "/setup", queryStrings);
                        this._addActionButton(_("Set up").t(), link, 'btn-setup');
                    }
                } else { // App is not installed
                    this.$(".app-actions-placeholder").append(splunk_util.sprintf('<a class="btn btn-primary install-btn" href="#">%s</a>', _('Install').t()));
                }
            },

            _addActionButton: function(text, link, className) {
                var template = _.template(this.actionTemplate, {
                        text: text,
                        link: link,
                        className: className || ''
                    });
                this.$(".app-actions").append(template);
            },

            template: AppTemplate,

            actionTemplate: ' \
                <a class="btn <%- className %>" href="<%- link %>"><%- text %></a> \
            ',

            dropdownTemplate: ' \
                <a class="btn <%- className %>" href="<%- link %>">\
                    <%- text %>\
                    <b class="caret"></b>\
                </a> \
            ',

            updateTemplate: ' \
                <span class="version-divider">|</span> \
                <a href="<%- link %>"> \
                    <%- updateText %> <%- updateVersion %> \
                </a> \
            '
        });
    }
);