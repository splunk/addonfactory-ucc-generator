/**
 * @author jszeto
 * @date 11/4/13
 *
 * Displays a checkmark if the field name is "_is_match" and the value is 1. Used with the MatchResultsTableMaster class
 */
define(function(require, exports, module) {

    var _ = require("underscore");
    var i18n = require("splunk.i18n");
    var BaseCellRenderer = require("./BaseCellRenderer");

    var CheckmarkCellRenderer = BaseCellRenderer.extend({

        canRender: function(cellData) {
            //return (cellData.columnType === "boolean");
            return (cellData.field === cellData.matchFieldName);
        },

        setup: function($td, cellData) {
            $td.addClass("checkmark");
        },

        teardown: function($td, cellData) {
            $td.removeClass("checkmark");
        },

        render: function($td, cellData) {
            $td.html(_.template(this.template, cellData));
            return this;
        },

        template: '\
            <% if (value == "1") { %>\
                <span class="font-icon" style="color: #487f22;">✓</span>\
            <% } else { %>\
                <i class="font-icon" style="color: #b00;">✗</i>\
            <% } %>\
            \
        '

    });

    return CheckmarkCellRenderer;

});
