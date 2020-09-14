define(function(require, exports, module) {
    var _ = require('underscore');
    var BaseView = require('views/Base');
    var addContentUtils = require('../addcontentutils');
    require('bootstrap.tooltip');

    var DashboardItem = BaseView.extend({
        moduleId: module.id,
        className: 'dashboard-panel-list-item panel-content',
        tagName: 'li',
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.panel = options.panel;
            var panelTitle = this.panel.settings['title'];
            if (!panelTitle) {
                var el = _(this.panel.children).chain()
                    .pluck('settings')
                    .find(function(e) { return !!e.title; })
                    .value();
                if (el) {
                    panelTitle = el.title;
                } else {
                    panelTitle = "Untitled Panel";
                }
            }
            this.title = panelTitle;
            this.model.highlightSelectedModel.on('change:currentSelectedView', this.checkSelectedItem, this);
            this.icon = addContentUtils.getPanelIcon(this.panel);
            this.hasPlusIcon = addContentUtils.getPanelElements(this.panel).length > 1;
        },
        events: {
            'click a': 'select'
        },
        select: function(evt) {
            evt.preventDefault();
            this.trigger('previewPanel', this.panel);
            this.model.highlightSelectedModel.set('currentSelectedView', this.cid);
        },
        checkSelectedItem: function(changedModel) {
            if(changedModel.get('currentSelectedView') === this.cid) {
                this.$el.addClass('selected');
            } else {
                this.$el.removeClass('selected');
            }
        },        
        render: function() {
            this.$el.html(this.compiledTemplate({icon: this.icon, hasPlusIcon: this.hasPlusIcon, name: _(this.title || this.panel.id).t()}));
            this.$el.tooltip({
                template: '<div class="tooltip add-content-name"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
                container: 'body',
                delay: {show: 500, hide: 0}
            });
            return this;
        },
        template: '<a href="#" title="<%- name %>"><div class="icons"><i class="<%- icon %>"/><% if (hasPlusIcon) { %><i class="icon-plus"/><% } %></div><%- name %></a>'
    });

    return DashboardItem;
});
