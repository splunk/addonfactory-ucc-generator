define(function(require, exports, module) {
    var BaseView = require('views/Base');
    var ReportItem = require('./reportitem');
    var _ = require('underscore');
    var $ = require('jquery');
    var keyboardUtil = require('util/keyboard');
    var AddContentUtils = require('../addcontentutils');

    return BaseView.extend({
        moduleId: module.id,
        tagName: 'ul',
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'reset', this.render);
        },
        removeChildren: function() {
            _.each(this.chidren, function(child) {
                this.stopListening(child);
                child.remove();
            }, this);
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
        render: function() {
            this.$el.html('');
            this.removeChildren();
            this.collection.each(function(reportModel) {
                var reportItem = new ReportItem({
                    model: {
                        report: reportModel,
                        highlightSelectedModel: this.model.highlightSelectedModel
                    },
                    id: _.uniqueId()
                });
                this.$el.append(reportItem.render().$el);
                this.listenTo(reportItem, 'previewPanel', _.bind(function(model, evt) {
                    this.trigger('previewPanel', model, evt);
                }, this));
                this.children[reportItem.id] = reportItem;
            }, this);

            if (this.collection.length >= this.collection.fetchData.get('count')) {
                this.$el.append($('<li class="panel-content"><a class="show-more" href="#">' + _('Show More').t() + '</a></li>'));
            }

            return this;
        }
    });
});