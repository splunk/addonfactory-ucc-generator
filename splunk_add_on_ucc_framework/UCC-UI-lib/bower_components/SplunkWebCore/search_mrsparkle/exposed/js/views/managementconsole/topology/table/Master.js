/**
 * Created by lrong on 10/8/15.
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/managementconsole/DmcBase',
        'helpers/managementconsole/url',
        'views/Base',
        'views/shared/TableHead',
        'views/shared/tablecaption/Master',
        'views/shared/controls/SyntheticSelectControl',
        'views/managementconsole/topology/table/TableRow',
        'views/managementconsole/deploy/components/StatusDialog',
        'views/managementconsole/utils/object_utils',
        'collections/managementconsole/topology/Instances',
        'contrib/text!./Master.html'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        DmcBaseModel,
        urlHelper,
        BaseView,
        TableHeadView,
        TableCaptionView,
        SyntheticSelectControlView,
        TableRowView,
        DeployStatusDialog,
        object_utils,
        InstancesCollection,
        Template
    ) {
        var STRINGS = {
                NO_INSTANCES_FOUND: _('No instances found. Modify the filter options or register new Splunk instances.').t(),
                NO_FORWARDERS_FOUND: _('No forwarders found. Modify the filter options or connect new forwarders to your deployment server.').t(),
                LEARN_MORE: _('Learn more').t()
            },
            preMergedTableColumns = {
                SELECT_ALL: {className: 'col-select-all'},
                HOST_NAME: {sortKey: 'hostname', className: 'col-hostname'},
                EDIT_ACTIONS: {className: 'col-edit-actions'},
                DNS_NAME: {sortKey: 'dns', className: 'col-dns'},
                CLIENT_NAME: {sortKey: 'clientName', className: 'col-client-name'},
                IP_ADDRESS: {sortKey: 'ip', className: 'col-ip'},
                MACHINE_TYPE: {sortKey: 'splunkPlatform', className: 'col-splunk-platform'},
                PHONE_HOME: {sortKey: 'lastPhoneHomeTime', className: 'col-phone-home'},
                VERSION: {sortKey: 'splunkVersion', className: 'col-splunk-version'},
                SERVER_ROLE: {sortKey: 'topology', className: 'col-topology'},
                REGISTRATION_STATUS: {sortKey: 'task.state', className: 'col-registration-status'},
                PENDING_CHANGE: { className: 'col-pending' },
                DEPLOY_STATUS: {className: 'col-deploy-status'},
                ACTIONS: {className: 'col-actions'}
            },
            TABLE_COLUMNS = object_utils.mergeObjects(InstancesCollection.TABLE_COLUMN_LABELS, preMergedTableColumns, function(a, b) {
                var label = a.label,
                    sortKey = b.sortKey,
                    className = b.className;

                return {
                    label: label,
                    sortKey: sortKey,
                    className: className
                };
            });

        var DEPLOY_STATUS_MODE = 'instance';

        return BaseView.extend(
            {
                moduleId: module.id,

                initialize: function(options) {
                    BaseView.prototype.initialize.apply(this, arguments);

                    // Default columns that are shared by all table views
                    // Instances Page: Forwarder_Only, Full_Access
                    // Topology Manager table
                    var defaults = {
                        columns: [
                            TABLE_COLUMNS.SELECT_ALL,
                            TABLE_COLUMNS.HOST_NAME,
                            TABLE_COLUMNS.EDIT_ACTIONS,
                            TABLE_COLUMNS.DNS_NAME,
                            TABLE_COLUMNS.CLIENT_NAME,
                            TABLE_COLUMNS.IP_ADDRESS,
                            TABLE_COLUMNS.MACHINE_TYPE,
                            TABLE_COLUMNS.PHONE_HOME,
                            TABLE_COLUMNS.VERSION,
                            TABLE_COLUMNS.SERVER_ROLE,
                            TABLE_COLUMNS.REGISTRATION_STATUS,
                            TABLE_COLUMNS.DEPLOY_STATUS,
                            TABLE_COLUMNS.PENDING_CHANGE,
                            TABLE_COLUMNS.ACTIONS
                        ],

                        selectAllEnabled: false
                    };

                    if (this.options.hiddenColumns) {
                        this.options.columns = _.filter(defaults.columns, function(column) {
                            return this.options.hiddenColumns.indexOf(column) === -1;
                        }.bind(this));
                    } else {
                        _.defaults(this.options, defaults);
                    }

                    this.deferreds = this.options.deferreds || {};

                    this.children.head = new TableHeadView({
                        model: this.collection.instances.fetchData,
                        columns: this.options.columns,
                        checkboxClassName: this.options.selectAllEnabled ? 'col-select-all': null
                    });

                    this.children.caption = new TableCaptionView({
                        model: {
                            state: this.collection.instances.fetchData
                        },
                        countLabel: _('Instances').t(),
                        collection: this.collection.instances,
                        noFilterButtons: true,
                        noFilter: true,
                        noDock: true
                    });

                    this.children.selectPageCount = new SyntheticSelectControlView({
                        menuWidth: "narrow",
                        className: "btn-group pull-left",
                        items: [
                            {value: '10', label: _('10 per page').t()},
                            {value: '25', label: _('25 per page').t()},
                            {value: '50', label: _('50 per page').t()},
                            {value: '100', label: _('100 per page').t()}
                        ],
                        model: this.collection.instances.fetchData,
                        modelAttribute: 'count',
                        toggleClassName: 'btn-pill'
                    });

                    this.children.rows = this.rowsFromCollection();


                    if (urlHelper.getUrlParam('deployStatus')) {
                        this.showDeployStatus(urlHelper.getUrlParam('deployStatus'));
                    }

                    // When the offset changes (user changes the page), unselect the selectall checkbox
                    this.listenTo(this.collection.instances.fetchData, 'change:offset', function() {
                        // clear the cache when pagination changes
                        this.collection.instances.resetEditList();
                        this.collection.instances.fetchData.set('selectAll', false);
                    });

                    this.listenTo(this.collection.instances, 'sync', function() {
                        this.renderRows();
                    });
                },

                events: {
                    'click .col-select-all': function(e) {
                        var value = this.collection.instances.fetchData.get('selectAll');
                        this.trigger('selectAllToggled', value);
                    },
                    'click .cell-actions a.edit-action': function(e) {
                        var instanceId = $(e.target).data().instance;
                        this.trigger('editClicked', instanceId);
                    },
                    'click .cell-actions a.remove-action': function(e) {
                        var instanceId = $(e.target).data().instance;
                        this.trigger('removeClicked', instanceId);
                    },
                    'click .cell-deploy-status a.show-deploy-status': function(e) {
                        var instanceId = $(e.target).data().instance;
                        this.showDeployStatus(instanceId);
                    },
                    'click .cell-checkbox a': function(e) {
                        // When a checkbox is clicked ,
                        // 1) update UI to show the right checkbox icon (checked vs unchecked)
                        //  2) Trigger a selection change event
                        var el = $(e.target).closest('a');
                        var instanceId = el.data().instance;
                        this._onCheckboxToggled(el, this.collection.instances.get(instanceId));
                        // Every time the selection changes below event is fired. This would be useful to perform any
                        // action when the row selection changes
                        this.trigger('selectionChanged');
                    }
                },

                _onCheckboxToggled: function(el, instance) {

                    // update the checkbox based on the state
                    var icon = el.find('i');
                    if (icon.css('display') === 'none') {
                        instance.setInstanceMarkedForUpdate(true);
                        icon.show();
                    } else {
                        instance.setInstanceMarkedForUpdate(false);
                        icon.hide();
                    }

                    // once the user manually checks or unchecks a row , the select all checkbox needs to be set
                    // to false as all the instances might not be selected
                    this.collection.instances.fetchData.set('selectAll', false);
                    //update the instances cache
                    this.collection.instances.updateEditList();
                },

                showDeployStatus: function(instanceId) {
                    var instance = this.collection.instances.get(instanceId),
                        deployStatusDialog;

                    urlHelper.replaceState({deployStatus: instanceId});

                    deployStatusDialog = new DeployStatusDialog({
                        model: instance,
                        mode: DEPLOY_STATUS_MODE,
                        collection: {
                            entities: instance.entry.content.bundlesCollection
                        },
                        redirectReturnToPage: urlHelper.pages.TOPOLOGY
                    });

                    $('body').append(deployStatusDialog.render().el);
                    deployStatusDialog.show();

                    this.listenTo(deployStatusDialog, 'hide', function() {
                        urlHelper.removeUrlParam('deployStatus');
                    });
                },

                render: function() {
                    if (!this.el.innerHTML) {
                        this.$el.append(this.compiledTemplate({
                            user: this.model.user,
                            helpLink: urlHelper.docUrl('learnmore.DMC_topology.missing_forwarders'),
                            strings: STRINGS
                        }));
                        this.children.selectPageCount.render().appendTo(this.$('.select-page-count-placeholder'));
                        this.children.caption.render().$el.appendTo(this.$('.table-control-container'));
                        this.children.head.render().$el.prependTo(this.$('.table-chrome'));
                    }
                    this._renderRows();

                    return this;
                },

                renderRows: function() {
                    _.each(_.values(this.children.rows), function(row) {
                        row.remove();
                    }, this);
                    this.children.rows = this.rowsFromCollection();
                    this._renderRows();
                },

                /**
                 *
                 * @param columns array of objects
                 *         [{
                 *          name: '<column_name>' as specified in the TABLE_COLUMNS list,
                 *          index: <index where the column needs to be inserted>
                 *         }]
                 */
                addColumns: function(columns) {

                    _.each(columns, function(column) {
                        if (TABLE_COLUMNS[column.name]) {
                            var columnObj = TABLE_COLUMNS[column.name];
                            if(_.indexOf(this.options.columns, columnObj) == -1) {
                                var index = _.indexOf(this.options.hiddenColumnsNames,column.name);

                                this.options.columns.splice(column.index, 0, columnObj);
                                this.children.head.render();
                                this.options.hiddenColumns.splice(index, 1);
                                this.options.hiddenColumnNames.splice(index, 1);
                            }
                        }
                    }, this);
                },

                /**
                 *
                 * @param columnNames: list of column names
                 */
                removeColumns: function(columnNames) {

                    _.each(columnNames, function(name) {

                        if (TABLE_COLUMNS[name]) {
                            var columnObj = TABLE_COLUMNS[name],
                                index = _.indexOf(this.options.columns, columnObj);

                            if (index > -1) {
                                this.options.columns.splice(index, 1);
                                this.children.head.render();
                                this.options.hiddenColumns.push(TABLE_COLUMNS[name]);
                                this.options.hiddenColumnNames.push(name);
                            }

                        }


                    }, this);
                },

                rowsFromCollection: function() {
                    return this.collection.instances.map(function(instance, i) {
                        return new TableRowView({
                            hiddenColumnNames: this.options.hiddenColumnNames,
                            model: {
                                classicurl: this.model.classicurl,
                                instance: instance
                            },
                            collection: {
                                instances: this.collection.instances,
                                pendingChanges: this.collection.pendingChanges,
                                tasks: this.collection.tasks
                            },
                            index: i
                        });
                    }, this);
                },

                _renderRows: function() {
                    if (this.children.rows.length === 0) {
                        this.$('.dmc-no-results').show();
                    } else {
                        this.$('.dmc-no-results').hide();

                        _.each(_.values(this.children.rows), function(row) {
                            row.render().$el.appendTo(this.$('.table-listing tbody'));
                        }, this);
                    }
                },

                template: Template
            }, {
                TABLE_COLUMNS: TABLE_COLUMNS
            }
        );
    }
);