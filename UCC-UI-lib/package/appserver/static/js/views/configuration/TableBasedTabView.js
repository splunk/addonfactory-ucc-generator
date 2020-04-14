import $ from 'jquery';
import _ from 'lodash';
import CaptionView from 'views/shared/tablecaption/Master';
import Table from 'app/views/component/Table';
import EntityDialog from 'app/views/component/EntityDialog';
import ButtonTemplate from 'app/templates/common/ButtonTemplate.html';
import {
    fetchConfigurationModels,
    generateCollection
} from 'app/util/backboneHelpers';
import { getFormattedMessage } from 'app/util/messageUtil';
import Util from 'app/util/Util';
import { sortAlphabetical } from 'app/util/sort';

import BaseTableView from 'app/views/BaseTableView';

// import MODE_EDIT constant to get edit string
import { MODE_EDIT } from 'app/constants/modes';

export default BaseTableView.extend({
    initialize: function() {
        BaseTableView.prototype.initialize.apply(this, arguments);

        const {
            deferred: configDeferred,
            modelObjList: configModelObjList
        } = fetchConfigurationModels();

        // servicesDeferred may not exist
        const defferedList = [configDeferred];
        // Load custom cell if configed
        defferedList.push(...this.loadCustomCell(this.props.table.header));

        _.extend(this, {
            entitiesDeferred: $.when(...defferedList),
            configModelObjList
        });

        this.cachedCollection = generateCollection();

        // Table filter key and empty string
        this.filterKey = _.map(this.props.entity, 'field');
        this.emptySearchString = this.filterKey.map(d => d + '=*').join(' OR ');
    },

    stateChange: function() {
        const models = this.adjustPaging(
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
        const result = models.filter(d =>
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

    filterSort: function(models) {
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

    /**
     * Method to open the edit dialog box popup on tab based page
     * This method will parse the URL Query Parameters e.g. ..../pageName?tab=mytab&record=myinput
     * In the popup it will open the tab with tab-id specified in the query parameter e.g. mytab and tab input data with input name specified in the query parameter e.g. myinput in the edit mode
     * If tab input name is incorrect, it will just open the tab page without any errors shown on the page but it will be logged in javascript console
     */
    editPopup: function() {
        let editModel;
        let params = new URLSearchParams(location.search);
        let tabName = params.get('tab');
        let record = params.get('record');

        if (record && tabName && this.cachedCollection.models.length > 0 && "#" + tabName + "-tab" === this.containerId) {
            this.cachedCollection.models.forEach(function(element) {
                if (record === element.entry.get("name")) {
                    editModel = element;
                }
            });

            if (editModel) {
                const editDialog = new EntityDialog({
                    el: $(".dialog-placeholder"),
                    collection: this.dataStore,
                    model: editModel,
                    mode: MODE_EDIT,
                    component: this.props,
                    dispatcher: this.dispatcher
                });
                editDialog.render().modal();
            }
        } else {
            console.log(`No record found of name: '${record}'`)
        }
    },

    render: function() {
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
                model: { state: this.stateModel },
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

            /**
             * call the editPopup event after rendering the page.
             */
            this.editPopup();
        };

        deferred.done(() => {
            // Set cache models
            this.cachedCollection.add(this.dataStore.models, { silent: true });
            this.stateChange();
            if (entitiesDeferred) {
                entitiesDeferred.done(() => {
                    renderTab();
                });
            } else {
                renderTab();
            }
        });
        return this;
    }
});