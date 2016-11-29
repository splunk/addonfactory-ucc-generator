import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
import CaptionView from 'views/shared/tablecaption/Master';
import Table from 'app/views/component/Table';
import EntityDialog from 'app/views/component/EntityDialog';
import ButtonTemplate from 'app/templates/common/ButtonTemplate.html';

export default Backbone.View.extend({
    initialize: function (options) {
        this.containerId = options.containerId;
        this.submitBtnId = options.submitBtnId;
        this.props = options.props;

        this.stateModel = new Backbone.Model({
            sortKey: 'name',
            sortDirection: 'asc',
            count: 100,
            offset: 0,
            fetching: true
        });

        this.dataStore = options.dataStore;

        this.listenTo(this.stateModel, 'change:search change:sortDirection change:sortKey', _.debounce(() => {
            this.fetchListCollection(this.dataStore, this.stateModel);
        }, 0));
    },

    render: function () {
        const addButtonData = {
                buttonId: this.submitBtnId,
                buttonValue: 'Add'
            },
            {props} = this,
            deferred = this.fetchListCollection(this.dataStore, this.stateModel);
        deferred.done(function () {
            const caption = new CaptionView({
                countLabel: _('Items').t(),
                model: {
                    state: this.stateModel
                },
                collection: this.dataStore,
                noFilterButtons: true,
                filterKey: _.map(props.entity, e => e.name)
            });

            const table = new Table({
                stateModel: this.stateModel,
                collection: this.dataStore,
                showActions: true,
                enableMoreInfo: props.table.moreInfo ? true : false,
                component: props
            });

            this.$el.append(caption.render().$el);
            this.$el.append(table.render().$el);
            $(`${this.containerId} .table-caption-inner`).prepend($(_.template(ButtonTemplate)(addButtonData)));

            $(`#${this.submitBtnId}`).on('click', () => {
                new EntityDialog({
                    el: $('.dialog-placeholder'),
                    collection: this.dataStore,
                    component: props,
                    isInput: false
                }).render().modal();
            });
        }.bind(this));
        return this;
    },

    fetchListCollection: function (collection, stateModel) {
        stateModel.set('fetching', true);
        return collection.fetch({
            data: {
                sort_dir: stateModel.get('sortDirection'),
                sort_key: stateModel.get('sortKey').split(','),
                search: stateModel.get('search') ? stateModel.get('search') : '',
                count: stateModel.get('count'),
                offset: stateModel.get('offset')
            },
            success: function () {
                stateModel.set('fetching', false);
            }.bind(this)
        });
    }
});
