/**
 * Created by rtran on 4/20/16.
 */
define([
    'jquery',
    'underscore',
    'module',
    'backbone',
    'views/Base',
    'views/shared/TableHead',
    'views/shared/tablecaption/Master',
    'views/managementconsole/deploy/components/StatusDialogTableRow',
    'views/shared/controls/SyntheticSelectControl',
    'models/managementconsole/topology/Instance',
    'models/managementconsole/Bundle',
    'models/managementconsole/Configuration',
    'collections/managementconsole/topology/Instances',
    './StatusDialogTable.pcss'
], function(
    $,
    _,
    module,
    Backbone,
    BaseView,
    TableHeaderView,
    TableCaptionView,
    TableRowView,
    SyntheticSelectControlView,
    InstanceModel,
    BundleModel,
    ConfigurationModel,
    InstancesCollection,
    css) {

    var CONTROL_PROPERTIES = {
            deployStatus: {
                label: _('Deploy Status: ').t(),
                defaultValue: 'all',
                items: [
                    {value: 'all', label: _('All').t()},
                    {value: 'up', label: _('Up-to-date').t()},
                    {value: 'down', label: _('Out-of-date').t()}
                ],
                modelAttribute: 'upToDate'
            },
            contextType: {
                label: _('Context Type: ').t(),
                defaultValue: 'all',
                items: [
                    {value: 'all', label: _('All').t()},
                    {value: 'node', label: _('This instance only').t()},
                    {value: 'forwarders', label: _('All Forwarders').t()},
                    {value: 'app', label: _('App').t()},
                    {value: 'custom', label: _('Server Class').t()}
                ],
                modelAttribute: 'contextType'
            },
            context: {
                label: _('Context: ').t(),
                defaultValue: 'all',
                items: [
                    {value: 'all', label: _('All').t()}
                ],
                sectionLabels: {
                    forwarders: _('Forwarders').t(),
                    serverClasses: _('Server Classes').t(),
                    apps: _('Apps').t()
                },
                modelAttribute: 'context'
            }
        },
        SHARED_DEFAULT_STATES = {
            upToDate: CONTROL_PROPERTIES.deployStatus.defaultValue
        },
        MODE = {
            instance: {
                initialize: 'initializeInstanceMode',
                controls: ['contextType', 'deployStatus'],
                defaultStates: $.extend({}, SHARED_DEFAULT_STATES, {
                    contextType: CONTROL_PROPERTIES.contextType.defaultValue,
                    count: -1
                })
            },
            forwarders: {
                controls: ['context', 'deployStatus'],
                defaultStates: $.extend({}, SHARED_DEFAULT_STATES, {
                    context: CONTROL_PROPERTIES.context.defaultValue
                })
            },
            custom: {
                controls: ['context', 'deployStatus'],
                defaultStates: $.extend({}, SHARED_DEFAULT_STATES, {
                    context: CONTROL_PROPERTIES.context.defaultValue
                })
            },

            app: {
                initialize: 'initializeAppMode',
                controls: ['deployStatus'],
                defaultStates: SHARED_DEFAULT_STATES
            }
        },
        TYPE = {
            bundle: {
                captionLabel: _('Contexts').t(),
                tableColumns: [
                    {label: _('Name').t(), className: 'column-header-bundle-name'},
                    {label: _('Context Type').t(), className: 'column-header-context-type'},
                    {label: _('Deploy Status').t(), className: 'column-header-deploy-status'}
                ]
            },
            instance: {
                captionLabel: _('Instances').t(),
                tableColumns: [
                    {label: InstancesCollection.TABLE_COLUMN_LABELS.HOST_NAME.label, className: 'column-header-host-name'},
                    {label: InstancesCollection.TABLE_COLUMN_LABELS.DNS_NAME.label, className: 'column-header-dns-name'},
                    {label: InstancesCollection.TABLE_COLUMN_LABELS.CLIENT_NAME.label, className: 'column-header-client-name'},
                    {label: InstancesCollection.TABLE_COLUMN_LABELS.IP_ADDRESS.label, className: 'column-header-ip-address'},
                    {label: InstancesCollection.TABLE_COLUMN_LABELS.PHONE_HOME.label, className: 'column-header-last-phone-home'},
                    {label: InstancesCollection.TABLE_COLUMN_LABELS.DEPLOY_STATUS.label, className: 'column-header-deploy-status'}
                ]
            }
        };

    var NO_INSTANCES_MSG = _('This context contains no instances.').t();
    var NO_CONFIGURATIONS_FOUND_MSG = _('No configurations found based on selected filters.').t();
    var NO_RESULTS_TEMPLATE = '<div class="alert-info msg"><i class="icon-alert"></i><%- msg %></div>';

    return BaseView.extend({
        moduleId: module.id,
        className: 'deploy-status-dialog-table',

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.redirectReturnToPage = this.options.redirectReturnToPage;

            this.MODE_LITERALS = this.options.MODE_LITERALS;

            this.mode = this.options.mode;
            this.type = this.options.type;

            this.model = this.model || {};
            this.collection = this.collection || {};

            this.children.controls = [];
            this.children.rows = [];

            this.model.state = this.mode === this.MODE_LITERALS.instance ? new Backbone.Model() :  this.collection.entities.fetchData;
            this.model.state.set(MODE[this.mode].defaultStates);

            // if an initialize function is specified && property is a function -> call the initialize function
            if (!_.isUndefined(MODE[this.mode].initialize) && _.isFunction(this[MODE[this.mode].initialize])) {
                this[MODE[this.mode].initialize]();
            }

            // for each control defined for that mode -> initialize that control and save its reference
            _.each(MODE[this.mode].controls, function(control) {
                this.children.controls.push(this.initializeControl[control].call(this));
            }, this);

            this.children.headerView = new TableHeaderView({
                model: this.model.state,
                columns: TYPE[this.type].tableColumns
            });

            this.children.tableCaptionView = new TableCaptionView({
                countLabel: TYPE[this.type].captionLabel,
                model: {
                    state: this.model.state
                },
                collection: this.collection.entities,
                noFilterButtons: true,
                noFilter: true,
                showListModeButtons: false,
                noDock: true
            });

            this.updateRows();

            this.listenTo(this.model.state, 'change:'+CONTROL_PROPERTIES.deployStatus.modelAttribute, this.updateEntities);
            this.listenTo(this.model.state, 'change:'+CONTROL_PROPERTIES.contextType.modelAttribute, this.updateEntities);
            this.listenTo(this.model.state, 'change:'+CONTROL_PROPERTIES.context.modelAttribute, this.updateEntities);
            this.listenTo(this.collection.entities, 'sync reset', this.updateRows);
        },

        initializeInstanceMode: function() {
            // clone bundles collection for client side filtering
            this.collection.entities = this.model.entity.entry.content.bundlesCollection.clone();
        },

        initializeAppMode: function() {
            // in the app mode, the static context is the app
            var appId = this.model.entity.entry.get('name');
            this.model.state.set('context', appId);
        },

        // hash for view controls
        initializeControl: {
            deployStatus: function() {
                return new SyntheticSelectControlView({
                    label: CONTROL_PROPERTIES.deployStatus.label,
                    menuWidth: 'narrow',
                    className: 'pull-left btn-group',
                    items: CONTROL_PROPERTIES.deployStatus.items,
                    model: this.model.state,
                    modelAttribute: CONTROL_PROPERTIES.deployStatus.modelAttribute,
                    toggleClassName: 'btn-pill',
                    popdownOptions: {
                        detachDialog: true
                    }
                });
            },
            contextType: function() {
                return new SyntheticSelectControlView({
                    label: CONTROL_PROPERTIES.contextType.label,
                    menuWidth: 'narrow',
                    className: 'pull-left btn-group',
                    items: CONTROL_PROPERTIES.contextType.items,
                    model: this.model.state,
                    modelAttribute: CONTROL_PROPERTIES.contextType.modelAttribute,
                    toggleClassName: 'btn-pill',
                    popdownOptions: {
                        detachDialog: true
                    }
                });
            },
            context: function() {
                return new SyntheticSelectControlView({
                    label: CONTROL_PROPERTIES.context.label,
                    menuWidth: 'normal',
                    className: 'pull-left btn-group',
                    items: this.getContextItems(),
                    model: this.model.state,
                    modelAttribute: CONTROL_PROPERTIES.context.modelAttribute,
                    toggleClassName: 'btn-pill',
                    popdownOptions: {
                        detachDialog: true
                    }
                });
            }
        },

        addDefaultContextItems: function(contextItems) {
            if (this.mode === this.MODE_LITERALS.forwarders) {
                contextItems.push({
                    value: ConfigurationModel.BUILTIN_BUNDLE_NAMES.FORWARDERS,
                    label: CONTROL_PROPERTIES.context.sectionLabels.forwarders
                });
            } else if (this.mode === this.MODE_LITERALS.custom) {
                contextItems.push({
                    label: CONTROL_PROPERTIES.context.sectionLabels.serverClasses});
                contextItems.push({
                    value: this.model.entity.getBundleName(),
                    label: this.model.entity.getDisplayName()
                });
            }
            return contextItems;
        },

        // for each app -> add it as a context item
        addAppContextItems: function(contextItems, apps) {
            contextItems.push({
                label: CONTROL_PROPERTIES.context.sectionLabels.apps
            });

            _.each(apps, function(app) {
                contextItems.push({value: app, label: app});
            });

            return contextItems;
        },

        getContextItems: function() {
            var contextItems = CONTROL_PROPERTIES.context.items.slice(),
                apps = this.model.entity.getApps();

            contextItems = this.addDefaultContextItems(contextItems);

            if (apps.length > 0) {
                contextItems = this.addAppContextItems(contextItems, apps);
            }

            return contextItems;
        },

        performClientSideFilter: function() {
            var upToDate = this.model.state.get('upToDate') === 'all' ? null : (this.model.state.get('upToDate') === 'up'),
                contextType = this.model.state.get('contextType');

            this.collection.entities.reset(this.model.entity.entry.content.bundlesCollection.filter(function(entity) {
                var contextTypePredicate;
                if (contextType === 'all') {
                    contextTypePredicate = true;
                } else if (contextType === 'forwarders') {
                    contextTypePredicate = entity.isAllForwarders();
                } else {
                    contextTypePredicate = entity.getBundleType() === contextType;
                }

                return contextTypePredicate && (upToDate === null || entity.getUpToDateStatus() === upToDate);
            }));

            // need to set this for client side count update
            this.collection.entities.paging.set('total', this.collection.entities.length);
        },

        updateDeployStatusQuery: function() {
            var upToDate = this.model.state.get('upToDate') === 'all' ? null : (this.model.state.get('upToDate') === 'up'),
                context = this.mode === this.MODE_LITERALS.app ? this.model.entity.getId() : this.model.state.get('context'),
                deployStatusObj = {
                    bundle: context,
                    upToDate: upToDate
                };

            if (context === 'all') {
                delete deployStatusObj.bundle;
            }

            if (upToDate === null) {
                delete deployStatusObj.upToDate;
            }

            this.collection.entities.fetchData.set({
                deployStatusQuery: JSON.stringify(deployStatusObj)
            });
        },

        updateEntities: function() {
            if (this.mode === this.MODE_LITERALS.instance) {
                this.performClientSideFilter();
            } else {
                this.updateDeployStatusQuery();
            }
        },

        updateRows: function() {
            _.each(this.children.rows, function(row) {
                row.remove();
            });

            this.children.rows = [];
            this.collection.entities.each(function(entity) {
                this.children.rows.push(new TableRowView({
                    type: this.type,
                    model: {
                        entity: entity,
                        state: this.model.state
                    },
                    redirectReturnToPage: this.redirectReturnToPage
                }));
            }, this);

            this.renderRows();
        },

        renderRows: function() {
            var $msgElem = this.$('.alert-info.msg');
            // if no results msg already exists -> remove it so duplicate messages aren't added
            // (need to re-add in case the new message is different from the previous)
            if ($msgElem.length > 0) {
                $msgElem.remove();
            }
            if (this.children.rows.length === 0) {
                // need to make sure function exists because method could be called on App model
                var memberCount;
                if (this.mode === this.MODE_LITERALS.custom || this.mode === this.MODE_LITERALS.forwarders) {
                    memberCount = this.model.entity.getMemberCount();
                } else if (this.mode === this.MODE_LITERALS.app) {
                    memberCount = this.model.entity.getTargetedClientCount();
                }

                var compiledNoResultsMsgTemplate = _.template(NO_RESULTS_TEMPLATE);
                var errMsg;

                // if @memberCount == 0 (no instances are assigned to that context (either selected or an app) ->
                // display "no instances" message
                if (memberCount === 0) {
                    errMsg = NO_INSTANCES_MSG;

                // else @memberCount is either greater than 0 or undefined -> no configuration package was found
                // based on search filters
                } else {
                    errMsg = NO_CONFIGURATIONS_FOUND_MSG;
                }

                $msgElem = $(compiledNoResultsMsgTemplate({
                    msg: errMsg
                }));
                this.$el.append($msgElem);
            } else {
                _.each(this.children.rows, function(row) {
                    this.$('.table tbody').append(row.render().el);
                }.bind(this));
            }
        },

        render: function() {
            this.$el.html(this.compiledTemplate());

            this.$('.table-control-container').append(this.children.tableCaptionView.render().el);

            _.each(this.children.controls, function(control) {
                this.$('.table-caption-inner').append(control.render().el);
            }, this);

            this.$('.table').append(this.children.headerView.render().el);

            this.renderRows();

            return this;
        },

        template: '<div class="deploy-status-table-control table-control-container"></div> \
        <table class="table table-chrome table-striped deploy-status-table "> \
            <tbody></tbody> \
        </table> \
        '
    });
});