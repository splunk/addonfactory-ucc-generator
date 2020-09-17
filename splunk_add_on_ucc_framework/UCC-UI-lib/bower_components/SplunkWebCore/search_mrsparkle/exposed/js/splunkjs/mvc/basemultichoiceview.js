define(function(require, exports, module) {
    var _ = require('underscore');
    var BaseChoiceView = require("./basechoiceview");
    var util = require('util/general_utils');

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name BaseMultiChoiceView
     * @private
     * @description The BaseMultichoiceView base class is for choice arrays that
     * can have multiple choice values selected.  All controls based on this class always
     * take and return arrays of values. This class is not designed to be instantiated directly.
     * @extends splunkjs.mvc.BaseChoiceView
     */
    var BaseMultiChoiceView = BaseChoiceView.extend(/** @lends splunkjs.mvc.BaseMultiChoiceView.prototype */{
        _isMultiChoiceView: true,
        
        updateSelectedLabel: function() {
            var oldSelectedLabels = util.asArray(this.settings.get('selectedLabel'));

            var selectedLabels = _.map(
                this.val(), 
                function(value) {
                    var choice = this._findDisplayedChoice(value);
                    return choice ? choice.label : undefined;
                }, 
                this);

            if (!_.isEqual(oldSelectedLabels, selectedLabels)) {
                if (selectedLabels.length > 0) {
                    this.settings.set('selectedLabel', selectedLabels);
                } else {
                    this.settings.unset('selectedLabel');
                }
            }
        },

        val: function(newValue) {
            var oldValue = this.settings.get('value');

            var oldValueAsArray = util.asArray(oldValue);
            var newValueAsArray = util.asArray(newValue);
            
            if (arguments.length === 0) {
                return oldValueAsArray;
            }
            
            var sortedOldValue = _.clone(oldValueAsArray).sort();
            var sortedNewValue = _.clone(newValueAsArray).sort();

            // Don't change the value if the new value is logically equal to the old value (ignoring order).
            // However, if the old value is undefined, we go ahead and set it anyway
            // to coerce it into an empty array.
            if (_.isEqual(sortedOldValue, sortedNewValue) && sortedOldValue.length > 0 && Array.isArray(oldValue)) {
                return oldValue;
            }

            this.settings.set('value', newValueAsArray);
            
            return newValueAsArray;
        },
        
        _getSelectedData: function() {
            var values = this.val();
            return _(values).map(_.bind(function(val){
                var result = {
                    value: val,
                    label: (this._findDisplayedChoice(val) || {}).label
                };
                return _.extend(this._selectedDataForValue(val) || {}, result);
            }, this));
        }
    });
    
    return BaseMultiChoiceView;
});
