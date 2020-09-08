define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/controls/SyntheticCheckboxControl',
        'bootstrap.tooltip'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseView,
        SyntheticCheckboxControl
        //tooltip
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'thead',
            className: 'table-head',
            /**
             * @param {Object} options {
             *     model: <Backbone.Model> 
             *     or model: { // use this if using checkbox and it should be powered by a model different then other columns
             *            state <Backbone.Model>,
             *            checkbox <Backbone.Model>
             *     }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                var defaults = {
                    columns: [] // hash: label, sortKey (optional)
                };
                _.defaults(this.options, defaults);
                var model = this.model;
                this.model = {};
                this.model.state = model.state || model;
                if (model.checkbox) {
                    this.model.checkbox = model.checkbox;
                }
                this.activate();
            },
            events: {
                'click th': function(e) {
                    var $target = $(e.currentTarget),
                        sortKey = $target.attr('data-key'),
                        sortDirection = $target.hasClass('asc') ? 'desc': 'asc';
                    if (!sortKey) {
                        return true;
                    }
                    this.model.state.set({sortKey: sortKey, sortDirection: sortDirection});
                    e.preventDefault();
                },
                'click th a': function(e) {
                    e.preventDefault();
                },
                'click a.tooltip-link': function(e) {
                    e.preventDefault();
                    $('.tooltip').remove();
                }
            },
            startListening: function() {
                this.listenTo(this.model.state, 'change:sortKey change:sortDirection', this.debouncedRender);
            },
            render: function() {
                var html = this.compiledTemplate({
                    _: _,
                    columns: this.options.columns,
                    model: this.model.state
                });
                this.$el.html(html);
                if (this.options.checkboxClassName) {
                    if (this.children.checkbox) {
                        this.children.checkbox.remove();
                    }
                    this.children.checkbox = new SyntheticCheckboxControl({
                        modelAttribute: 'selectAll',
                        model: this.model.checkbox || this.model.state
                    });
                    this.children.checkbox.render().appendTo(this.$('.' + this.options.checkboxClassName));
                }
                this.options.columns.forEach(function(column) {
                    if (column.tooltip) {
                        this.$('.' + column.className).find('.column-tooltip').tooltip({animation:false, title: column.tooltip, container: 'body'});
                    }
                }.bind(this));
                return this;
            },
            template: '\
                <tr class="">\
                    <% _.each(columns, function(value, sortKey) { %>\
                        <% if (_.isFunction(value.visible) && !value.visible.call()) { return; } %>\
                        <% var sortableClassName = (value.sortKey) ? "sorts" : "" %>\
                        <% var activeClassName = model.get("sortKey") && value.sortKey==model.get("sortKey") ? "active " + model.get("sortDirection") : "" %>\
                        <th data-key="<%- value.sortKey || "" %>" class="<%- sortableClassName %> <%- activeClassName %> <%- value.className || "" %>" <%- value.colSpan ? "colspan=" + value.colSpan : "" %> >\
                        <% if (value.html) { %>\
                            <%= value.html %>\
                        <% } else if (value.sortKey) { %>\
                            <a href="#"><%- value.label %>\
                                <% if (value.tooltip) { %>\
                                    <a href="#" class="column-tooltip tooltip-link"><%- _("?").t() %></a>\
                                <% } %>\
                                <i class="icon-sorts <%- activeClassName %>"></i>\
                            </a>\
                        <% } else { %>\
                                <%- value.label %>\
                            <% } %>\
                        </th>\
                    <% }) %>\
                </tr>\
            '
        });
    }
);
