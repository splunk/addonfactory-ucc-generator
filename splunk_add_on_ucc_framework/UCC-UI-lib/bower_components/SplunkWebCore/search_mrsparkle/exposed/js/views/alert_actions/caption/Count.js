define([
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/SyntheticSelectControl',
        'splunk.util'
], function($, _, module, BaseView, SyntheticSelect, splunkUtil) {
    return BaseView.extend({
        moduleId: module.id,
        className: 'count-control',
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.children.countSelect = new SyntheticSelect({
                modelAttribute: 'count',
                model: this.model,
                items: [
                    {label: _('10 per page').t(), value: 10},
                    {label: _('25 per page').t(), value: 25},
                    {label: _('50 per page').t(), value: 50},
                    {label: _('100 per page').t(), value: 100}
                ]
            });
            var update = _.debounce(_.bind(this.update, this));
            this.listenTo(this.collection, 'reset destroy', update);
            this.listenTo(this.model, 'change:fetching', update);
        },
        update: function() {
            var offset = parseInt(this.model.get('offset'), 10);
            var count = this.collection.length;
            var collectionTotal = this.collection.models[0] && this.collection.models[0].paging ?
                                    this.collection.models[0].paging.get('total') : 0;
            
            if (count === 0 || (collectionTotal <= parseInt(this.model.get('count'), 10) && offset === 0)) {
                this.$('.msg').empty();
                this.$el.addClass('hidden');
            } else {
                this.$('.msg').text(splunkUtil.sprintf(_("Showing %s-%s of %s items").t(),
                    offset + 1, offset + count, collectionTotal));
                this.$el.removeClass('hidden');
            }
        },
        render: function() {
            $('<div class="msg"></div>').appendTo(this.$el);
            this.children.countSelect.render().appendTo(this.$el);
            this.update();
            return this;
        }
    });
});
