define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'splunk.util'
    ],
    function($, _, module, Base, splunkUtil){
        return Base.extend({
            moduleId: module.id,
            className: 'regenerate',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click .refresh': function(e) {
                    e.preventDefault();
                    this.model.patternJob.trigger('restart');
                    this.render();
                }
            },
            startListening: function() {
                this.listenTo(this.model.searchJob.entry.content, 'change:eventCount', this.render);
                this.listenTo(this.model.patternJob, 'done', function() {
                    this.showRefreshLink = false;
                    this.render();  
                });
            },
            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }

                delete this.showRefreshLink;
                this.render();

                return Base.prototype.activate.apply(this, arguments);
            },
            render: function() {
                var showRefreshLink = this.model.searchJob.entry.content.get('eventCount') > this.model.patternJob.getParentEventCount();
                if (showRefreshLink !== this.showRefreshLink) {
                    this.showRefreshLink = showRefreshLink;
                    this.$el.html(this.compiledTemplate({
                        _: _,
                        splunkUtil: splunkUtil,
                        showRefreshLink: this.showRefreshLink,
                        isDone: this.model.patternJob.isDone()
                    }));
                }
            },
            template: '\
                <% if (showRefreshLink) { %>\
                    <div class="alert alert-warning">\
                        <i class="icon-alert icon-warning"></i>\
                        <% if (isDone) { %>\
                            <%= splunkUtil.sprintf(_("These patterns were generated before the search completed. %s Regenerating with latest events %s may provide improved results.").t(), \'<a href="#" class="refresh">\', "</a>") %>\
                        <% } else { %>\
                            <%= splunkUtil.sprintf(_("These patterns will be generated before the search completed. %s Regenerating with latest events %s may provide improved results.").t(), \'<a href="#" class="refresh">\', "</a>") %>\
                        <% } %>\
                    </div>\
                <% } %>\
            '
        });
    }
);