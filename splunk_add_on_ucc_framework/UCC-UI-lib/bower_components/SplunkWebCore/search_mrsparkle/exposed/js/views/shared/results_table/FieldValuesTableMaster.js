/**
 * @author jszeto
 * @date 12/5/13
 *
 * ResultTableMaster subclass that adds special logic for showing a % with custom cell renderer
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    './ResultsTableMaster',
    './FieldValuesTableHeader',
    './renderers/PercentCellRenderer'
],
    function (
        $,
        _,
        Backbone,
        module,
        ResultsTableMaster,
        FieldValuesTableHeader,
        PercentCellRenderer) {

        return ResultsTableMaster.extend({
            moduleId:module.id,

            initialize:function (options) {
                this.options = $.extend(true, {headerClass: FieldValuesTableHeader}, this.options);

                ResultsTableMaster.prototype.initialize.call(this, this.options);
                this.addCellRenderer(new PercentCellRenderer());
            }
        });

    });

