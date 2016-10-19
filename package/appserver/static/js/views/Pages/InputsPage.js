import {configManager} from 'app/util/configManager';

define([
    'jquery',
    'underscore',
    'backbone',
    'app/util/Util',
    'app/models/Base.Model',
    'app/collections/ProxyBase.Collection',
    'app/collections/Accounts',
    'app/models/appData',
    'app/views/pages/InputsPage.html',
    'models/Base',
    'views/shared/tablecaption/Master',
    'app/views/component/InputFilterMenu',
    'app/views/component/AddInputMenu',
    'app/views/component/EntityDialog',
    'app/config/ComponentMap',
    'app/views/component/Table'
], function (
    $,
    _,
    Backbone,
    Util,
    BaseModel,
    BaseCollection,
    Accounts,
    appData,
    InputsPageTemplate,
    SplunkBaseModel,
    CaptionView,
    InputFilter,
    AddInputMenu,
    EntityDialog,
    ComponentMap,
    Table
) {
    return Backbone.View.extend({
        className: 'inputsContainer',
        initialize: function (options) {
            this.unifiedConfig = configManager.unifiedConfig;
            this.inputsPageTemplateData = {};
            this.inputsPageTemplateData.title = this.unifiedConfig.pages.inputs.title;
            this.inputsPageTemplateData.description = this.unifiedConfig.pages.inputs.description;
            this.inputsPageTemplateData.singleInput = this.unifiedConfig.pages.inputs.services.length === 1;
            this.addonName = this.unifiedConfig.meta.name;
            //state model
            this.stateModel = new SplunkBaseModel();
            this.stateModel.set({
                sortKey: 'name',
                sortDirection: 'asc',
                count: 10,
                offset: 0,
                fetching: true
            });
            this.services = this.unifiedConfig.pages.inputs.services;
            _.each(this.services, service => {
                let model = BaseModel.extend({
                    url: this.unifiedConfig.meta.restRoot + '/' + service.name,
                    initialize: function (attributes, options) {
                        this.collection = options.collection;
                        BaseModel.prototype.initialize.call(this, attributes, options);
                    }
                });
                let collection = BaseCollection.extend({
                    url: this.unifiedConfig.meta.restRoot + '/' + service.name,
                    model: model,
                    initialize: function (attributes, options) {
                        BaseCollection.prototype.initialize.call(this, attributes, options);
                    }
                });
                this[service.name] = new collection([], {
                    appData: {app: appData.get("app"), owner: appData.get("owner")},
                    targetApp: this.addonName,
                    targetOwner: "nobody"
                });
            });
            this.dispatcher = _.extend({}, Backbone.Events);

            //Change filter
            this.listenTo(this.dispatcher, 'filter-change', function (type) {
                this.filterChange(type, this.stateModel);
            }.bind(this));

            //Delete input
            this.listenTo(this.dispatcher, 'delete-input', function () {
                var all_deferred = this.fetchAllCollection();
                all_deferred.done(function () {
                    var tempCollection= this.combineCollection(),
                        offset = this.stateModel.get('offset'),
                        count = this.stateModel.get('count'),
                        models;
                    this.cachedInputs = tempCollection[0];
                    this.cachedSearchInputs = tempCollection[1];

                    this.inputs.paging.set('offset', offset);
                    this.inputs.paging.set('perPage', count);
                    this.inputs.paging.set('total', this.cachedSearchInputs.length);
                    models = this.cachedSearchInputs.models.slice(offset, offset + count);
                    _.each(models, function (model) {
                        model.paging.set('offset', offset);
                        model.paging.set('perPage', count);
                        model.paging.set('total', this.cachedSearchInputs.length);
                    }.bind(this));
                    this.inputs.reset(models);
                    this.inputs._url = undefined;
                }.bind(this));
            }.bind(this));

            //Add input with offset change
            this.listenTo(this.dispatcher, 'add-input', function () {
                var all_deferred = this.fetchAllCollection();
                all_deferred.done(function () {
                    var tempCollection= this.combineCollection(),
                        offset = this.stateModel.get('offset'),
                        count = this.stateModel.get('count'),
                        models;
                    this.cachedInputs = tempCollection[0];
                    this.cachedSearchInputs = tempCollection[1];

                    this.inputs.paging.set('offset', offset);
                    this.inputs.paging.set('perPage', count);
                    this.inputs.paging.set('total', this.cachedSearchInputs.length);
                    models = this.cachedSearchInputs.models.slice(offset, offset + count);
                    _.each(models, function (model) {
                        model.paging.set('offset', offset);
                        model.paging.set('perPage', count);
                        model.paging.set('total', this.cachedSearchInputs.length);
                    }.bind(this));
                    this.inputs.reset(models);
                    this.inputs._url = undefined;
                }.bind(this));
            }.bind(this));

            //Change sort
            this.listenTo(this.stateModel, 'change:sortDirection change:sortKey', _.debounce(function () {
                if (this.inputs._url === undefined) {
                    this.sortCollection(this.stateModel);
                } else {
                    this.fetchListCollection(this.inputs, this.stateModel);
                }
            }.bind(this), 0));

            //Change search
            this.listenTo(this.stateModel, 'change:search', _.debounce(function () {
                if (this.inputs._url === undefined) {
                    this.searchCollection(this.stateModel);
                } else {
                    this.fetchListCollection(this.inputs, this.stateModel);
                }
            }.bind(this), 0));

            //Change offset
            this.listenTo(this.stateModel, 'change:offset', _.debounce(function () {
                if (this.inputs._url === undefined) {
                    this.pageCollection(this.stateModel);
                } else {
                    this.fetchListCollection(this.inputs, this.stateModel);
                }
            }.bind(this), 0));

            this.deferred = this.fetchAllCollection();

            this.filter = new InputFilter({
                dispatcher: this.dispatcher,
                services: ComponentMap.input.services
            });

            this.emptySearchString =
                ComponentMap.input.filters.map(d => d.key + '=*')
                .join(' OR ');
        },

        filterChange: function (type, stateModel) {
            // Do not triger the change event
            stateModel.set('offset', 0, {silent: true});
            var search = this.stateModel.get('search'),
                all_deferred,
                models,
                deferred;

            if (type === 'all') {
                if (search !== undefined && search !== this.emptySearchString) {
                    this.searchCollection(this.stateModel);
                    this.inputs._url = undefined;
                } else {
                    all_deferred = this.fetchAllCollection();
                    all_deferred.done(function () {
                        var tempCollection= this.combineCollection(),
                            offset = this.stateModel.get('offset'),
                            count = this.stateModel.get('count');
                        this.cachedInputs = tempCollection[0];
                        this.cachedSearchInputs = tempCollection[1];
                        this.inputs.paging.set('offset', offset);
                        this.inputs.paging.set('perPage', count);
                        this.inputs.paging.set('total', this.cachedSearchInputs.length);
                        models = this.cachedSearchInputs.models.slice(offset, offset + count);
                        _.each(models, function (model) {
                            model.paging.set('offset', offset);
                            model.paging.set('perPage', count);
                            model.paging.set('total', this.cachedSearchInputs.length);
                        }.bind(this));
                        this.inputs.reset(models);
                        this.inputs._url = undefined;
                    }.bind(this));
                }
            } else {
                deferred = this.fetchListCollection(this[type], this.stateModel);
                deferred.done(function () {
                    this.inputs.model = this.services[type].model;
                    this.inputs._url = this[type]._url;
                    this.inputs.reset(this[type].models);

                    var offset = this.stateModel.get('offset'),
                        count = this.stateModel.get('count');
                    this.inputs.paging.set('offset', offset);
                    this.inputs.paging.set('perPage', count);
                    this.inputs.paging.set('total', this[type].paging.get('total'));
                }.bind(this));
            }
        },

        render: function () {
            let tempCollection;
            this.deferred.done(() => {
                this.stateModel.set('fetching', false);
                tempCollection = this.combineCollection();
                this.cachedInputs = tempCollection[0];
                this.cachedSearchInputs = tempCollection[1];

                //Display the first page
                this.inputs = this.combineCollection()[0];
                this.inputs.models = this.cachedInputs.models.slice(0, this.stateModel.get('count'));

                if (this.inputs.length !== 0) {
                    _.each(this.inputs.models, model =>
                        model.paging.set('total', this.inputs.length)
                    );
                }
                this.inputs.paging.set('total', this.inputs.length);
                let filterKey = [];
                _.each(this.unifiedConfig.pages.inputs.services, service =>
                    _.each(service.entity, e => {
                        if (filterKey.indexOf(e.field) < 0) {
                            filterKey.push(e.field);
                        }
                    })
                );
                this.caption = new CaptionView({
                    countLabel: _(this.unifiedConfig.pages.inputs.title).t(),
                    model: {
                        state: this.stateModel
                    },
                    collection: this.inputs,
                    noFilterButtons: true,
                    // default filter keys: all inputs entity group
                    filterKey: filterKey
                });

                this.inputTable = new Table({
                    stateModel: this.stateModel,
                    collection: this.inputs,
                    dispatcher: this.dispatcher,
                    enableBulkActions: false,
                    showActions: true,
                    enableMoreInfo: true,
                    // component: ComponentMap.input,
                    component: this.unifiedConfig.pages.inputs
                });

                this.$el.append(_.template(InputsPageTemplate, this.inputsPageTemplateData));
                this.$el.append(this.caption.render().$el);
                // render input filter for multiple inputs
                if (!this.inputsPageTemplateData.singleInput) {
                    $('.table-caption-inner').append(this.filter.render().$el);
                }
                // render inputs table
                this.$el.append(this.inputTable.render().$el);

                if (this.inputsPageTemplateData.singleInput) {
                    this.$('#addInputBtn').on('click', () => {
                        var dlg = new EntityDialog({
                            el: $(".dialog-placeholder"),
                            collection: this.inputs,
                            component: this.unifiedConfig.pages.inputs.services[0],
                            isInput: true
                        }).render();
                        dlg.modal();
                    });
                } else {
                    this.$('#addInputBtn').on("click", e => {
                        var $target = $(e.currentTarget);
                        if (this.editmenu && this.editmenu.shown) {
                            this.editmenu.hide();
                            e.preventDefault();
                            return;
                        }
                        this.editmenu = new AddInputMenu({
                            collection: this.inputs,
                            dispatcher: this.dispatcher,
                            services: this.unifiedConfig.pages.inputs.services
                        });

                        $('body').append(this.editmenu.render().el);
                        this.editmenu.show($target);
                    });
                }
            });
        },

        fetchAllCollection: function () {
            var singleStateModel = new SplunkBaseModel();
            singleStateModel.set({
                sortKey: 'name',
                sortDirection: 'asc',
                count: 100,
                offset: 0,
                fetching: true
            });
            var calls = _.map(this.services, service => {
                return this.fetchListCollection(this[service.name], singleStateModel);
            });
            return $.when.apply(this, calls);
        },

        combineCollection: function () {
            let tempCollection1 = new BaseCollection([], {
                    appData: {app: appData.get("app"), owner: appData.get("owner")},
                    targetApp: this.addonName,
                    targetOwner: "nobody"
                }),
                tempCollection2 = new BaseCollection([], {
                    appData: {app: appData.get("app"), owner: appData.get("owner")},
                    targetApp: this.addonName,
                    targetOwner: "nobody"
                });
            _.each(this.services, service => {
                tempCollection1.add(this[service.name].models, {silent: true});
                tempCollection2.add(this[service.name].models, {silent: true});
            })
            return [tempCollection1, tempCollection2];
        },

        fetchListCollection: function (collection, stateModel) {
            var rawSearch = '', searchString = '';
            if (stateModel.get('search')) {
                searchString = stateModel.get('search');
                //make the filter work for field 'service' and 'status'
                rawSearch = searchString.substring(searchString.indexOf('*') + 1, searchString.indexOf('*', searchString.indexOf('*') + 1)).toLowerCase();
                if (collection._url.indexOf("ta_crowdstrike_falcon_host_inputs") > -1 && "falcon host".indexOf(rawSearch) > -1 ) {
                    searchString = this.emptySearchString;
                }

                if ("disabled".indexOf(rawSearch) > -1) {
                    searchString += ' OR (disabled="*1*")';
                }else if ("enabled".indexOf(rawSearch) > -1) {
                    searchString += ' OR (disabled="*0*")';
                }
            }

            stateModel.set('fetching', true);
            return collection.fetch({
                data: {
                    sort_dir: stateModel.get('sortDirection'),
                    sort_key: stateModel.get('sortKey'),
                    search: searchString,
                    count: stateModel.get('count'),
                    offset: stateModel.get('offset')
                },
                success: function () {
                    stateModel.set('fetching', false);
                }.bind(this)
            });
        },

        searchCollection: function (stateModel) {
            var search = stateModel.get('search'),
                result = [],
                a = stateModel.get('search'),
                offset = this.stateModel.get('offset'),
                count = this.stateModel.get('count'),
                newPageStateModel = new SplunkBaseModel(),
                all_deferred,
                models;

            if (search !== this.emptySearchString) {
                search = a.substring(a.indexOf('*') + 1, a.indexOf('*', a.indexOf('*') + 1)).toLowerCase();
                result = this.cachedInputs.models.filter(d =>
                    ComponentMap.input.filters.some(filter => {
                            const {key, mapping} = filter;
                            const entryValue = (d.entry.get(key) && d.entry.get(key).toLowerCase()) || undefined;
                            const contentValue = (d.entry.content.get(key) && d.entry.content.get(key).toLowerCase()) || undefined;

                            return (entryValue && entryValue.indexOf(search) > -1) ||
                                (contentValue && contentValue.indexOf(search) > -1) ||
                                (mapping && mapping(d).toLowerCase().indexOf(search) > -1);
                        }
                    )
                );

                this.inputs.paging.set('offset', offset);
                this.inputs.paging.set('perPage', count);
                this.inputs.paging.set('total', result.length);
                _.each(result, function (model) {
                    model.paging.set('offset', offset);
                    model.paging.set('perPage', count);
                    model.paging.set('total', result.length);
                }.bind(this));
                this.cachedSearchInputs.reset(result);

                newPageStateModel.set({
                    sortKey: 'name',
                    sortDirection: 'asc',
                    count: 10,
                    offset: 0,
                    fetching: true
                });

                this.pageCollection(newPageStateModel);

            } else {
                all_deferred = this.fetchAllCollection();
                all_deferred.done(function () {
                    var tempCollection= this.combineCollection();
                    this.cachedInputs = tempCollection[0];
                    this.cachedSearchInputs = tempCollection[1];
                    this.inputs.paging.set('offset', offset);
                    this.inputs.paging.set('perPage', count);
                    this.inputs.paging.set('total', this.cachedSearchInputs.length);
                    models = this.cachedSearchInputs.models.slice(offset, offset + count);
                    _.each(models, function (model) {
                        model.paging.set('offset', offset);
                        model.paging.set('perPage', count);
                        model.paging.set('total', this.cachedSearchInputs.length);
                    }.bind(this));
                    this.inputs.reset(models);
                    this.inputs._url = undefined;

                    if (this.stateModel.get('search') !== this.emptySearchString) {
                        this.searchCollection(this.stateModel);
                    }
                }.bind(this));
            }
        },

        pageCollection: function (stateModel) {
            var offset = stateModel.get('offset'),
                count = stateModel.get('count'),
                models;
            this.inputs.paging.set('offset', offset);
            this.inputs.paging.set('perPage', count);

            this.inputs.paging.set('total', this.cachedSearchInputs.length);
            models = this.cachedSearchInputs.models.slice(offset, offset + count);

            _.each(models, function (model) {
                model.paging.set('offset', offset);
                model.paging.set('perPage', count);
                model.paging.set('total', this.cachedSearchInputs.length);
            }.bind(this));
            this.inputs.reset(models);
        },

        sortCollection: function (stateModel) {
            var handler = ComponentMap.input.generateSortHandler(stateModel),
            sort_key = stateModel.get('sortKey');

            var all_deferred = this.fetchAllCollection(),
                offset = stateModel.get('offset'),
                count = stateModel.get('count');
            all_deferred.done(function () {
                var tempCollection= this.combineCollection();
                this.cachedInputs = tempCollection[0];
                this.cachedSearchInputs = tempCollection[1];
                this.inputs.paging.set('offset', offset);
                this.inputs.paging.set('perPage', count);
                this.inputs.paging.set('total', this.cachedSearchInputs.length);

                this.cachedSearchInputs.models.sort(handler[sort_key]);
                var models = this.cachedSearchInputs.models.slice(offset, offset + count);
                _.each(models, function (model) {
                    model.paging.set('offset', offset);
                    model.paging.set('perPage', count);
                    model.paging.set('total', this.cachedSearchInputs.length);
                }.bind(this));
                this.inputs.reset(models);
                this.inputs._url = undefined;
            }.bind(this));
        }
    });
});
