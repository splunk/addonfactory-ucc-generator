define(function(require, exports, module) {

    var Class = require("jg/Class");
    var Element = require("splunk/display/Element");

    require("./EditorRemoveButton.pcss");

    return Class(module.id, Element, function(EditorRemoveButton, base) {

        // Private Static Methods

        var _preventDefault = function(e) {
            e.preventDefault();
        };

        // Constructor

        this.constructor = function() {
            base.constructor.call(this, 'a');

            this.addClass('btn-link');

            var icon = document.createElement('i');
            icon.className = 'icon-x-circle';
            this.element.href = '#';
            this.element.appendChild(icon);

            this.on("click", _preventDefault, this, Infinity);
        };

    });

});
