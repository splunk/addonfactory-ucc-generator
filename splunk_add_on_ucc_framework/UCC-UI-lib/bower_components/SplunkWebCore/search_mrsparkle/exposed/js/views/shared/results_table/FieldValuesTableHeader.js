/**
 * @author jszeto
 * @date 12/5/13
 *
 * Custom Table Header for FieldValuesTable. Turns off sorting for % column
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    './ResultsTableHeader'
],
    function ($, _, Backbone, module, ResultsTableHeader) {

        return ResultsTableHeader.extend({
            moduleId:module.id,



            template:'\
                <tr class="">\
                <% if(rowExpansion) { %>\
                    <th class="col-info" style="width: 15px;"><i class="icon-info"></i></th>\
                <% } %>\
                <% if(rowNumbers) { %>\
                    <th class="row-number"></th>\
                <% } %>\
                <% _(fields).each(function(field) { %>\
                    <% if (field == "%") { %>\
                        <th><%- field %></th>\
                    <% } else { %>\
                        <th class="sorts <%- columnClasses[field] %>" <%- sortKeyAttribute %>="<%- field %>">\
                        <a href="#"><%- field %><i class="icon-sorts "></i></a>\
                        </th>\
                    <% } %>\
                <% }) %>\
            </tr>\
            '
        });

    });

