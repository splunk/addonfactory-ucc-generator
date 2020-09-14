define(
    [
        'module',
        'jquery',
        'underscore',
        '../Base',
        'views/shared/PopTart',
        'util/pdf_utils',
        'util/infodelivery_utils',
        'views/dashboards/table/controls/InfoDelivery',
        'views/dashboards/table/controls/Configure',
        'views/shared/InfoDevInstallModal'
    ],
    function(module,
             $,
             _,
             BaseDashboardView,
             PopTartView,
             PDFUtils,
             infoUtils,
             InfoDeliveryDialog,
             ConfigureDialog,
             InfoDevInstallModal
        )
    {

        var defaults = {
            button: true,
            showOpenActions: true,
            deleteRedirect: false
        };

        var OtherMenu = PopTartView.extend({
            className: 'dropdown-menu other-menu',
            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);
                _.defaults(this.options, defaults);
                this._menuModel = {
                    allowEditPermission: this.model.view.entry.acl.get('can_change_perms') && this.model.view.entry.acl.canWrite(),
                    allowConvertToHTML: this.model.view.isSimpleXML() && !this.model.serverInfo.isLite() && this.model.view.entry.acl.canWrite() && this.model.user.canEditViewHtml(),
                    allowClone: !this.model.view.isHTML() || this.model.user.canEditViewHtml(),
                    allowMakeHome: !this.model.serverInfo.isLite() && this.model.view.isSimpleXML() && !(this.model.userPref.entry.content.get('display.page.home.dashboardId') === this.model.view.get('id')),
                    allowDelete: this.model.view.entry.acl.canWrite() && this.model.view.entry.acl.get('removable')
                };
            },
            events: {
                'click a.edit-perms': function(e) {
                    e.preventDefault();
                    this._triggerControllerEvent('action:edit-permission');
                },
                'click a.convert-to-html': function(e) {
                    e.preventDefault();
                    this._triggerControllerEvent('action:convert-html');
                },
                'click a.clone': function(e) {
                    e.preventDefault();
                    this._triggerControllerEvent('action:clone');
                },
                'click a.make-home': function(e) {
                    e.preventDefault();
                    this._triggerControllerEvent('action:make-home');
                },
                'click a.delete': function(e) {
                    e.preventDefault();
                    this._triggerControllerEvent('action:delete');
                }
            },
            _triggerControllerEvent: function() {
                this.model.controller.trigger.apply(this.model.controller, arguments);
                this.hide();
            },
            render: function() {
                this.$el.html(PopTartView.prototype.template_menu);
                this.$el.append(this.compiledTemplate(this._menuModel));
                return this;
            },
            isEmpty: function() {
                return !_.some(_.values(this._menuModel));
            },
            template: '\
                    <ul class="first-group">\
                        <% if(allowEditPermission) { %>\
                        <li><a href="#" class="edit-perms"><%- _("Edit Permissions").t() %></a></li>\
                        <% } %>\
                        <% if (allowConvertToHTML) { %>\
                        <li><a href="#" class="convert-to-html"><%- _("Convert to HTML").t() %></a></li>\
                        <% } %>\
                    </ul>\
                    <ul class="second-group">\
                        <% if (allowClone) { %>\
                        <li><a href="#" class="clone"><%- _("Clone").t() %></a></li>\
                        <% } %>\
                        <% if (allowMakeHome) { %>\
                        <li><a href="#" class="make-home"><%- _("Set as Home Dashboard").t() %></a></li>\
                        <% } %>\
                        <% if(allowDelete) { %>\
                        <li><a href="#" class="delete"><%- _("Delete").t() %></a></li>\
                        <% } %>\
                    </ul>\
            '
        });

        var ExportMenu = PopTartView.extend({
            className: 'dropdown-menu export-menu',
            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);
                _.defaults(this.options, defaults);
            },
            events: {
                'click a.edit-export-png': function (e) {
                    e.preventDefault();
                    if ($(e.currentTarget).is('.disabled')) {
                        return;
                    }
                    this._triggerControllerEvent('action:export-png');
                },
                'click a.edit-export-pdf': function(e) {
                    e.preventDefault();
                    this._triggerControllerEvent('action:export-pdf');
                },
                'click a.edit-schedule-pdf': function(e) {
                    e.preventDefault();
                    if ($(e.currentTarget).is('.disabled')) {
                        return;
                    }
                    this._triggerControllerEvent('action:schedule-pdf');
                },
                'click a.edit-print': function(e) {
                    e.preventDefault();
                    this._triggerControllerEvent('action:print');
                },
                'click a.improved-info-delivery': function(e) {
                    e.preventDefault();
                    var infoDialog = new InfoDeliveryDialog({
                        model: {
                            dashboard: this.model.view,
                            application: this.model.application,
                            user: this.model.user,
                            displayShowAgain: false
                        },
                        onHiddenRemove: true
                    });
                    infoDialog.render().appendTo($('body'));
                    infoDialog.show();

                    // when the Install add-on is pressed, show the app install dialog
                    infoDialog.on('info-dev-install', function () {
                        infoDialog.hide();
                        // trigger the download and install modal to be displayed
                        var installDialog = new InfoDevInstallModal({
                            model: this.model,
                            collection: this.collection
                        });
                        installDialog.render().appendTo($('body'));
                        installDialog.show();
                    }, this);

                    // hides drop down
                    this.children.popdownDialogDelegate.hide();
                }
            },
            _triggerControllerEvent: function() {
                this.model.controller.trigger.apply(this.model.controller, arguments);
                this.hide();
            },
            render: function() {
                this.$el.html(PopTartView.prototype.template_menu);
                this.$el.append(this._getTemplate());
                return this;
            },
            _getTemplate: function() {
                var menuModel = {
                    canWrite: this.model.view.entry.acl.canWrite(),
                    isSimpleXML: this.model.view.isSimpleXML(),
                    userCanSchedule: this.model.user.canSchedulePDF(),
                    viewSchedulable: this.model.view.canSchedulePDF(),
                    viewPdfSchedulable: PDFUtils.isPDFGenAvailable() && this.model.view.canSchedulePDF(),
                    canExport: this.model.view.isSimpleXML() && PDFUtils.isPDFGenAvailable(),
                    isForm: this.model.view.isForm(),
                    infoDeliveryEnabled: this.options.infoDeliveryEnabled,
                    infoDeliveryInstalled: this.options.infoDeliveryInstalled,
                    infoDeliveryConfigured: this.options.infoDeliveryConfigured,
                    infoDeliveryAvailable: this.options.infoDeliveryEnabled && this.options.infoDeliveryInstalled &&
                        this.options.infoDeliveryConfigured
                };
                return this.compiledTemplate(menuModel);
            },
            isEmpty: function() {
                return false; // There're will be at least one print item
            },
            template: '\
                <ul class="first-group">\
                    <% if(isSimpleXML && infoDeliveryAvailable) { %>\
                        <li><a href="#" class="edit-export-pdf"><%- _("Export PDF").t() %></a></li>\
                        <% if(isForm) { %>\
                            <li><a href="#" class="edit-export-png disabled"><%- _("Export PNG").t() %></a></li>\
                        <% } else {%>\
                            <li><a href="#" class="edit-export-png"><%- _("Export PNG").t() %></a></li>\
                        <% } %>\
                    <% } else if (canExport) { %>\
                        <li><a href="#" class="edit-export-pdf"><%- _("Export PDF").t() %></a></li>\
                    <% } else { %>\
                        <li><a href="#" class="edit-export-pdf disabled"><%- _("Export PDF").t() %></a></li>\
                    <% } %>\
                    <% if (infoDeliveryAvailable ) { %>\
                        <% if (userCanSchedule) { %>\
                            <% if (viewSchedulable) { %>\
                                <li><a href="#" class="edit-schedule-pdf"><%- _("Schedule Dashboard Delivery").t() %></a></li>\
                            <% } else { %>\
                                <li><a href="#" class="edit-schedule-pdf disabled"><%- _("Schedule Dashboard Delivery").t() %></a></li>\
                            <% } %>\
                        <% } %>\
                    <% } else { %>\
                        <% if (userCanSchedule) { %>\
                            <% if (viewPdfSchedulable) { %>\
                                <li><a href="#" class="edit-schedule-pdf"><%- _("Schedule PDF Delivery").t() %></a></li>\
                            <% } else { %>\
                                <li><a href="#" class="edit-schedule-pdf disabled"><%- _("Schedule PDF Delivery").t() %></a></li>\
                            <% } %>\
                        <% } %>\
                    <% } %>\
                    <li><a href="#" class="edit-print"><%- _("Print").t() %></a></li>\
                    <% if(userCanSchedule && infoDeliveryEnabled && !infoDeliveryInstalled) { %>\
                        <li><a href="#" class="improved-info-delivery"><%- _("Splunk Dashboard Export Add-on").t() %></a></li>\
                    <% } %>\
                </ul>\
            '
        });

        return BaseDashboardView.extend({
            moduleId: module.id,
            viewOptions: {
                register: false
            },
            className: 'dashboard-menu pull-right',
            initialize: function() {
                BaseDashboardView.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click a.edit-btn': function(e) {
                    e.preventDefault();
                    this.model.controller.trigger('mode:edit');
                },
                'click a.edit-export': function(e) {
                    e.preventDefault();

                    // gets the results from user prefs
                    // pass in list of apps to check if infoDelivery is installed
                    // pass in options.owner and options.app to help create proper urls
                    infoUtils.getInfoDeliveryFlags(this.collection.apps.models, this.model.userPref).then(function (result) {
                        // used to prevent drop down from appearing when it shouldn't
                        var suppressDropDown;

                        // set result to model so it can be accessed elsewhere (action helper for example)
                        // if result is undefined the flags will be defaulted to false
                        this.model.infoDeliveryUIControl = result;

                        // if there is an error retrieving the flags OR if not enabled default to showing drop down menu and exit
                        // if the view cannot be scheduled do not display ad/configure modal
                        if(_.isUndefined(result) || !result.infoDeliveryEnabled || !this.model.view.canSchedulePDF()) {
                            this._showDropdownMenu(e);
                            return;
                        }

                        // if not configured make sure to force original functionality to load
                        // show configure modal if not configured and if the do not show this again button was not pressed
                        if (!result.infoDeliveryConfigured  && result.infoDeliveryInstalled && result.showConfigureModal) {
                            // prompt user to either configure or continue using old method
                            var configureDialog = new ConfigureDialog({
                                model: {
                                    dashboard: this.model.view,
                                    application: this.model.application,
                                    user: this.model.user
                                },
                                onHiddenRemove: true
                            });

                            configureDialog.render().appendTo($('body'));
                            configureDialog.show();

                            // user has not configured
                            configureDialog.on('hidden', function () {
                                this._showDropdownMenu(e);
                                // only update if the stored value is different then what is saved
                                if (configureDialog.model.inmem.get('update') != result.showConfigureModal) {
                                    infoUtils.hideModal('config', false, this.model.userPref);
                                }
                            }, this);

                            // prevent other actions from occurring
                            return;
                        }

                        // Can turn off app in system/local/ui-prefs.conf
                        if (!result.infoDeliveryInstalled && result.showInfoAdModal) {

                            var infoDialog = new InfoDeliveryDialog({
                                model: {
                                    dashboard: this.model.view,
                                    application: this.model.application,
                                    user: this.model.user,
                                    displayShowAgain: true
                                },
                                onHiddenRemove: true
                            });
                            infoDialog.render().appendTo($('body'));
                            infoDialog.show();

                            // event listeners

                            // when the Install add-on is pressed, show the app install dialog
                            infoDialog.on('info-dev-install', function () {
                                // hide current dialog
                                infoDialog.hide();
                                // prevent the drop down from showing
                                suppressDropDown = true;
                                // trigger the download and install modal to be displayed
                                var installDialog = new InfoDevInstallModal({
                                    model: this.model,
                                    collection: this.collection
                                });
                                installDialog.render().appendTo($('body'));
                                installDialog.show();

                            }, this);

                            // when the ad modal is hidden check to see if do not show again was checked and then
                            // show the drop down menu
                            infoDialog.on('hidden', function () {
                                // only update showInfoAdModal if the value has changed
                                if (infoDialog.model.inmem.get('update') != result.showInfoAdModal) {
                                    infoUtils.hideModal('ad', infoDialog.model.inmem.get('update'),this.model.userPref);
                                }

                                // only suppress when install button is clicked
                                if (suppressDropDown) {
                                    suppressDropDown = false; // reset so drop down can keep being displayed
                                } else {
                                    this._showDropdownMenu(e);
                                }

                            }, this);
                        } else {
                            // show drop down by default
                            this._showDropdownMenu(e);
                        }

                    }.bind(this));
                },
                'click a.modal-btn-close': function(e) {
                    e.preventDefault();
                },
                'click a.edit-other': function(e) {
                    e.preventDefault();
                    var otherMenu = new OtherMenu({
                        model: this.model
                    });
                    if (!otherMenu.isEmpty()) {
                        this.children.otherMenu = otherMenu;
                        this.children.otherMenu.once('hide', this.children.otherMenu.remove);
                        $('body').append(this.children.otherMenu.render().$el);
                        var $btn = $(e.currentTarget);
                        $btn.addClass('active');
                        this.children.otherMenu.show($btn);
                        this.children.otherMenu.once('hide', function() {
                            $btn.removeClass('active');
                        });
                    }
                }
            },
            // display export menu
            _showDropdownMenu: function(e) {
                var exportMenu = new ExportMenu({
                    model: this.model,
                    collection: {
                        apps: this.collection.apps
                    },
                    infoDeliveryEnabled: this.model.infoDeliveryUIControl ? this.model.infoDeliveryUIControl.infoDeliveryEnabled : false,
                    infoDeliveryInstalled: this.model.infoDeliveryUIControl ? this.model.infoDeliveryUIControl.infoDeliveryInstalled : false,
                    infoDeliveryConfigured: this.model.infoDeliveryUIControl ? this.model.infoDeliveryUIControl.infoDeliveryConfigured : false
                });

                if (!exportMenu.isEmpty()) {
                    this.children.exportMenu = exportMenu;
                    this.children.exportMenu.once('hide', this.children.exportMenu.remove);
                    $('body').append(this.children.exportMenu.render().$el);
                    var $btn = $(e.currentTarget);
                    $btn.addClass('active');
                    this.children.exportMenu.show($btn);
                    this.children.exportMenu.once('hide', function() {
                        $btn.removeClass('active');
                    });
                }
            },
            _triggerControllerEvent: function() {
                // trigger event in action helper
                this.model.controller.trigger.apply(this.model.controller, arguments);
                this.hide();
            },
            render: function() {
                var menuModel = {
                    canWrite: this.model.view.entry.acl.canWrite()
                };
                this.$el.html(this.compiledTemplate(menuModel));
                return this;
            },
            template: '\
            <span class="dashboard-view-controls">\
               <% if(canWrite) { %>\
                    <a class="btn edit-btn" href="#"><%- _("Edit").t() %></a>\
               <% } %>\
                <a class="btn edit-export" href="#"><%- _("Export").t() %> <span class="caret"></span></a>\
                <a class="btn edit-other" href="#">...</a>\
            </span>\
        '
        });
    }
);