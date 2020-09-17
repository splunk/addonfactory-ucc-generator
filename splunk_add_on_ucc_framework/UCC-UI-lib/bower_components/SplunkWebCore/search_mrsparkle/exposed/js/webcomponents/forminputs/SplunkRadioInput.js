define([
    'jquery',
    'underscore',
    'backbone',
    './SplunkInputBase',
    'views/shared/controls/SyntheticRadioControl'
], function($, _, Backbone, InputBase, SyntheticRadioControl) {

    var SplunkRadioElement = Object.create(InputBase, {

        createdCallback: {
            value: function() {
                InputBase.createdCallback.apply(this, arguments);
                this.items = _($(this).find('option')).map(function(el) {
                    return ({
                        label: $(el).text(),
                        value: $(el).attr('value')
                    });
                });
            }
        },

        attachedCallback: {
            value: function() {
                InputBase.attachedCallback.apply(this, arguments);
                $(this).empty();
                this.view = new SyntheticRadioControl({
                    el: this,
                    model: this.model,
                    modelAttribute: 'value',
                    items: this.items,
                    additionalClassNames: 'btn-group btn-group-radio shared-controls-syntheticradiocontrol'
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

    return document.registerElement('splunk-radio-input', {prototype: SplunkRadioElement});

});