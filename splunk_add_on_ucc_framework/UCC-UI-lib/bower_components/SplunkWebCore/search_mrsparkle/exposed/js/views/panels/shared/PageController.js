/**
 * @author ahebert
 * @date 3/15/15
 *
 * PageController for the prebuilt panels manager page
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'controllers/BaseManagerPageControllerFiltered',
        'collections/services/data/ui/Panels',
        'models/services/data/ui/Panel',
        './ActionCell',
        './EditDialog',
        './GridRow',
        'uri/route',
        'views/shared/pcss/basemanager.pcss',
        './PageController.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseController,
        PanelsCollection,
        PanelModel,
        PanelActionCell,
        AddEditDialog,
        GridRow,
        route,
        cssBaseManager,
        css
        
    ) {
        return BaseController.extend({
            moduleId: module.id,

            initialize: function(options) {
                this.collection = this.collection || {};
                this.model = this.model || {};
                this.deferreds = this.deferreds || {};

                //MODELS
                this.model.controller = new Backbone.Model();

                options.enableNavigationFromUrl = true;
                options.fragments = ['data', 'ui', 'panels'];
                options.entitiesPlural = _('Prebuilt panels').t();
                options.entitySingular = _('Prebuilt panel').t();
                options.header = {
                    pageDesc: _("Prebuilt panels are reusable dashboard content that can easily be added to multiple dashboards. These panels consist of one or more visualizations along with any relevant form inputs.").t(),
                    learnMoreLink: 'prebuilt.panel.dashboards',
                    breadcrumb: this.model.serverInfo.isLite() ? undefined : {
                        label: _('User interface').t(),
                        url: route.manager(
                                this.model.application.get("root"),
                                this.model.application.get("locale"),
                                this.model.application.get("app"),
                                'ui')
                    }
                };
                options.model = this.model;
                options.collection = this.collection;
                options.entitiesCollectionClass = this.options.panelsCollectionClass || PanelsCollection;
                options.entityModelClass = this.options.panelModelClass || PanelModel;
                options.customViews = {
                    ActionCell: PanelActionCell,
                    AddEditDialog: AddEditDialog,
                    GridRow: GridRow
                };

                BaseController.prototype.initialize.call(this, options);
            },

            /**
             * Override of method from superclass, adding 'app' to have SplunkDBase fetching with namespace:
             * /en-US/splunkd/__raw/servicesNS/<owner>/<app>/data/ui/panels
             * @returns the fetch data option object.
             */
            getFetchData: function() {
                var data = BaseController.prototype.getFetchData.call(this);
                data['app'] = "-";
                return data;
            },

            /**
             * Override default which is _new
             */
            navigateToNew: function(){
                this.navigate('_new', { data: {action: 'edit'}});
            },

            /**
             * Override the default method which return null.
             * In this page, we need to keep the context of the listing filtering:
             * keep ns parameter as we navigate to other modals.
             * @returns {*}
             */
            getPageOptions: function() {
                if (this.options.namespaceFilterCandidate) {
                    return {
                        data: {
                            ns: this.options.namespaceFilterCandidate
                        }
                    };
                } else {
                    return null;
                }
            }
        });
    });