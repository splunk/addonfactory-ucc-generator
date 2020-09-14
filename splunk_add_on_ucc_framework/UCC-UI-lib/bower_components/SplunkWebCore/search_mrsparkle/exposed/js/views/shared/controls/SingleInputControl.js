define([
            'jquery',
            'underscore',
            'module',
            'views/shared/controls/Control',
            'splunk.util',
            'select2/select2'
        ],
        function(
            $,
            _,
            module,
            Control,
            splunkUtils
            /* remaining modules do not export */
        ) {

    /**
     * @constructor
     * @memberOf views
     * @name  SingleInputControl
     * @extends {views.Control}
     * 
     * @param {Object} options
     * @param {String} options.modelAttribute The attribute on the model to observe and update on selection
     * @param {Backbone.Model} options.model The model to operate on
     * @param {String} [options.placeholder] The placeholder text for an empty input
     * @param {String[]} [options.autoCompleteFields] A list of fields to use for auto-complete
     * @param {String} [options.inputClassName] A class name to apply to the input element
     */
    return Control.extend(/** @lends views.SingleInputControl.prototype */{

        moduleId: module.id,

        events: {

            'change input': function(e) {
                this.setValue(e.val, false);
            }

        },

        render: function() {
            if(this.el.innerHTML) {
                return;
            }
            this.$el.html(this.compiledTemplate({ options: this.options }));
            var $input = this.$('input');
            var data = [];
            $.each(this.options.autoCompleteFields, function() {
                data.push({id: this, text: this});
            });
            $input.select2({
                placeholder: this.options.placeholder,
                data: data,
                formatNoMatches: function() { return '&nbsp;'; },
                dropdownCssClass: 'empty-results-allowed',
                // SPL-77050, this needs to be false for use inside popdowns/modals
                openOnEnter: false,
                multiple: false,
                combobox: true
            })
            .select2('val', this._value || '');
            return this;
        },

        remove: function() {
            this.$('input').select2('close').select2('destroy');
            return Control.prototype.remove.apply(this, arguments);
        },

        template: '\
            <input class="<%= options.inputClassName %>" />\
        '

    });

});
