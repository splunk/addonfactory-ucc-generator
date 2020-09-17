define(
    [
        'underscore',
        'module',
        'views/shared/PopTart',
        'splunk.i18n'
    ],
    function(
        _,
        module,
        PopTartView,
        i18n
        )
    {
        return PopTartView.extend({
            moduleId: module.id,
            initialize: function(options) {
                PopTartView.prototype.initialize.apply(this, arguments);
                this.$content = options.$content;
            },
            render: function() {
                PopTartView.prototype.render.apply(this, arguments);
                this.$('.popdown-dialog-body').append(this.$content);
                return this;
            }
        });
    }
);
