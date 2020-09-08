define(
    [
        'underscore',
        'module',
        'views/Base',
        'splunk.i18n'
    ],
    function(_, module, Base, i18n) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'span',
            className: 'pull-left',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            startListening: function() {
                this.listenTo(this.model.searchJob.entry.content, 'change:isPreviewEnabled change:resultCount change:resultPreviewCount', this.debouncedRender);
            },
            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }

                Base.prototype.activate.apply(this, arguments);
                this.render();
                return this;
            },
            render: function() {
                var resultCount = this.model.searchJob.entry.content.get('isPreviewEnabled') ? this.model.searchJob.entry.content.get('resultPreviewCount') : this.model.searchJob.entry.content.get('resultCount');
                this.$el.html(i18n.format_decimal(resultCount) + i18n.ungettext(_(' result').t(), _(' results').t(), resultCount));
            }
        });
    }
);