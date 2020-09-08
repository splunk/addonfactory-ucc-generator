/**
 * @author sfishel
 *
 * A container view for statistics table formatting controls.
 *
 * Child Views:
 *
 * count <views/shared/SyntheticSelectControl> a drop-down control for the rows-per-page
 * drillDown <views/shared/controls/ControlGroup> a radio-style control group for specifying drilldown configuration
 * rowNumbers <views/shared/controls/ControlGroup> a radio-style control group for toggling row numbering on and off
 * wrapResults <views/shared/controls/ControlGroup> a radio-style control group for toggling wrapping on and off
 * dataOverlay <views/shared/controls/ControlGroup> a drop-down-style control group for specifying data overlay options
 */

define([
            'underscore',
            'module',
            'views/Base',
            'views/shared/controls/SyntheticSelectControl',
            'views/shared/vizcontrols/Master'
        ],
        function(
            _,
            module,
            BaseView,
            SyntheticSelectControl,
            FormattingControls
        ) {

    return BaseView.extend({

        moduleId: module.id,

        /**
         * @constructor
         * @param options {Object} {
         *     model: {
         *         report <models/pivot/PivotReport> the report model
         *         application <models/shared/Application.js> the application model
         *         user <models/shared/User> the user model
         *     }
         * }
         */

        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);

            //child views
            this.children.count = new SyntheticSelectControl({
                menuWidth: "narrow",
                className: "btn-group pull-left",
                items: [
                    {value: '10', label: _("10 per page").t()},
                    {value: '20', label: _("20 per page").t()},
                    {value: '50', label: _("50 per page").t()}
                ],
                model: this.model.report.entry.content,
                modelAttribute: 'display.prefs.statistics.count',
                toggleClassName: 'btn-pill',
                popdownOptions: {
                    attachDialogTo: 'body'
                }
            });

            this.children.formattingControls = new FormattingControls({
                vizTypes: ['statistics'],
                bindToChangeOfSearch: false,
                excludeAttributes: ['display.prefs.statistics.count'],
                model: {
                    report: this.model.report,
                    application: this.model.application,
                    user: this.model.user
                }
            });
            this.children.formattingControls.$el.addClass('popdown pull-left');

        },

        render: function() {
            this.children.count.render().appendTo(this.el);
            this.children.formattingControls.render().appendTo(this.el);
            return this;
        }

    });

});
