/**
 * @author jszeto
 * @date 9/3/14
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/KeyValueControl'

],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        KeyValueControl
        ) {

        return BaseView.extend({
            moduleId: module.id,
            className: "clearfix",

            events: {
            'click .close-row': "onCloseRow",
            'keypress .close-row': function(e) {
                    if (e.keyCode === 13) //ENTER
                        this.onCloseRow(e);
                }
            },

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.children.keyValueControl = new KeyValueControl({
                    model:this.model,
                    keyTextControlOptions: {
                        modelAttribute: 'vix.newSetting.key' + this.options.numRow
                    },
                    valueTextControlOptions: {
                        modelAttribute: 'vix.newSetting.value' + this.options.numRow
                    }
                });
            },

            onCloseRow: function(e) {
                var key = this.children.keyValueControl.getKey();
                this.children.keyValueControl.unsetKey();
                this.trigger("closeRow", this, key);
            },

            render: function() {
                // Detach children
                if (this.children.keyValueControl) {
                    this.children.keyValueControl.detach();
                }

                // Use template
                this.$el.html(this.compiledTemplate({}));

                // Attach children and render them
                this.children.keyValueControl.render().appendTo(this.$(".key-value-control-placeholder"));

                return this;
            },

            // TODO [JCS] Move the styling to a stylesheet
            template: '\
                <span class="key-value-control-placeholder" ></span>\
                <span tabindex="0" class="font-icon close-row">⊗</span>\
            '
        });

    });

