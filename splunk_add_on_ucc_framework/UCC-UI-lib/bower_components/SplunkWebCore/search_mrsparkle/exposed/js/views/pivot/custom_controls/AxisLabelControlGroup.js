/**
 * @author sfishel
 *
 * A custom sub-class of ControlGroup for pivot config forms label inputs.
 *
 * Renders a text input control for the label with the model's default label as placeholder text.
 */

define([
            'underscore',
            'module',
            'views/shared/controls/ControlGroup',
            'views/shared/controls/Control'
        ],
        function(
            _,
            module,
            ControlGroup,
            Control
        ) {

    return ControlGroup.extend({

        moduleId: module.id,

        /**
         * @constructor
         * @param options {Object} {
         *     model {Model} the model to operate on
         *     report <models.pivot.PivotReport> the current pivot report
         *     xAxis {Boolean} whether to operate on the x-axis as opposed to the y-axis, defaults to false
         * }
         */

        initialize: function() {
            this.axisTitleVisibilityAttr = this.options.xAxis ? 'display.visualizations.charting.axisTitleX.visibility' :
                                                                'display.visualizations.charting.axisTitleY.visibility';
            this.options.label = _('Label').t();
            this.options.controls = [
                {
                    type: 'SyntheticSelect',
                    options: {
                        className: Control.prototype.className + ' input-prepend',
                        model: this.options.visualization,
                        modelAttribute: this.axisTitleVisibilityAttr,
                        toggleClassName: 'btn',
                        menuWidth: 'narrow',
                        popdownOptions: { detachDialog: true },
                        items: [
                            { value: 'visible', label: _('show').t() },
                            { value: 'collapsed', label: _('hide').t() }
                        ]
                    }
                },
                {
                    type: 'Text',
                    options: {
                        className: Control.prototype.className + ' input-prepend',
                        model: this.model,
                        modelAttribute: 'label',
                        placeholder: _('optional').t(),
                        inputClassName: this.options.inputClassName
                    }
                }
            ];
            ControlGroup.prototype.initialize.call(this, this.options);
            // set up references to each control
            this.showHideControl = this.childList[0];
            this.labelControl = this.childList[1];

            this.options.visualization.on('change:' + this.axisTitleVisibilityAttr, this.handleTitleVisibility, this);
        },

        render: function() {
            ControlGroup.prototype.render.apply(this, arguments);
            this.handleTitleVisibility();
            return this;
        },

        handleTitleVisibility: function() {
            var titleIsCollapsed = this.options.visualization.get(this.axisTitleVisibilityAttr) === 'collapsed';
            if(titleIsCollapsed || this.model.get('type') === 'timestamp') {
                this.labelControl.detach();
                this.showHideControl.$el.removeClass('input-prepend');
            }
            else {
                this.labelControl.insertAfter(this.showHideControl.$el);
                this.showHideControl.$el.addClass('input-prepend');
            }
        }

    });

});