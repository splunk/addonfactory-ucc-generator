define([
    'module',
    'jquery',
    'underscore',
    './TitleEditor'
], function(module,
            $,
            _,
            TitleEditor) {
    
    var DescriptionEditor = TitleEditor.extend({
        moduleId: module.id,
        attribute: "description",
        className: 'title-editor description-editor',
        tagName: 'textarea',
        initialize: function(options) {
            TitleEditor.prototype.initialize.apply(this, arguments);
            this.placeholder = options.placeholder || _('No description').t();
        }
    });

    return DescriptionEditor;
});