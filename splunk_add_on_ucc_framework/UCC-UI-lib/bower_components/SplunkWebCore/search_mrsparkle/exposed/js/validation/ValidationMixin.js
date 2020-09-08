define([
    'underscore',
    'backbone',
    'backbone_validation'
],
    function(
        _,
        Backbone
        // backbone-validation
        ){
        /**
         * Custom Validator Example:
         *
         *     _.extend(Backbone.Validation.validators, {
         *         myValidator: function(value, attr, customValue, model) {
         *             if(value !== customValue){
         *                 return 'error';
         *             }
         *         }
         *     });
         *
         *  Custom Patterns Example:
         *
         *     _.extend(Backbone.Validation.patterns, {
         *         myPattern: /my-pattern/,
         *         email: /my-much-better-email-regex/
         *     });
         *      
         * Custom Messages
         * Replace the existing error messages with ones that use the
         * ControlGroup's label as the placeholder instead of the model attribute name
         * @mixin validation
         */
        _.extend(Backbone.Validation.messages, {
            required: '{label} is required',
            acceptance: '{label} must be accepted',
            min: '{label} must be greater than or equal to {1}',
            max: '{label} must be less than or equal to {1}',
            range: '{label} must be between {1} and {2}',
            length: '{label} must be {1} characters',
            minLength: '{label} must be at least {1} characters',
            maxLength: '{label} must be at most {1} characters',
            rangeLength: '{label} must be between {1} and {2} characters',
            oneOf: '{label} must be one of: {1}',
            equalTo: '{label} must be the same as {1}',
            pattern: '{label} must be a valid {1}'
        });

        return Backbone.Validation.mixin;
});

