import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
import NormalTabViewTemplate from 'app/views/configuration/NormalTabViewTemplate.html';
import ControlWrapper from 'app/views/controls/ControlWrapper';
import {configManager} from 'app/util/configManager';
import {generateModel} from 'app/util/backboneHelpers';
import {generateValidators} from 'app/util/validators';
import {
    addErrorMsg,
    removeErrorMsg,
    addSavingMsg,
    removeSavingMsg,
    displayValidationError
} from 'app/util/promptMsgController';

export default Backbone.View.extend({
    initialize: function(options) {
        this.isTableBasedView = !!options.props.table;
        this.props = options.props;

        this.initDataBinding();
        this.msgContainerId = `${options.containerId} .modal-body`;
    },

    initDataBinding: function() {
        if (this.isTableBasedView) {

        } else {
            const {entity, name} = this.props;
            const validators = generateValidators(entity);
            const [baseModelName, fieldName] = name.split('/');

            this.dataStore = new (generateModel(baseModelName, {validators}))({name: fieldName});
            this.dataStore.on('invalid', err => displayValidationError(this.msgContainerId,  error));
        }
    },

    renderNormalView: function() {
        this.$el.html(_.template(NormalTabViewTemplate));

        this.dataStore.fetch().done(() => {
            const {content} = this.dataStore.entry;
            const {entity} = this.props;
            entity.forEach(d => {
                if (content.get(d.field) === undefined && d.defaultValue) {
                    content.set(d.field, d.defaultValue);
                }
                const controlOptions = {
                    ...d.options,
                    model: content,
                    modelAttribute: d.field,
                    password: d.encrypted ? true : false
                };
                _.extend(controlOptions, d.options);
                const controlWrapper = new ControlWrapper({...d, controlOptions});
                this.$('.modal-body').append(controlWrapper.render().$el);
            });
        });

        this.$("input[type=submit]").on("click", this.saveDataStore.bind(this));
    },

    saveDataStore: function() {
        const {entity} = this.props;
        this.dataStore.attr_labels = {};
        entity.forEach(({field, label}) => this.dataStore.attr_labels[field] = label);

        removeErrorMsg(this.msgContainerId);
        addSavingMsg(this.msgContainerId, _('Saving').t());
        this.dataStore.save(null, {
            success: () => removeSavingMsg(this.msgContainerId),
            error: function (model, response) {
                removeSavingMsg(this.msgContainerId);
                addErrorMsg(this.msgContainerId, response, true);
            }
        });
    },

    renderTableBasedView: function() {

    },

    render: function() {
        if (this.isTableBasedView) {
            this.renderTableBasedView();
        } else {
            this.renderNormalView();
        }

        return this;
    }
});
