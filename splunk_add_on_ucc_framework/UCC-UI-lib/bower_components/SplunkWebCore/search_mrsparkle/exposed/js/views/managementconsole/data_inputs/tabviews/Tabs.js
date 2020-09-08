// Takes a collection and displays a list
// upon collection reset, updates the counts
// accepts options.order, which will list items in that order
// @author: nmistry
define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/Base'
], function (
    _,
    $,
    Backbone,
    module,
    BaseView
) {
    return BaseView.extend({
        moduleId: module.id,
        tagName: 'div',
        className: 'tabs',

        events: {
            'click .list-group-item': 'handleTabClick'
        },

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);
            this.collection = this.collection || new Backbone.Collection();
            this.selectedId = this.options.selectedId || '';
            this.viewRegistry = this.options.tabDetailsRegistry || {};
            this.getCountTitle = _.template(this.countTitleTemplate);
            this.listenTo(this.collection, 'reset', this.updateCount);
        },

        // Rather than rerendering, lets simply update the counts
        updateCount: function () {
            var $counts = this.$('.list-group-item');
            var el;
            var count;
            var countTitle;

            this.collection.each(function updateCount(item, index) {
                el = $counts.get(index);
                count = item.getCount();
                countTitle = this.getCountTitle({
                    name: item.getDisplayName(),
                    count: count
                });
                el.title =  countTitle;
                $(el).find('span').html(count);
            }, this);
        },

        handleTabClick: function (e) {
            var $target = $(e.currentTarget);
            e.preventDefault();
            if ($target.hasClass('disabled')) return;
            this.trigger('tabClicked', $target.data('id'));
        },

        setActiveTab: function (id) {
            this.selectedId = id;
            this.$('.active').removeClass('active');
            this.$('.list-group-item[data-id=' + id + ']').addClass('active');
        },

        render: function () {
            var tab = _.template(this.tabTemplate);
            var registered = false;
            this.collection.each(function renderTab(item) {
                registered = _.has(this.viewRegistry, item.getId());
                this.$el.append(
                    tab({
                        selectedId: this.selectedId,
                        id: item.getId(),
                        name: item.getDisplayName(),
                        count: item.getCount(),
                        title: this.getCountTitle({
                            name: item.getDisplayName(),
                            count: item.getCount()
                        }),
                        registered: registered
                    })
                );
            }, this);

            return this;
        },
        countTitleTemplate: '<%- name %> (<%- count %>)',
        tabTemplate: '' +
        '<a href="#" class="list-group-item <%= id === selectedId && registered ? \'active\' : \'\' %> <%= !registered ? \'disabled\': \'\' %>" data-id="<%- id %>" title="<%- title %>">' +
        '<span class="list-group-label pull-right"><%- count %></span>' +
        '<%- name %></a>'
    });
});
