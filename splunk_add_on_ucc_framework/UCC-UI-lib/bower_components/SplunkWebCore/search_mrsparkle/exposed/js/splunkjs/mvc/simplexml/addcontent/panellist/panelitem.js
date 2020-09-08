define(function(require, exports, module) {
    var _ = require('underscore');
    var BaseView = require('views/Base');
    var parser = require('../../parser');
    var addContentUtils = require('../addcontentutils');
    require('bootstrap.tooltip');

    return BaseView.extend({
        moduleId: module.id,
        className: 'panel-list-item panel-content',
        tagName: 'li',
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model.highlightSelectedModel.on('change:currentSelectedView', this.checkSelectedItem, this);
            try {
                this.parsedPanel = parser.getDefault().parsePanel(this.model.panel.entry.content.get('eai:data'));
                this.icon = addContentUtils.getPanelIcon(this.parsedPanel);
                this.hasPlusIcon = addContentUtils.getPanelElements(this.parsedPanel).length > 1;
            } catch (e) {
                this.icon = "icon-warning-sign";
                this.error = e.message || 'Invalid Panel';
            }
        },
        render: function() {
            var title = _(this.model.panel.entry.content.get('panel.title')).t();
            this.$el.html(this.compiledTemplate({icon: this.icon, hasPlusIcon: this.hasPlusIcon, name: title, title: this.error && _(this.error).t() || title } ));
            this.$el.tooltip({
                template: '<div class="tooltip add-content-name"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
                container: 'body',
                delay: {show: 500, hide: 0}
            });
            if (this.error) {
                this.$el.addClass('parser-error');
            }
            return this;
        },
        events: {
            'click a': 'select'
        },
        select: function(evt) {
            evt.preventDefault();
            if (this.error) {
                return;
            }
            this.trigger('panelSelected', this.model.panel);
            this.model.highlightSelectedModel.set('currentSelectedView', this.cid);
        }, 
        checkSelectedItem: function(changedModel) {
            if(changedModel.get('currentSelectedView') === this.cid) {
                this.$el.addClass('selected');
            } else {
                this.$el.removeClass('selected');
            }
        },
        template: '<a href="#" title="<%- title %>"><div class="icons"><i class="<%- icon %>"/><% if (hasPlusIcon) { %><i class="icon-plus"/><% } %></div><%- name %></a>'
    });
});
