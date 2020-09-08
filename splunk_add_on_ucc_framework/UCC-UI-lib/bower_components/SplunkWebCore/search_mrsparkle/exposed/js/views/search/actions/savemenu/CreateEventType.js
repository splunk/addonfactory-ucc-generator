define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/search/actions/eventtype/Master'
    ],
    function($, _, module, Base, EventTypeDialog) {
        return Base.extend({
            moduleId: module.id,
            className: 'create-event-type',
            tagName: 'li',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click a:not(.disabled)': function(e) {
                    this.children.eventTypeDialog = new EventTypeDialog({
                        model: {
                            application: this.model.application,
                            report: this.model.report,
                            user: this.model.user
                        },
                        onHiddenRemove: true
                    });

                    this.children.eventTypeDialog.render().appendTo($('body')).show();
                                        
                    e.preventDefault();
                },
                'click a.disabled': function(e) {
                    e.preventDefault();
                }
            },
             render: function() {
                var disableLink = !this.model.searchJob.searchCanBeEventType();
                this.$el.html(this.compiledTemplate({
                    _: _,
                    disableLink: disableLink
                }));

                if (disableLink) {
                    this.$el.tooltip({animation:false, container: this.$el, placement:'left', title:_('You cannot base an event type on a search that includes a pipe operator or a subsearch.').t()});
                }
                return this;
            },
            template: '\
                <a href="#" <% if (disableLink) {%>class="disabled"<% } %> ><%- _("Event Type").t() %></a>\
            '
        });
    }
);
