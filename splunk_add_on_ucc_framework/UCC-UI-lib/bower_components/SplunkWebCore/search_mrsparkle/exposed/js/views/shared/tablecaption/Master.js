define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/CollectionPaginator',
        'views/shared/CollectionCount',
        'views/shared/controls/ControlGroup',
        'views/shared/FindInput',
        'views/shared/delegates/Dock'
    ],
    function(
        _,
        module,
        BaseView,
        PaginatorView,
        CountView,
        ControlGroup,
        InputView,
        Dock
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'div',
            className: 'table-caption',
            /**
             * @param {Object} options {
             *     countLabel: <String> The count vanity label
             *     model: {
             *         state: <models.State>,
             *         uiPrefs: <models.services.admin.UIPrefs>
             *         rawSearch: <models.Base> (Optional)
             *     }, 
             *     collection: <collections.services.SavedSearches>
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.count = new CountView({
                    countLabel: this.options.countLabel,
                    model: this.model.state,
                    collection: this.collection,
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
                        controlOptions: {
                            modelAttribute: 'display.prefs.aclFilter',
                            model: this.model.uiPrefs.entry.content,
                            items: filterButtons
                         }
                    });
                }

                this.children.paginatorView = new PaginatorView({
                    collection: this.collection,
                    model: this.model.state
                });

                if(!this.options.noFilter){
                    this.children.input = new InputView({
                        model: this.model.state,
                        rawSearch: this.model.rawSearch,
                        key: this.options.filterKey
                    });
                }

                if (this.options.showListModeButtons) {
                    this.children.listModeButtons = new ControlGroup({
                        controlType: 'SyntheticRadio',
                        controlOptions: {
                            modelAttribute: 'display.prefs.listMode',
                            model: this.model.uiPrefs.entry.content,
                            items: [
                                { icon: 'tiles', iconSize: 'icon-small', tooltip: _('Tiles').t(), value: 'tiles' },
                                { icon: 'rows', iconSize: 'icon-small', tooltip: _('Table').t(), value: 'table' }
                            ]
                        }
                    });
                }
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
                if(!this.options.noFilter){
                     this.children.input.render().appendTo($tableCaptionInner);
                }

                if (!this.options.noDock) {
                    this.children.tableDock = new Dock({ el: this.el, affix: '.table-caption-inner' });
                }
                
                return this;
            },
            template: '\
                <div class="table-caption-inner"></div>\
            '
        });
    }
);
