define([
            'underscore',
            'module',
            'views/Base',
            '../custom_controls/SplitSortControlGroup',
            '../custom_controls/SplitLimitControlGroup',
            '../custom_controls/SplitTotalsControlGroup'
        ],
        function(
            _,
            module,
            Base,
            SplitSortControlGroup,
            SplitLimitControlGroup,
            SplitTotalsControlGroup
        ) {

    return Base.extend({

        moduleId: module.id,
        tagName: 'form',
        className: 'form-horizontal',

        events: {
            'submit': function(e) {
                e.preventDefault();
            }
        },

        /**
         * @constructor
         * @param options {Object} {
         *     model: {
         *         element: <sub-class of models/pivot/elements/BaseElement> the pivot element to inspect/edit
         *         report: <models/pivot/PivotReport> the pivot report model
         *     }
         *     elementType: {String} the element type ("row", or "column")
         *     elementIndex: {Integer} the index of the element being edited, or the index where it will be added
         * }
         */

        initialize: function(options) {
            Base.prototype.initialize.call(this, options);
            options = options || {};
            this.elementType = options.elementType;
            this.elementIndex = options.elementIndex;
            var dataType = this.model.element.get('type');

            if(dataType === 'number') {
                this.$el.addClass('number-split');
                this.model.element.on('change:display', this.updateLimitEnabled, this);
            }

            if(this.elementType === 'row') {
                this.children.sortControlGroup = new SplitSortControlGroup({
                    model: this.model.report.entry.content,
                    report: this.model.report,
                    showHelpText: true
                });
            }
            this.children.limitControlGroup = new SplitLimitControlGroup({
                model: this.model.report.entry.content,
                elementType: this.elementType,
                dataType: dataType,
                label: this.elementType === 'row' ? _('Max Rows').t() : _('Max Columns').t()
            });
            if (this.elementType === 'column') {
                this.children.totalsControlGroup = new SplitTotalsControlGroup({
                    model: this.model.report.entry.content,
                    elementType: this.elementType
                });
            }
        },

        render: function() {
            if(this.children.sortControlGroup) {
                this.children.sortControlGroup.render().appendTo(this.el);
            }
            this.children.limitControlGroup.render().appendTo(this.el);
            if (this.children.totalsControlGroup) {
                this.children.totalsControlGroup.render().appendTo(this.el);
            }
            this.updateLimitEnabled();
            return this;
        },

        updateLimitEnabled: function() {
            var disabledMessage = this.model.report.validateLimitAmountEnabled(this.elementType, this.model.element, this.elementIndex);
            if(disabledMessage) {
                this.children.limitControlGroup.disable(disabledMessage);
            }
            else {
                this.children.limitControlGroup.enable();
            }
        }

    });

});