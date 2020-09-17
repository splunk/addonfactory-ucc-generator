define(function(require) {
    var BaseInput = require('./base');
    var MultiSelectView = require('../../multiselectview');
    var FormUtils = require('../formutils');

    FormUtils.registerInputType('multiselect', MultiSelectView, { choices: true, multiValue: true });

    var MultiSelectInput = BaseInput.extend({
        initialVisualization: 'multiselect'
    });

    return MultiSelectInput;
});
