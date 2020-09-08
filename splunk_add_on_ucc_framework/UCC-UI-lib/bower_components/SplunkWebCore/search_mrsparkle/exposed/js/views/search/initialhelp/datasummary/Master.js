define(
    [
         'jquery',
         'underscore',
         'backbone',
         'module',
         'models/classicurl',
         'models/services/search/IntentionsParser',
         'views/search/initialhelp/datasummary/Tab',
         'views/search/initialhelp/datasummary/Pane',
         'views/shared/Modal',
         'views/shared/delegates/Tabs',
         './Master.pcss'
     ],
     function(
        $,
        _,
        Backbone,
        module,
        classicurl,
        IntentionsParserModel,
        Tab,
        Pane,
        Modal,
        TabsDelegate,
        css
    ){
        return Modal.extend({
            className: Modal.CLASS_NAME + " " + Modal.CLASS_MODAL_WIDE,
            moduleId: module.id,
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);

                this.model.intentionsParser = new IntentionsParserModel();

                this.children.hostsTab = new Tab({
                    model: {
                        searchJob: this.model.hostsJob
                    },
                    type: "hosts",
                    label: _("Hosts").t()
                });
                this.children.sourcesTab = new Tab({
                    model: {
                        searchJob: this.model.sourcesJob
                    },
                    type: "sources",
                    label: _("Sources").t()
                });
                this.children.sourcetypesTab = new Tab({
                    model: {
                        searchJob: this.model.sourceTypesJob
                    },
                    type: "sourcetypes",
                    label: _("Sourcetypes").t()
                });
                /*
                this.children.tagsTab = new Tab();
                this.children.eventtypesTab = new Tab();
                */

                this.children.hostsPane = new Pane({
                    type: "host",
                    label: _("Host").t(),
                    model: {
                        searchJob: this.model.hostsJob,
                        result: this.model.hostsResult,
                        application: this.model.application,
                        intentionsParser: this.model.intentionsParser,
                        serverInfo: this.model.serverInfo
                    }
                });

                this.children.sourcesPane = new Pane({
                    type: "source",
                    label: _("Source").t(),
                    model: {
                        searchJob: this.model.sourcesJob,
                        result: this.model.sourcesResult,
                        application: this.model.application,
                        intentionsParser: this.model.intentionsParser,
                        serverInfo: this.model.serverInfo
                    }
                });

                this.children.sourcetypesPane = new Pane({
                    type: "sourcetype",
                    label: _("Sourcetype").t(),
                    model: {
                        searchJob: this.model.sourceTypesJob,
                        result: this.model.sourceTypesResult,
                        application: this.model.application,
                        intentionsParser: this.model.intentionsParser,
                        serverInfo: this.model.serverInfo
                    }
                });

                this.listenTo(this.model.intentionsParser, 'sync', function() {
                    classicurl.set("auto_pause", true);

                    if (this.model.report.entry.content.get('search') !== this.model.intentionsParser.fullSearch()) {
                        this.model.report.entry.content.set({
                            'search': this.model.intentionsParser.fullSearch()
                        });
                    } else {
                        // If the searches are the same, we still want the page to act like the user
                        // hit the enter key or the search button.
                        this.model.report.entry.content.trigger('applied');
                    }

                    this.hide();
                });

                /*
                this.children.tagsPane = new TagsPane();
                this.children.eventtypesPane = new EventtypesPane();
                */
            },
            events: $.extend({}, Modal.prototype.events, {
                'click ul.main-tabs a': function(e) {
                    this.wake($(e.currentTarget).attr('data-type'));
                    e.preventDefault();
                }
            }),
            show: function() {
                this.$el.show();
                Modal.prototype.show.apply(this, arguments);
            },
            wake: function (selectedTab) {
                this.children.hostsPane.sleep().$el.hide();
                this.children.sourcesPane.sleep().$el.hide();
                this.children.sourcetypesPane.sleep().$el.hide();
                /*
                this.children.tagsPane.sleep().$el.hide();
                this.children.eventtypesPane.sleep().$el.hide();
                */

                switch (selectedTab) {
                    case 'hosts':
                        this.children.hostsPane.wake().$el.show();
                        break;
                    case 'sources':
                        this.children.sourcesPane.wake().$el.show();
                        break;
                    case 'sourcetypes':
                        this.children.sourcetypesPane.wake().$el.show();
                        break;
                    /*
                    case 'tags':
                        this.children.tagsPane.wake().$el.show();
                        break;
                    case 'eventtypes':
                        this.children.eventtypesPane.wake().$el.show();
                        break;
                    */
                }
                this.children.tabsDelegate.show(this.$('a[data-type="' + selectedTab + '"]'));
                return this;
            },
            render: function() {
                var template = _.template(this.template, {
                    cid: this.cid
                });

                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Data Summary").t());

                this.$(Modal.BODY_SELECTOR).append(template);

                this.children.hostsTab.render().appendTo(this.$('.main-tabs'));
                this.children.sourcesTab.render().appendTo(this.$('.main-tabs'));
                this.children.sourcetypesTab.render().appendTo(this.$('.main-tabs'));

                /*
                this.$('.main-tabs').append(this.children.tagsTab.render().el);
                this.$('.main-tabs').append(this.children.eventtypesTab.render().el);
                */

                this.children.hostsPane.render().appendTo(this.$('.tab-content'));
                this.children.sourcesPane.render().appendTo(this.$('.tab-content'));
                this.children.sourcetypesPane.render().appendTo(this.$('.tab-content'));

                /*
                this.$('.tab-content').append(this.children.tagsPane.render().el);
                this.$('.tab-content').append(this.children.eventtypesPane.render().el);
                */

                this.children.tabsDelegate = new TabsDelegate({
                    el: this.$('.main-tabs')
                });

                this.wake("hosts");
                return this;
            },
            template: '\
                <ul class="nav nav-tabs main-tabs"></ul>\
                <div class="tab-content" style="overflow:visible;"></div>\
            '
        });
    }
);
