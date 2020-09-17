define(function(require) {
    var BaseInput = require('./base');
    var TextInputView = require('../../textinputview');
    var FormUtils = require('../formutils');

    FormUtils.registerInputType('text', TextInputView, { blankIsUndefined: true });

    var TextInput = BaseInput.extend({
        initialVisualization: 'text'
    });
    
    return TextInput;
});