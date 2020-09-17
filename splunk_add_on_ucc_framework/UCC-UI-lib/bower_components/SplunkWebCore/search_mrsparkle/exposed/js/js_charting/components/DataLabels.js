define([
            'jquery',
            '../helpers/EventMixin'
        ],
        function(
            $,
            EventMixin) {

    var DataLabels = function(properties) {
        this.properties = properties || {};
        return this;
    };

    DataLabels.prototype = $.extend({}, EventMixin, {
        getConfig: function() {
            return ({
                enabled: true
            });
        }
    });
    return DataLabels;
});