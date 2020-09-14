define(
    [
        'module',
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'views/dashboard/layout/PanelRef',
        'dashboard/DashboardFactory',
        'controllers/dashboard/helpers/ModelHelper'
    ],
    function(module,
             $,
             _,
             Backbone,
             BaseView,
             PanelRef,
             Factory,
             ModelHelper) {

        var PanelView = BaseView.extend({
            moduleId: module.id,
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.viewOnlyModel = ModelHelper.getViewOnlyModel(this.model);
                this.deferreds = options.deferreds;
                this.managers = [];
                this.events = [];
            },
            render: function() {
                if (this.model.parsedPanel.type === "panelref") {
                    this._renderPrebuiltPanel();
                }
                else {
                    this._renderPanel();
                }
                return this;
            },
            _renderPanel: function() {
                Factory.getDefault().materialize(this.model.parsedPanel, this.$el, {
                    waitForReady: true,
                    model: this.viewOnlyModel,
                    deferreds: this.deferreds
                }).then(function(rootComponent, managers, components, events) {
                    this.managers = managers;
                    this.events = events;
                    _.each(components, function(component) {
                        this.children[component.id] = component;
                    }, this);
                }.bind(this));
            },
            _renderPrebuiltPanel: function() {
                this.children.refPanel = new PanelRef({
                    model: this.viewOnlyModel,
                    deferreds: this.deferreds
                });
                this.children.refPanel.render().$el.appendTo(this.$el);
                this.children.refPanel.load(this.model.parsedPanel.ref, this.model.parsedPanel.app || this.model.application('app'));
            },
            remove: function() {
                //destroy searchers and events, children will be destroy in base modules
                _(this.events).invoke('dispose');
                _(this.managers).invoke('dispose');
                BaseView.prototype.remove.apply(this, arguments);
            }
        });
        return PanelView;
    });