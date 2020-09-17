// This view encaps all the detail views and shows and hides
// them based on user selection of the tab
// when an invalid view is selected, displays the select message.
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
    backbone,
    module,
    BaseView
) {
    return BaseView.extend({
        moduleId: module.id,

        tagName: 'div',

        className: 'tabdetails',

        STRINGS: {
            SELECT_INPUT_TYPE: _('Please select one of the inputs.').t()
        },

        events: {},

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);
            this.active_view = null;
            this.rendered_views = [];
            this.views = {};
        },

        addView: function (id, view) {
            if (_.has(this.views, id)) {
                // NMTODO: MINOR handle view replace logic
                // currently add is more like replace
            }
            this.views[id] = view;
        },

        activateView: function (id) {
            var view;
            if (!_.has(this.views, id) || this.active_view === id) return;

            if (this.active_view != null) {
                this.$('.' + this.active_view).hide();
            }

            if (_.contains(this.rendered_views, id)) {
                this.$('.' + id).show();
                // note: each tabdetails class need to implement this method
                view = this.views[id];
            } else {
                view = this.views[id];
                if (id === 'empty') {
                    this.$el.append(view);
                } else {
                    view.render().$el.addClass(id).appendTo(this.$el);
                }
                this.rendered_views.push(id);
            }
            if (id !== 'empty') view.updateBundle();
            this.active_view = id;
        },

        has: function (id) {
            return _.has(this.views, id);
        },

        render: function () {
            var emptyView = this.compiledTemplate({
                strings: this.STRINGS
            });
            this.addView('empty', emptyView);
            this.activateView('empty');
            return this;
        },

        template: '<div class="empty"><i class="icon-arrow-left"></i> <%- strings.SELECT_INPUT_TYPE %></div>'

    });
});
