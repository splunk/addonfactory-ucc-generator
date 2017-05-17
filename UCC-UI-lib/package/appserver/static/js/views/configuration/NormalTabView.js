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
    displayValidationError
} from 'app/util/promptMsgController';
import {parseFuncRawStr} from 'app/util/script';
import {getFormattedMessage} from 'app/util/messageUtil';
import Util from 'app/util/Util';

export default Backbone.View.extend({
    initialize: function(options) {
        // submitBtnId, props, dataStore
        _.extend(this, options);
        this.msgContainerId = `${options.containerId}`;
        options.dataStore.on('invalid', err => {
            displayValidationError(this.msgContainerId,  err);
        });

        this.stateModel = new Backbone.Model({});

        // We can't set onChange-hook up in the data fetching model.
        // Since it will only be updated when user save form data.
        this.stateModel.on('change', this.onStateChange.bind(this));

        options.pageState.on('change', () => {
            const selectedTabId = options.pageState.get('selectedTabId');
            if (selectedTabId === options.containerId) {
                (this.refCollectionList || []).map(d => d.fetch());
            }
        });
    },

    events: {
        'click button.close': (e) => {
            $(e.target).closest('.msg').remove();
        }
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

    enableButtons: function () {
        this.$("button[type=button]").removeAttr('disabled');
        this.$("input[type=submit]").removeAttr('disabled');
    },

    disableButtons: function () {
        this.$("button[type=button]").attr('disabled', true);
        this.$("input[type=submit]").attr('disabled', true);
    },

    saveData: function() {
        removeErrorMsg(this.msgContainerId);
        addSavingMsg(this.msgContainerId, getFormattedMessage(108));
        this.disableButtons();
        const newConfig = this.stateModel.toJSON();
        this.props.entity.forEach(d => {
            // Related JIRA ID: ADDON-12723
            if(newConfig[d.field] === undefined) {
                newConfig[d.field] = '';
            }
        });

        this.dataStore.entry.content.set(newConfig);
        const valid = this.dataStore.save(null, {
            success: () => {
                removeSavingMsg(this.msgContainerId);
                this.enableButtons();
            },
            error: (model, response) => {
                removeSavingMsg(this.msgContainerId);
                addErrorMsg(this.msgContainerId, response, true);
                this.enableButtons();
            }
        });
        if (!valid) {
            this.enableButtons();
        }
    },

    render: function() {
        Util.addLoadingMsg.apply(this);
        this.dataStore.fetch().done(() => {
            const tabContentDOMObj = $(_.template(NormalTabViewTemplate)({
                buttonId: this.submitBtnId
            }));
            tabContentDOMObj.find('input[type=submit]').on(
                'click',
                this.saveData.bind(this)
            );
            this.$el.html(tabContentDOMObj);
            const {content} = this.dataStore.entry;
            const {entity, name} = this.props;
            const refCollectionList = [];
            entity.forEach(d => {
                if (content.get(d.field) === undefined &&
                        d.defaultValue !== undefined) {
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
                const controlWrapper = new ControlWrapper(
                    {...d, controlOptions}
                );
                if(controlWrapper.collection) {
                    refCollectionList.push(controlWrapper.collection);
                }
                this.$('.modal-body').append(controlWrapper.render().$el);
                // prevent auto complete for password
                if (d.encrypted) {
                    this.$('.modal-body').prepend(
                        _.template(this.passwordInputTemplate)(
                            {field: d.field}
                        )
                    );
                }
            });
            this.refCollectionList = refCollectionList;
        });

        return this;
    },

    passwordInputTemplate: `
        <input type="password" id="<%- field %>" style="display: none"/>
    `
});
