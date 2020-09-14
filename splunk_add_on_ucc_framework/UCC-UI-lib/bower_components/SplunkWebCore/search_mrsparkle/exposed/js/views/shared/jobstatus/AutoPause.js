define(
    [
        'underscore',
        'module',
        'views/Base',
        'util/splunkd_utils',
        'splunk.util',
        'splunk.i18n'
    ],
    function(
        _,
        module,
        Base,
        splunkd_utils,
        splunkUtil,
        i18n
    ){
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.searchJob.entry.content, "change:isDone change:isPaused", this.debouncedRender);
                this.listenTo(this.model.searchJob, "sync", this.render);
            },
            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }

                this.autoPauseInterval = parseInt(this.model.searchJob.entry.content.runtime.get("auto_pause"), 10) * 1000;
                this.autoPauseStartTime = new Date();

                return Base.prototype.activate.apply(this, arguments);
            },
            events: {
                'click a.auto-pause-cancel': function(e) {
                    e.preventDefault();
                    
                    this.model.searchJob.saveJob({
                        data: {
                            auto_pause: 0
                        },
                        success: function(model, response) {
                            this.remove();
                        }.bind(this)
                    });
                }
            },
            render: function() {
              if (this.model.searchJob.isNew() || this.model.searchJob.isDone() || this.model.searchJob.entry.content.get('isPaused') || parseInt(this.model.searchJob.entry.content.runtime.get('auto_pause'), 10) === 0) {
                  this.$el.hide();
                  this.remove();
              } else {
                  var elapsedTime = parseInt((new Date()) - this.autoPauseStartTime, 10);
                  var timeRemaining = Math.round((this.autoPauseInterval - elapsedTime) / 1000);

                  if(timeRemaining < 1) {
                      this.model.searchJob.pause();
                      timeRemaining = 0;
                      this.$el.hide();
                      this.remove();
                      return this;
                  }
                  
                  var template = this.compiledTemplate({
                      _: _,
                      i18n: i18n,
                      splunkUtil: splunkUtil,
                      timeRemaining: timeRemaining
                  });
                  
                  this.el.innerHTML = template;                  
              }
              
              return this;
            },
            template: '\
                <div class="alert alert-warning">\
                    <i class="icon-alert"></i>\
                    <%- splunkUtil.sprintf(i18n.ungettext("Your search will automatically pause in %s second.", "Your search will automatically pause in %s seconds.", timeRemaining), timeRemaining) %>\
                    <a href="#" class="auto-pause-cancel"><%- _("Do not pause").t() %></a>\
                </div>\
            '
        });
    }
);
