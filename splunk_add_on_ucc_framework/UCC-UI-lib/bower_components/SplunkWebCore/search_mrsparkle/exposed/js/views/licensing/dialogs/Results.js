define(
    [
        'module',
        'underscore',
        'views/Base',
        'contrib/text!views/licensing/dialogs/Results.html'
    ],
    function(
        module,
        _,
        BaseView,
        ResultsTemplate
    ) {
        return BaseView.extend({
            template: ResultsTemplate,
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.fileName = null;
                if (this.options.fileName && (this.options.fileName.trim().length > 0)) {
                    this.fileName = this.options.fileName.trim();
                }
            },
            
            render: function() {
                var html = this.compiledTemplate({
                    _: _,
                    fileName : this.fileName,
                    descriptionText : this.options.descriptionText,
                    learnMoreLink : this.options.learnMoreLink
                });
                this.$el.html(html);
                return this;
            }
        });
    }
);