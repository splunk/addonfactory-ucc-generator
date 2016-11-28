import Backbone from 'backbone';
import {generateModel} from 'app/util/backboneHelpers';
import {generateValidators} from 'app/util/validators';
import {generateCollection} from 'app/util/backboneHelpers';
import NormalTabView from './NormalTabView';
import TableBasedTabView from './TableBasedTabView';

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

        if (this.isTableBasedView) {
            this.dataStore = generateCollection(name);
        } else {
            const {entity} = this.props;
            const validators = generateValidators(entity);
            const [baseModelName, fieldName] = name.split('/');

            this.dataStore = new (generateModel(baseModelName, {validators}))({name: fieldName});
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
