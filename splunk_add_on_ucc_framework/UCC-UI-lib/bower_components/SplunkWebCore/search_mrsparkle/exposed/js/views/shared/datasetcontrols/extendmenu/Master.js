define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/datasetcontrols/clone/Master',
        './Master.pcss',
        'uri/route'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        CloneDialog,
        css,
        route
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'dataset-extend-menu',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            
            events: {
                'click a.clone': function(e) {
                    this.children.cloneDialog = new CloneDialog({
                        model: {
                            dataset: this.model.dataset,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo,
                            application: this.model.application
                        },
                        onHiddenRemove: true,
                        nameLabel: this.model.dataset.getDatasetDisplayType()
                    });

                    this.children.cloneDialog.render().appendTo($("body"));
                    this.children.cloneDialog.show();
                    e.preventDefault();
                }
            },

            render: function() {
                var datasetName = this.model.dataset.getFromName(),
                    fromType = this.model.dataset.getFromType(),
                    fromQuery = '| from ' + fromType + ':"' + datasetName + '"',
                    selectedFieldsString = this.model.dataset.getSelectedFieldsString(),
                    
                    extendPivotLink = route.pivot(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        { data: {
                            dataset: datasetName,
                            type: fromType
                        }}),

                    appName = this.model.dataset.entry.acl.get('app'),
                    datasetApp = _.find(this.collection.apps.models, function (app) {
                        return app.entry.get('name') === appName;
                    }),
                    app = datasetApp && datasetApp.entry.content.get("visible") ? appName : this.options.alternateApp,
                    openInApp = this.model.application.get("app"),
                    searchLinkData = {
                        q: fromQuery
                    },
                    extendSearchLink;

                if (openInApp === "system") {
                    openInApp = app;
                }
                
                if (selectedFieldsString) {
                    searchLinkData['display.events.fields'] = selectedFieldsString;
                }

                extendSearchLink = route.search(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    openInApp,
                    {
                        data: searchLinkData
                    });

                this.$el.html(this.compiledTemplate({
                    canClone: this.model.dataset.canClone(),
                    canSearch: this.model.dataset.canSearch(),
                    searchLink: extendSearchLink,
                    canPivot: this.model.dataset.canPivot(),
                    pivotLink: extendPivotLink
                }));

                if (this.options.displayAsButtons) {
                    this.$el.addClass('btn-group');
                    this.$('div').addClass('btn-combo');
                    this.$('a').addClass('btn');
                }
                
                return this;
            },

            template: '\
                <% if (canPivot) { %>\
                    <div>\
                        <a href="<%= pivotLink %>"><%- _("Pivot").t() %></a>\
                    </div>\
                <% } %>\
                <% if (canSearch) { %>\
                    <div>\
                        <a href="<%= searchLink %>"><%- _("Explore in Search").t() %></a>\
                    </div>\
                <% } %>\
                <% if (canClone) { %>\
                    <div>\
                        <a href="#" class="clone"><%- _("Clone").t() %></a>\
                    </div>\
                <% } %>\
            '
        });
    }
);

