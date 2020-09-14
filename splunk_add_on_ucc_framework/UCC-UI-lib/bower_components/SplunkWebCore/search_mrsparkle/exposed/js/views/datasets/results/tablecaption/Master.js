define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/CollectionCount',
        'views/shared/FindInput',
        'views/shared/CollectionPaginator',
        'views/shared/controls/ControlGroup',
        'views/shared/delegates/Dock'
    ],
    function(
        _,
        module,
        BaseView,
        CountView,
        InputView,
        PaginatorView,
        ControlGroup,
        Dock
    ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'div',
            className: 'table-caption shared-tablecaption',

            /**
             * @param {Object} options {
             *      model: {
             *          state: <Backbone.Model>
             *          application: <models.Application>,
             *          uiPrefs: <models.services.admin.UIPrefs>
             *          user: <models.services.authentication.User>
             *          serverInfo: <models.services.server.ServerInfo>
             *          rawSearch: <Backbone.Model>
             *      }
             *      collection: {
             *          datasets: <collections.Datasets>,
             *          roles: <collections.services.authorization.Roles>
             *      }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.count = new CountView({
                    model: this.model.state,
                    collection: this.collection.datasets,
                    className: 'shared-tablecaption-count',
                    countLabel: _('Datasets').t(),
                    tagName: 'h3'
                });

                if (!this.options.noFilterButtons) {
                    var filterButtons = [];
                    if (this.model.application.get('app') === 'system') {
                        filterButtons = [
                            { label: _('All').t(), value: 'none' },
                            { label: _('Yours').t(), value: 'owner' }
                        ];
                    } else {
                        filterButtons = [
                            { label: _('All').t(), value: 'none' },
                            { label: _('Yours').t(), value: 'owner' },
                            { label: _('This App\'s').t(), value: 'app' }
                        ];
                    }

                    if (this.model.serverInfo.isLite()) {
                        filterButtons.splice(2, 1);
                    }

                    this.children.filterButtons = new ControlGroup({
                        controlType: 'SyntheticRadio',
                        className: 'acl-filter-controls',
                        controlOptions: {
                            modelAttribute: 'display.prefs.aclFilter',
                            model: this.model.uiPrefs.entry.content,
                            items: filterButtons
                        }
                    });
                }

                if (!this.options.noFilter){
                    this.children.input = new InputView({
                        model: this.model.state,
                        rawSearch: this.model.rawSearch,
                        key: this.options.filterKey,
                        conditions: this.options.conditions,
                        // className: 'search-query-control shared-tablecaption-input',
                        placeholder: _("Filter by title, description, fields").t()
                    });
                }

                this.children.paginatorView = new PaginatorView({
                    collection: this.collection.datasets,
                    model: this.model.state
                });
                
            },

            render: function() {
                this.$el.append(this.template);
                var $tableCaptionInner = this.$('.table-caption-inner');
                this.children.count.render().appendTo($tableCaptionInner);
                this.children.paginatorView.render().appendTo($tableCaptionInner);

                if (this.children.listModeButtons) {
                    this.children.listModeButtons.render().appendTo($tableCaptionInner);
                }
                if (!this.options.noFilterButtons) {
                    this.children.filterButtons.render().appendTo($tableCaptionInner);
                }
                if (!this.options.noFilter) {
                    this.children.input.render().appendTo($tableCaptionInner);
                }

                this.children.tableDock = new Dock({ el: this.el, affix: '.table-caption-inner' });

                return this;
            },

            template: '\
                <div class="table-caption-inner"></div>\
            '
        });
    }
);
