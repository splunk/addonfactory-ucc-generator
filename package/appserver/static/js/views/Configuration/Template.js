/*global define*/
define([
    'jquery',
    'lodash',
    'backbone',
    'app/util/Util',
    'models/Base',
    'views/shared/tablecaption/Master',
    'app/views/component/Table',
    'app/views/component/EntityDialog',
    'app/collections/Templates',
    'app/collections/ProxyBase.Collection',
    'app/models/appData',
    'app/config/ComponentMap',
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
    Templates,
    ProxyBase,
    appData,
    ComponentMap,
    ButtonTemplate
) {
    return Backbone.View.extend({
        initialize: function () {
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

            //Load service inputs
            this.services = ComponentMap.input.services;
            var service, Collection;
            for (service in this.services) {
                if (this.services.hasOwnProperty(service)) {
                    Collection = this.services[service].collection;

                    this[service] = new Collection([], {
                        appData: {app: appData.get("app"), owner: appData.get("owner")},
                        targetApp: this.addonName,
                        targetOwner: "nobody"
                    });
                }
            }

            //templates collection
            this.templates = new Templates([], {
                appData: {app: appData.get("app"), owner: appData.get("owner")},
                targetApp: this.addonName,
                targetOwner: "nobody"
            });

            //Change search, sort
            this.listenTo(this.stateModel, 'change:search change:sortDirection change:sortKey', _.debounce(function () {
                this.fetchListCollection(this.templates, this.stateModel);
            }.bind(this), 0));

            this.deferred = this.fetchAllCollection();
        },

        render: function () {
            var add_button_data = {
                    buttonId: "addTemplateBtn",
                    buttonValue: "Create New Template"
                },
                tempalte_deferred = this.fetchListCollection(this.templates, this.stateModel);

            tempalte_deferred.done(function () {
                this.deferred.done(function () {
                    //Caption
                    this.caption = new CaptionView({
                        countLabel: _('Templates').t(),
                        model: {
                            state: this.stateModel
                        },
                        collection: this.templates,
                        noFilterButtons: true,
                        filterKey: ['name', 'key_id']
                    });

                    //Create view
                    this.template_list = new Table({
                        stateModel: this.stateModel,
                        collection: this.templates,
                        refCollection: this.combineCollection(),
                        showActions: true,
                        enableMoreInfo: false,
                        component: ComponentMap.template
                    });

                    this.$el.append(this.caption.render().$el);
                    this.$el.append(this.template_list.render().$el);
                    $('#template-tab .table-caption-inner').prepend($(_.template(ButtonTemplate, add_button_data)));

                    $('#addTemplateBtn').on('click', function () {
                        var dlg = new EntityDialog({
                            el: $(".dialog-placeholder"),
                            collection: this.templates,
                            component: ComponentMap.template
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
                success: function () {
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
                    appData: {app: appData.get("app"), owner: appData.get("owner")},
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
