// Page count tool for table component.
// @author: nmistry
define([
    'underscore',
    'jquery',
    'views/shared/dataenrichment/preview/components/SelectPageCount'
], function (
    _,
    $,
    PageCount
) {
    return ({
        toolbarItems: {
            selectPageCount: 'initializePageCount'
        },
        initializePageCount: function (config) {
            _.defaults(config, {
                attachTo: '.select-page-count'
            });
            var settings = {
                model: this.collection.fetchData
            };
            _.extend(settings, config.options);
            this.children[config.type] = new PageCount(settings);

            // if the current fetch count is not items, reset the fetch count to the first value
            // not the best way but lets get started
            var newCount = null;
            var currentCount = parseInt(this.collection.fetchData.get('count'), 10);
            var possibleCounts = _.map(
                _.pluck(this.children[config.type].items, 'value'),
                function parseInteger(x) {
                    return parseInt(x, 10);
                }
            );

            if (!_.contains(possibleCounts, currentCount)) {
                newCount = possibleCounts.shift();
                this.collection.fetchData.set('count', newCount);
            }
        }

    });
});
