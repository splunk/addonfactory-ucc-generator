define([
    'jquery',
    'module', 
    'views/Base', 
    'uri/route', 
    'util/time',
    'helpers/grid/RowIterator',
    'views/deploymentserver/ClientsGridRow',
    'splunk.i18n',
    'underscore', 
    'views/shared/dialogs/TextDialog',
    'contrib/text!views/deploymentserver/ClientsGrid.html'
], 
      
function(
    $,
    module, 
    BaseView, 
    route, 
    time_utils,
    RowIterator,
    ClientsGridRow,
    i18n,
    _,  
    TextDialog,  
    template) {
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            clientsGridRows: [],
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.collection.on('reset', this.render, this);  
            },
            render: function() {
                var html = this.compiledTemplate({});
                var $html = $(html);

                _(this.clientsGridRows).each(function(clientsGridRow) {
                    clientsGridRow.off();
                    clientsGridRow.detach();
                }, this);

                this.clientsGridRows = [];
                var rowIterator = new RowIterator();

                rowIterator.eachRow(this.collection, function(clientModel, index, rowNumber, isExpanded) {
                        // Note we've set the root tag of the FieldRow to be a TR
                        var clientsGridRow = new ClientsGridRow({
                            model: {client: clientModel,
                                    paginator: this.model.paginator,
                                    application: this.options.application},
                            isExpanded: isExpanded,
                            index: index,
                            rowNumber: rowNumber});

                    this.clientsGridRows.push(clientsGridRow);
                    // TODO [JCS] Move this out of the loop for better performance
                    $html.find(".client-grid-table-body").append(clientsGridRow.render().el);
                }, this);

                this.$el.html($html);

                return this; 
            } 

        });
});
