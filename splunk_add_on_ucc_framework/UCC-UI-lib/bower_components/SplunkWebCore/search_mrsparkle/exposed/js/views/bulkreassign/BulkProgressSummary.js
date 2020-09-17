/**
 * Shows a summary for bulk action progress
 * @author nmistry
 * @date 10/12/16
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/waitspinner/Master',
    './BulkProgressSummaryRow'
], function(
    $,
    _,
    Backbone,
    module,
    Base,
    WaitSpinner,
    Row
) {
    return Base.extend({
        moduleId: module.id,
        /**
         *
         * @param {object} options
         * @param {Backbone Model} options.model.controller - controller model to fire events
         * @param {Backbone Collection} options.collection - collection of selected entities
         * @param {string} options.entitySingular - singular string (default: entity)
         * @param {string} options.entityPlural - plural string (default: entities)
         */
        initialize: function(options) {
            Base.prototype.initialize.call(this, options);

            var defaults = {
                entitySingular: _('entity').t(),
                entityPlural: _('entities').t()
            };
            this.options = this.options || {};
            _.defaults(this.options, defaults);

            if (_.isUndefined(this.model) || _.isUndefined(this.model.controller)) {
                throw new Error('Need this.model.controller to be passed in');
            }
            if (!this.collection) {
                throw new Error('Need this.collection to be passed in');
            }
            this.children.rows = [];
            this.listenTo(this.collection, 'add remove reset', this.debouncedRender);
        },

        events: {
            'click .removeEntityFromSelection': 'triggerRemoveItem'
        },

        triggerRemoveItem: function (e) {
            e.preventDefault();
            var $target = $(e.currentTarget);
            var id = $target.data('id');
            var model = this.collection.get(id);
            if (!model) return;
            this.model.controller.trigger('removeSelectedEntity', model);
        },

        render: function () {
            // remove existing rows
            _.each(this.children.rows, function (row) {
                row.remove();
            });

            // reinstantiate the rows
            this.children.rows = this.collection.map(function (model) {
                return new Row({model: model});
            });

            var html = this.compiledTemplate({
                collection: this.collection,
                entitySingular: this.options.entitySingular,
                entityPlural: this.options.entityPlural
            });
            var $html = $(html);
            if (this.collection.length > 0) {
                var tbody = $html.find('tbody');
                _.each(this.children.rows, function (row) {
                    tbody.append(row.render().el);
                });
            }
            this.$el.html($html);
            this.initializeTooltipOnce();
            return this;
        },

        initializeTooltipOnce: function () {
            if (!this.isTooltipInitialized) {
                // tooltip bubbles the hide/hidden event
                // which will forces the modal to be closed. wtf?!?!
                this.$el.tooltip({selector: '[data-toggle="tooltip"]'})
                    .on('show', function(e) {e.stopPropagation();})
                    .on('hide', function(e) {e.stopPropagation();})
                    .on('hidden', function(e) {e.stopPropagation();});
                this.isTooltipInitialized = true;
            }
        },

        remove: function () {
            this.$el.tooltip('destroy');
            _.each(this.children.rows, function (row) {
                row.remove();
            });
            Base.prototype.remove.apply(this, arguments);
        },

        template: '\
        <% if (collection.length < 1) { %>\
            <p>No items selected</p>\
        <% } else { %>\
            <table class="table table-striped table-hover">\
                <thead><tr>\
                    <th><%- _("Name").t() %></th>\
                    <th><%- _("Type").t() %></th>\
                    <th><%- _("Owner").t() %></th>\
                    <th><%- _("App").t() %></th>\
                    <th><%- _("Sharing").t() %></th>\
                    <th><%- _("Action").t() %></th>\
                </tr></thead>\
                <tbody></tbody>\
            </table>\
        <% } %>'

    });
});
