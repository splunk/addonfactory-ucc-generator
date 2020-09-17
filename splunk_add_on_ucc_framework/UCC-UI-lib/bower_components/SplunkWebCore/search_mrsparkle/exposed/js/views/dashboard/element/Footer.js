/**
 *         ( (
 *          ) )
 *       ........
 *       |      |]  We turn coffee into code
 *       \      /
 *        `----'
 */
define(
    [
        'module',
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'views/dashboard/Base',
        'views/dashboard/element/TimeIndicator',
        'views/shared/jobstatus/buttons/ExportResultsDialog',
        'models/search/Job',
        'splunkjs/mvc/postprocessmanager',
        'splunkjs/mvc/savedsearchmanager',
        'splunkjs/mvc/utils',
        'util/general_utils',
        'util/infodelivery_utils',
        'splunk.util',
        'splunk.window',
        'uri/route',
        'views/shared/PopTart',
        'views/dashboard/element/Footer.pcss',
        'views/dashboards/table/controls/Configure'
    ], function(module,
                $,
                _,
                Backbone,
                BaseView,
                BaseDashboardView,
                TimeIndicator,
                ExportResultsDialog,
                SearchJobModel,
                PostProcessSearchManager,
                SavedSearchManager,
                MvcUtils,
                GeneralUtils,
                infoUtils,
                SplunkUtil,
                SplunkWindow,
                Route,
                PopTartView,
                css,
                ConfigureDialog) {

        var FloatButton = BaseView.extend({
            tagName: 'a',
            className: 'btn-pill',
            defaults: {
                enabled: true,
                visible: true
            },
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.listenTo(this.model, 'change', this.render);
            },
            render: function() {
                var attributes = _.defaults(this.model.toJSON(), this.defaults);
                attributes.clazz = attributes.clazz || attributes.id;

                this.$el[attributes.enabled ? 'removeClass' : 'addClass']('disabled');
                this.$el[attributes.visible ? 'removeClass' : 'addClass']('hidden');
                this.$el[attributes.visible ? 'show' : 'hide']();
                this.$el.addClass(attributes.clazz);
                this.$el.attr('title', attributes.text);
                this.$el.html(this.compiledTemplate(attributes));

                // display tooltip
                this.$el.tooltip("destroy");
                attributes.visible && (this.$el.tooltip({animation: false, container: "body"}));
                return this;
            },
            events: {
                'click': '_onButtonClick'
            },
            _onButtonClick: function(e) {
                e.preventDefault();
                if (this.model.get('enabled') !== false) {
                    var action = this.model.get('action') || this.model.get('id');
                    this.trigger(action);
                }
            },
            template: '\
                <i class="<%- icon %>"></i>\
                <span class="hide-text"><%- text %></span>\
                '
        });
        
        var SearchStoppedIndicator = BaseView.extend({
            tagName: 'span',
            className: 'search-stopped-indicator',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.listenTo(this.model, 'change', this.toggle);
            },
            toggle: function() {
                var showMessage = this.model.get('finalizedByUser');
                this.$el.toggle(showMessage);
            },
            render: function() {
                this.$el.text(this.model.get('text'));
                this.toggle();
                return this;
            }
        });

        var ExportOptions = PopTartView.extend({
            className: 'dropdown-menu panel-export',
            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);
                _.defaults(this.options, this.defaults);
            },
            // panel export click event will trigger either an export modal or a direct PNG download
            events: {
                'click .export-png': function(e) {
                    e.preventDefault();
                    this.trigger('panel-export-click', 'png');
                },
                'click .export-csv': function() {
                    this.trigger('panel-export-click', 'csv');
                },
                'click .export-xml': function() {
                    this.trigger('panel-export-click', 'xml');
                },
                'click .export-json': function() {
                    this.trigger('panel-export-click', 'json');
                }
            },
            render: function() {
                var menuModel = {
                    canWrite: this.model.view.entry.acl.canWrite(),
                    isSimpleXML: this.model.view.isSimpleXML(),
                    isForm: this.model.view.isForm()
                };
                this.$el.html(PopTartView.prototype.template_menu);
                this.$el.append(this.compiledTemplate(menuModel));
                return this;
            },
            template: '\
                <ul class="first-group">\
                    <li><a href="#" class="export-png"><%- _("PNG").t() %></a></li>\
                </ul>\
                <ul class="second-group">\
                    <li><a href="#" class="export-csv"><%- _("CSV").t() %></a></li>\
                    <li><a href="#" class="export-xml"><%- _("XML").t() %></a></li>\
                    <li><a href="#" class="export-json"><%- _("JSON").t() %></a></li>\
                </ul>\
            '
        });

        return BaseDashboardView.extend({
            moduleId: module.id,
            className: 'element-footer', // we use a new class instead of panel-footer
            viewOptions: {
                register: false
            },
            initialize: function(options) {
                BaseDashboardView.prototype.initialize.apply(this, arguments);
                this.model = _.extend({}, this.model, {
                    menus: {
                        search: new Backbone.Model({
                            id: 'search',
                            icon: 'icon-search',
                            text: _('Open in Search').t()
                        }),
                        pivot: new Backbone.Model({
                            id: 'pivot',
                            icon: 'icon-pivot',
                            text: _('Open in Pivot').t()
                        }),
                        'export': new Backbone.Model({
                            id: 'export',
                            icon: 'icon-export',
                            text: _('Export').t()
                        }),
                        inspect: new Backbone.Model({
                            id: 'inspect',
                            icon: 'icon-info',
                            text: _('Inspect').t()
                        }),
                        refresh: new Backbone.Model({
                            id: 'refresh',
                            icon: 'icon-rotate-counter',
                            text: _('Refresh').t()
                        }),
                        searchFinalized: new Backbone.Model({
                            id: 'searchFinalized',
                            text: _('Stopped').t(),
                            finalizedByUser: false
                        }),
                        stopSearch: new Backbone.Model({
                            id: 'stopSearch',
                            icon: 'icon-stop',
                            text: _('Stop').t(),
                            visible: false
                        })
                    }
                });
                this.searchJobModel = new SearchJobModel();
                this.listenTo(this.settings, 'change:managerid change:manager', this._bindSearchManager);
                this.listenTo(this.settings, 'change', this.render);
                this.deferreds = _.extend({}, options.deferreds);
                this.reportReady = this.deferreds.reportReady || $.Deferred().resolve();
                this.reportReady.state() === 'pending' && this.reportReady.then(this.render.bind(this));
                this._bindSearchManager();
            },
            _bindSearchManager: function() {
                this.managerid = this.settings.get('managerid') || this.settings.get('manager');
                if (this.managerid) {
                    this.unbindFromComponent(this.managerid, this.onManagerChange, this);
                    this.bindToComponent(this.managerid, this.onManagerChange, this);
                }
            },
            onManagerChange: function(managers, manager) {
                if (this.manager) {
                    this.manager.off(null, null, this);
                    this.manager = null;
                }

                if (manager) {
                    this.manager = manager;
                    this.listenTo(manager, "search:start", this._onSearchStart);
                    this.listenTo(manager, "search:done", this._onSearchDone);

                    if (this.manager.hasJob()) {
                        this._onSearchStart();
                    }
                    this.manager.replayLastSearchEvent(this);
                }
            },
            render: function() {
                if (this.reportReady.state() === 'resolved') {
                    this.$el.html(this.compiledTemplate());
                    this.$menus = this.$el.children('.menus');
                    this.removeChildren();
                    this._renderMenus();
                    this._renderRefreshIndicator();
                    this.$el[_.isEmpty(this.children) ? 'addClass' : 'removeClass']('hidden');
                }
                return this;
            },
            _renderMenus: function() {
                if (this.model.report.isPivotReport()) {
                    if (this.resolveBooleanOptions("link.openPivot.visible", "link.visible", true) && this.model.user.canPivot()) {
                        this.children.pivot = new FloatButton({
                            model: this.model.menus.pivot
                        });
                        this._renderMenu(this.children.pivot);
                    }
                }
                else {
                    if (this.resolveBooleanOptions("link.openSearch.visible", "link.visible", true)) {
                        if (this.settings.get('link.openSearch.text')) {
                            this.model.menus.search.set('text', this.settings.get('link.openSearch.text'));
                        }
                        this.children.search = new FloatButton({
                            model: this.model.menus.search
                        });
                        this._renderMenu(this.children.search);
                    }
                }
                if (this.resolveBooleanOptions("link.exportResults.visible", "link.visible", true) && this.model.user.canExportResults()) {
                    this.children['export'] = new FloatButton({
                        model: this.model.menus['export']
                    });
                    this._renderMenu(this.children['export']);
                }
                if (this.resolveBooleanOptions("link.inspectSearch.visible", "link.visible", true)) {
                    this.children.inspect = new FloatButton({
                        model: this.model.menus.inspect
                    });
                    this._renderMenu(this.children.inspect);
                }
                if (this.resolveBooleanOptions("refresh.link.visible", "link.visible", true)) {
                    this.children.refresh = new FloatButton({
                        model: this.model.menus.refresh
                    });
                    this._renderMenu(this.children.refresh);
                }
                if(this.resolveBooleanOptions("link.stopSearch.visible", "link.visible", true)) {
                    this.children.searchStoppedIndicator = new SearchStoppedIndicator({
                        model: this.model.menus.searchFinalized
                    });
                    this._renderMenu(this.children.searchStoppedIndicator);
                    
                    this.children.stopSearch = new FloatButton({
                        model: this.model.menus.stopSearch
                    });
                    this._renderMenu(this.children.stopSearch);
                    
                    this.listenTo(this.searchJobModel.entry.content, 'change', function() {
                        var isFinalized = !!this.searchJobModel.entry.content.get('isFinalized');
                        var showRefreshIndicator = !isFinalized;
                        
                        this.model.menus.searchFinalized.set('finalizedByUser', isFinalized);
                        this.children.refreshIndicator.$el.toggle(showRefreshIndicator);
                    });
                }
            },
            _renderMenu: function(view) {
                view.render().$el.appendTo(this.$menus);
                this.listenTo(view, 'all', this._handleAction);
            },
            _renderRefreshIndicator: function() {
                if (this.managerid) {
                    this.children.refreshIndicator = new TimeIndicator({
                        id: _.uniqueId(this.id + '-refreshtime'),
                        el: $('<div class="refresh-time-indicator"></div>'),
                        manager: this.managerid,
                        "refresh.time.visible": GeneralUtils.normalizeBoolean(this.settings.get('refresh.time.visible'), {'default': true})
                    });
                    this.children.refreshIndicator.render().$el.appendTo(this.$menus);
                }
            },
            _handleAction: function(action) {
                switch (action) {
                    case 'search':
                        this._openSearch();
                        break;
                    case 'pivot':
                        this._openPivot();
                        break;
                    case 'export':
                        this._export();
                        break;
                    case 'inspect':
                        this._inspect();
                        break;
                    case 'refresh':
                        this._refresh();
                        break;
                    case 'stopSearch':
                        this._stopSearch();
                        break;
                    default:
                        break;
                }
            },
            _onSearchStart: function() {
                var sid = this.manager.getSid();
                this.searchJobModel.set("id", sid);
                _.each(_.omit(this.model.menus, 'export'), function(model, k) {
                    model.set('visible', true);
                }, this);
                if (this.children['export']) {
                    if (this.manager instanceof PostProcessSearchManager) {
                        // Disable Export for post process
                        this.model.menus['export'].set({
                            title: _("Export - You cannot export results for post-process jobs.").t(),
                            enabled: false,
                            visible: true
                        });
                    } else {
                        this.model.menus['export'].set({
                            enabled: false,
                            visible: true
                        });
                    }
                }
                if(this.children.stopSearch) {
                    this.model.menus.searchFinalized.set('finalizedByUser', false);
                    this.model.menus.stopSearch.set('visible', true);
                    this.model.menus.refresh.set('visible', false);
                }
            },
            _onSearchDone: function() {
                var jobResponse = this.manager.getJobResponse();
                this.searchJobModel.setFromSplunkD(jobResponse);
                if (this.children['export']) {
                    if (!(this.manager instanceof PostProcessSearchManager)) {
                        this.model.menus['export'].set({
                            title: _("Export").t(),
                            enabled: true
                        });
                    }
                }
                if(this.children.stopSearch) {
                    this.model.menus.stopSearch.set('visible', false);
                    this.model.menus.refresh.set('visible', true);
                }
            },
            _getTimeRange: function(manager, fromSettings) {
                if (manager instanceof PostProcessSearchManager) {
                    // always retrieve time range from setting for base search
                    return this._getTimeRange(manager.parent, true);
                }
                else {
                    // get timerange from search manager first
                    var timeRange = {};
                    if (manager.settings.get('global_earliest_time', {tokens: true}) != null &&
                        manager.settings.get('global_latest_time', {tokens: true}) != null) {
                        timeRange.earliest = manager.settings.get('global_earliest_time', {tokens: false});
                        timeRange.latest = manager.settings.get('global_latest_time', {tokens: false});
                    }
                    else {
                        timeRange.earliest = manager.settings.get('earliest_time', {tokens: false});
                        timeRange.latest = manager.settings.get('latest_time', {tokens: false});
                    }

                    if (!fromSettings) {
                        var jobProperties = manager.get('data');
                        if (jobProperties.earliestTime != null) {
                            timeRange.earliest = SplunkUtil.getEpochTimeFromISO(jobProperties.earliestTime);
                        }
                        if (jobProperties.latestTime != null) {
                            timeRange.latest = SplunkUtil.getEpochTimeFromISO(jobProperties.latestTime);
                        }
                    }
                    return timeRange;
                }
            },
            _openSearch: function() {
                var manager = this.manager;
                var params = {};
                var timeRangeFromManager = this._getTimeRange(this.manager);
                var timeRange = {
                    earliest: this.settings.get("link.openSearch.searchEarliestTime"),
                    latest: this.settings.get("link.openSearch.searchLatestTime")
                };
                // searchEarliestTime and searchLatestTime override the timerange from manager
                _.defaults(timeRange, timeRangeFromManager);
                if (timeRange.earliest != null) {
                    params.earliest = timeRange.earliest;
                }
                if (timeRange.latest != null) {
                    params.latest = timeRange.latest;
                }
                if (this.settings.has("link.openSearch.search")) {
                    params.q = this.settings.get("link.openSearch.search");
                } else if (!this.settings.get("link.openSearch.viewTarget")) {
                    params.sid = this.searchJobModel.get("id");
                    params.q = manager.settings.resolve();
                    if (manager instanceof SavedSearchManager) {
                        params['s'] = manager.get('searchname');
                    }
                } else {
                    params = {
                        sid: this.searchJobModel.get("id")
                    };
                }

                var url = Route.page(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get('app'), this.settings.get("link.openSearch.viewTarget") || "search", {data: params});

                MvcUtils.redirect(url, true);
            },
            _openPivot: function() {
                var params, url;
                var application = this.model.application;
                if (this.model.report.has('id')) {
                    //saved pivot
                    //URI API: app/search/pivot?s=<reportId>
                    //example id: "/servicesNS/admin/simplexml/saved/searches/Report%20Pivot2"
                    var id = this.model.report.get('id');
                    params = {s: id};
                } else {
                    //inline pivot
                    //URI API: app/search/pivot?q=<search string with pivot command>
                    //example search: "| pivot Debugger RootObject_1 count(RootObject_1) AS "Count of RootObject_1" | stats count"
                    var search = this.model.report.entry.content.get('search');
                    params = {q: search};
                }
                if (this.model.report.entry.content.has('dispatch.earliest_time')) {
                    params.earliest = this.model.report.entry.content.get('dispatch.earliest_time');
                    params.latedst = this.model.report.entry.content.get('dispatch.latest_time');
                }
                url = Route.pivot(application.get('root'), application.get('locale'), application.get('app'), {data: params});
                MvcUtils.redirect(url, true);
            },
            _export: function() {
                // wait for the results from the endpoint to be fetched
                // pass in list of apps to check if infoDelivery is installed
                infoUtils.getInfoDeliveryFlags(this.collection.appLocalsUnfilteredAll.models, this.model.userPref).then(function(result) {

                    // if not enabled default to showing export dialog and exit
                    if (!result.infoDeliveryEnabled) {
                        this._showExportDialog();
                        return;
                    }

                    if (!result.infoDeliveryConfigured && result.infoDeliveryInstalled) {
                        // force info delivery to be disabled if the app has not been configured
                        result.infoDeliveryEnabled = false;

                        // show configure modal if not configured and if the do not show this again button was not pressed
                        if (result.showConfigureModal) {
                            // prompt user to either configure or continue using old method
                            var configureDialog = new ConfigureDialog({
                                model: {
                                    dashboard: this.model.view,
                                    application: this.model.application,
                                    appLocal: this.model.state.appLocal,
                                    user: this.model.user
                                },
                                onHiddenRemove: true
                            });

                            configureDialog.render().appendTo($('body'));
                            configureDialog.show();

                            // user has not configured
                            configureDialog.on('hidden', function() {
                                this._showExportDialog();
                                // only update if the stored value is different then what is saved
                                if (configureDialog.model.inmem.get('update') != result.showConfigureModal) {
                                    infoUtils.hideModal('config', false, this.model.userPref);
                                }
                            }, this);

                            // prevent other actions from occurring
                            return;
                        }
                    }

                    if (result.infoDeliveryEnabled && result.infoDeliveryInstalled) {
                        this.children.exportOptions = new ExportOptions({
                            model: this.model
                        });

                        this.children.exportOptions.once('hide', this.children.exportOptions.remove);
                        this.$menus.css('display', 'block');
                        $('body').append(this.children.exportOptions.render().$el);
                        var $btn = this.$el.find(".export");
                        this.children.exportOptions.show($btn);
                        this.children.exportOptions.once('hide', function() {
                            this.$menus.css('display', '');
                        }, this);

                        // wait for user to click on option in poptart menu
                        this.listenTo(this.children.exportOptions, 'panel-export-click', function(format) {
                            if (format == 'png') {
                                // direct download a PNG
                                this._pngExport();
                            } else {
                                // otherwise load export dialog
                                this._showExportDialog(format);
                                this.children.exportOptions.hide();
                            }
                        });
                    } else {
                        this._showExportDialog();
                    }

                }.bind(this));
            },
            _pngExport: function() {
                var props = this.model.report.entry.content.toJSON();
                // to get width and height: this.$el.parent().width(), this.$el.parent().height()
                infoUtils.chartDownload(JSON.stringify(props), this.manager.search.get('search'), this.manager.getSid(), this.manager.get('data')['earliestTime'], this.manager.get('data')['latestTime'], 'png');
            },
            _showExportDialog: function(format) {
                var exportDialog = new ExportResultsDialog({
                    model: {
                        searchJob: this.searchJobModel,
                        application: this.model.application,
                        report: this.model.report
                    },
                    usePanelType: true,
                    onHiddenRemove: true
                });

                if (format) {
                    exportDialog.model.inmem.set('format', format);
                }

                exportDialog.render().appendTo($("body"));
                exportDialog.show();
            },
            _inspect: function() {
                var application = this.model.application;
                var url = Route.jobInspector(application.get('root'), application.get('locale'), application.get('app'), this.searchJobModel.get("id"));

                SplunkWindow.open(url, "splunk_job_inspector", {width: 870, height: 560, menubar: false});
            },
            _refresh: function() {
                var rootSearchManager = this.manager;
                while (rootSearchManager instanceof PostProcessSearchManager) {
                    rootSearchManager = rootSearchManager.parent;
                }

                rootSearchManager.startSearch({refresh: true});
            },
            _stopSearch: function() {
                var rootSearchManager = this.manager;
                while (rootSearchManager instanceof PostProcessSearchManager) {
                    rootSearchManager = rootSearchManager.parent;
                }
                
                this.model.menus.searchFinalized.set('finalizedByUser', true);
                this.model.menus.stopSearch.set('visible', false);
                this.model.menus.refresh.set('visible', true);
                
                rootSearchManager.finalize();
            },
            resolveBooleanOptions: function(/*optionName1, optionName2, ..., defaultValue*/) {
                var settings = this.settings;
                var value;
                for (var i = 0, l = arguments.length - 1; i < l; i++) {
                    value = settings.get(arguments[i]);
                    if (value != null) {
                        return GeneralUtils.normalizeBoolean(value);
                    }
                }
                return GeneralUtils.normalizeBoolean(arguments[arguments.length - 1]);
            },
            template: '<div class="menus"></div>'
        });
    });
