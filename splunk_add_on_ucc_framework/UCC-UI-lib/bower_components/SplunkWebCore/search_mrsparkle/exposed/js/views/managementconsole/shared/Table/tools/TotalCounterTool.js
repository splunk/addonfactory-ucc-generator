// Total counter tool for the table component
// @author: nmistry
define([
    'underscore',
    'jquery',
    'views/shared/CollectionCount'
], function (
    _,
    $,
    Counter
) {
    return ({
        toolbarItems: {
            totalCounter: 'initializeCounter'
        },
        initializeCounter: function (config) {
            _.defaults(config, {
                tagName: 'h3',
                attachTo: '.toolbar2'
            });
            var settings = {
                tagName: config.tagName,
                collection: this.collection,
                countLabel: config.label || ''
            };
            _.extend(settings, config.options);
            this.children[config.type] = new Counter(settings);
        }
    });
});
