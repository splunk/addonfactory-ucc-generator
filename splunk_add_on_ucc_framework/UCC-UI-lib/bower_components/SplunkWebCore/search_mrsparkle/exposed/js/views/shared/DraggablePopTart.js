define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/PopTart',
        'jquery.ui.draggable',
        './DraggablePopTart.pcss'
    ],
    function(
        _,
        $,
        module,
        PopTart
        /* jquery ui draggable */
        /* component pcss */
    ){
        return PopTart.extend({
            moduleId: module.id,
            className: 'popdown-dialog popdown-dialog-draggable',

            initialize: function(options) {
                PopTart.prototype.initialize.call(this, options);

                this.listenTo(this, 'hide', function() {
                    // Before hiding, blur the focused element if it's inside the dialog to make
                    // sure any pending changes go through (SPL-110761).
                    var $activeElement = $(document.activeElement);
                    if ($.contains(this.el, $activeElement[0])) {
                        $activeElement.blur();
                    }
                });

                this._hasDragged = false;

                // Since we are applying the draggable plugin before the view is in the DOM,
                // we have to manually set the position to absolute or the plugin will
                // think it should be relative.
                this.$el.css('position', 'absolute').draggable({
                    addClasses: false,
                    handle: '.drag-handle',
                    opacity: 0.5,
                    containment: 'document',
                    start: function() {
                        this._hasDragged = true;
                    }.bind(this)
                });

                this.listenTo(this, 'shown', function() {
                    // Work-around for a bug in Firefox where the scroll offset of the html element is non-zero
                    // and throws off the draggable plugin's positioning algorithm (SPL-108350).
                    // This needs to be in the callback for the "shown" event because the PopTart might scroll
                    // the screen while showing as it determines its initial position.
                    // See also https://bugs.jqueryui.com/ticket/9315
                    this.$el.draggable('option', 'cursorAt', { top: $('html').scrollTop() });
                });
            },

            events: {
                'click .close': function(e) {
                    e.preventDefault();
                    this.hide();
                }
            },

            // The dialog should not reposition on window resize events if it has been dragged.
            onWindowResize: function() {
                if (this._hasDragged) {
                    return;
                }

                PopTart.prototype.onWindowResize.apply(this, arguments);
            },

            template: '\
                <div class="popdown-dialog-body">\
                    <div class="drag-handle">\
                        <a href="#" class="close"></a>\
                        <div class="handle-inner"></div>\
                    </div>\
                </div>\
            '
        });
    }
);
