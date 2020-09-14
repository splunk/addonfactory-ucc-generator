define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/CheckboxGroup',
        'views/shared/controls/TextControl',
        'uri/route',
        'views/shared/apps_remote/paging/Master',
        'views/shared/apps_remote/ResultsPane',
        'views/shared/apps_remote/FilterBar',
        './Master.pcss'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        ControlGroup,
        CheckboxGroupControl,
        TextControl,
        route,
        Paginator,
        ResultsPane,
        FilterBar,
        css
        ){

        return BaseView.extend({
            moduleId: module.id,

            ERROR_HASH: {
                'cim_version - invalid query field' : _('Invalid filter').t(),
                'relevance - not valid option(s) for order without a search keyword (query)' : _('Cannot sort by Best Match without a search string').t(),
                'Error resolving: nodename nor servname provided, or not known': _('Error connecting to server').t()
            },

            initialize: function () {
                BaseView.prototype.initialize.apply(this, arguments);
                this.hideDock = !_.isUndefined(this.options.hideDock) ? this.options.hideDock : false;

                var _FilterBar = this.options.filterBarClass || FilterBar;
                this.children.filterBar = new _FilterBar({
                    model: {
                        metadata: this.model.metadata
                    },

                    collection: {
                        options: this.collection.options
                    },

                    hideDock: this.hideDock
                });

                var _ResultsPane = this.options.resultsPaneClass || ResultsPane;
                this.children.resultsPane = new _ResultsPane({
                    model: this.model,
                    collection: this.collection,
                    hideDock: this.hideDock
                });

                this.collection.appsRemote.error.on('change', this.render, this);
            },

            _handleErrors: function() {
                this.$('.alert-error').append('<i class="icon-alert"></i>&nbsp;</div>');

                var errors = this.collection.appsRemote.error.get('errors'),
                    err = '';
                for (var i = 0; i < errors.length; i++) {
                    err = this.ERROR_HASH[errors[i]] || errors[i];
                    this.$('.alert-error').append(err);
                }
                this.collection.appsRemote.paging.set({'total': 0});
            },

            render: function () {
                this.$el.html(this.compiledTemplate());
                if(this.collection.appsRemote.error.get('status')) {
                    this._handleErrors();
                } else {
                    this.$('.alert-error').hide();
                    this.children.filterBar.render().appendTo(this.$('.content-area'));
                    this.children.resultsPane.render().appendTo(this.$('.content-area'));
                }
                return this;
            },

            template: ' \
				<div class="section-padded section-header"> \
                <h2 class="section-title"><%- _("Browse More Apps").t() %></h2> \
				</div> \
				<div class="content-area"> \
				</div> \
                <div class="alert alert-error"></div> \
            '
        });
    });
