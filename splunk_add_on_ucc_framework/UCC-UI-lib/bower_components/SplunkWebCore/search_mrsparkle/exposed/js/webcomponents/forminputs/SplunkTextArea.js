define([
    'jquery',
    'underscore',
    'backbone',
    './SplunkInputBase',
    'views/shared/controls/TextareaControl'
], function($, _, Backbone, InputBase, TextAreaControl) {

    var SplunkTextAreaElement = Object.create(InputBase, {

        createdCallback: {
            value: function() {
                InputBase.createdCallback.apply(this, arguments);
            }
        },

        attachedCallback: {
            value: function() {
                InputBase.attachedCallback.apply(this, arguments);

                this.view = new TextAreaControl({
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

    return document.registerElement('splunk-text-area', {prototype: SplunkTextAreaElement});

});