import {configManager} from 'app/util/configManager';
import {generateModel, generateCollection} from 'app/util/backboneHelpers';
import {getFormattedMessage} from 'app/util/messageUtil';
import {sortAlphabetical} from 'app/util/sort';
import restEndpointMap from 'app/constants/restEndpointMap';
import 'appCssDir/common.css';
import 'appCssDir/inputs.css';

define([
    'jquery',
    'lodash',
    'backbone',
    'app/util/Util',
    'app/views/pages/InputsPage.html',
    'views/shared/tablecaption/Master',
    'app/views/component/InputFilterMenu',
    'app/views/component/AddInputMenu',
    'app/views/component/EntityDialog',
    'app/views/component/Table',
    'expose-loader?Lodash!lodash'
], function (
    $,
    _,
    Backbone,
    Util,
    InputsPageTemplate,
    CaptionView,
    InputFilter,
    AddInputMenu,
    EntityDialog,
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
            this.inputsPageTemplateData.buttonText = getFormattedMessage(100);
            this.addonName = this.unifiedConfig.meta.name;

            this.navModel = options.navModel;
            //state model
            this.stateModel = new Backbone.Model();
            this.stateModel.set({
                sortKey: 'name',
                sortDirection: 'asc',
                count: 10,
                offset: 0,
                fetching: true
            });
            this.services = this.unifiedConfig.pages.inputs.services;
            // filter keys for search
            this.filterKey = [];
            _.each(this.services, service =>
                _.each(service.entity, e => {
                    if (this.filterKey.indexOf(e.field) < 0) {
                        this.filterKey.push(e.field);
                    }
                })
            );
            // create collection for each service
            _.each(this.services, service => {
                if (!restEndpointMap[service.name]) {
                    this[service.name] = generateCollection(service.name);
                } else {
                    this[service.name] = generateCollection(
                        '',
                        {'endpointUrl': restEndpointMap[service.name]}
                    );
                }
            });
            this.dispatcher = _.extend({}, Backbone.Events);

            //Change filter
            this.listenTo(this.dispatcher, 'filter-change', (type) => {
                this.filterChange(type, this.stateModel);
            });

            //Delete input
            this.listenTo(this.dispatcher, 'delete-input', () => {
                var all_deferred = this.fetchAllCollection();
                all_deferred.done(() => {
                    var offset = this.stateModel.get('offset'),
                        count = this.stateModel.get('count'),
                        models;
                    this.cachedInputs = this.combineCollection();
                    this.cachedSearchInputs = this.combineCollection();

                    this.inputs.paging.set('offset', offset);
                    this.inputs.paging.set('perPage', count);
                    this.inputs.paging.set('total', this.cachedSearchInputs.length);
                    models = this.cachedSearchInputs.models.slice(offset, offset + count);
                    _.each(models, (model) => {
                        model.paging.set('offset', offset);
                        model.paging.set('perPage', count);
                        model.paging.set('total', this.cachedSearchInputs.length);
                    });
                    this.inputs.reset(models);
                    this.inputs._url = undefined;
                });
            });

            //Add input with offset change
            this.listenTo(this.dispatcher, 'add-input', () => {
                var all_deferred = this.fetchAllCollection();
                all_deferred.done(() => {
                    var offset = this.stateModel.get('offset'),
                        count = this.stateModel.get('count'),
                        models;
                    this.cachedInputs = this.combineCollection();
                    this.cachedSearchInputs = this.combineCollection();

                    this.inputs.paging.set('offset', offset);
                    this.inputs.paging.set('perPage', count);
                    this.inputs.paging.set('total', this.cachedSearchInputs.length);
                    models = this.cachedSearchInputs.models.slice(offset, offset + count);
                    _.each(models, (model) => {
                        model.paging.set('offset', offset);
                        model.paging.set('perPage', count);
                        model.paging.set('total', this.cachedSearchInputs.length);
                    });
                    this.inputs.reset(models);
                    this.inputs._url = undefined;
                });
            });

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
                services: this.services
            });

            this.emptySearchString =
                this.filterKey.map(d => d + '=*')
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
                    all_deferred.done(() => {
                        var offset = this.stateModel.get('offset'),
                            count = this.stateModel.get('count');
                        this.cachedInputs = this.combineCollection();
                        this.cachedSearchInputs = this.combineCollection();
                        this.inputs.paging.set('offset', offset);
                        this.inputs.paging.set('perPage', count);
                        this.inputs.paging.set('total', this.cachedSearchInputs.length);
                        models = this.cachedSearchInputs.models.slice(offset, offset + count);
                        _.each(models, (model) => {
                            model.paging.set('offset', offset);
                            model.paging.set('perPage', count);
                            model.paging.set('total', this.cachedSearchInputs.length);
                        });
                        this.inputs.reset(models);
                        this.inputs._url = undefined;
                    });
                }
            } else {
                deferred = this.fetchListCollection(this[type], this.stateModel);
                deferred.done(() => {
                    const service = _.find(this.services, d => d.name === type);
                    if (!restEndpointMap[service.name]) {
                        this.inputs.model = generateModel(service.name);
                    } else {
                        this.inputs.model = generateModel(
                            '',
                            {'endpointUrl': restEndpointMap[service.name]}
                        );
                    }
                    this.inputs._url = this[type]._url;
                    this.inputs.reset(this[type].models);

                    var offset = this.stateModel.get('offset'),
                        count = this.stateModel.get('count');
                    this.inputs.paging.set('offset', offset);
                    this.inputs.paging.set('perPage', count);
                    this.inputs.paging.set('total', this[type].paging.get('total'));
                });
            }
        },

        render: function () {
            this.$el.html(`<div class="loading-msg-icon">${getFormattedMessage(115)}</div>`);
            this.deferred.done(() => {
                this.$el.html('');
                this.stateModel.set('fetching', false);
                this.cachedInputs = this.combineCollection();
                this.cachedSearchInputs = this.combineCollection();

                //Display the first page
                this.inputs = this.combineCollection();
                this.inputs.models = this.cachedInputs.models.slice(0, this.stateModel.get('count'));

                if (this.inputs.length !== 0) {
                    _.each(this.inputs.models, model =>
                        model.paging.set('total', this.inputs.length)
                    );
                }
                this.inputs.paging.set('total', this.inputs.length);

                this.caption = new CaptionView({
                    countLabel: _(this.unifiedConfig.pages.inputs.title).t(),
                    model: {
                        state: this.stateModel
                    },
                    collection: this.inputs,
                    noFilterButtons: true,
                    filterKey: this.filterKey
                });

                this.inputTable = new Table({
                    stateModel: this.stateModel,
                    collection: this.inputs,
                    dispatcher: this.dispatcher,
                    enableBulkActions: false,
                    showActions: true,
                    enableMoreInfo: true,
                    customRow: this.unifiedConfig.pages.inputs.table.customRow,
                    component: this.unifiedConfig.pages.inputs,
                    restRoot: this.unifiedConfig.meta.restRoot,
                    navModel: this.navModel
                });
                this.$el.append(_.template(InputsPageTemplate)(this.inputsPageTemplateData));
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
                            component: this.unifiedConfig.pages.inputs.services[0]
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
                            services: this.unifiedConfig.pages.inputs.services,
                            navModel: this.navModel
                        });

                        $('body').append(this.editmenu.render().el);
                        this.editmenu.show($target);
                    });
                }
            });
            return this;
        },

        fetchAllCollection: function () {
            var singleStateModel = new Backbone.Model({
                sortKey: 'name',
                sortDirection: 'asc',
                count: 0, // fetch all stanzas
                offset: 0,
                fetching: true
            });
            var calls = _.map(this.services, service => {
                return this.fetchListCollection(this[service.name], singleStateModel);
            });
            return $.when.apply(this, calls);
        },

        combineCollection: function () {
            const tempCollection = generateCollection();
            _.each(this.services, service => {
                tempCollection.add(this[service.name].models, {silent: true});
            });
            return tempCollection;
        },

        fetchListCollection: function (collection, stateModel) {
            var rawSearch = '', searchString = '';
            if (stateModel.get('search')) {
                searchString = stateModel.get('search');
                //make the filter work for field 'status'
                rawSearch = this.getRawSearch(searchString);
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
                success: () => {
                    stateModel.set('fetching', false);
                }
            });
        },

        searchCollection: function (stateModel) {
            var search = stateModel.get('search'),
                result = [],
                a = stateModel.get('search'),
                offset = this.stateModel.get('offset'),
                count = this.stateModel.get('count'),
                all_deferred,
                models;

            if (search !== this.emptySearchString) {
                search = this.getRawSearch(search);
                result = this.cachedInputs.models.filter(d =>
                    this.filterKey.some(field => {
                            const entryValue = (d.entry.get(field) &&
                                d.entry.get(field).toLowerCase()) || undefined;
                            const contentValue = (d.entry.content.get(field) &&
                                d.entry.content.get(field).toLowerCase()) || undefined;

                            return (entryValue && entryValue.indexOf(search) > -1) ||
                                (contentValue && contentValue.indexOf(search) > -1);
                        }
                    )
                );
                //make the filter work for field 'status'
                if ("disabled".indexOf(search) > -1) {
                    result = result.concat(this.cachedInputs.models.filter(model => {
                        return model.entry.content.get('disabled') === true;
                    }));
                } else if ("enabled".indexOf(search) > -1) {
                    result = result.concat(this.cachedInputs.models.filter(model => {
                        return model.entry.content.get('disabled') === false;
                    }));
                }

                this.inputs.paging.set('offset', offset);
                this.inputs.paging.set('perPage', count);
                this.inputs.paging.set('total', result.length);
                _.each(result, (model) => {
                    model.paging.set('offset', offset);
                    model.paging.set('perPage', count);
                    model.paging.set('total', result.length);
                });
                this.cachedSearchInputs.reset(result);

                const newPageStateModel = new Backbone.Model({
                    sortKey: 'name',
                    sortDirection: 'asc',
                    count: 10,
                    offset: 0,
                    fetching: true
                });

                this.pageCollection(newPageStateModel);
            } else {
                all_deferred = this.fetchAllCollection();
                all_deferred.done(() => {
                    this.cachedInputs = this.combineCollection();
                    this.cachedSearchInputs = this.combineCollection();
                    this.inputs.paging.set('offset', offset);
                    this.inputs.paging.set('perPage', count);
                    this.inputs.paging.set('total', this.cachedSearchInputs.length);
                    models = this.cachedSearchInputs.models.slice(offset, offset + count);
                    _.each(models, (model) => {
                        model.paging.set('offset', offset);
                        model.paging.set('perPage', count);
                        model.paging.set('total', this.cachedSearchInputs.length);
                    });
                    this.inputs.reset(models);
                    this.inputs._url = undefined;

                    if (this.stateModel.get('search') !== this.emptySearchString) {
                        this.searchCollection(this.stateModel);
                    }
                });
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

            _.each(models, (model) => {
                model.paging.set('offset', offset);
                model.paging.set('perPage', count);
                model.paging.set('total', this.cachedSearchInputs.length);
            });
            this.inputs.reset(models);
        },

        sortCollection: function (stateModel) {
            //TODO: changeme
            var sortDir = stateModel.get('sortDirection'),
                sortKey = stateModel.get('sortKey'),
                allDeferred = this.fetchAllCollection(),
                offset = stateModel.get('offset'),
                count = stateModel.get('count'),
                // TODO: support numerical sorting
                handler = (a, b) => sortAlphabetical(
                    a.entry.get(sortKey) || a.entry.content.get(sortKey),
                    b.entry.get(sortKey) || b.entry.content.get(sortKey),
                sortDir);

            allDeferred.done(() => {
                this.cachedInputs = this.combineCollection();
                this.cachedSearchInputs = this.combineCollection();
                this.inputs.paging.set('offset', offset);
                this.inputs.paging.set('perPage', count);
                this.inputs.paging.set('total', this.cachedSearchInputs.length);

                this.cachedSearchInputs.models.sort(handler);
                var models = this.cachedSearchInputs.models.slice(offset, offset + count);
                _.each(models, (model) => {
                    model.paging.set('offset', offset);
                    model.paging.set('perPage', count);
                    model.paging.set('total', this.cachedSearchInputs.length);
                });
                this.inputs.reset(models);
                this.inputs._url = undefined;
            });
        },

        getRawSearch: function(searchString) {
            if (searchString) {
                return searchString.substring(
                    searchString.indexOf('*') + 1,
                    searchString.indexOf('*', searchString.indexOf('*') + 1)
                ).toLowerCase();
            } else {
                return '';
            }
        }
    });
});
