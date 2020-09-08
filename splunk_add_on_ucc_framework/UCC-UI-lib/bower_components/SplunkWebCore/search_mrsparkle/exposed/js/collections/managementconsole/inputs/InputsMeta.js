// Inputs meta collection
// responsible for fetching the summary of input types and its count
// @author: nmistry
define([
    'splunk.util',
    'collections/managementconsole/DMCsContextualBase',
    'models/managementconsole/inputs/InputsMeta'
], function (
    splunkUtil,
    DMCContextualBaseCollection,
    InputsMetaModel
) {
    return DMCContextualBaseCollection.extend({
        urlRoot: 'dmc/config',

        model: InputsMetaModel,

        comparator: 'rank',

        url: function () {
            return this.buildCompleteUrl(this.getBundle(), 'inputs-meta');
        },

        getModelById: function (id) {
            return this.get(id);
        }

    });
});
