define([
    'module',
    'jquery',
    'underscore',
    'views/shared/databind/HtmlFormDialog'
], function(module,
            $,
            _,
            HtmlFormDialog) {

    return HtmlFormDialog.extend({
        moduleId: module.id,
        className: 'splunk-custom-formatter',
        attributePrefix: 'display.visualizations.custom.',
        getEntityReference: function() {
            var vizType = this.model.target.get('display.visualizations.type');
            var vizName = vizType === 'custom' ? this.model.target.get('display.visualizations.custom.type') : vizType;
            return 'visualization: ' + vizName;
        },
        renderContentHtml: function() {
            HtmlFormDialog.prototype.renderContentHtml.apply(this, arguments);
            this.$('form').addClass('form form-horizontal').attr('data-form-id', this.options.sectionId);
        }
    });

});
