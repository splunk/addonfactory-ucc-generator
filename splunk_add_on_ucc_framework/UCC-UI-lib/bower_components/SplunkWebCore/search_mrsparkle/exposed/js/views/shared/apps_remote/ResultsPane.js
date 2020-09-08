define(
    [
        'jquery',
        'module',
        'views/Base',
        'views/shared/waitspinner/Master',
        'views/shared/apps_remote/paging/Master',
        'views/shared/apps_remote/apps/Master',
        'views/shared/apps_remote/SortFilter',
        'views/shared/delegates/Dock'
    ],
    function(
        $,
        module,
        BaseView,
        WaitSpinner,
        Paginator,
        AppsBoxView,
        SortFilter,
		Dock
        ){
        return BaseView.extend({
            moduleId: module.id,
            className: 'results-pane',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.hideDock = this.options.hideDock;

                var _AppsBoxView = this.options.appsBoxViewClass || AppsBoxView;
                this.children.appsBox = new _AppsBoxView({
                    model: this.model,
                    collection: this.collection
                });

                this.children.paginator = new Paginator({
                    model: this.model.metadata,
                    collection: this.collection.appsRemote
                });

                var _SortFilter = this.options.sortFilterClass || SortFilter;
                this.children.sortFilter = new _SortFilter({
                    model: this.model.metadata
                });

                this.children.waitSpinner = new WaitSpinner();

                this.collection.appsRemote.on('request', function() {
                    this.children.waitSpinner.start();
                    this.children.waitSpinner.$el.show();
                    this.children.appsBox.$el.hide();
                    this.children.paginator.$el.hide();
                }, this);

                this.collection.appsRemote.on('sync', function() {
                    this.children.waitSpinner.stop();
                    this.children.waitSpinner.$el.hide();
                    this.children.appsBox.$el.show();
                    this.children.paginator.$el.show();
                }, this);

                this.collection.appsRemote.on('error', function() {
                    this.children.waitSpinner.stop();
                    this.children.waitSpinner.$el.hide();
                    this.children.appsBox.$el.show();
                }, this);
            },

            render: function() {
                this.$el.html(this.compiledTemplate());
                this.children.waitSpinner.render().appendTo(this.$el);
                this.children.sortFilter.render().appendTo(this.$('.results-control-bar-inner'));
                this.children.paginator.render().appendTo(this.$('.results-control-bar-inner'));
                this.children.appsBox.render().appendTo(this.$el);

                if (!this.hideDock) {
                    this.children.tableDock = new Dock({
                        el: this.$('.results-control-bar')[0],
                        affix: '.results-control-bar-inner'
                    });
                }
            },

            template: '\
				<div class="results-control-bar"> \
    				<div class="results-control-bar-inner"> \
    				</div> \
				</div>'
        });
    });
