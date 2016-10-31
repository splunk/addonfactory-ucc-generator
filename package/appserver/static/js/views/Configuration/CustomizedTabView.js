import {configManager} from 'app/util/configManager';

define([
    'jquery',
    'lodash',
    'backbone'
], function (
    $,
    _,
    Backbone
) {
    return Backbone.View.extend({
        initialize: function (options) {
            this.props = options.props;
        }
    });
});
