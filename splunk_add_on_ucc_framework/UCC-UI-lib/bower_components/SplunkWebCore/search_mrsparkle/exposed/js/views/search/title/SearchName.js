define(
    [
        'underscore',
        'module',
        'views/Base'
    ],
    function(_, module, Base){
        return Base.extend({
            moduleId: module.id,
            tagName: 'h2',
            className: "search-name section-title",
            /**
             * @param {Object} options {
             *     model: {
             *         searchJob: <helpers.ModelProxy>,
             *         report: <models.services.SavedSearch>
             *     }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.report.entry.content, 'change:name', this.render);
            },
            render: function() {
                var activeSearchName = this.model.report.entry.get('name');
                var searchName = _('Search').t();
                var iconClass = 'icon-search-thin';

                if (activeSearchName && activeSearchName !== "_new") {
                    searchName = activeSearchName;
                    if (this.model.reportPristine.isAlert()) {
                        iconClass = 'icon-bell';
                    } else {
                        iconClass = 'icon-report';
                    }
                } else if (!this.model.searchJob.isNew() || (this.model.report.entry.content.get("search"))) {
                    searchName = _('New Search').t();
                }
                this.$el.attr('title', searchName);
                var template = this.compiledTemplate({
                    searchName: searchName,
                    iconClass: iconClass
                });
                this.$el.html(template);
            },
            template: '\
                <i class="<%= iconClass %>"></i> <%- searchName %>\
            '
        });
    }
);