// Displays the bulk edit menu
// @author: nmistry
define([
    'underscore',
    'jquery',
    './BulkEditMenu'
], function (
    _,
    $,
    BulkEditMenu
) {
    return ({
        toolbarItems: {
            bulkEdit: 'initializeBulkEditsTool'
        },
        initializeBulkEditsTool: function (config) {
            var settings = {
                links: [],
                singular: '',
                plural: ''
            };
            _.extend(settings, config);
            this.children[config.type] = new BulkEditMenu({
                singular: settings.singular,
                plural: settings.plural,
                links: settings.links,
                radio: this.radio
            });

            // enable bulk edit in grid, if someone adds the bulkedit tool
            this.config.grid.bulkEdit = $.extend(true, {enabled: true}, this.config.grid.bulkEdit);
        }
    });
});
