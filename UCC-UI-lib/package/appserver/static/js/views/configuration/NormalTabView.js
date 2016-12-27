import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
import NormalTabViewTemplate from 'app/views/configuration/NormalTabViewTemplate.html';
import ControlWrapper from 'app/views/controls/ControlWrapper';
import {
    addErrorMsg,
    removeErrorMsg,
    addSavingMsg,
    removeSavingMsg,
    displayValidationError,
    addClickListener
} from 'app/util/promptMsgController';
import {parseFuncRawStr} from 'app/util/script';
import {getFormattedMessage} from 'app/util/messageUtil';

export default Backbone.View.extend({
    initialize: function(options) {
        this.props = options.props;

        this.submitBtnId = options.submitBtnId;
        this.dataStore = options.dataStore;
        this.msgContainerId = `${options.containerId}`;
        options.dataStore.on('invalid', err => {
            displayValidationError(this.msgContainerId,  err);
            addClickListener(this.msgContainerId, 'msg-error');
        });

        this.stateModel = new Backbone.Model({});

        // We can't set onChange-hook up in the data fetching model. Since it will only be updated when user save form data.
        this.stateModel.on('change', this.onStateChange.bind(this));

        options.pageState.on('change', () => {
            if (options.pageState.get('selectedTabId') === options.containerId) {
                (this.refCollectionList || []).map(d => d.fetch());
            }
        });
    },

    onStateChange: function() {
        const onChangeHookRawStr = _.get(this.props, ['options', 'onChange']);
        if (onChangeHookRawStr) {
            const changedField = this.stateModel.changedAttributes();
            const widgetsIdDict = {};
            const {entity, name} = this.props;
            (entity || []).forEach(d => {
                widgetsIdDict[d.field] = `#${name}-${d.field}`;
            });
            const formData = this.stateModel.toJSON();
            const onChangeHook = parseFuncRawStr(onChangeHookRawStr);
            onChangeHook(formData, changedField, widgetsIdDict);
        }
    },

    saveData: function() {
        removeErrorMsg(this.msgContainerId);
        addSavingMsg(this.msgContainerId, getFormattedMessage(108));
        addClickListener(this.msgContainerId, 'msg-loading');
        this.dataStore.entry.content.set(this.stateModel.toJSON());
        this.dataStore.save(null, {
            success: () => removeSavingMsg(this.msgContainerId),
            error: (model, response) => {
                removeSavingMsg(this.msgContainerId);
                addErrorMsg(this.msgContainerId, model, true);
                addClickListener(this.msgContainerId, 'msg-error');
            }
        });
    },

    render: function() {
        this.$el.html(`<div class="loading-msg-icon">${getFormattedMessage(115)}</div>`);
        this.dataStore.fetch().done(() => {
            const tabContentDOMObj = $(_.template(NormalTabViewTemplate)({buttonId: this.submitBtnId}));
            tabContentDOMObj.find('input[type=submit]').on('click', this.saveData.bind(this));
            this.$el.html(tabContentDOMObj);
            const {content} = this.dataStore.entry;
            const {entity, name} = this.props;
            const refCollectionList = [];
            entity.forEach(d => {
                if (content.get(d.field) === undefined && d.defaultValue) {
                    this.stateModel.set(d.field, d.defaultValue);
                } else if (content.get(d.field)) {
                    this.stateModel.set(d.field, content.get(d.field));
                }
                const controlOptions = {
                    ...d.options,
                    model: this.stateModel,
                    modelAttribute: d.field,
                    password: d.encrypted ? true : false,
                    elementId: `${name}-${d.field}`
                };
                _.extend(controlOptions, d.options);
                const controlWrapper = new ControlWrapper({...d, controlOptions});
                if(controlWrapper.collection) {
                    refCollectionList.push(controlWrapper.collection);
                }
                this.$('.modal-body').append(controlWrapper.render().$el);
                // prevent auto complete for password
                if (d.encrypted) {
                    this.$('.modal-body').prepend(
                        `<input type="password" id="${d.field}" style="display: none"/>`
                    );
                }
            });
            this.refCollectionList = refCollectionList;
        });

        return this;
    }
});
