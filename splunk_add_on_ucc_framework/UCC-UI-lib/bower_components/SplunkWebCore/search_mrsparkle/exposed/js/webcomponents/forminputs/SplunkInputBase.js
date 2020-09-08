define([
    'jquery',
    'underscore',
    'backbone',
    'document-register-element' 
], function($, _, Backbone) {

    var InputBase = Object.create(HTMLDivElement.prototype);

    _.extend(InputBase, {

        createdCallback: function() {
            // Leading or trailing whitespace can confuse the wrapped Backbone views
            // that sub-classes will create, so remove it here.
            var $el = $(this);
            $el.html($.trim($el.html()));
            this.model = new Backbone.Model({ value: $(this).attr('value') });
        },

        attachedCallback: function() {
            var $el = $(this);
            this.model.on('change', function() {
                $el.attr('value', this.model.get('value'));
                $el.trigger('change');
            }, this);
        },

        detachedCallback: function() {
            this.model.off();
        },

        attributeChangedCallback: function(name, previousValue, value) {
            if (name === 'value') {
                this.model.set({ value: value });
            }
        }

    });

    return InputBase;
    
});