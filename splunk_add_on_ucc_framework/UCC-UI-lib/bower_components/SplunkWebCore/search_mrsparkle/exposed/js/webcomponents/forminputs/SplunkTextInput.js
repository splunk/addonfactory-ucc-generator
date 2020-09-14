define([
    'jquery',
    'underscore',
    'backbone',
    './SplunkInputBase',
    'views/shared/controls/TextControl'
], function($, _, Backbone, InputBase, TextControl) {

    var SplunkTextInputElement = Object.create(InputBase, {

        createdCallback: {
            value: function() {
                InputBase.createdCallback.apply(this, arguments);
            }
        },

        attachedCallback: {
            value: function() {
                InputBase.attachedCallback.apply(this, arguments);

                // Assume input base has set up the model
                this.view = new TextControl({
                    el: this,
                    model: this.model,
                    modelAttribute: 'value'
                });
                this.view.render();
            }
        },

        detachedCallback: {
            value: function() {
                InputBase.detachedCallback.apply(this, arguments);

                if (this.view) {
                    this.view.remove();
                }
            }
        }

    });

    return document.registerElement('splunk-text-input', {prototype: SplunkTextInputElement});

});
