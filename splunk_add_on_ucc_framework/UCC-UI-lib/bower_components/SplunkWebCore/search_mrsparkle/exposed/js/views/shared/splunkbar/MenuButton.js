define(
    [
        'module',
        'views/shared/Button',
        './MenuButton.pcssm',
        './MenuButtonLite.pcssm'
    ],
    function(
        module,
        Button,
        css,
        cssLite
    ){
        return Button.extend({
            moduleId: module.id,
            constructor: function(options) {
                var isLite = options.model  && options.model.serverInfo && options.model.serverInfo.isLite();
                this.css = isLite? cssLite : css;
                this.className = this.css.view;
                Button.apply(this, arguments);
            },
            initialize: function() {
                this.options.menu = true;
                this.options.action = 'toggle';
                Button.prototype.initialize.apply(this, arguments);
            },
            render: function() {
                Button.prototype.render.apply(this, arguments);
                this.options.truncateLongLabels && this.$('[data-role=label]').attr('class', this.css.truncateLabel);
                this.options.hideLabelsAtSmallScreenSizes && this.$('[data-role=label]').attr('class', this.css.optionalLabel);
                return this;
            }
        });
    });
