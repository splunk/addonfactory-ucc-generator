import {configManager} from 'app/util/configManager';

define([
    'jquery',
    'lodash',
    'backbone',
    'app/views/configuration/NormalTabViewTemplate.html',
    'app/views/controls/ControlWrapper'
], function (
    $,
    _,
    Backbone,
    NormalTabViewTemplate,
    ControlWrapper
) {
    return Backbone.View.extend({
        initialize: function(options) {
            this.isTableBasedView = !!options.props.table;
            this.props = options.props;

            this.initDataBinding();
        },

        initDataBinding: function() {

        },

        renderNormalView: function() {
            this.$el.html(_.template(NormalTabViewTemplate));

            const {entity} = this.props;
            entity.forEach(d => {
                const controlOptions = {
                    ...d.options,
                    model: this.model,
                    modelAttribute: d.field,
                    password: d.encrypted ? true : false
                };
                _.extend(controlOptions, d.options);
                const controlWrapper = new ControlWrapper({...d, controlOptions});
                this.$('.modal-body').append(controlWrapper.render().$el);
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
});
