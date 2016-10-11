/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'app/util/Util',
    'splunk.util',
    'models/Base',
    'views/shared/tablecaption/Master',
    'app/views/component/Table',
    'app/views/component/EntityDialog',
    'app/collections/Forwarders',
    'app/models/appData',
    'app/config/ComponentMap',
    'app/templates/common/ButtonTemplate.html'
], function (
    $,
    _,
    Backbone,
    Util,
    SplunkdUtil,
    BaseModel,
    CaptionView,
    Table,
    EntityDialog,
    Forwarders,
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
            //accounts collection
            this.forwarders = new Forwarders([], {
                appData: {app: appData.get("app"), owner: appData.get("owner")},
                targetApp: this.addonName,
                targetOwner: "nobody"
            });

            //Change search, sort
            this.listenTo(this.stateModel, 'change:search change:sortDirection change:sortKey', _.debounce(function () {
                this.fetchListCollection(this.forwarders, this.stateModel);
            }.bind(this), 0));

            this.dispatcher = _.extend({}, Backbone.Events);
        },

        render: function () {
            var add_button_data = {
                    buttonId: "addForwarderBtn",
                    buttonValue: "Add Forwarder"
                },
                forwarder_deferred = this.fetchListCollection(this.forwarders, this.stateModel);

            forwarder_deferred.done(function () {
                var help_link, description_html;
                help_link = SplunkdUtil.make_url("help") + "?location=" + Util.getLinkPrefix() + "mscs.forwarder";
                //Description
                description_html = "<div class='description_block'>To automatically distribute data collection tasks among a set of forwarders, configure your forwarder credentials here. <a class='external' target='_blank' href='" + help_link + "'>Learn more</a></div>";

                //Caption
                this.caption = new CaptionView({
                    countLabel: _('Forwarders').t(),
                    model: {
                        state: this.stateModel
                    },
                    collection: this.forwarders,
                    noFilterButtons: true,
                    filterKey: ['name', 'key_id']
                });

                //Create view
                this.forwarder_list = new Table({
                    stateModel: this.stateModel,
                    collection: this.forwarders,
                    dispatcher: this.dispatcher,
                    showActions: true,
                    enableMoreInfo: false,
                    component: ComponentMap.forwarder
                });
                this.$el.append($(description_html));
                this.$el.append(this.caption.render().$el);
                this.$el.append(this.forwarder_list.render().$el);
                $('#forwarders-tab .table-caption-inner').prepend($(_.template(ButtonTemplate, add_button_data)));

                $('#addForwarderBtn').on('click', function () {
                    var dlg = new EntityDialog({
                        el: $(".dialog-placeholder"),
                        collection: this.forwarders,
                        component: ComponentMap.forwarder,
                        isInput: false
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
