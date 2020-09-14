define(function(require, exports, module) {

    var _ = require("underscore");
    var i18n = require("splunk.i18n");
    var TimeUtils = require("util/time");
    var BaseCellRenderer = require("./BaseCellRenderer");

    return BaseCellRenderer.extend({

        canRender: function(cellData) {
            return (cellData.columnType === "timestamp");
        },

        setup: function($td, cellData) {
            $td.addClass("timestamp");
        },

        teardown: function($td, cellData) {
            $td.removeClass("timestamp");
        },

        render: function($td, cellData) {
            cellData = _.extend({
                formattedValue: (cellData.value !== "ALL" && TimeUtils.isValidIsoTime(cellData.value)) ?
                    i18n.format_date(TimeUtils.isoToDateObject(cellData.value), cellData.timestampFormat) :
                    cellData.value
            }, cellData);

            $td.html(_.template(this.template, cellData));
        },

        template: '\
            <%- formattedValue %>\
        '

    });

});
