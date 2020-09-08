define([
            'underscore',
            'module',
            'views/shared/controls/ControlGroup',
            'util/pivot/config_form_utils',
            'util/keyboard',
            'splunk.util',
            'bootstrap.tooltip'
        ],
        function(
            _,
            module,
            ControlGroup,
            configFormUtils,
            keyboardUtils,
            splunkUtils
            // bootstrap tooltip
        ) {

    return ControlGroup.extend({

        moduleId: module.id,

        events: {
            'click .help-tooltip': function(e) { e.preventDefault(); },
            'keypress .help-tooltip': function(e) {
                if(e.which === keyboardUtils.KEYS.ENTER) {
                    e.preventDefault();
                }
            }
        },

        initialize: function(options) {
            this.options.label = _('Sort').t();
            this.options.controls = [
                {
                    type: 'SyntheticSelect',
                    options: {
                        model: this.model,
                        modelAttribute: 'rowLimitType',
                        toggleClassName: 'btn',
                        menuWidth: 'narrow',
                        items: [
                            {
                                value: 'default',
                                label: _('Default').t()
                            },
                            {
                                value: 'descending',
                                label: _('Descending').t()
                            },
                            {
                                value: 'ascending',
                                label: _('Ascending').t()
                            }
                        ],
                        popdownOptions: { detachDialog: true }
                    }
                }
            ];
            if(options.showHelpText) {
                var limitByField = options.report.entry.content.cells.find(function(cell) {
                        return (
                            cell.get('value') in { count: true, dc: true, sum: true, avg: true } ||
                            cell.get('type') in { objectCount: true, childCount: true }
                        );
                    }),
                    limitByDisplayName = limitByField ? limitByField.getComputedLabel() :
                                            configFormUtils.getCellValueLabel(options.report.getPivotObjectName(), 'count');

                this.options.help = _(this.helpTextTemplate).template({
                    helpMessage: splunkUtils.sprintf(_('(By %s)').t(), limitByDisplayName),
                    helpTooltip: _('When sorting by Ascending or Descending, the first compatible Column Value is used. If none are defined, Count of rows will be used.').t()
                });
                this.options.helpClass = 'pivot-inspector-help-text';
                this.model.on('change:rowLimitType', this.handleLimitType, this);
            }
            ControlGroup.prototype.initialize.call(this, this.options);
        },

        render: function() {
            ControlGroup.prototype.render.apply(this, arguments);
            this.$('.help-tooltip').tooltip({ animation: false });
            this.handleLimitType();
            return this;
        },

        handleLimitType: function() {
            if(this.model.get('rowLimitType') === 'default') {
                this.$('.pivot-inspector-help-text').css('display', 'none');
            }
            else {
                this.$('.pivot-inspector-help-text').css('display', 'block');
            }
        },

        helpTextTemplate: '\
            <span><%- helpMessage %></span>\
            <a href="#" class="help-tooltip" title="<%- helpTooltip %>">?</a>\
        '

    });

});