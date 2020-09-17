define(
    [
        'underscore',
        'module',
        'models/datasets/Table',
        'mixins/dataset',
        'views/shared/controls/SyntheticSelectControl'
    ],
    function(
        _,
        module,
        TableModel,
        datasetMixin,
        SyntheticSelectControl
    ) {
        return SyntheticSelectControl.extend({
            moduleId: module.id,
            className: 'dataset-diversity',

            initialize: function(options) {
                options.items = [
                    [
                        {value: datasetMixin.DIVERSITY.LATEST, label: _('Latest').t(), description: _('Fastest.').t()},
                        {value: datasetMixin.DIVERSITY.RANDOM, label: _('Random').t(), description: _('Fast. 10,000+ events recommended.').t()}
                    ],
                    [
                        {value: 'SAMPLE_AGAIN', label: _('Get New Sample').t()}
                    ]
                ];
                options.modelAttribute = 'dataset.display.diversity';
                options.defaultValue = datasetMixin.DIVERSITY.LATEST;
                options.toggleClassName = 'btn-pill job-status-btn-pill-diversity';
                options.size = this.options.size;
                options.menuClassName = 'dropdown-menu';
                options.label = _('Sample:').t();
                options.popdownOptions = {detachDialog: true};

                SyntheticSelectControl.prototype.initialize.call(this, options);
            },

            setValue: function(value, render, suppressEvent) {
                if (value === 'SAMPLE_AGAIN') {
                    this.model.trigger('newSample');
                    return;
                }

                SyntheticSelectControl.prototype.setValue.call(this, value, render, suppressEvent);
            }
        });
    }
);
