/**
 * Created by rtran on 2/11/16.
 */
define([
    'module',
    'underscore',
    'jquery',
    'backbone',
    'views/deploymentserver/editServerclass/addClients/ClientsGrid',
    'views/shared/TableHead',
    'views/managementconsole/server_classes/addClients/TableRow'],
    function(
        module,
        _,
        $,
        backbone,
        ClientsTabGrid,
        TableHeadView,
        TableRow) {

        return ClientsTabGrid.extend({
            moduleId: module.id,
            initialize: function() {
                ClientsTabGrid.prototype.initialize.apply(this, arguments);

                this.allClientsSelected = this.options.areAllClientsSelected;

                var columns = [
                    {label: _('Matched').t(), sortKey: 'selected', className: 'col-matched'},
                    {label: _('Host Name').t(), sortKey: 'hostname', className: 'col-hostname'},
                    {label: _('DNS Name').t(), sortKey: 'dns', className: 'col-dns'},
                    {label: _('Client Name').t(), sortKey: 'clientName', className: 'col-client-name'},
                    {label: _('IP Address').t(), sortKey: 'ip', className: 'col-ip'},
                    {label: _('Machine Type').t(), sortKey: 'utsname', className: 'col-utsname'},
                    {label: _('Phone Home').t(), sortKey: 'lastPhoneHomeTime', className: 'col-last-phone-home'}
                ];

                this.children.tableHeadView = new TableHeadView({
                    model: this.model.search,
                    columns: columns
                });

                this.children.rows = this.rowsFromCollection();

                this.collection.on('sync', this._updateRows, this);
                this.model.search.on('change:filter change:sortKey change:sortDirection', this.performSearch, this);
            },

            performSearch: function() {
                var data = this.model.paginator.get('data') || {},
                    filter = this.model.search.get('filter'),
                    sort_key = this.model.search.get('sortKey'),
                    sort_dir = this.model.search.get('sortDirection'),
                    escapedFilter = filter ? this._escapeFilter(filter) : filter;

                data.search = escapedFilter ? 'clientName="*' + escapedFilter + '*" OR ' +
                    'hostname="*' + escapedFilter + '*" OR ' +
                    'ip="*' + escapedFilter + '*" OR ' +
                    'utsname="*' + escapedFilter + '*" '
                        : '';  // If user typed in a search
                data.sort_key = sort_key;
                data.sort_dir = sort_dir;

                this.model.paginator.set('data', data);
                this.model.paginator.trigger('change:data');
            },

            rowsFromCollection: function() {
                return this.collection.map(function(model) {
                    return new TableRow({
                        model: model,
                        allClientsSelected: this.allClientsSelected
                    });
                }, this);
            },

            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.append(this.compiledTemplate());
                    this.children.tableHeadView.render().prependTo(this.$('> .table-chrome'));
                }
                this._renderRows();
                return this;
            },

            _escapeFilter: function(filter) {
                return filter.replace(/"/g, '\\"');
            },

            _renderRows: function() {
                _.each(this.children.rows, function(row) {
                    row.render().$el.appendTo(this.$('.table-listing tbody'));
                }, this);
            },

            _updateRows: function() {
                _.each(this.children.rows, function(row) {
                    row.remove();
                });
                this.children.rows = this.rowsFromCollection();

                this._renderRows();
            },

            template: '\
                <table class="table table-chrome table-striped table-row-expanding table-listing">\
                        <tbody class="managementconsole-listings"></tbody>\
                </table>\
            '
        });
    }
);