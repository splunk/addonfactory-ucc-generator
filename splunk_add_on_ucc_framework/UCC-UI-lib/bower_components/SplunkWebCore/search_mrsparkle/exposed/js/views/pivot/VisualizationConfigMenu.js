/*
 * The master view for the visualization config sidebar in pivot.
 *
 * This views renders each of the individual panels based on the provided configuration,
 * and manages the concertina navigation behavior.
 */
define([
            'jquery',
            'underscore',
            'module',
            'models/shared/Visualization',
            'models/pivot/PivotReport',
            'models/pivot/datatable/PivotableDataTable',
            'views/extensions/DeclarativeDependencies',
            'views/Base',
            './VisualizationConfigPanel',
            'views/shared/delegates/Concertina',
            'helpers/VisualizationRegistry'
        ],
        function(
            $,
            _,
            module,
            Visualization,
            PivotReport,
            PivotableDataTable,
            DeclarativeDependencies,
            Base,
            VisualizationConfigPanel,
            Concertina,
            VisualizationRegistry
        ) {

    var VisualizationConfigMenu = Base.extend({

        moduleId: module.id,

        className: 'concertina',

        /**
         * @constructor
         * @param options {
         *     model: {
         *         report <models/pivot/PivotReport> the current report
         *         dataTable <models/pivot/PivotableDataTable> the current data table
         *         application: <models/shared/Application> the application state model
         *         appLocal <models.services.AppLocal> the local splunk app
         *         user <models.services/admin.User> the current user
         *     }
         *     collection {
         *         timePresets <collections/services/data/ui/Times> the current user's time presets
         *     }
         *     panels {Array<Object>} a list of panel configuration objects,
         *                             see helpers/pivot/PivotVisualization for full documentation
         * }
         */

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            this.model.reportWorking = this.model.report.clone();
            this.model.reportWorking.on('reportConfigChange', function() {
                var reportConfigsAreEqual = function(report1, report2) {
                    var content1 = report1.entry.content,
                        content2 = report2.entry.content;

                    return (
                        _.isEqual(
                            content1.filterByWildcards(PivotReport.PIVOT_CONTENT_FILTER, { allowEmpty: true}),
                            content2.filterByWildcards(PivotReport.PIVOT_CONTENT_FILTER, { allowEmpty: true})
                        ) &&
                        _.isEqual(content1.filters.toJSON(), content2.filters.toJSON()) &&
                        _.isEqual(content1.columns.toJSON(), content2.columns.toJSON()) &&
                        _.isEqual(content1.rows.toJSON(), content2.rows.toJSON()) &&
                        _.isEqual(content1.cells.toJSON(), content2.cells.toJSON())
                    );
                };
                // bail out if the two reports are equivalent, this can happen if an invalid value was entered and then removed
                // this is more than just a performance optimization, if the reports are equivalent a new route will not trigger (SPL-68062)
                if(!this.model.reportWorking.isValid(true) || reportConfigsAreEqual(this.model.reportWorking, this.model.report)) {
                    return;
                }
                // sync the two reports' pivot JSON configurations,
                // but do it silently because we're going to fire the 'reportConfigChange' event later
                this.model.report.setFromPivotJSON(this.model.reportWorking.getPivotJSON(), { silent: true });

                var workingIndexTimeFilter = this.model.reportWorking.getIndexTimeFilter(),
                    reportIndexTimeFilter = this.model.report.getIndexTimeFilter();

                if(workingIndexTimeFilter && reportIndexTimeFilter) {
                    reportIndexTimeFilter.setTimeRange(workingIndexTimeFilter.timeRange, workingIndexTimeFilter.timePresets);
                }
                this.model.report.trigger('reportConfigChange');
            }, this);

            var vizConfig = VisualizationRegistry.findVisualizationForConfig(this.model.report.entry.content.toJSON());
            this.model.visualization = Visualization.fromReportContentAndSchema(this.model.reportWorking.entry.content, vizConfig.editorSchema);
            this.model.visualization.on('change', function() {
                var displayChanged = this.model.visualization.filterChangedByWildcards(PivotReport.REPORT_FORMAT_FILTER, { allowEmpty: true });
                if(!_.isEmpty(displayChanged) && this.model.visualization.isValid(true)) {
                    // SPL-71300, copy all attributes from the clone to the original, since it's possible a validation error
                    // prevented previously-changed attributes from being copied over
                    this.model.report.entry.content.set(this.model.visualization.filterByWildcards(PivotReport.REPORT_FORMAT_FILTER, { allowEmpty: true }));
                }
            }, this);

            // SPL-101903 - must sync the is_timeseries report model attribute to the visualization model
            // if a new value is set on the report model by the visualization, for access by the pivot menu
            this.listenTo(this.model.report.entry.content, 'change:is_timeseries', function() {
                this.model.visualization.set('is_timeseries', this.model.report.entry.content.get('is_timeseries'));
            }, this);
        },

        render: function() {
            if(!this.el.innerHTML) {
                this.$el.html(this.template);
                this.children.concertina = new Concertina({ el: this.el });
            }

            _(this.children).chain().omit('concertina').invoke('remove');
            this.children = { concertina: this.children.concertina };
            _(this.options.panels || []).each(function(panel, i) {
                var availableFields = this.getAvailableFieldsForPanel(panel);
                // if there are no fields available for ane element panel, don't render it
                if(availableFields.length === 0 && panel.hasOwnProperty('elementType')) {
                    return;
                }
                var panelViewOptions = this.constructPanelViewOptions(panel, availableFields),
                    child = this.children['panel_' + i] = new VisualizationConfigPanel(_.extend(
                        {
                            apiResources: this.apiResources.panel,
                            model: {
                                report: this.model.reportWorking,
                                visualization: this.model.visualization
                            }
                        },
                        panelViewOptions
                    ));

                child.render().appendTo(this.$('.concertina-body'));
            }, this);

            // validate the report content so any errors are displayed correctly
            this.model.reportWorking.entry.content.validate();
            return this;
        },

        disable: function() {
            this.$disabledScreen = $('<div class="disabled-screen"></div>');
            this.$el.append(this.$disabledScreen);
        },

        getScrollOffset: function() {
            return this.$('.concertina-body').scrollTop();
        },

        getAvailableFieldsForPanel: function(panel) {
            var reportFields = this.model.dataTable.getFieldList();

            if(panel.hasOwnProperty('dataTypes')) {
                reportFields = _(reportFields).filter(function(field) {
                    return _(panel.dataTypes).contains(field.type);
                }, this);
            }
            return reportFields;
        },

        constructPanelViewOptions: function(panel, availableFields) {
            var panelViewOptions = {
                panel: panel
            };

            if(panel.hasOwnProperty('elementType')) {
                var elements = this.model.reportWorking.getElementCollectionByType(panel.elementType).toArray();
                if(panel.hasOwnProperty('dataTypes')) {
                    elements = _(elements).filter(function(element) {
                        return _(panel.dataTypes).contains(element.get('type'));
                    });
                }

                // Add message to be displayed in place of 'add new' button if panel should not be enabled for add
                if(_.isFunction(panel.isEnabledForAdd)) {
                    panelViewOptions.prerequisiteToAdd = panel.isEnabledForAdd(elements);
                }
                
                if(_.isFunction(panel.elementsSelector)) {
                    elements = panel.elementsSelector(elements);
                }
                else {
                    elements = panel.hasOwnProperty('maxLength') ? elements.slice(0, panel.maxLength) : elements;
                }
                panelViewOptions.elements = elements;
                // if there's only one field available for the panel (and it's required), don't show the field picker
                panelViewOptions.hideFieldPicker = (panel.required && availableFields.length === 1);
            }
            return panelViewOptions;
        },

        onAddedToDocument: function() {
            this.children.concertina.reset();
            if(this.options.scrollOffset) {
                this.$('.concertina-body').scrollTop(this.options.scrollOffset);
            }
            Base.prototype.onAddedToDocument.call(this);
        },

        template: '\
            <div class="concertina-dock-top"></div>\
            <div class="concertina-body popdown-dialog-scroll-parent"></div>\
            <div class="concertina-dock-bottom"></div>\
        '

    },
    {
        apiDependencies: {
            report: PivotReport,
            dataTable: PivotableDataTable,

            panel: VisualizationConfigPanel
        }
    });

    return DeclarativeDependencies(VisualizationConfigMenu);

});