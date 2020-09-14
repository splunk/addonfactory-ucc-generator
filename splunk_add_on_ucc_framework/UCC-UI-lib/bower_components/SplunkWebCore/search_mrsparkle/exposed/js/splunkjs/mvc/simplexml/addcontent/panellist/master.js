define(function(require, exports, module) {
    var $ = require('jquery');
    var BaseView = require('views/Base');
    var PanelItem = require('./panelitem');
    var _ = require('underscore');
    var keyboardUtil = require('util/keyboard');
    var AddContentUtils = require('../addcontentutils');

    return BaseView.extend({
        moduleId: module.id,
        className: "panel-list",
        tagName: 'ul',
        initialize: function () {
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
            this.collection.each(function(panelModel) {
                var panelItem = new PanelItem({
                    model: {
                        panel: panelModel,
                        highlightSelectedModel: this.model.highlightSelectedModel
                    },
                    id: _.uniqueId()
                });
                this.$el.append(panelItem.render().$el);
                this.listenTo(panelItem, 'panelSelected', _.bind(function(model) {
                    this.trigger('panelSelected', model);
                }, this));
                this.children[panelItem.id] = panelItem;
            }, this);

            if (this.collection.length >= this.collection.fetchData.get('count')) {
                this.$el.append($('<li class="panel-content"><a class="show-more" href="#">' + _('Show More').t() + '</a></li>'));
            }
            return this;
        }
    });
});
