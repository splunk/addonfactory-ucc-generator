define(function(require) {
    var BaseInput = require('./base');
    var CheckboxGroupView = require('../../checkboxgroupview');
    var FormUtils = require('../formutils');

    FormUtils.registerInputType('checkbox', CheckboxGroupView, { choices: true, multiValue: true });

    var CheckboxGroupInput = BaseInput.extend({
        initialVisualization: 'checkbox'
    });

    return CheckboxGroupInput;
});
