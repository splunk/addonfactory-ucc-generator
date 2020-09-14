/**
 * @author jszeto
 * @date 9/2/14
 *
 * Display additional settings for the ProviderSetup view
 *
 * @param {Object} options
 *                          {Model}  model Will display a Text Control and label for each attribute in the model
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/ControlGroup'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        ControlGroup
        ) {

        return BaseView.extend({
            moduleId: module.id,

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
            },

            createSetting: function(attribute) {
                return new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: attribute,
                        model: this.model,
                        canClear: true
                    },
                    label: attribute
                });
            },

            render: function() {
                // Detach children
                if (this.children) {
                    _(this.children).each(function(control) {
                        control.detach();
                    }, this);
                }
                // Use template
                this.$el.html(this.compiledTemplate({}));

                // Create new children
                _(this.model.keys()).each(function(key) {
                    if (!_(this.children).has(key)) {
                        this.children[key] = this.createSetting(key);
                    }
                }, this);

                // Iterate over children and remove any not found in the model. Then attach
                _(this.children).each(function(control, key) {
                    if (!this.model.has(key)) {
                        delete this.children[key];
                    } else {
                        this.children[key].render().appendTo(this.$(".controls-placeholder"));
                    }
                }, this);

                return this;
            },

            template: '\
                <div class="controls-placeholder form form-horizontal"></div>\
            '
        });

    });

