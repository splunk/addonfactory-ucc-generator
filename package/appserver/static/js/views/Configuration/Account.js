import {configManager} from 'app/util/configManager';
import {generateCollection} from 'app/util/backbone';

define([
    'jquery',
    'underscore',
    'backbone',
    'app/util/Util',
    'models/Base',
    'views/shared/tablecaption/Master',
    'app/views/component/Table',
    'app/views/component/EntityDialog',
    'app/collections/ProxyBase.Collection',
    'app/templates/common/ButtonTemplate.html'
], function (
    $,
    _,
    Backbone,
    Util,
    BaseModel,
    CaptionView,
    Table,
    EntityDialog,
    ProxyBase,
    ButtonTemplate
) {
    return Backbone.View.extend({
        initialize: function (options) {
            this.accountConfig = _.find(configManager.unifiedConfig.pages.configuration.tabs, tab => {
                return tab.name === 'account';
            });
            const { containerId } = options;
            this.containerId = containerId;
            this.appData = configManager.getAppData();
            this.addonName = Util.getAddonName();
            //state model
            this.stateModel = new BaseModel();
            this.stateModel.set({
                sortKey: 'name',
                sortDirection: 'asc',
                count: 100,
                offset: 0,
                fetching: true
            });

            //accounts collection
            const accoutsCollection = generateCollection('account');
            this.accounts = new accoutsCollection([], {
                appData: this.appData.toJSON(),
                targetApp: this.addonName,
                targetOwner: "nobody"
            });

            //Change search
            this.listenTo(this.stateModel, 'change:search change:sortDirection change:sortKey', _.debounce(function () {
                this.fetchListCollection(this.accounts, this.stateModel);
            }.bind(this), 0));

            this.deferred = this.fetchAllCollection();
        },

        render: function () {
            var add_button_data = {
                    buttonId: "addAccountBtn",
                    buttonValue: "Add Account"
                },
                account_deferred = this.fetchListCollection(this.accounts, this.stateModel);
            account_deferred.done(function () {
                this.deferred.done(function () {
                    //Caption
                    this.caption = new CaptionView({
                        countLabel: _('Accounts').t(),
                        model: {
                            state: this.stateModel
                        },
                        collection: this.accounts,
                        noFilterButtons: true,
                        filterKey: ['name', 'endpoint', 'api_uuid']
                    });

                    //Create view
                    this.account_list = new Table({
                        stateModel: this.stateModel,
                        collection: this.accounts,
                        refCollection: this.combineCollection(),
                        showActions: true,
                        enableMoreInfo: this.accountConfig.table.moreInfo ? true : false,
                        component: this.accountConfig,
                    });

                    this.$el.append(this.caption.render().$el);
                    this.$el.append(this.account_list.render().$el);
                    $(`${this.containerId} .table-caption-inner`).prepend($(_.template(ButtonTemplate, add_button_data)));

                    $('#addAccountBtn').on('click', function () {
                        var dlg = new EntityDialog({
                            el: $(".dialog-placeholder"),
                            collection: this.accounts,
                            component: this.accountConfig,
                            isInput: false
                        }).render();
                        dlg.modal();
                    }.bind(this));
                }.bind(this));
            }.bind(this));
            return this;
        },

        fetchListCollection: function (collection, stateModel) {
            var search = '';
            if (stateModel.get('search')) {
                search = stateModel.get('search');
            }

            stateModel.set('fetching', true);
            return collection.fetch({
                data: {
                    sort_dir: stateModel.get('sortDirection'),
                    sort_key: stateModel.get('sortKey').split(','),
                    search: search,
                    count: stateModel.get('count'),
                    offset: stateModel.get('offset')
                },
                success: function (response, options) {
                    stateModel.set('fetching', false);
                }.bind(this)
            });
        },

        fetchAllCollection: function () {
            var singleStateModel = new BaseModel(),
                calls = [],
                service;
            singleStateModel.set({
                sortKey: 'name',
                sortDirection: 'asc',
                count: 100,
                offset: 0,
                fetching: true
            });

            for (service in this.services) {
                if (this.services.hasOwnProperty(service)) {
                    calls.push(this.fetchListCollection(this[service], singleStateModel));
                }
            }
            return $.when.apply(this, calls);
        },

        //Different from the function in manage_input
        combineCollection: function () {
            var temp_collection = new ProxyBase([], {
                    appData: this.appData.toJSON(),
                    targetApp: this.addonName,
                    targetOwner: "nobody"
                }),
                service;

            for (service in this.services) {
                if (this.services.hasOwnProperty(service)) {
                    temp_collection.add(this[service].models, {silent: true});
                }
            }

            return temp_collection;
        }
    });
});
