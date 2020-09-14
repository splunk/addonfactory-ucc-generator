define(
    [
        'module',
        'jquery',
        'underscore',
        'views/dashboard/Base',
        'views/dashboard/editor/element/InlineSearchControls',
        'views/dashboard/editor/element/SavedSearchControls',
        'splunkjs/mvc/savedsearchmanager',
        'uri/route',
        'splunkjs/mvc/tokenutils',
        'views/shared/vizcontrols/Master'
    ],
    function(module,
             $,
             _,
             BaseDashboardView,
             InlineSearchControls,
             SavedSearchControls,
             SavedSearchManager,
             route,
             TokenUtils,
             VizControls) {
        var VIZ_TYPE_PROPERTIES = [
            'display.general.type',
            'display.visualizations.type',
            'display.visualizations.custom.type',
            'display.visualizations.charting.chart'
        ];
        return BaseDashboardView.extend({
            moduleId: module.id,
            viewOptions: {
                register: false
            },
            className: 'dashboard-element-editor',
            initialize: function() {
                BaseDashboardView.prototype.initialize.apply(this, arguments);

                this.bindToComponent(this.settings.get('managerid'), this.onManagerChange, this);

                this.children.vizControls = new VizControls({
                    model: {
                        report: this.model.report,
                        application: this.model.application,
                        user: this.model.user
                    },
                    vizTypes: ['events', 'statistics', 'visualizations'],
                    saveOnApply: true, //do not save on apply
                    vizpicker: this.reportContainsTokenInVizType() ? {
                        warningMsg: _("Warning: Changes here can overwrite related token settings and behavior in your source code.").t()
                    } : undefined,
                    format: this.reportContainsTokenInFormat() ? {
                        warningMsg: _("Warning: Changes here can overwrite related token settings and behavior in your source code.").t()
                    } : undefined
                });
            },
            reportContainsTokenInVizType: function() {
                var reportModelContent = this.model.elementReport.toJSON({tokens: true});
                var tokenReleatedKey = _.find(VIZ_TYPE_PROPERTIES, function(key) {
                    return reportModelContent[key] && TokenUtils.hasToken(reportModelContent[key]);
                });
                return tokenReleatedKey != null;
            },
            reportContainsTokenInFormat: function() {
                var reportModelContent = this.model.elementReport.toJSON({tokens: true});
                var pairWithToken = _.chain(reportModelContent).pairs().find(function(pair) {
                    return pair[0].indexOf("display") === 0 && _(VIZ_TYPE_PROPERTIES).indexOf(pair[0]) < 0 && TokenUtils.hasToken(pair[1]);
                }).value();
                return pairWithToken != null;
            },
            onManagerChange: function(components, manager) {
                if (this.children.elementControls) {
                    this.children.elementControls.remove();
                }

                var ElementControls = manager instanceof SavedSearchManager ? SavedSearchControls : InlineSearchControls;

                this.children.elementControls = new ElementControls({
                    model: this.model,
                    collection: this.collection,
                    manager: manager,
                    settings: this.settings
                });

                this.render();
            },
            render: function() {
                if (this.children.elementControls) {
                    this.children.elementControls.render().$el.appendTo(this.$el);
                }
                this.children.vizControls.render().$el.appendTo(this.$el);
                return this;
            }
        });
    });