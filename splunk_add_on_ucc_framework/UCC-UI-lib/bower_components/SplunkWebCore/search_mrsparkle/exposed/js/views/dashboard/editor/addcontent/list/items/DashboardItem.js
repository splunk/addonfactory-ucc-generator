define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'dashboard/DashboardParser',
        'dashboard/DashboardFactory',
        'views/dashboard/editor/addcontent/list/items/PanelItem',
        'splunk.util'
    ],
    function(module,
             $,
             _,
             BaseView,
             Parser,
             Factory,
             PanelItem,
             SplunkUtil) {
        
        var DashboardItem = BaseView.extend({
            moduleId: module.id,
            tagName: 'li',
            className: 'dashboard-list-item panel-content',
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.id = options.id || _.uniqueId('dashboard_');
                this.template = options.template;
                this.parseDashboard = _.once(this._parseDashboard);
            },
            events: {
                'show': 'parseDashboard'
            },
            _parseDashboard: function() {
                var $ul = this.$('.accordion-inner ul');
                try {
                    var parsedDashboard = Parser.getDefault().parseDashboard(this.model.dashboard.entry.content.get('eai:data'));
                    var panelList = Factory.getDashboardPanels(parsedDashboard);
                    _.each(panelList, function(panel) {
                        var model = _.extend({}, {panel: panel}, this.model);
                        var panelItem = new PanelItem({
                            model: model
                        });
                        panelItem.render().$el.appendTo($ul);
                        this.listenTo(panelItem, 'all', this.trigger);
                        this.children[panelItem.id] = panelItem;
                    }, this);
                } catch (e) {
                    var $error = $('<li class="dashboard-panel-list-item parser-error"><a><i class="icon-warning-sign"></i> ' + _("Error parsing dashboard!").t() + '</a></li>').appendTo($ul);
                    $error.attr('title', 'Error: ' + e.message);
                    $error.tooltip({
                        template: '<div class="tooltip add-content-name"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
                        container: 'body',
                        delay: {show: 500, hide: 0}
                    });
                }
            },
            expand: function() {
                this.$el.find('.collapse').first().addClass('in').css('height', 'auto');
                this.$el.find('.accordion-toggle').first().removeClass('collapsed');
            },
            collapse: function() {
                this.$el.find('.collapse').first().removeClass('in').css('height', '0px');
                this.$el.find('.accordion-toggle').first().addClass('collapsed');
            },
            render: function() {
                this.label = SplunkUtil.escapeHtml(this.model.dashboard.entry.content.get('label')) || SplunkUtil.escapeHtml(this.model.dashboard.entry.get('name'));
                this.compiledTemplate = this.compileTemplate(this.template);
                this.$el.html(this.compiledTemplate({
                    title: _(this.label).t(),
                    id: this.id
                }));
                this._renderTooltip();
                this.collapse(); // collapse by default
                return this;
            },
            _renderTooltip: function() {
                var toggle = this.$('.accordion-toggle');
                toggle.attr('title', this.label);
                toggle.tooltip({
                    template: '<div class="tooltip add-content-name"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
                    container: 'body',
                    delay: {show: 500, hide: 0}
                });
            }
        });

        return DashboardItem;
    });