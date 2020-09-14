// Displays the bulk edit menu.
// @author: nmistry
define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/delegates/Popdown',
    'contrib/text!./BulkEditMenu.html'
], function (
    $,
    _,
    module,
    BaseView,
    Popdown,
    Template
) {
    return BaseView.extend({
        moduleId: module.id,

        template: Template,

        className: 'bulkedit-menu',

        events: {
            'click a.bulk-action': 'handleActionClick'
        },

        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.singular = this.options.singular;
            this.plural = this.options.plural;
            this.selectedId = [];
            this.radio = this.options.radio;
            this.links = this.options.links;
            this.listenTo(this.radio, 'select:click', this.handleSelect);
        },

        handleSelect: function (data) {
            this.selectedId = data.selected;
            this.$el.empty();
            this.render();
        },

        handleActionClick: function (e) {
            e.preventDefault();
            var $e = $(e.currentTarget);
            var fires = 'bulk:' + $e.data('fires');
            this.radio.trigger(fires, {nos: this.selectedId});
        },

        render: function () {
            var html = this.compiledTemplate({
                count: this.selectedId.length,
                singular: this.singular,
                plural: this.plural,
                items: this.links
            });
            this.$el.html(html);
            this.children.popdown = new Popdown({el: this.el, mode: 'dialog'});
            return this;
        }
    });
});
