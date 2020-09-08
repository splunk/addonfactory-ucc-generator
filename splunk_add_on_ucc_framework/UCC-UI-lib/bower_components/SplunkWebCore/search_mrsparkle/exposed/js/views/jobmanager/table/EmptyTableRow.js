define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/waitspinner/Master'
    ],
    function(
        _,
        module,
        BaseView,
        WaitSpinner
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            initialize: function(options) {
                options = options || {};
                var defaults = {
                    cols: 1
                };
                _.defaults(options, defaults);
                BaseView.prototype.initialize.call(this, options);
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.state, 'change:fetching', this.render);
            },
            events: {
                'click .reload': function(e) {
                    e.preventDefault();
                    this.collection.jobs.trigger('refresh');
                }
            },
            render: function() {
                !this.children.spinner || this.children.spinner.$el.detach();
                var isFetching = this.model.state.get('fetching');
                this.$el.html(this.compiledTemplate({
                    fetching: isFetching,
                    cols: this.options.cols
                }));
                this.children.spinner = this.children.spinner || new WaitSpinner();
                this.children.spinner.prependTo(this.$('h2'));
                this.children.spinner.$el.css('display', [isFetching ? 'inline-block' : 'none']);
                this.children.spinner[isFetching ? 'start' : 'stop']();

                return this;
            },
            template: '\
                <td class="col-empty odd" colspan="<%= cols %>">\
                    <div>\
                    <% if (fetching) { %>\
                        <h2><%- _("Loading").t() %></h2>\
                    <% } else { %>\
                        <h2><%- _("There are no results that match the specified criteria.").t() %></h2>\
                        <p><a href="#" class="btn reload"><%- _("Reload Page").t() %></a></p>\
                    <% } %>\
                    </div>\
                </td>\
            '
        });
    }
);
