/**
 * @author jszeto
 * @date 8/11/15
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView
        ) {

        return BaseView.extend({
            moduleId: module.id,
            tagName: "button",
            className: "enable-button btn",

            /**
             * options {
             *      model: {BaseModel} {
             *          editable {Boolean} If true, then set the button label to "Create Policy", otherwise set to "Edit"
             *          enabled {Boolean} If true, then enable the button
             *      }
             * }
             *
             * @param options
             */
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);

                this.listenTo(this.model, "change:enabled", this.updateButton);
            },
            events: {
                'click': function (e) {
                    this.trigger("click");
                }
            },

            enable: function() {
                this.$el.prop('disabled', false);
            },

            disable: function() {
                this.$el.prop('disabled', true);
            },

            updateButton: function() {
                var buttonEnabled = this.model.get("enabled");
                this.$el.text(this.options.label);
                //this.$el.prop('disabled', !buttonEnabled);
            },

            render: function() {
                //this.$el.html(this.compiledTemplate());
                this.updateButton();
                return this;
            },

            template: '\
            '
        });

    });

