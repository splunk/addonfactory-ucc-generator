define(['underscore', 'module', 'views/Base', './Master.pcssm'], function(_, module, BaseView, css) {


    return BaseView.extend({
        moduleId: module.id,
        useLocalClassNames: false,
        constructor: function(options) {
            _.extend(this, _.pick(options || {}, 'useLocalClassNames'));

            if (this.useLocalClassNames && this.css === undefined) {
                this.css = css;
            }

            BaseView.apply(this, arguments);
        },
        initialize: function(){
            BaseView.prototype.initialize.apply(this, arguments);

            var defaults = {
              size: 'small',
              color: 'gray',
              frameWidth: 14, //px
              frameCount: 8,
              fps: 10
            };

            _.defaults(this.options, defaults);

            if (this.useLocalClassNames) {
                this.$el.attr('class', this.css[this.options.size + this.options.color]);
            } else {
                this.$el.addClass('spinner-' + this.options.size + '-' + this.options.color);
            }

            this.frame=0;
        },
        stop:  function() {
            this.active=false;
            this.interval && window.clearInterval(this.interval);
            return this;
        },
        start:  function() {
            this.active=true;
            this.interval && window.clearInterval(this.interval);
            this.interval=setInterval(this.step.bind(this), 1000/this.options.fps);
            return this;
        },
        step:  function() {
            this.$el.css('backgroundPosition', '-' + (this.frame * this.options.frameWidth) + 'px top ');

            this.frame++;
            this.frame = this.frame == this.options.frameCount ? 0 : this.frame;

            return this;
        },
        remove: function() {
            this.stop();
            BaseView.prototype.remove.apply(this, arguments);
        },
        render: function() {
            return this;
        }
    });
});
