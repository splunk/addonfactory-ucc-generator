define([
    'jquery',
    'underscore',
    'backbone',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/Control',
    'document-register-element'
], function($, _, Backbone, ControlGroup, Control) {

    var EmptyControl = Control.extend({});

    var SplunkControlGroup = Object.create(HTMLDivElement.prototype);

    _.extend(SplunkControlGroup, {

        createdCallback: function() {
            var $el = $(this);
            $el.html($.trim($el.html()));
        },
        
        attachedCallback: function() {
            var $el = $(this);

            // Get the inner html that will be moved under the control group and empty
            if(!this.htmlToRender) {
                this.htmlToRender = $el.html();
                $el.empty();
            }

            // Get the label and layout
            var layout = $(this).attr('layout');
            var label = $(this).attr('label');
            var helpText = $(this).attr('help');
                            
            this.view = new ControlGroup({
                el: this,
                controlType: 'Empty',
                controlTypes: {
                    'Empty': EmptyControl
                },
                label: label,
                help: helpText
            });
            this.view.render();

            $el.addClass('control-group');

            // Add the original html under the controls div
            $el.find('.controls').append(this.htmlToRender);

            // Move the help block back to the end
            if (helpText) {
                $el.find('.controls').append($el.find('.help-block')); 
            }
        },

        detachedCallback: function() {    
            if (this.view) {
                this.view.remove();
            }
        }

    });

    return document.registerElement('splunk-control-group', {prototype: SplunkControlGroup});

});
