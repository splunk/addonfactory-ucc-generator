/**
 * @author jszeto
 * @date 12/10/13
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'splunk.util',
    'views/shared/controls/TextareaControl'
],
    function (
        $,
        _,
        Backbone,
        module,
        splunkUtil,
        TextareaControl
        ) {

        return TextareaControl.extend({
            moduleId: module.id,

            // Trims whitespace from the string before committing the value to the model.
            setValue: function(value, render, options) {
                return TextareaControl.prototype.setValue.call(this, splunkUtil.trim(value), render, options);
            }

        });

    });

