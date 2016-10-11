/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'app/util/Util',
    'models/Base',
    'views/shared/tablecaption/Master',
    'app/views/component/Table',
    'app/views/component/EntityDialog',
    'app/collections/HttpInputs',
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
    HttpInputs,
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
            //httpinput collection
            this.httpinputs = new HttpInputs([], {
                appData: {app: appData.get("app"), owner: appData.get("owner")},
                targetApp: this.addonName,
                targetOwner: "nobody"
            });
        },

        render: function () {
            var add_button_data = {
                    buttonId: "addHttpInputBtn",
                    buttonValue: "Create New HttpInput"
                },
                httpinput_deferred = this.fetchListCollection(this.httpinputs, this.stateModel);

            httpinput_deferred.done(function () {
                //Caption
                this.caption = new CaptionView({
                    countLabel: _('HttpInputs').t(),
                    model: {
                        state: this.stateModel
                    },
                    collection: this.httpinputs,
                    noFilterButtons: true,
                    filterKey: ['name', 'key_id']
                });

                //Create view
                this.httpinput_list = new Table({
                    stateModel: this.stateModel,
                    collection: this.httpinputs,
                    //refCollection: this.combineCollection(),
                    showActions: true,
                    enableMoreInfo: false,
                    component: ComponentMap.httpinput
                });

                this.$el.append(this.caption.render().$el);
                this.$el.append(this.httpinput_list.render().$el);
                $('#httpinput-tab .table-caption-inner').prepend($(_.template(ButtonTemplate, add_button_data)));

                $('#addHttpInputBtn').on('click', function () {
                    var dlg = new EntityDialog({
                        el: $(".dialog-placeholder"),
                        collection: this.httpinputs,
                        component: ComponentMap.httpinput
                    }).render();
                    dlg.modal();
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
        }
    });
});
