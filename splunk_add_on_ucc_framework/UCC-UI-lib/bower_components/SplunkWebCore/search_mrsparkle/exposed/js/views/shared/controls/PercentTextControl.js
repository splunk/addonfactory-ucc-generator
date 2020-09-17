define([
            'jquery',
            'underscore',
            'module',
            'views/shared/controls/TextControl',
            'util/math_utils'
        ],
        function(
            $,
            _,
            module,
            TextControl,
            mathUtils
        ) {

    /**
     * @constructor
     * @memberOf views
     * @name PercentTextControl
     * @extends {views.TextControl}
     */
    return TextControl.extend(/** @lends views.PercentTextControl.prototype */{

        moduleId: module.id,

        initialize: function() {
            this.options = $.extend({
                append: _('<span class="add-on"><%- _("%").t() %></span>').template({}),
                inputClassName: 'input-mini'
            }, this.options);
            TextControl.prototype.initialize.call(this, this.options);
        },

        // the next two methods normalize the model attribute from a decimal in the model to a percent when displayed to the user
        setValueFromModel: function(render) {
            var rawValue = this.model.get(this.getModelAttribute()),
                // need to do this to avoid floating point errors
                normalizedValue = mathUtils.strictParseFloat((mathUtils.strictParseFloat(rawValue) * 100).toPrecision(12));

            this._setValue(_.isNaN(normalizedValue) ? rawValue : normalizedValue, render);
            return this;
        },

        getUpdatedModelAttributes: function() {
            var updateAttrs = TextControl.prototype.getUpdatedModelAttributes.apply(this, arguments),
                rawValue = updateAttrs[this.getModelAttribute()],
                normalizedValue = mathUtils.strictParseFloat(updateAttrs[this.getModelAttribute()]) / 100;

            updateAttrs[this.getModelAttribute()] = _.isNaN(normalizedValue) ? rawValue : normalizedValue;
            return updateAttrs;
        }

    });

});