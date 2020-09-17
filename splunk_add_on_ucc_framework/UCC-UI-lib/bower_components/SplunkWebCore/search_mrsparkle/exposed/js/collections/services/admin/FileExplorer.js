define(
    [
        "models/services/admin/FileExplorer",
        "collections/SplunkDsBase"
    ],
    function(FileExplorerModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },
            url: 'admin/file-explorer',
            model: FileExplorerModel
        });
    }
);