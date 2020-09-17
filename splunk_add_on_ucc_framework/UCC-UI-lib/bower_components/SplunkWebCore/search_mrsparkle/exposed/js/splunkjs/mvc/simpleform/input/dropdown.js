define(function(require) {
    var BaseInput = require('./base');
    var SelectView = require('../../dropdownview');
    var FormUtils = require('../formutils');

    FormUtils.registerInputType('dropdown', SelectView, { choices: true, multiValue: false });

    var DropdownInput = BaseInput.extend({
        initialVisualization: 'dropdown'
    });
    
    return DropdownInput;
});
