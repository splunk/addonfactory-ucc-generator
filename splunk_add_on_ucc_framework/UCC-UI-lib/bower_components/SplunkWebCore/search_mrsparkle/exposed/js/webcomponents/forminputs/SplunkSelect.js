define([
    'jquery',
    'underscore',
    'backbone',
    './SplunkInputBase',
    'views/shared/controls/SyntheticSelectControl'
], function($, _, Backbone, InputBase, SyntheticSelectControl) {

    var SplunkSelectElement = Object.create(InputBase, {

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
                this.view = new SyntheticSelectControl({
                    el: this,
                    model: this.model,
                    modelAttribute: 'value',
                    items: this.items,
                    toggleClassName: 'btn'
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

    return document.registerElement('splunk-select', {prototype: SplunkSelectElement});

});