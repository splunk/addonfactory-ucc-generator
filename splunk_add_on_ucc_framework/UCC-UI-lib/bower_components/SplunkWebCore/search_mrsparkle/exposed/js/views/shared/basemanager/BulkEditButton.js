/**
 * This shows the bulk edit button
 * Enables/Disables based on the number of selections
 * Displays count of selected items
 * @author nmistry
 * @date 9/29/16
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'splunk.i18n',
    './BulkEditMenu'
], function (
    $,
    _,
    Backbone,
    module,
    Base,
    i18n,
    BulkEditMenu
) {
    return Base.extend({
        moduleId: module.id,
        tagName: 'a',
        className: 'dropdown-toggle bulk-edit-dropdown-toggle',

        events: {
            'click': 'showBulkEditMenu'
        },

        initialize: function (options) {
            Base.prototype.initialize.call(this, options);
            _.defaults(this.options,  {
                toggleClassName: 'btn-pill',
                entitySingular: '',
                entitiesPlural: ''
            });

            this.children.bulkEditMenu = new BulkEditMenu($.extend({}, this.options, {
                model: this.model,
                collection: this.collection
            }));

            this.listenTo(this.collection.selectedEntities, 'add remove reset', this.debouncedRender);
            this.listenTo(this.model.controller, 'bulkActionClicked', this.hideBulkEditMenu);
        },

        hideBulkEditMenu: function (e) {
            this.children.bulkEditMenu.hide();
        },

        showBulkEditMenu: function (e) {
            e.preventDefault();
            var $target = $(e.currentTarget);
            if ($target.hasClass('disabled')) return;

            if (this.children.bulkEditMenu.shown) {
                this.children.bulkEditMenu.hide();
                return;
            }

            $('body').append(this.children.bulkEditMenu.render().el);
            this.children.bulkEditMenu.show($target);
        },

        enable: function () {
            this.$el.removeClass('disabled');
        },

        disable: function () {
            this.$el.addClass('disabled');
        },

        getTemplateArgs: function () {
            var count = this.collection.selectedEntities.length;
            var label = (count === 0) ? this.options.entitySingular : i18n.ungettext(this.options.entitySingular, this.options.entitiesPlural, count);
            return {
                count: count,
                label: label
            };
        },

        render: function () {
            var args = this.getTemplateArgs();
            var html = this.compiledTemplate(args);
            this.$el.html(html);
            this.$el.addClass(this.options.toggleClassName);
            if (args.count > 0) {
                this.enable();
            } else {
                this.disable();
            }
            return this;
        },

        template: '<%- _("Edit Selected").t() %> <%- label %> (<%- count %>) <span class="caret"></span>'
    });
});
