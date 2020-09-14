define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/shared/controls/Control',
        'views/shared/delegates/Popdown',
        'views/table/commandeditor/listpicker/Overlay',
        'bootstrap.tooltip'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        Control,
        Popdown,
        ListPickerOverlay,
        tooltip
    ) {
        /**
         * List Picker Control with sliding overlay
         *
         * @param {Object} options
         *     {Object} model The model to operate on
         *     {String} modelAttribute The attribute on the model to observe and update on selection
         *     {String} label (Optional) Html to display before the selected value
         *     {String} toggleClassName (Optional) Class attribute to add to the parent element
         *     {String} additionalClassNames (Optional) Class attribute(s) to add to control
         *     {String} iconClassName (Optional) Class attribute(s) to add to icon
         *     {String} attachOverlayTo (Optional) The overlay will be attached to the closest parent with the defined selector.
         *     {Object} listOptions an Object to configure the overlay list. (also see 'views/table/commandeditor/listpicker/Master')
         *         {Array} items An array of objects where:
         *               {String} label (textual display - if none specified, will default to value),
         *               {any} value (value to store in model - if none specified, element is considered a menu header instead of menu item)
         *         {Boolean} required (Optional) Whether the user must select an item before exiting the overylay
         *         {Boolean} multiselect (Optional) Allow the user to select more than one item.
         *         {String} selectMessage (Optional) The text at the top of the list when multiselect is enabled.
         *         {String} multiselectMessage (Optional) The text at the top of the list when multiselect is enabled.
         *         {String} additionalClassNames (Optional) Class attribute(s) to add to this.$el
         *         {String} selectedIcon (Optional) the icon shown beside selected items, also shown as the icon for select/deselect all. Likely 'check' or 'x'.
         *         {String} Size (Optional) size of the control and its text, currently only supports 'default' and 'small'.
         *
         *   Example of items array:
         *   var items = [
         *           {value: "item1", label: "Menu item with desc"},
         *           {value: "item2", label: "Menu item"},
         *           {value: "item5", label: "Another menu item"},
         *           {value: "item6"}
         *           {value: "item7", label: "More action"},
         *           {value: "item8", label: "Yet another action"}
         *   ];
         */

        return Control.extend({
            moduleId: module.id,
            className: 'control control-list-overlay',

            initialize: function(options) {
                var defaults = {
                    toggleClassName: 'btn',
                    label: '',
                    placeholder: _('Select a value...').t(),
                    attachOverlayTo: '.overlay-parent',
                    listOptions: {}
                };

                _.defaults(this.options, defaults);
                defaults.listOptions.size = this.options.size;
                _.defaults(this.options.listOptions, defaults.listOptions);

                this.children.overlay = new ListPickerOverlay(this.options.listOptions);

                Control.prototype.initialize.apply(this, arguments);
            },

            events: {
                'click .overlay-toggle:not(.disabled)': function(e) {
                    this.renderAndAttachOverlay();
                    this.children.overlay.slideIn();
                    e.preventDefault();
                }
            },

            startListening: function() {
                Control.prototype.startListening.apply(this, arguments);

                this.listenTo(this.children.overlay, 'selectionDidChange', this.selectionDidChange);
            },

            onAddedToDocument: function() {
                if (this.options.openOverlay) {
                    this.renderAndAttachOverlay();
                    this.children.overlay.show();
                }
            },

            renderAndAttachOverlay: function() {
                if (!this.children.overlay.el.innerHTML) {
                    this.children.overlay.render().$el.appendTo(this.$el.closest(this.options.attachOverlayTo));
                }
            },

            setValueFromModel: function(render) {
                Control.prototype.setValueFromModel.apply(this, arguments);
                this.children.overlay.setSelectedValues(this.getValue());
            },

            selectionDidChange: function() {
                var val = this.children.overlay[this.options.listOptions.multiselect ? 'getSelectedValues' : 'getSelectedValue']();
                this.setValue(val);
            },

            disable: function() {
                this.options.enabled = false;
                this.$overlayToggle && this.$overlayToggle.addClass('disabled');
            },

            enable: function() {
                this.options.enabled = true;
                this.$overlayToggle && this.$overlayToggle.removeClass('disabled');
            },

            tooltip: function(options) {
                this.$overlayToggle && this.$overlayToggle.tooltip(options);
            },

            render: function() {
                var template = this.compiledTemplate({
                    selectedLabels: this.children.overlay.getSelectedLabels().join(', '),
                    selectedItem: this.children.overlay.getSelectedItem(),
                    options: this.options
                });
                this.$el.html(template);

                if (this.options.additionalClassNames) {
                    this.$el.addClass(this.options.additionalClassNames);
                }

                this.$overlayToggle = this.$('a.overlay-toggle');
                return this;
            },

            template: '\
                <a class="overlay-toggle <%- options.toggleClassName %>" href="#">' +
                    '<% if (this.options.listOptions.multiselect && selectedLabels) { %>' +
                        '<span class="link-label"><%- options.label ? options.label + "" : "" %><%- selectedLabels %></span>' +
                    '<% } else if (selectedItem) { %>' +
                        '<span class="link-label"><%- options.label ? options.label + "" : "" %> <%- selectedLabels %></span>' +
                    '<% } else { %>' +
                        '<span class="placeholder"><%- options.placeholder %></span>' +
                    '<% } %>' +
                    '<icon class="icon-chevron-right"></icon>' +
                '</a>\
            '
        }, {
            PAGINATOR_TYPES: {
                SEARCH_RESULTS: ListPickerOverlay.PAGINATOR_TYPES.SEARCH_RESULTS,
                SPLUNKD_COLLECTION: ListPickerOverlay.PAGINATOR_TYPES.SPLUNKD_COLLECTION
            }
        });
    });
