define(['jquery', '../util/dom_utils'], function($, domUtils) {

    return ({

        on: function(eventType, callback) {
            domUtils.jQueryOn.call($(this), eventType, callback);
        },

        off: function(eventType, callback) {
            domUtils.jQueryOff.call($(this), eventType, callback);
        },

        trigger: function(eventType, extraParams) {
            $(this).trigger(eventType, extraParams);
        }

    });

});