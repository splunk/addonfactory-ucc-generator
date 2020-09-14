define(
    [
        'jquery',
        'underscore',
        'module',
        'models/classicurl',
        'views/search/initialhelp/datasummary/Tab',
        'views/search/initialhelp/datasummary/Pane',
        'views/Base',
        'models/services/search/IntentionsParser',
        'views/shared/delegates/Tabs',
        'uri/route'
    ],
    function(
        $,
        _,
        module,
        classicurl,
        Tab,
        Pane,
        Base,
        IntentionsParser,
        TabsDelegate,
        route
    ) {
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.model.intentionsParser = new IntentionsParser();

                this.children.hostsTab = new Tab({
                    model: {
                        searchJob: this.model.hostsJob
                    },
                    type: "data-hosts",
                    label: _("Hosts").t()
                });
                this.children.sourcesTab = new Tab({
                    model: {
                        searchJob: this.model.sourcesJob
                    },
                    type: "data-sources",
                    label: _("Sources").t()
                });
                this.children.sourcetypesTab = new Tab({
                    model: {
                        searchJob: this.model.sourcetypesJob
                    },
                    type: "data-sourcetypes",
                    label: _("Sourcetypes").t()
                });
                
                this.children.sourcetypesPane = new Pane({
                    type: "sourcetype",
                    label: _("Source Types").t(),
                    model: {
                        searchJob: this.model.sourcetypesJob,
                        result: this.model.sourcetypesResult,
                        application: this.model.application,
                        intentionsParser: this.model.intentionsParser,
                        serverInfo: this.model.serverInfo
                    }
                });

                this.children.sourcesPane = new Pane({
                    type: "source",
                    label: _("Sources").t(),
                    model: {
                        searchJob: this.model.sourcesJob,
                        result: this.model.sourcesResult,
                        application: this.model.application,
                        intentionsParser: this.model.intentionsParser,
                        serverInfo: this.model.serverInfo
                    }
                });

                this.children.hostsPane = new Pane({
                    type: "host",
                    label: _("Hosts").t(),
                    model: {
                        searchJob: this.model.hostsJob,
                        result: this.model.hostsResult,
                        application: this.model.application,
                        intentionsParser: this.model.intentionsParser,
                        serverInfo: this.model.serverInfo
                    }
                });
                
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.intentionsParser, 'sync', function() {
                    classicurl.set("auto_pause", true);
                    this.model.report.entry.content.set({
                        'search': this.model.intentionsParser.fullSearch(),
                        'dispatch.earliest_time': '0',
                        'dispatch.latest_time': ''
                    });
                });
            },
            events: {
                'click ul.main-tabs a': function(e) {
                    this.wake($(e.currentTarget).attr('data-type'));
                    e.preventDefault();
                }
            },
            wake: function (selectedTab) {
                this.children.hostsPane.sleep().$el.hide();
                this.children.sourcesPane.sleep().$el.hide();
                this.children.sourcetypesPane.sleep().$el.hide();

                switch (selectedTab) {
                    case 'data-hosts':
                        this.children.hostsPane.wake().$el.show();
                        this.model.hostsJob.startPolling();
                        break;
                    case 'data-sources':
                        this.children.sourcesPane.wake().$el.show();
                        this.model.sourcesJob.startPolling();
                        break;
                    case 'data-sourcetypes':
                        this.children.sourcetypesPane.wake().$el.show();
                        this.model.sourcetypesJob.startPolling();
                        break;
                }
                this.children.tabsDelegate.show(this.$('a[data-type="' + selectedTab + '"]'));
                return this;
            },
            render: function() {
                var noDataText = _('No data has been added.').t(),
                    isAdmin = this.model.user.isAdmin() || this.model.user.isCloudAdmin(),
                    root = this.model.application.get("root"),
                    locale = this.model.application.get("locale"),
                    app = this.model.application.get("app"),
                    addDataRoute = route.manager(root, locale, app, 'adddata');

                if (isAdmin) {
                    noDataText += ' <a href="' + addDataRoute + '">' + _('Please add data').t() + '</a>';
                }

                this.$el.html(this.compiledTemplate({
                    _: _,
                    cid: this.cid
                }));

                this.children.hostsTab.render().appendTo(this.$('.main-tabs'));
                this.children.sourcesTab.render().appendTo(this.$('.main-tabs'));
                this.children.sourcetypesTab.render().appendTo(this.$('.main-tabs'));

                this.$('.tab-content').html('');
                this.children.hostsPane.render().appendTo(this.$('.tab-content'));
                this.children.sourcesPane.render().appendTo(this.$('.tab-content'));
                this.children.sourcetypesPane.render().appendTo(this.$('.tab-content'));
                
                this.children.tabsDelegate = new TabsDelegate({
                    el: this.$('.main-tabs')
                });

                this.wake('data-hosts');
                this.$('.waiting td').html(noDataText);
                return this;
            },
            template: '\
                <h3><%- _("What to Search").t() %></h3>\
                <div class="what-columns">\
                    <ul class="nav nav-tabs-lite main-tabs"></ul>\
                    <div class="tab-content" style="overflow:visible;">Waiting for results...</div>\
                </div>\
            '
        });
    }
);
