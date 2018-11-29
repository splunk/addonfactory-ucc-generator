import {generateCollection} from 'app/util/backboneHelpers';
import {getFormattedMessage} from 'app/util/messageUtil';
import {MODE_CREATE} from 'app/constants/modes';
import {PAGE_STYLE} from 'app/constants/pageStyle';
import restEndpointMap from 'app/constants/restEndpointMap';
import BaseTableView from 'app/views/BaseTableView';
import {sortAlphabetical} from 'app/util/sort';
import 'appCssDir/common.css';
import 'appCssDir/inputs.css';
import { MODE_EDIT } from 'app/constants/modes'

const ALL_SERVICE = 'all';

define([
    'jquery',
    'lodash',
    'backbone',
    'app/util/Util',
    'app/views/pages/InputsPage.html',
    'views/shared/tablecaption/Master',
    'views/shared/controls/SyntheticSelectControl',
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
    SyntheticSelectControl,
    InputFilter,
    AddInputMenu,
    EntityDialog,
    Table
) {
    return BaseTableView.extend({
        className: 'inputsContainer',

        initialize: function (options) {
            BaseTableView.prototype.initialize.apply(this, arguments);

            this.inputsConfig = this.unifiedConfig.pages.inputs;
            this.inputsPageTemplateData = {
                'title': this.inputsConfig.title,
                'description': this.inputsConfig.description,
                'singleInput': this.inputsConfig.services.length === 1,
                'buttonText': getFormattedMessage(100)
            };

            this.navModel = options.navModel;

            // Set state model
            this.stateModel.set('service', ALL_SERVICE, {'silent': true});

            this.services = this.inputsConfig.services;
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
            this.inputs = generateCollection();

            // Change filter
            this.listenTo(this.dispatcher, 'filter-change', (type) => {
                // Trigger change:service event
                this.stateModel.set('service', type);
            });

            // Enabled or disable input event
            this.listenTo(this.dispatcher, 'toggle-input', (model) => {
                /*
                    Note: the param 'model 'is not a backbone model,
                    but an object from response
                */
                // Update model in cache
                this.cachedCollection.models = this.cachedCollection.models.map(
                    m => {
                        if (m.entry.get('name') === model.name) {
                            m.entry.content.set(
                                {'disabled': model.content.disabled},
                                {silent: true}
                            )
                        }
                        return m;
                    }
                );
                // Does not trigger the stateChange
            });

            // Load all collections and CustomCell if configed
            this.deferred =
                $.when.apply(
                    this,
                    this.fetchAllCollection().concat(
                        this.loadCustomCell(this.inputsConfig.table.header)
                    )
                );

            this.emptySearchString =
                this.filterKey.map(d => d + '=*')
                .join(' OR ');
        },

        stateChange: function () {
            const models = this.adjustPaging(
                this.inputs,
                this.filterSort(
                    this.filterSearch(
                        this.filterService(this.cachedCollection.models)
                    )
            ));
            this.inputs.reset(models);
        },

        filterSearch: function(models) {
            if (!this.stateModel.get('search') ||
                    this.stateModel.get('search') === this.emptySearchString) {
                return models;
            }
            const search = this.getRawSearch(this.stateModel.get('search'));
            const result = models.filter(d =>
                this.filterKey.some(field => {
                    const text = this._getCompareText(
                        d,
                        field,
                        this.inputsConfig.table.header
                    );
                    return (text && text.toLowerCase().indexOf(search) > -1);
                })
            );
            //make the filter work for field 'status'
            if ("disabled".indexOf(search) > -1) {
                _.each(models.filter(model => {
                    return model.entry.content.get('disabled') === true;
                }), (m) => {
                    if (!_.includes(result, m)) {
                        result.push(m);
                    }
                });
            }
            if ("enabled".indexOf(search) > -1) {
                _.each(models.filter(model => {
                    return model.entry.content.get('disabled') === false;
                }), (m) => {
                    if (!_.includes(result, m)) {
                        result.push(m);
                    }
                });
            }
            return result;
        },

        filterSort: function (models) {
            const sortKey = this.stateModel.get('sortKey'),
                  sortDir = this.stateModel.get('sortDirection'),
                  header = this.inputsConfig.table.header,
                  handler = (a, b) => sortAlphabetical(
                      this._getCompareText(a, sortKey, header),
                      this._getCompareText(b, sortKey, header),
                      sortDir
                  );
            return models.sort(handler);
        },
        
        // Method to open the edit-popup dialog box on input page
        editPopup: function () {
            let editModel;
            let params = new URLSearchParams(location.search);
            let record = params.get('record');
           
            if (record && this.cachedCollection.models.length > 0) {
                this.cachedCollection.models.forEach(function (element) {
                    if (record === element.entry.get("name")) {
                        editModel = element;
                    }
                });
           
                if (editModel) {
                    const serviceConfig = this.inputsConfig.services[0];
                    const editDialog = new EntityDialog({
                        el: $(".dialog-placeholder"),
                        collection: this.inputs,
                        model: editModel,
                        mode: MODE_EDIT,
                        component: serviceConfig,
                        dispatcher: this.dispatcher
                    });
           
                    editDialog.render().modal();
                 }
            }
        },

        filterService: function (models) {
            // Filter by service
            if (this.inputs.length > 0) {
                this.editPopup();
            }
            const service = this.stateModel.get('service');
            if (service === ALL_SERVICE) {
                return models;
            } else {
                return models.filter(model => {
                    return Util.extractServiceName(model) === service;
                });
            }
        },

        render: function () {
            Util.addLoadingMsg(this.$el);
            if (this.cachedCollection) {
                this._render();
            } else {
                this.deferred.done(() => {
                    this.stateModel.set('fetching', false);
                    this.cachedCollection = this.combineCollection();
                    this.inputs.models = this.cachedCollection.models;
                    this.stateChange();
                    this._render();
                });
            }
            return this;
        },

        _render: function () {
            this.$el.html('');
            // Table caption view
            this.caption = new CaptionView({
                countLabel: _(this.inputsConfig.title).t(),
                model: {
                    state: this.stateModel
                },
                collection: this.inputs,
                noFilterButtons: true,
                filterKey: this.filterKey
            });

            // Page count setting view
            this.countSelect = new SyntheticSelectControl({
                modelAttribute: 'count',
                model: this.stateModel,
                items: [
                    {label: _('10 Per Page').t(), value: 10},
                    {label: _('25 Per Page').t(), value: 25},
                    {label: _('50 Per Page').t(), value: 50}
                ],
                menuWidth: 'narrow'
            });
            // Input type filter
            this.filter = new InputFilter({
                dispatcher: this.dispatcher,
                services: this.services,
                model: this.stateModel
            });

            this.inputTable = new Table({
                stateModel: this.stateModel,
                collection: this.inputs,
                dispatcher: this.dispatcher,
                enableBulkActions: false,
                showActions: true,
                enableMoreInfo: true,
                customRow: this.inputsConfig.table.customRow,
                component: this.inputsConfig,
                unifiedConfig: this.unifiedConfig,
                navModel: this.navModel
            });
            this.$el.append(
                _.template(InputsPageTemplate)(this.inputsPageTemplateData)
            );
            this.$el.append(this.caption.render().$el);

            // render input filter for multiple inputs
            if (!this.inputsPageTemplateData.singleInput) {
                this.$('.table-caption-inner').append(
                    this.countSelect.render().$el
                );
                this.$('.table-caption-inner').append(
                    this.filter.render().$el
                );
            }
            // render inputs table
            this.$el.append(this.inputTable.render().$el);

            // Single data input or multiple data inputs
            if (this.inputsPageTemplateData.singleInput) {
                const serviceConfig = this.inputsConfig.services[0];
                this.$('#addInputBtn').on('click', () => {
                    if (serviceConfig.style === PAGE_STYLE) {
                        this.navModel.navigator.navigate({
                            'service': serviceConfig.name,
                            'action': MODE_CREATE
                        });
                    } else {
                        const dlg = new EntityDialog({
                            el: $(".dialog-placeholder"),
                            collection: this.inputs,
                            component: serviceConfig
                        }).render();
                        dlg.modal();
                    }
                });
            } else {
                const customMenu = this.inputsConfig.menu;
                if (customMenu) {
                    this._loadCustomMenu(
                        customMenu.src,
                        this.$('#addInputBtn').get(0),
                        this.navModel.navigator
                    ).then(() => {
                        this.editmenu.render();
                    });
                } else {
                    this.$('#addInputBtn').on("click", e => {
                        const $target = $(e.currentTarget);
                        if (this.editmenu && this.editmenu.shown) {
                            this.editmenu.hide();
                            e.preventDefault();
                            return;
                        }
                        this.editmenu = new AddInputMenu({
                            collection: this.inputs,
                            dispatcher: this.dispatcher,
                            services: this.services,
                            navModel: this.navModel
                        });

                        $('body').append(this.editmenu.render().el);
                        this.editmenu.show($target);
                    });
                }
            }
        },

        _loadCustomMenu: function(module, target, navigator) {
            const deferred = $.Deferred();
            __non_webpack_require__(['custom/' + module], (CustomMenu) => {
                this.editmenu = new CustomMenu(
                    this.unifiedConfig,
                    target,
                    navigator
                );
                deferred.resolve(CustomMenu);
            });
            return deferred.promise();
        },

        fetchAllCollection: function () {
            return _.map(this.services, service => {
                return this[service.name].fetch({
                    count: 0 // fetch all stanzas
                });
            });
        },

        combineCollection: function () {
            const tempCollection = generateCollection();
            _.each(this.services, service => {
                tempCollection.add(this[service.name].models, {silent: true});
            });
            return tempCollection;
        }
    });
});
