define([
        'jquery',
        'underscore',
        'module',
        'backbone',
        'views/shared/controls/Control',
        'bootstrap.tooltip'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        Control,
        bootstrapTooltip
        ) {

        return Control.extend({
            className: 'color-range-label-control',
            moduleId: module.id,

            initialize: function() {
                Control.prototype.initialize.apply(this, arguments);
            },

            render: function() {
                this.$('.text-value').tooltip('destroy');
                this.$el.html(this.compiledTemplate({
                    value: this.options.value || this.model.get('value'),
                    label: this.options.label,
                    customClass: this.options.customClass || 'color-control-left-col'
                }));
                this.$('.text-value').tooltip({ animation: false, container: 'body' });
                return this;
            },

            remove: function() {
                this.$('.text-value').tooltip('destroy');
                return Control.prototype.remove.apply(this, arguments);
            },

            template: '\
                <div class="control-group <%- customClass %>">\
                    <label class="control-label text-label">\
                        <span><%- label %></span>\
                    </label>\
                    <label class="control-label text-value" title="<%- value %>">\
                        <span class="value"><%- value %></span>\
                    </label>\
                </div>\
            '
        });

    });
