/**
 * @author claral
 * @date 11/13/2015
 *
 * @description This is a component for optional time range setting.
 *              The core structure is a checkbox and a TimeSecondsControl.
 *              The TimeSecondsControl is only enabled when the checkbox is checked.
 */
 
 
 
 
define(
[
    'underscore',
    'models/Base',
    'views/Base',
    'views/shared/controls/Control',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/SyntheticCheckboxControl',
    'views/virtual_indexes/custom_controls/TimeSecondsControl',
    'module'
],
function (
    _,
    BaseModel,
    BaseView,
    Control,
    ControlGroup,
    SyntheticCheckboxControl,
    TimeSecondsControl,
    module
) {
    return Control.extend({
        moduleId: module.id,

        initialize: function () {            
            this.model.editCutoffSec = new BaseModel({
                'enabled': this.options.enabled
            });
            
            this.enableUnifiedCheckbox = new SyntheticCheckboxControl({
                model: this.model.editCutoffSec,
                modelAttribute: 'enabled',
                label: this.options.checkboxLabel
            });
            this.children.enabledGroup = new ControlGroup({
                controls: [this.enableUnifiedCheckbox],
                help: this.options.checkboxHelp
            });
           
            this.listenTo(this.model.editCutoffSec, 'change enabled', this.setTimeThresholdVisibility);

            this.unifiedSearchCutoffControl = new TimeSecondsControl({
                modelAttribute: this.options.modelAttribute,
                model: this.options.model
            });
            
            this.children.timeCutoff = new ControlGroup({
                    className: 'control-group',
                    controlClass: 'controls-block',
                    controls: [this.unifiedSearchCutoffControl],
                    label: this.options.timeLabel,
                    tooltip: this.options.timeTooltip,
                    help: this.options.timeHelp
                });
        },

        setTimeThresholdVisibility: function() {
            // Enable or disable the timeCutoff so the user can't input values unless the checkbox is checked.
            if (this.model.editCutoffSec.get('enabled')) {
                this.children.timeCutoff.enable();
            } else {
                this.children.timeCutoff.disable();
            }
        },
        
        isEnabled: function() {
            return this.model.editCutoffSec.get('enabled');
        },

        render: function() {
            this.$el.append(this.children.enabledGroup.render().el);
            this.$el.append(this.children.timeCutoff.render().el);
            this.setTimeThresholdVisibility();
            return this;
        }
    });
});