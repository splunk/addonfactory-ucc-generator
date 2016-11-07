define([
    'views/shared/controls/Control',
    'splunk.util',
    'select2/select2'
], function (
    Control,
    splunkUtils
) {
    /**
     *
     * @param {Object} options
     *                        {Object} model The model to operate on
     *                        {String} modelAttribute The attribute on the model to observe and update on selection
     *                        {Object} items An array of one-level deep data structures:
     *                                      label (textual display),
     *                                      value (value to store in model)
     */
    var DELIMITER = '::::';

    return Control.extend({
        className: 'control multiselect-input-control splunk-multidropdown splunk-chioce-input',

        initialize: function () {
            Control.prototype.initialize.call(this, this.options);
            if (this.options.modelAttribute) {
                this.$el.attr('data-name', this.options.modelAttribute);
            }
            this.delimiter = this.options.delimiter || ',';
        },

        render: function () {
            this.$el.html(this.compiledTemplate({
                items: this.options.items
            }));
            this.$('select').select2({
                placeholder: this.options.placeholder,
                formatNoMatches: function () {
                    return 'No matches found';
                },
                value: this._value,
                dropdownCssClass: 'empty-results-allowed',
                separator: DELIMITER,
                // SPL-77050, this needs to be false for use inside popdowns/modals
                openOnEnter: false
            })
                .select2('val', this.stringToFieldList(this._value || ''));
            return this;
        },

        setItems: function (items, render) {
            render = render || true;
            this.options.items = items;
            if (render) {
                this.render();
            }
        },

        remove: function () {
            this.$('select').select2('close').select2('destroy');
            return Control.prototype.remove.apply(this, arguments);
        },

        //Delimiter with this.delimiter
        stringToFieldList: function(strList) {
            if (typeof(strList) != 'string' || !strList) return [];
            var items = [];
            var field_name_buffer = [];
            var str = $.trim(strList);
            for (var i=0,j=str.length; i<j; i++) {
                if (str.charAt(i) == '\\') {
                    var nextidx = i+1;
                    if (j > nextidx && (str.charAt(nextidx) == '\\' || str.charAt(nextidx) == '"')) {
                        field_name_buffer.push(str.charAt(nextidx));
                        i++;
                        continue;
                    } else {
                        field_name_buffer.push(str.charAt(i));
                        continue;
                    }
                }
                // Template metrics field
                if (str.charAt(i) === this.delimiter) {
                    if (field_name_buffer.length > 0) {
                        items.push($.trim(field_name_buffer.join('')));
                    }
                    field_name_buffer = [];
                    continue;
                }
                field_name_buffer.push(str.charAt(i));
            }
            if (field_name_buffer.length > 0) {
                items.push($.trim(field_name_buffer.join('')));
            }
            return items;
        },

        fieldListToString: function(fieldArray) {
            if (!fieldArray) return '';
            var output = [];
            for (var i=0,L=fieldArray.length; i<L; i++) {
                var v = $.trim(fieldArray[i]);
                if (v !== '') {
                    // Escape any char with the backslash.
                    if (v.search(this._sflEscapable) > -1) {
                        v = v.replace(this._sflEscapable, "\\$1");
                    }
                    output.push(v);
                }
            }
            if (this.options.modelAttribute === 'content') {
                return output.join(this.delimiter);
            }
            return output.join(this.delimiter);
        },

        events: {
            'change select': function (e) {
                var values = e.val || [];
                this.setValue(this.fieldListToString(values), false);
            }
        },

        template: `
            <select multiple="multiple">
                <% _.each(items, function(item, index) { %>
                    <option value="<%- item.value %>"><%- item.label %></option>
                <% }) %>
            </select>
        `
    });
});
