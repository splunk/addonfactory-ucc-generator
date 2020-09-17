define(function(require, exports, module) {
    var BaseView = require('views/Base');
    var _ = require('underscore');
    var NewPanelModel = require('../../newpanelmodel');
    var InlineItem = require('./inlineitem');

    var TimeRangeModel = require('models/shared/TimeRange');

    var PanelTimeRangeModel = TimeRangeModel.extend({
        validation: _.extend({
            earliest_token: function(value, attr, computedState) {
                if(computedState.useTimeFrom === 'tokens' && !value) {
                    return 'No value specified for earliest token.';
                }
            },
            latest_token: function(value, attr, computedState) {
                if(computedState.useTimeFrom === 'tokens' && !value) {
                    return 'No value specified for latest token.';
                }
            }
        })
    });

    return BaseView.extend({
        moduleId: module.id,
        tagName: 'ul',
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, 'reset', this.render);
            this.model.panelModel = new NewPanelModel();
            this.model.timeRange = new PanelTimeRangeModel({
                'earliest': "0",
                'latest': ""
            });
            this.model.timeRange.initialDfd = this.model.timeRange.save();
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
            this.collection.each(function(inlineModel) {
                var inlineItem = new InlineItem({
                    model: {
                        inline: inlineModel,
                        panel: this.model.panelModel,
                        timeRange: this.model.timeRange,
                        highlightSelectedModel: this.model.highlightSelectedModel
                    },
                    id: _.uniqueId()
                });
                this.$el.append(inlineItem.render().$el);
                this.listenTo(inlineItem, 'previewPanel', _.bind(function(model) {
                    this.trigger('previewPanel', model);
                }, this));
                this.children[inlineItem.id] = inlineItem;
            }, this);
            return this;
        }
    });
});
