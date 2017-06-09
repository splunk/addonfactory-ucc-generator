import $ from 'jquery';
import _ from 'lodash';
import CaptionView from 'views/shared/tablecaption/Master';
import Table from 'app/views/component/Table';
import EntityDialog from 'app/views/component/EntityDialog';
import ButtonTemplate from 'app/templates/common/ButtonTemplate.html';
import {
    fetchRefCollections,
    fetchConfigurationModels,
    generateCollection
} from 'app/util/backboneHelpers';
import {setCollectionRefCount} from 'app/util/dependencyChecker';
import {getFormattedMessage} from 'app/util/messageUtil';
import Util from 'app/util/Util';
import {sortAlphabetical} from 'app/util/sort';

import BaseTableView from 'app/views/BaseTableView';

export default BaseTableView.extend({
    initialize: function (options) {
        BaseTableView.prototype.initialize.apply(this, arguments);
        const {
            deferred: servicesDeferred,
            collectionObjList: serviceCollectionObjList
        } = fetchRefCollections(options.props.name);

        const {
            deferred: configDeferred,
            modelObjList: configModelObjList
        } = fetchConfigurationModels();

        // servicesDeferred may not exist
        const defferedList = [configDeferred];
        if (servicesDeferred) {
            defferedList.push(servicesDeferred);
        }
        // Load custom cell if configed
        defferedList.push(...this.loadCustomCell(this.props.table.header));

        _.extend(this, {
            entitiesDeferred: $.when(...defferedList),
            serviceCollectionObjList,
            configModelObjList
        });

        this.cachedCollection = generateCollection();

        // Table filter key and empty string
        this.filterKey = _.map(this.props.entity, 'field');
        this.emptySearchString = this.filterKey.map(d => d + '=*').join(' OR ');
    },

    stateChange: function () {
        let models = this.adjustPaging(
            this.dataStore,
            this.filterSort(
                this.filterSearch(this.cachedCollection.models)
        ));
        this.dataStore.reset(models);
    },

    filterSearch: function(models) {
        if (!this.stateModel.get('search') ||
                this.stateModel.get('search') === this.emptySearchString) {
            return models;
        }
        const search = this.getRawSearch(this.stateModel.get('search'));
        let result = models.filter(d =>
            this.filterKey.some(field => {
                const text = this._getCompareText(
                    d,
                    field,
                    this.props.table.header
                );
                return (text && text.toLowerCase().indexOf(search) > -1);
            })
        );
        return result;
    },

    filterSort: function (models) {
        const sortKey = this.stateModel.get('sortKey'),
              sortDir = this.stateModel.get('sortDirection'),
              handler = (a, b) => {
                  const header = this.props.table.header;
                  return sortAlphabetical(
                      this._getCompareText(a, sortKey, header),
                      this._getCompareText(b, sortKey, header),
                      sortDir
                  );
              }
        return models.sort(handler);
    },

    render: function () {
        Util.addLoadingMsg(this.$el);

        const addButtonData = {
                buttonId: this.submitBtnId,
                buttonValue: 'Add'
            },
            {
                props,
                entitiesDeferred,
                serviceCollectionObjList,
                configModelObjList
            } = this,
            deferred = this.fetchListCollection(this.dataStore);
        const renderTab = () => {
            this.$el.html('');
            const caption = new CaptionView({
                countLabel: getFormattedMessage(107),
                model: {state: this.stateModel},
                collection: this.dataStore,
                noFilterButtons: true,
                filterKey: this.filterKey
            });

            const table = new Table({
                stateModel: this.stateModel,
                collection: this.dataStore,
                showActions: true,
                enableMoreInfo: props.table.moreInfo ? true : false,
                customRow: props.table.customRow,
                component: props,
                dispatcher: this.dispatcher
            });

            this.$el.append(caption.render().$el);
            this.$el.append(table.render().$el);
            $(`${this.containerId} .table-caption-inner`).prepend(
                $(_.template(ButtonTemplate)(addButtonData))
            );

            $(`#${this.submitBtnId}`).on('click', () => {
                new EntityDialog({
                    el: $('.dialog-placeholder'),
                    collection: this.dataStore,
                    component: props,
                    dispatcher: this.dispatcher
                }).render().modal();
            });
        };

        deferred.done(() => {
            // Set cache models
            this.cachedCollection.add(this.dataStore.models, {silent: true});
            if (entitiesDeferred) {
                entitiesDeferred.done(() => {
                    setCollectionRefCount(
                        this.dataStore,
                        serviceCollectionObjList,
                        configModelObjList,
                        props.name
                    );
                    renderTab();
                });
            } else {
                renderTab();
            }
        });
        return this;
    }
});
