import Backbone from 'backbone';
import {generateModel} from 'app/util/backboneHelpers';
import {generateValidators} from 'app/util/validators';
import NormalTabView from './NormalTabView';

export default Backbone.View.extend({
    initialize: function(options) {
        this.initOptions = options;

        this.isTableBasedView = !!options.props.table;
        this.props = options.props;

        this.initDataBinding();
    },

    initDataBinding: function() {
        if (this.isTableBasedView) {

        } else {
            const {entity, name} = this.props;
            const validators = generateValidators(entity);
            const [baseModelName, fieldName] = name.split('/');

            this.dataStore = new (generateModel(baseModelName, {validators}))({name: fieldName});
        }
    },

    render: function() {
        const {dataStore} = this;
        if (this.isTableBasedView) {
            this.renderTableBasedView();
        } else {
            const view = new NormalTabView({...this.initOptions, dataStore});
            this.$el.html(view.render().$el);
        }

        return this;
    }
});
