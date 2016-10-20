import CONTROL_TYPE_MAP from 'app/constants/controlTypeMap';

define([
    'views/Base',
    'underscore'
], function (
    BaseView,
    _
) {
    /**
     *  A wrapper view for controls.
     *      An extra label will be render
     *      (TODO)A loading indicator will be render along with the control.
     */
    return BaseView.extend({
        className: 'form-horizontal',
        initialize: function (options) {
            this.label = options.label;
            _.extend(this, options);
            this.labelPosition = options.labelPosition || 'top';
            // Support both string mapping and raw component
            const controlType = typeof options.controlType === 'string' ?
                CONTROL_TYPE_MAP[options.controlType] : options.controlType;
            this.control = new controlType(this.controlOptions);
            this.listenTo(this.control, 'all', this.trigger);
        },
        events: {
            'click a.tooltip-link': function (e) {
                e.preventDefault();
            }
        },
        validate: function () {
            return this.control.validate();
        },
        render: function () {
            this.$el.html(this.compiledTemplate({
                label: this.label,
                tooltip: this.tooltip,
                required: this.required,
                help: this.help
            }));
            if (this.tooltip) {
                this.$('.tooltip-link').tooltip({animation: false, title: this.options.tooltip, container: 'body'});
            }
            var $control = this.control.render().$el;
            if (this.controlClass) {
                $control.addClass(this.controlClass);
            }
            // this.$('.control-placeholder').replaceWith($control);
            //this.$('.control-placeholder').append($control);
            this.$('.control-placeholder').prepend($control);
            //this.$el.addClass('label-position-' + this.labelPosition);
            this.$el.addClass('form-small');
            this.wrapperClass && this.$el.addClass(this.wrapperClass);
            return this;
        },
        remove: function () {
            if (this.tooltip) {
                this.$('.tooltip-link').tooltip('destroy');
            }
            return BaseView.prototype.remove.apply(this, arguments);
        },

        template: [
            '<div class="form-group control-group">',
            '<% if (label) { %><div class="control-label col-sm-2"><p><%- label %><% if (tooltip) { %><a href="#" class="tooltip-link"><%- _("?").t() %></a><% } %>',
            '<% if (required) { %><span class="required">*</span><% } %></p></div><% } %>',
            '<div class="col-sm-10 controls control-placeholder">',
            '<% if (help) { %><span class="help-block"><%- help %></span><% } %>',
            '</div>',
            '</div>'
        ].join('')
    });
});
