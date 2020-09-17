define([
            'underscore',
            'module',
            'models/Base',
            'views/shared/controls/ControlGroup',
            'helpers/VisualizationRegistry',
            'splunk.util'
        ],
        function(
            _,
            module,
            BaseModel,
            ControlGroup,
            VisualizationRegistry,
            splunkUtil
        ) {

    return ControlGroup.extend({

        moduleId: module.id,

        initialize: function() {
            this.options.label = _('Content').t();
            var generalType = this.model.report.entry.content.get('display.general.type');
            var isReportSearch = this.model.searchJob.isReportSearch();
            // If we have a reporting search and the type is visualization, let the user choose between
            // viz/table/viz + table.
            if (isReportSearch && generalType === 'visualizations') {
                var vizType = VisualizationRegistry.findVisualizationForConfig(this.model.report.entry.content.toJSON());
                // If for some reason no viz was found to match the report configuration (probably
                // a permissions mismatch between the report and an external viz), create a placeholder
                // viz type so we don't thrown an error.
                if (!vizType) {
                    vizType = { icon: 'external-viz' };
                }
                _.extend(this.options, {
                    controlType:'SyntheticRadio',
                    controlClass: 'controls-thirdblock',
                    controlOptions: {
                        className: "btn-group btn-group-2",
                        items: [
                            {
                                value: 'chartandtable',
                                icon: vizType.icon + '-plus-table',
                                iconSize: '',
                                tooltip: splunkUtil.sprintf(_('%s and Statistics Table').t(), vizType.label)
                            },
                            { value: 'chart', icon: vizType.icon, iconSize: '', tooltip : vizType.label },
                            { value: 'table', icon: 'table', iconSize: '', tooltip : _('Statistics Table').t() }
                        ],
                        model: this.model.report.entry.content,
                        modelAttribute: 'display.general.reports.show'
                    }
                });
            // Otherwise there is no choice to be made, the report will either be a stats table or an events list
            // depending on whether the search is reporting.
            } else {
                var labelValue = isReportSearch ? _('Statistics Table').t() : _('Events').t();
                var icon = isReportSearch ? 'table' : 'list';
                _.extend(this.options, {
                    controlType: 'Label',
                    controlOptions: {
                        icon: icon,
                        defaultValue: labelValue,
                        // This is to provide a consistent hook for QA automation
                        modelAttribute: 'display.general.reports.show'
                    }
                });
            }
            ControlGroup.prototype.initialize.call(this, this.options);
        }

    });

});