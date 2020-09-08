// The Master view for Management Console Data Inputs.
// This view is primarily a TAB view
// It lists the Tabs on the left side and
// upon user click it renders the known detail view.
// Additionally, it is responsible for the context filtering.
// @author: nmistry
define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/Base',
    'views/managementconsole/data_inputs/shared/controls/DMCContext',
    './tabviews/Tabs',
    './tabviews/TabDetails',
    'contrib/text!./Master.html',
    './Master.pcss',
    'views/managementconsole/shared.pcss'
], function (
    _,
    $,
    Backbone,
    module,
    BaseView,
    DMCContext,
    TabsView,
    TabDetailsView,
    Template,
    css
) {
    var strings = {
        TITLE: _('Inputs').t(),
        DESCRIPTION: _('How do you want to add data from your forwarders?').t()
    };

    // The /inputs-meta endpoint will list the inputs
    // using unique name. We need to map that to view
    var TAB_DETAILS_REGISTRY = {};

    return BaseView.extend({
        moduleId: module.id,
        tagName: 'div',
        className: 'datainputs-master',
        template: Template,

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);

            // we will using radio as our message bus
            this.radio = this.options.radio || _.extend({}, Backbone.Events);
            this.deferreds = this.options.deferreds || {};
            TAB_DETAILS_REGISTRY = this.options.registry;

            // If the user visits the first time,
            // select the first view for him by default
            var selectedViewId = this.model.classicurl.get('tab');
            if (!selectedViewId) {
                selectedViewId = this.collection.tabs.at(0) ? this.collection.tabs.at(0).getId() : 'monitor';
                this.model.classicurl.set('tab', selectedViewId);
            }
            this.selectedViewId = selectedViewId;

            this.children.tabs = new TabsView({
                collection: this.collection.tabs,
                selectedId: selectedViewId,
                tabDetailsRegistry: TAB_DETAILS_REGISTRY
            });

            this.children.tabDetails = new TabDetailsView();

            this.children.contextFilter = new DMCContext({
                mode: 'filter',
                model: this.model.classicurl,
                modelTypeAttribute: 'bundleType',
                modelAttribute: 'bundle',
                collection: this.collection,
                deferreds: this.deferreds
            });

            this.listenTo(this.children.tabs, 'tabClicked', this.handleTabClick);
            this.listenTo(this.radio, 'tabrefresh', this.handleCreate);
        },

        //when the user creates a new input,
        // we need to update the counts on the tabs
        handleCreate: function () {
            this.collection.tabs.fetch();
        },

        // when the user clicks a tab
        // handleTabClick will persist the selectedTab
        // and show the corresponding detailview
        handleTabClick: function (tabId) {
            this.model.classicurl.set('tab', tabId);
            this.children.tabs.setActiveTab(tabId);
            this.showDetailView(this.collection.tabs.getModelById(tabId));
        },

        showDetailView: function (model) {
            var viewId;
            var ViewKlass;
            var ModelKlass;
            var WizardKlass;
            var view;

            if (!model) return;

            viewId = model.getId() || '';

            // no view selected. No-op, sorry.
            if (!viewId || !_.has(TAB_DETAILS_REGISTRY, viewId)) viewId = 'empty';

            // if the view has not been rendered
            // please render it
            if (!this.children.tabDetails.has(viewId)) {
                ViewKlass = TAB_DETAILS_REGISTRY[viewId].ViewKlass;
                ModelKlass = TAB_DETAILS_REGISTRY[viewId].ModelKlass;
                WizardKlass = TAB_DETAILS_REGISTRY[viewId].WizardKlass;

                view = new ViewKlass({
                    viewId: viewId,
                    model: this.model,
                    collection: this.collection,
                    deferreds: this.deferreds,
                    radio: this.radio,
                    title: model.getDisplayName(),
                    description: model.getDescription(),
                    helpString: model.getHelpString(),
                    ModelKlass: ModelKlass,
                    WizardKlass: WizardKlass
                });

                this.children.tabDetails.addView(viewId, view);
            }
            this.selectedViewId = viewId;
            this.children.tabDetails.activateView(viewId);
        },

        render: function () {
            this.el.innerHTML = this.compiledTemplate({
                strings: strings
            });

            // render the tabs and tab details view.
            // show the selected view.
            this.children.tabs.render().$el.appendTo(this.$('.tabs-view'));
            this.children.tabDetails.render().$el.appendTo(this.$('.tab-details-view'));
            this.children.contextFilter.render().$el.appendTo(this.$('.context-filter'));
            this.showDetailView(this.collection.tabs.getModelById(this.selectedViewId));

            return this;
        }
    });
});
