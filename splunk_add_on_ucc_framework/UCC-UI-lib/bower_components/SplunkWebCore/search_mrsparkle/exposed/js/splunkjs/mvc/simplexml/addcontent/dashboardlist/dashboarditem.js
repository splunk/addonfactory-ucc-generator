define(function(require) {
    var $ = require('jquery');
    var _ = require('underscore');
    var BaseView = require('views/Base');
    require('bootstrap.tooltip');
    var accordionTemplate = require('contrib/text!../accordionGroupTemplate.html');
    var DashboardParser = require('../../parser');
    var DashboardFactory = require('../../factory');
    var DashboardPanelItem = require('./dashboardpanelitem');
    var SplunkUtil = require('splunk.util');

    var DashboardItem = BaseView.extend({
        className: 'dashboard-list-item panel-content',
        tagName: 'li',
        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);
            this.parseDashboard = _.once(this.parseDashboard);
        },
        events: {
            'show': 'parseDashboard'
        },
        parseDashboard: function() {
            var $ul = $('<ul/>');
            try {
                var parsedDashboard = DashboardParser.getDefault().parseDashboard(this.model.dashboard.entry.content.get('eai:data'));
                var panelList = DashboardFactory.getDashboardPanels(parsedDashboard);
                _.each(panelList, function(panel) {
                    var panelItem = new DashboardPanelItem({
                        panel: panel,
                        model: {
                            highlightSelectedModel: this.model.highlightSelectedModel
                        }
                    });
                    panelItem.render().$el.appendTo($ul);
                    this.listenTo(panelItem, 'previewPanel', function(panel) {
                        this.trigger('previewPanel', panel);
                    });
                    this.children[panelItem.id] = panelItem;
                }, this);
            } catch (e) {
                var $error = $('<li class="dashboard-panel-list-item parser-error"><a><i class="icon-warning-sign"></i> '+_("Error parsing dashboard!").t()+'</a></li>').appendTo($ul);
                $error.attr('title', 'Error: ' + e.message);
                $error.tooltip({
                    template: '<div class="tooltip add-content-name"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
                    container: 'body',
                    delay: {show: 500, hide: 0}
                });
            }
            $ul.appendTo(this.$('.accordion-inner'));
        },
        render: function() {
            var label = SplunkUtil.escapeHtml(this.model.dashboard.entry.content.get('label')) || SplunkUtil.escapeHtml(this.model.dashboard.entry.get('name'));
            this.$el.html(this.compiledTemplate({title: _(label).t(), id: _.uniqueId(), 'show': false}));
            var toggle = this.$('.accordion-toggle');
            toggle.attr('title', label);
            toggle.tooltip({
                template: '<div class="tooltip add-content-name"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
                container: 'body',
                delay: {show: 500, hide: 0}
            });
            return this;
        },
        template: accordionTemplate
    });

    return DashboardItem;
});
