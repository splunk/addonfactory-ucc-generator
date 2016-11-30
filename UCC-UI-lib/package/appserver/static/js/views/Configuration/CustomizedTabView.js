import Backbone from 'backbone';
import {generateModel} from 'app/util/backboneHelpers';
import {generateValidators} from 'app/util/validators';
import {generateCollection} from 'app/util/backboneHelpers';
import NormalTabView from './NormalTabView';
import TableBasedTabView from './TableBasedTabView';
import restEndpointMap from 'app/constants/restEndpointMap';

export default Backbone.View.extend({
    initialize: function(options) {
        this.initOptions = options;

        this.isTableBasedView = !!options.props.table;
        this.props = options.props;

        // This id will be used by QA team for testes
        this.submitBtnId = `add${this.props.title.replace(' ', '')}Btn`;

        this.initDataBinding();
    },

    initDataBinding: function() {
        const {name} = this.props;
        const preDefinedUrl = restEndpointMap[name];

        if (this.isTableBasedView) {
            this.dataStore = generateCollection(preDefinedUrl ? '' : name, {
                customizedUrl: preDefinedUrl
            });
        } else {
            const {entity, options} = this.props;
            const validators = generateValidators(entity);

            this.dataStore = new (generateModel(preDefinedUrl ? undefined : name, {
                customizedUrl: preDefinedUrl,
                formDataValidatorRawStr: options ? options.saveValidator : undefined,
                validators
            }))({name});
        }
    },

    render: function() {
        const {dataStore, submitBtnId} = this;
        let view;
        if (this.isTableBasedView) {
            view = new TableBasedTabView({...this.initOptions, dataStore, submitBtnId});
        } else {
            view = new NormalTabView({...this.initOptions, dataStore, submitBtnId});
        }
        this.$el.html(view.render().$el);

        return this;
    }
});
