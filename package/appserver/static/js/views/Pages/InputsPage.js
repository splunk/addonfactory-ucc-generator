/*global require*/
define([
     'jquery',
     'underscore',
     'backbone',
     'app/util/Util',
     'app/collections/ProxyBase.Collection',
     'app/collections/Accounts',
     'app/models/appData',
     'app/templates/common/PageTitle.html',
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
     ProxyBase,
     Accounts,
     appData,
     InputTitleTemplate,
     BaseModel,
     CaptionView,
     InputFilter,
     AddInputMenu,
     EntityDialog,
     ComponentMap,
     Table
) {
     return Backbone.View.extend({
         className: 'inputsContainer',
         initialize: function () {
             this.addonName = Util.getAddonName();
             //state model
             this.stateModel = new BaseModel();
             this.stateModel.set({
                 sortKey: 'name',
                 sortDirection: 'asc',
                 count: 10,
                 offset: 0,
                 fetching: true
             });
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

             this.dispatcher = _.extend({}, Backbone.Events);

             //Change filter
             this.listenTo(this.dispatcher, 'filter-change', function (type) {
                 this.filterChange(type, this.stateModel);
             }.bind(this));

             //Delete input
             this.listenTo(this.dispatcher, 'delete-input', function () {
                 var all_deferred = this.fetchAllCollection();
                 all_deferred.done(function () {
                     var temp_collection = this.combineCollection(),
                         offset = this.stateModel.get('offset'),
                         count = this.stateModel.get('count'),
                         models;
                     this.cached_inputs = temp_collection[0];
                     this.cached_search_inputs = temp_collection[1];

                     this.inputs.paging.set('offset', offset);
                     this.inputs.paging.set('perPage', count);
                     this.inputs.paging.set('total', this.cached_search_inputs.length);
                     models = this.cached_search_inputs.models.slice(offset, offset + count);
                     _.each(models, function (model) {
                         model.paging.set('offset', offset);
                         model.paging.set('perPage', count);
                         model.paging.set('total', this.cached_search_inputs.length);
                     }.bind(this));
                     this.inputs.reset(models);
                     this.inputs._url = undefined;
                 }.bind(this));
             }.bind(this));

             //Add input with offset change
             this.listenTo(this.dispatcher, 'add-input', function () {
                 var all_deferred = this.fetchAllCollection();
                 all_deferred.done(function () {
                     var temp_collection = this.combineCollection(),
                         offset = this.stateModel.get('offset'),
                         count = this.stateModel.get('count'),
                         models;
                     this.cached_inputs = temp_collection[0];
                     this.cached_search_inputs = temp_collection[1];

                     this.inputs.paging.set('offset', offset);
                     this.inputs.paging.set('perPage', count);
                     this.inputs.paging.set('total', this.cached_search_inputs.length);
                     models = this.cached_search_inputs.models.slice(offset, offset + count);
                     _.each(models, function (model) {
                         model.paging.set('offset', offset);
                         model.paging.set('perPage', count);
                         model.paging.set('total', this.cached_search_inputs.length);
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

             this.emptySearchString = _.map(ComponentMap.input.filterKey, function(key) {
                 return key + '=*';
             }).join(' OR ');
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
                         var temp_collection = this.combineCollection(),
                             offset = this.stateModel.get('offset'),
                             count = this.stateModel.get('count');
                         this.cached_inputs = temp_collection[0];
                         this.cached_search_inputs = temp_collection[1];
                         this.inputs.paging.set('offset', offset);
                         this.inputs.paging.set('perPage', count);
                         this.inputs.paging.set('total', this.cached_search_inputs.length);
                         models = this.cached_search_inputs.models.slice(offset, offset + count);
                         _.each(models, function (model) {
                             model.paging.set('offset', offset);
                             model.paging.set('perPage', count);
                             model.paging.set('total', this.cached_search_inputs.length);
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
             var title_template, inputs_template_data, temp_collection;
             this.deferred.done(function () {
                 this.stateModel.set('fetching', false);
                 inputs_template_data = ComponentMap.input.caption;
                 title_template = _.template(InputTitleTemplate);
                 temp_collection = this.combineCollection();
                 this.cached_inputs = temp_collection[0];
                 this.cached_search_inputs = temp_collection[1];

                 //Display the first page
                 this.inputs = this.combineCollection()[0];
                 this.inputs.models = this.cached_inputs.models.slice(0, this.stateModel.get('count'));

                 if (this.inputs.length !== 0) {
                     _.each(this.inputs.models, function (model) {
                         model.paging.set('total', this.inputs.length);
                     }.bind(this));
                 }

                 this.inputs.paging.set('total', this.inputs.length);

                 this.caption = new CaptionView({
                     countLabel: _('Inputs').t(),
                     model: {
                         state: this.stateModel
                     },
                     collection: this.inputs,
                     noFilterButtons: true,
                     filterKey: ComponentMap.input.filterKey
                 });

                 this.input_list = new Table({
                     stateModel: this.stateModel,
                     collection: this.inputs,
                     dispatcher: this.dispatcher,
                     enableBulkActions: false,
                     showActions: true,
                     enableMoreInfo: true,
                     component: ComponentMap.input
                 });

                 this.$el.append(title_template(inputs_template_data));
                 this.$el.append(this.caption.render().$el);

                 if (!ComponentMap.input.caption.singleInput && Object.keys(ComponentMap.input.services).length > 1) {
                     $('.table-caption-inner').append(this.filter.render().$el);
                 }

                 this.$el.append(this.input_list.render().$el);

                 if (ComponentMap.input.caption.singleInput) {
                     var keys = Object.keys(ComponentMap.input.services);
                     if (keys.length === 1) {
                         $('#' + ComponentMap.input.caption.buttonId).on('click', function () {
                             var dlg = new EntityDialog({
                                 el: $(".dialog-placeholder"),
                                 collection: this.inputs,
                                 component: ComponentMap.input.services[keys[0]],
                                 isInput: true
                             }).render();
                             dlg.modal();
                         }.bind(this));
                     }
                 } else {
                     $('#' + ComponentMap.input.caption.buttonId).on("click", function (e) {
                         var $target = $(e.currentTarget);
                         if (this.editmenu && this.editmenu.shown) {
                             this.editmenu.hide();
                             e.preventDefault();
                             return;
                         }

                         this.editmenu = new AddInputMenu({
                             collection: this.inputs,
                             dispatcher: this.dispatcher,
                             services: ComponentMap.input.services
                         });

                         $('body').append(this.editmenu.render().el);
                         this.editmenu.show($target);
                     }.bind(this));
                 }
             }.bind(this));
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

         combineCollection: function () {
             var temp_collection1 = new ProxyBase([], {
                     appData: {app: appData.get("app"), owner: appData.get("owner")},
                     targetApp: this.addonName,
                     targetOwner: "nobody"
                 }),
                 temp_collection2 = new ProxyBase([], {
                     appData: {app: appData.get("app"), owner: appData.get("owner")},
                     targetApp: this.addonName,
                     targetOwner: "nobody"
                 }),
                 service;

             for (service in this.services) {
                 if (this.services.hasOwnProperty(service)) {
                     temp_collection1.add(this[service].models, {silent: true});
                     temp_collection2.add(this[service].models, {silent: true});
                 }
             }

             return [temp_collection1, temp_collection2];
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
                 newPageStateModel = new BaseModel(),
                 all_deferred,
                 models;

             function statusMap(disabled) {
                 return disabled ? 'Disabled' :'Enabled';
             }

             function serviceMap(model) {
                 if (model.id.indexOf('ta_crowdstrike_falcon_host_inputs') > -1) {
                     return "Falcon Host";
                 }
                 return "Unknown";
             }

             if (search !== this.emptySearchString) {
                 search = a.substring(a.indexOf('*') + 1, a.indexOf('*', a.indexOf('*') + 1)).toLowerCase();
                 _.each(this.cached_inputs.models, function (model) {
                     _.each(ComponentMap.input.filterKey, function(key) {
                         if (model.entry.get(key) && model.entry.get(key).toLowerCase().indexOf(search) > -1 ||
                             model.entry.content.get(key) && model.entry.content.get(key).toLowerCase().indexOf(search) > -1 ||
                             key === 'status' && statusMap(model.entry.content.get('disabled')).toLowerCase().indexOf(search) > -1 ||
                             key === 'service' && serviceMap(model).toLowerCase().indexOf(search) > -1
                         ) {
                             result.push(model);
                         }
                     });
                 });

                 this.inputs.paging.set('offset', offset);
                 this.inputs.paging.set('perPage', count);
                 this.inputs.paging.set('total', result.length);
                 _.each(result, function (model) {
                     model.paging.set('offset', offset);
                     model.paging.set('perPage', count);
                     model.paging.set('total', result.length);
                 }.bind(this));
                 this.cached_search_inputs.reset(result);

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
                     var temp_collection = this.combineCollection();
                     this.cached_inputs = temp_collection[0];
                     this.cached_search_inputs = temp_collection[1];
                     this.inputs.paging.set('offset', offset);
                     this.inputs.paging.set('perPage', count);
                     this.inputs.paging.set('total', this.cached_search_inputs.length);
                     models = this.cached_search_inputs.models.slice(offset, offset + count);
                     _.each(models, function (model) {
                         model.paging.set('offset', offset);
                         model.paging.set('perPage', count);
                         model.paging.set('total', this.cached_search_inputs.length);
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

             this.inputs.paging.set('total', this.cached_search_inputs.length);
             models = this.cached_search_inputs.models.slice(offset, offset + count);

             _.each(models, function (model) {
                 model.paging.set('offset', offset);
                 model.paging.set('perPage', count);
                 model.paging.set('total', this.cached_search_inputs.length);
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
                 var temp_collection = this.combineCollection();
                 this.cached_inputs = temp_collection[0];
                 this.cached_search_inputs = temp_collection[1];
                 this.inputs.paging.set('offset', offset);
                 this.inputs.paging.set('perPage', count);
                 this.inputs.paging.set('total', this.cached_search_inputs.length);

                 this.cached_search_inputs.models.sort(handler[sort_key]);
                 var models = this.cached_search_inputs.models.slice(offset, offset + count);
                 _.each(models, function (model) {
                     model.paging.set('offset', offset);
                     model.paging.set('perPage', count);
                     model.paging.set('total', this.cached_search_inputs.length);
                 }.bind(this));
                 this.inputs.reset(models);
                 this.inputs._url = undefined;
             }.bind(this));
         }
     });
});
