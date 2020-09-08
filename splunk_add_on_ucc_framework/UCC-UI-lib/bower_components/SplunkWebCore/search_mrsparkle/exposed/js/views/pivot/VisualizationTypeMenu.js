define([
            'jquery',
            'module',
            'models/pivot/PivotReport',
            'views/extensions/DeclarativeDependencies',
            'views/Base',
            'bootstrap.tooltip'
        ],
        function(
            $,
            module,
            PivotReport,
            DeclarativeDependencies,
            Base
            /* bootstrap tooltip */
        ) {

    var VisualizationTypeMenu = Base.extend({

        tagName: 'ul',

        moduleId: module.id,

        events: {
            'click li > a': function(e) {
                e.preventDefault();
                var $a = $(e.currentTarget);
                if($a.is('.disabled')) {
                    return;
                }
                this.model.report.setVisualizationType($a.attr('data-viz-type'));
            }
        },

        /**
         * @constructor
         * @param options {
         *     model {
         *         report: <models/pivot/PivotReport> the current pivot report
         *     }
         *     items {Array<Object>} a list of object literals representing the available viz types, their properties must include:
         *         type {String} the type name, corresponds to what will be set on the report model
         *         description {String} human-readable description of the the viz type
         *         icon {String} the class name to the give the viz type icon in the menu
         * }
         */

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            this.model.report.on('visualizationTypeChange', this.debouncedRender, this);
        },

        render: function() {
            this.removeTooltips();
            this.$el.html(this.compiledTemplate({
                items: this.options.items,
                activeType: this.model.report.getVisualizationType()
            }));
            this.$('li > a:not(.disabled)').tooltip({
                animation: false,
                placement: 'right',
                container: 'body',
                delay: { show: 500, hide: 0 }
            });
            return this;
        },

        remove: function() {
            this.removeTooltips();
            return Base.prototype.remove.apply(this, arguments);
        },

        removeTooltips: function() {
            this.$('li > a:not(.disabled)').each(function() {
                // trigger a mouseleave in case there is a pending timeout to show the tooltip
                $(this).trigger('mouseleave').tooltip('destroy');
            });
        },

        template: '\
            <% _(items).each(function(item) { %>\
                <li class="<%- item.id === activeType ? "active" : "" %>">\
                    <a href="#" class="<%- item.disabled ? \'disabled\' : \'\' %>" \
                                title="<%- item.disabled ? \'\' : item.label || \'\' %>" \
                                data-viz-type="<%- item.id %>">\
                        <% if (item.icon) { %>\
                            <span class="icon-<%- item.icon %>"></span>\
                        <% } else { %>\
                            <span class="icon"><%- item.label.slice(0, 2) %></span>\
                        <% } %>\
                    </a>\
                </li> \
            <% }); %>\
        '

    },
    {
        apiDependencies: {
            report: PivotReport
        }
    });

    return DeclarativeDependencies(VisualizationTypeMenu);

});