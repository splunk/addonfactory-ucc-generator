// Text Filter tool for table component.
// @author: nmistry
define([
    'underscore',
    'jquery',
    'views/shared/controls/TextControl'
], function (
    _,
    $,
    TextControl
) {
    return ({
        toolbarItems: {
            textFilter: 'initializeFilterControl'
        },
        initializeFilterControl: function (config) {
            _.defaults(config, {
                attachTo: '.toolbar2'
            });
            var settings = {
                model: this.collection.fetchData,
                modelAttribute: 'nameFilter',
                inputClassName: 'search-query',
                canClear: true,
                placeholder: config.placeholder || _('filter').t(),
                className: 'control text-filter-tool'
            };
            _.extend(settings, config.options);
            this.children[config.type] = new TextControl(settings);
        }
    });
});
