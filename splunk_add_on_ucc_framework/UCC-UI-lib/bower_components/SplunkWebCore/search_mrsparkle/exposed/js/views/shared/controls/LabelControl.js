define(['underscore', 'module', 'views/shared/controls/Control', 'bootstrap.tooltip'], function(_, module, Control /*tooltip*/) {
    /**
     * @constructor
     * @memberOf views
     * @name LabelControl
     * @extends {views.Control}
     * @description Text Input with Bootstrap markup
     *
     * @param {Object} options
     * @param {String} options.modelAttribute The attribute on the model to observe
     * @param {Backbone.Model} options.model The model to observe
     * @param {String} [options.inputClassName] Class attribute for the input
     * @param {Boolean} [options.multiline] if enabled, behaves more like a textarea: scroll and
     * pre-wrap
     * @param {Boolean} [options.breakword] If true, words will break. Good for uris.
     * @param {Object} [options.defaultValue] If the modelAttribute in the model is undefined, then
     * use this value to populate the input
     * @param {String} [options.additionalClassNames] Class attribute(s) to add to control
     * @param {String} [options.tooltip] Text to display in the tooltip.
     * @param {String} [options.size] size of the control and it's text, currently only supports 'default' and 'small'.
     */
    return Control.extend(/** @lends views.LabelControl.prototype */{
        moduleId: module.id,
        initialize: function() {
            var defaults = {
                inputClassName: 'input-label',
                defaultValue: 'label',
                iconSize: 'icon-large'
            };
         
            _.defaults(this.options, defaults);

            Control.prototype.initialize.apply(this, arguments);

        },
        render: function() {
            var value = (_.isUndefined(this._value) || _.isNull(this._value)) ? '' : this._value;
            
            if (!this.el.innerHTML) {
                var template = _.template(this.template, {
                        options: this.options,
                        value: value
                    });

                this.$el.html(template);
                this.$span = this.$('span');
            } else {
                this.$span.text(value);
            }

            var additionalClassNames = this.options.additionalClassNames;
            if(additionalClassNames) {
                this.$el.addClass(additionalClassNames); 
            }

            if (this.options.tooltip) {
                this.$('.tooltip-text').tooltip({animation:false, title: this.options.tooltip});
            }
            return this;
        },
        // Using concatenation for constructing the template so extra whitespace isn't introduced into the span.
        // This allows the use of preformatted text styling on the span.
        template: '' +
            '<span class="<%= options.inputClassName %><% if(options.tooltip) { %> tooltip-text<% } %>">' +
                '<% if (options.icon) { %> <i class="icon-<%-options.icon%> <%-options.iconSize%>"></i> <% } %>' +
                '<%- value %>' +
            '</span>'
    });
});
