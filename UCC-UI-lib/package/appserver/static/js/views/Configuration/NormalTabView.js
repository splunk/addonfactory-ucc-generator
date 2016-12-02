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

export default Backbone.View.extend({
    initialize: function(options) {
        this.props = options.props;

        this.submitBtnId = options.submitBtnId;
        this.dataStore = options.dataStore;
        this.msgContainerId = `${options.containerId} .modal-body`;
        options.dataStore.on('invalid', err => {
            displayValidationError(this.msgContainerId,  err);
        });

        this.stateModel = new Backbone.Model({});

        // We can't set onChange-hook up in the data fetching model. Since it will only be updated when user save form data.
        this.stateModel.on('change', this.onStateChange.bind(this));
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
        addSavingMsg(this.msgContainerId, _('Saving').t());
        this.dataStore.entry.content.set(this.stateModel.toJSON());
        this.dataStore.save(null, {
            success: () => removeSavingMsg(this.msgContainerId),
            error: function (model, response) {
                removeSavingMsg(this.msgContainerId);
                addErrorMsg(this.msgContainerId, response, true);
            }
        });
    },

    render: function() {
        this.$el.html(_.template(NormalTabViewTemplate)({buttonId: this.submitBtnId}));

        this.dataStore.fetch().done(() => {
            const {content} = this.dataStore.entry;
            const {entity, name} = this.props;
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
                this.$('.modal-body').append(controlWrapper.render().$el);
            });
        });
        this.$('input[type=submit]').on('click', this.saveData.bind(this));

        return this;
    }
});
