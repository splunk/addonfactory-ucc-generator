/**
 * @author jszeto
 * @date 12/5/13
 *
 * Displays a the percentage to three places plus a grey bar representing the percentage
 */
define(function(require, exports, module) {

    var _ = require("underscore");
    var i18n = require("splunk.i18n");
    var TimeUtils = require("util/time");
    var BaseCellRenderer = require("./BaseCellRenderer");

    return BaseCellRenderer.extend({

        canRender: function(cellData) {
            return (cellData.field == "%" || cellData.field == "Percent");
        },

        setup: function($td, cellData) {
            $td.addClass("percent");
        },

        teardown: function($td, cellData) {
            $td.removeClass("percent");
        },

        render: function($td, cellData) {
            $td.html(_.template(this.template, cellData));
            return this;
        },

        template: '\
            <div style="width:5em; margin-right:8px" class="pull-left"><%- (value * 100).toFixed(3) %></div>\
            <div style="width:calc(100% - 5em - 8px)" class="pull-left">\
                <div style="width:<%- Math.round(value * 100) %>%;" class="graph-bar pull-left"></div>\
            <div>\
        '
    });

});
