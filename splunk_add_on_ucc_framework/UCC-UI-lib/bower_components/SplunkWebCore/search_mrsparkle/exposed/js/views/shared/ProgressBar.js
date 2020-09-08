define(
    [
        'underscore',
        'module',
        'views/Base',
        'splunk.util',
        './ProgressBar.pcss',
        'bootstrap.tooltip'
    ], function(_, module, Base, splunkUtil, css /* bootstrap tooltip */) {
        return Base.extend({
            moduleId: module.id,
            className: 'progress-bar',
            tagName: 'div',
            initialize: function() {
                var defaults = {
                  frameCount: 28,
                  maxStep: 3,
                  fps: 12,
                  animateRealTime: true
                };
                _.defaults(this.options, defaults);

                Base.prototype.initialize.apply(this, arguments);

                this.frame = 0;
                this.percentage = 0;
                this.targetPercentage = 0;
                this.lastStep = 0;
                this.animating = false;
                this.activate({skipRender: true});
            },
            startListening: function() {
                this.listenTo(this.model, 'sync', this.render);
                this.listenTo(this.model.entry.content, 'change', this.render);
                this.listenTo(this.model, 'change:id', this.render);
            },
            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }

                options = options || {};

                if (this.animating) {
                    return Base.prototype.activate.apply(this, arguments);
                }

                if (!options.skipRender) {
                    this.render();
                }

                return Base.prototype.activate.apply(this, arguments);
            },
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }

                if (!this.animating) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }

                Base.prototype.deactivate.apply(this, arguments);
                this.stop();
                return this;
            },
            stop:  function() {
                this.animating = false;
                this.interval && window.clearInterval(this.interval);
                this.$el.hide();
                this.step();
                return this;
            },
            start:  function() {
                this.targetPercentage = 0;
                this.animating = true;
                this.$el.show();
                this.interval && window.clearInterval(this.interval);
                this.interval = setInterval(this.step.bind(this), 1000/this.options.fps);
                return this;
            },
            step:  function() {
                var frame= this.frame < this.options.frameCount/2 ? this.frame : this.options.frameCount - this.frame;
                var opacity = Math.min(1.0, frame/(this.options.frameCount/2) * 1.1);

                //Pulse
                this.$progressCursor.css({opacity: opacity, filter: 'alpha(opacity=' + (opacity * 100) + ')'});

                //Grow
                if (this.targetPercentage != this.percentage && this.targetPercentage == 0) {
                    this.percentage = 0;
                    this.$('.progress-animation').css('width', '0%');
                } else if (this.targetPercentage != this.percentage) {
                    var distance = this.targetPercentage - this.percentage;
                    var move = distance > this.options.maxStep + this.lastStep ? this.options.maxStep + this.lastStep : distance;
                    this.percentage += move;
                    this.lastStep = move;
                    this.$('.progress-animation').css('width', this.percentage + '%');
                } else {
                    this.lastStep = 0;
                }

                this.frame++;
                this.frame = this.frame == this.options.frameCount ? 0 : this.frame;

                return this;
            },
            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.html(this.compiledTemplate({
                        _: _
                    }));
                    this.$progressAnimation = this.$('.progress-animation');
                    this.$progressCursor = this.$('.progress-cursor');
                }

                if (this.model.isNew()) {
                    if (this.animating) {
                        this.stop();
                    }
                    this.$el.hide();
                    return this;
                }

                var doneProgress = this.model.entry.content.get('doneProgress') || 0;
                this.targetPercentage = (doneProgress * 100.0).toFixed(1);

                var isRealTime = this.model.entry.content.get("isRealTimeSearch");
                if ((this.model.isRunning() || this.model.isParsing() || this.model.isFinalizing())  && !(isRealTime && this.percentage == 100 && !this.options.animateRealTime)) {

                    var tooltipVisible = this.$progressAnimation.next(".tooltip:visible").length;

                    if (tooltipVisible) {
                        this.$progressAnimation.tooltip('hide');
                    }

                    this.$progressAnimation.data('tooltip', false);
                    if (isRealTime && this.targetPercentage == 100) {
                        this.$el.addClass('real-time');
                        this.$progressAnimation.tooltip({animation:false, title:_('Updating in Real-time.').t()});
                    } else {
                        this.$el.removeClass('real-time');
                        this.$progressAnimation.tooltip({animation:false, title:splunkUtil.sprintf(_('%s%% of the time range scanned.').t(), this.targetPercentage)});
                    }

                    if (tooltipVisible) {
                        this.$progressAnimation.tooltip('show');
                    }

                    if (!this.animating) {
                        this.start();
                        this.$('.progress-animation').show();
                    }
                } else {
                    if (this.animating) {
                        this.stop();
                    }
                    this.$el.show().children().hide();
                }

                return this;
            },
            template: '\
                    <div class="progress-animation" tabindex="0"><div class="progress-cursor"></div></div>\
            '
        });
    }
);
