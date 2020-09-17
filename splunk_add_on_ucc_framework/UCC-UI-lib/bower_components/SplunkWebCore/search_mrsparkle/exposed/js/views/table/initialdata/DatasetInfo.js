define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/datasetcontrols/details/Master',
        'views/shared/PopTart',
        'splunk.i18n'
    ],
    function(
        $,
        _,
        module,
        DetailsView,
        PopTartView,
        i18n
    ) {
        return PopTartView.extend({
            moduleId: module.id,
            className: 'popdown-dialog initial-data-datasetinfo',

            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);

                this.children.detailsView = new DetailsView({
                    model: {
                        dataset: this.model.dataset,
                        application: this.model.application,
                        searchJob: this.model.searchJob,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        roles: this.collection.roles
                    },
                    showLinks: false,
                    numFieldsToShow: 10,
                    showTotal: true
                });
            },

            events: $.extend({}, PopTartView.prototype.events, {
                'mouseleave': function(e) {
                    this.hide(e);
                    e.preventDefault();
                }
            }),

            render: function() {
                this.$el.html(PopTartView.prototype.template);
                this.children.detailsView.render().appendTo(this.$el);
                this.$('dl.list-dotted').prepend(_.template(this.compiledTemplate({
                    _: _,
                    description: this.model.dataset.getDescription()
                })));

                return this;
            },

            template: '\
                <% if ( description ) {%>\
                    <dt class="type"><%- _("Description").t() %></dt>\
                            <dd class="type"><%- description %></dd>\
                 <% } %>\
            '
        });
    }
);
