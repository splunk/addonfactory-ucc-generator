import {configManager} from 'app/util/configManager';

define([
    'jquery',
    'lodash',
    'backbone',
    'app/views/controls/ControlWrapper'
], function (
    $,
    _,
    Backbone,
    ControlWrapper
) {
    return Backbone.View.extend({
        initialize: function (options) {
            this.props = options.props;
        },

        render: function() {
            const {entity} = this.props;

            entity.forEach(d => {
                const controlOptions = {
                    modelAttribute: d.field,
                    password: d.encrypted ? true : false
                };
                _.extend(controlOptions, d.options);
                const controlWrapper = new ControlWrapper({...d, controlOptions});
                this.$el.append(controlWrapper.render().$el);
            });
            // TODO change below to button control
            this.$el.append(`
                <input type="submit" class="btn btn-primary submit-btn" value="Save" style="margin-left: 170px">
            `);
            return this;
        }
    });
});
