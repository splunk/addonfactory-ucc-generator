define([
            'underscore',
            'models/Base',
            'util/field_extractor_utils'
        ],
        function(
            _,
            BaseModel,
            fieldExtractorUtils
        ) {

    return BaseModel.extend({

        defaults: {
            regex: '',
            fieldName: ''
        },

        validation: {
            fieldName: [
                {
                    required: true,
                    pattern: /^[a-zA-Z]+[a-zA-Z0-9_]*$/,
                    msg: _('Field names must start with a letter and contain only letters, numbers, and underscores.').t()
                },
                {
                    fn: 'validateFieldName'
                }
            ]
        },

        validateFieldName: function(fieldName) {
            var regex = this.get('regex');
            if(regex && _(fieldExtractorUtils.getCaptureGroupNames(regex)).contains(fieldName)) {
                return _('Field names must be unique.').t();
            }
            if (fieldName.length > 32) {
                return _('Field names must be 32 characters or less.').t();
            }
        }

    });

});