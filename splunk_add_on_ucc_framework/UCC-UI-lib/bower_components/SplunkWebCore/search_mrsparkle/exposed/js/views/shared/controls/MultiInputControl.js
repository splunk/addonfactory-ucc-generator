define([
            'underscore',
            'module',
            'views/shared/controls/Control',
            'splunk.util',
            'select2/select2',
            'jquery.resize'
        ],
        function(
            _,
            module,
            Control,
            splunkUtils
            /* remaining modules do not export */
        ) {

    var DELIMITER = '::::';

    /**
     * @constructor
     * @memberOf views
     * @name MultiInputControl
     * @extends {views.Control}
     * 
     * @param {Object} options
     * @param {String} options.modelAttribute The attribute on the model to observe and update on
     * selection
     * @param {Backbone.Model} options.model The model to operate on
     * @param {String} [options.placeholder] The placeholder text for an empty input
     * @param {Array<String>} [options.autoCompleteFields] A list of fields to use for auto-complete
     * @param {String} [options.inputClassName] A class name to apply to the input element
     */
    return Control.extend(/** @lends views.MultiInputControl.prototype */{

        moduleId: module.id,

        events: {
            'change input': function(e) {
                var values = e.val || [];
                this.setValue(splunkUtils.fieldListToString(values), false);
            }
        },

        render: function() {
            if(this.el.innerHTML) {
                this.$('input').select2('val', splunkUtils.stringToFieldList(this._value || ''), false);
                return;
            }
            this.$el.html(this.compiledTemplate({ options: this.options }));
            this.$input = this.$('input');
            if (_.isArray(this.options.data)) {
                this.$input.select2({
                    placeholder: this.options.placeholder,
                    data: this.options.data,
                    multiple: true,
                    openOnEnter: false
                })
                .select2('val', splunkUtils.stringToFieldList(this._value || ''));
            } else {
                this.$input.select2({
                    placeholder: this.options.placeholder,
                    tags: this.options.autoCompleteFields || [],
                    formatNoMatches: function() { return '&nbsp;'; },
                    dropdownCssClass: 'empty-results-allowed',
                    separator: DELIMITER,
                    // SPL-77050, this needs to be false for use inside popdowns/modals
                    openOnEnter: false
                })
                .select2('val', splunkUtils.stringToFieldList(this._value || ''));
            }
            return this;
        },

        reflow: function() {
            // The placeholder text does not automatically refresh itself when the container size changes.
            // If the placeholder is visible (signified by the value being empty), set the value again
            // to force the placeholder to refresh (SPL-95554).
            var val = this.$input.select2('val');
            if (!val || val.length === 0) {
                this.$input.select2('val', []);
            }
        },

        startListening: function() {
            Control.prototype.startListening.apply(this, arguments);
            this.$el.on('elementResize', _(this.invalidateReflow).bind(this));
        },

        deactivate: function(options) {
            if (!this.active) {
                return Control.prototype.deactivate.apply(this, arguments);
            }
            Control.prototype.deactivate.apply(this, arguments);
            this.$el.off('elementResize');
            return this;
        },

        remove: function() {
            this.$input.select2('close').select2('destroy');
            this.$el.off('elementResize');
            return Control.prototype.remove.apply(this, arguments);
        },

        template: '\
            <input class="<%= options.inputClassName %>" />\
        '

    });

});