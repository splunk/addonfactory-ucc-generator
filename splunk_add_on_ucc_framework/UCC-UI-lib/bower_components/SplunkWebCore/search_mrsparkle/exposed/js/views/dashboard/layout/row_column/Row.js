define(
    [
        'module',
        'jquery',
        'underscore',
        'views/dashboard/Base',
        'splunkjs/mvc/simplexml/dashboard/tokendeps'
    ],
    function(module,
             $,
             _,
             BaseDashboardView,
             TokenDependenciesMixin) {

        return BaseDashboardView.extend(_.extend({}, TokenDependenciesMixin, {
            moduleId: module.id,
            className: 'dashboard-row',
            _uniqueIdPrefix: 'row',
            initialize: function() {
                BaseDashboardView.prototype.initialize.apply(this, arguments);
                this.setupTokenDependencies();
            },
            addChild: function(panel) {
                BaseDashboardView.prototype.addChild.apply(this, arguments);
                this._updateState();
                this.$el.trigger('structureChanged');
            },
            render: function() {
                BaseDashboardView.prototype.render.apply(this, arguments);
                this._updateState();
                return this;
            },
            _updateState: function() {
                this.$el[this.isEmpty() ? 'addClass' : 'removeClass']('empty');
            },
            getPanels: function() {
                return this.getChildElements('.dashboard-cell');
            },
            isEmpty: function() {
                return this.getPanels().length == 0;
            },
            remove: function() {
                this.stopListeningToTokenDependencyChange();                
                BaseDashboardView.prototype.remove.apply(this, arguments);
            },
            removeIfDOMEmpty: function() {
                this.isEmpty() && (this.remove());
            }
        }));
    }
);
