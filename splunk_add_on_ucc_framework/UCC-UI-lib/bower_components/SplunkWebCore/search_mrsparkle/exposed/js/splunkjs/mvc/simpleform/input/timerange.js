define(function(require) {
    var BaseInput = require('./base');
    var TimeRangeView = require('../../timerangeview');
    var FormUtils = require('../formutils');

    FormUtils.registerInputType('time', TimeRangeView);

    var TimeRangeInput = BaseInput.extend({
        initialVisualization: 'time'
    });

    return TimeRangeInput;
});
