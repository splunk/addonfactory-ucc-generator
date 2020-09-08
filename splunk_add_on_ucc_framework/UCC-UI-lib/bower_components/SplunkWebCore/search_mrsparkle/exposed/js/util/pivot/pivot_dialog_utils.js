define(['underscore'], function(_) {
    
    var prepareInmemDataModel = function(dataModel) {
        dataModel.unset(dataModel.idAttribute);
        var content = dataModel.entry.content;
        content.unset('displayName');
        content.unset('modelName');
    };

    var saveDataModel = function(dataModel, inmemDataModel, pivotSearch, report, appOwner) {
        var inmemDataModelContent = inmemDataModel.entry.content;
        inmemDataModelContent.set({ name: inmemDataModelContent.get('modelName') });
        return inmemDataModel.save({}, { data: appOwner }).then(function() {
            dataModel.setFromSplunkD(inmemDataModel.toSplunkD());
            dataModel.unset('sid');
            var reportContent = report.entry.content;
            var modelId = inmemDataModel.id;
            var pivotJson = report.getPivotJSON();
            pivotJson.dataModel = _(modelId.split('/')).last();
            var indexTimeFilter = _(pivotJson.filters).findWhere({ fieldName: '_time', type: 'timestamp' });
            if(indexTimeFilter) {
                pivotJson.filters = _(pivotJson.filters).without(indexTimeFilter);
            }
            pivotSearch.clear();
            pivotSearch.set({
                pivotJson: JSON.stringify(pivotJson)
            });
            var fetchData = _.extend({ dataModel: modelId }, appOwner);
            return pivotSearch.fetch({ data: fetchData }).then(function() {
                reportContent.set({ search: pivotSearch.get('pivotSearch') });
            });
        });
    };
    
    return ({
        prepareInmemDataModel: prepareInmemDataModel,
        saveDataModel: saveDataModel
    });
    
});