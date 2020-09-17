define(function(require) {
    var BaseInput = require('./base');
    var LinkListView = require('../../linklistview');
    var FormUtils = require('../formutils');

    FormUtils.registerInputType('link', LinkListView, { choices: true, multiValue: false });

    var LinkListInput = BaseInput.extend({
        initialVisualization: 'link'
    });

    return LinkListInput;
});
