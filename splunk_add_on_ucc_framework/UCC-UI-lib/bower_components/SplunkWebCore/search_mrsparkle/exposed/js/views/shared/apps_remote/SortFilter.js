define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/LinkList'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        LinkList
        ){
        return BaseView.extend({
            moduleId: module.id,

            initialize: function() {
                this.model.on('change:query', function(e) {
                    this.render();
                }, this);
                BaseView.prototype.initialize.apply(this, arguments);
            },

            render: function() {
                if ( this.children.sortSelect ) {
                    this.children.sortSelect.remove();
                    this.children.sortSelect = null;
                }
                this.$el.empty();
                
                this.children.sortSelect = new LinkList({
                    model: this.model,
                    modelAttribute: 'order',
                    items: this.getSortItems()
                });
                this.children.sortSelect.render().appendTo(this.$el);
            },

            getSortItems: function() {
                var sortItems = [];
                if ( this.model.get('query') ) {
                    this.model.set({'order': 'relevance'});
                    sortItems = [
                        {value: 'relevance', label: _('Best Match').t()},
                        {value: 'latest', label: _('Newest').t()},
                        {value: 'popular', label: _('Popular').t()}
                    ];
                } else {
                    this.model.set({'order': 'latest'});
                    sortItems = [
                        {value: 'latest', label: _('Newest').t()},
                        {value: 'popular', label: _('Popular').t()}
                        ];
                }
                return sortItems;
            }
        });
    });

