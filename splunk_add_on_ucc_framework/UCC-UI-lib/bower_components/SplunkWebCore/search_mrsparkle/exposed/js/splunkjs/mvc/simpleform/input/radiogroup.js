define(function(require) {
    var BaseInput = require('./base');
    var RadioGroupView = require('../../radiogroupview');
    var FormUtils = require('../formutils');

    FormUtils.registerInputType('radio', RadioGroupView, { choices: true, multiValue: false });

    var RadioGroupInput = BaseInput.extend({
        initialVisualization: 'radio'
    });
    
    return RadioGroupInput;
});
