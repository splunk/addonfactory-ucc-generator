define(function(require, exports, module){
    var $ = require('jquery');
    var BaseView = require('views/Base');
    var DashboardItem = require('./dashboarditem');
    var keyboardUtil = require('util/keyboard');
    var AddContentUtils = require('../addcontentutils');
    var _ = require('underscore');

    return BaseView.extend({
        moduleId: module.id,
        tagName: 'ul',
        initialize: function () {
            this.listenTo(this.collection, 'reset', this.render);
        },
        events: {
            'click .show-more': function(e) {
                AddContentUtils.showMoreItems(e, this.collection, this.$el);
            },
            'keydown .show-more': function(e) {
                if(e.keyCode === keyboardUtil.KEYS['ENTER']) {
                    AddContentUtils.showMoreItems(e, this.collection, this.$el);
                }
            }
        },
        removeChildren: function() {
            _.each(this.chidren, function(child) {
                this.stopListening(child);
                child.remove();
            }, this);
        },
        render: function() {
            this.$el.html('');
            this.removeChildren();
            this.collection.each(function(dashboardModel) {
                var dashboardItem = new DashboardItem({
                    model: {
                        dashboard: dashboardModel,
                        highlightSelectedModel: this.model.highlightSelectedModel
                    }
                });
                this.$el.append(dashboardItem.render().$el);
                this.listenTo(dashboardItem, 'previewPanel', function(panel) {
                    this.trigger('previewPanel', panel);
                });
                this.children[dashboardItem.id] = dashboardItem;
            }, this);

            if (this.collection.length >= this.collection.fetchData.get('count')) {
                this.$el.append($('<li class="panel-content"><a class="show-more" href="#">' + _('Show More').t() + '</a></li>'));
            }
            return this;
        }
    });
});
