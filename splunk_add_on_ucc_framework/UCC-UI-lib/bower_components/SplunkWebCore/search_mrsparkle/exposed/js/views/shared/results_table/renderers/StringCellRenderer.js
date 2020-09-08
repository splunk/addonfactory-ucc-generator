define(function(require, exports, module) {

    var _ = require("underscore");
    var ResultsTableRow = require("../ResultsTableRow");
    var BaseCellRenderer = require("./BaseCellRenderer");

    return BaseCellRenderer.extend({

        canRender: function(cellData) {
            return true;
        },

        setup: function($td, cellData) {
            $td.addClass("string");
        },

        teardown: function($td, cellData) {
            $td.removeClass("string");
        },

        render: function($td, cellData) {
            cellData = _.extend({
                MV_SUBCELL_CLASSNAME: ResultsTableRow.MV_SUBCELL_CLASSNAME,
                MV_INDEX_ATTR: ResultsTableRow.MV_INDEX_ATTR
            }, cellData);

            $td.html(_.template(this.template, cellData));
        },

        template: '\
            <% if (_.isArray(value)) { %>\
                <% _(value).each(function(subValue, i) { %>\
                    <div tabindex="0" class="<%- MV_SUBCELL_CLASSNAME %>" <%- MV_INDEX_ATTR %>="<%- i %>">\
                        <%- subValue %>\
                    </div>\
                <% }) %>\
            <% } else { %>\
                <%- value %>\
            <% } %>\
        '

    });

});
