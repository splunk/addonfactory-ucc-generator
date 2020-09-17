/*
 * This view provides the popdown dialog wrapper and workflow buttons for editing a visualization.
 * The contents of the dialog body are rendered by the component child view.
 */

define(
    [
        'underscore',
        'jquery',
        'module',
        'models/shared/Visualization',
        'models/search/Report',
        'views/shared/DraggablePopTart',
        'views/shared/vizcontrols/components/Master',
        'helpers/user_agent',
        'util/general_utils',
        'jquery.ui.draggable'
    ],
    function(
        _,
        $,
        module,
        VisualizationModel,
        Report,
        DraggablePopTart,
        Component,
        userAgent,
        generalUtils
        /* jquery ui draggable */
    ){

        return DraggablePopTart.extend({
            moduleId: module.id,

            options: {
                saveOnApply: false
            },

            /**
             * @constructor
             * @param options {
             *     model: {
             *         report: <models.search.Report>,
             *         application: <models.shared.Application>
             *     }
             *     saveOnApply: <Boolean>,
             *     formatterDescription: the schema or custom html defining the formatter controls to render
             *         see https://confluence.splunk.com/display/PROD/Internal+Mod+Viz+ERD#InternalModVizERD-VisualizationEditorSchema
             * }
             */

            initialize: function() {
                DraggablePopTart.prototype.initialize.call(this, this.options);

                this.model.visualization = VisualizationModel.fromReportContentAndSchema(
                    this.model.report.entry.content,
                    this.options.formatterDescription
                );

                this.listenTo(this.model.visualization, 'change', this.applyChanges);

                this.children.visualizationControls = new Component({
                    model: {
                        visualization: this.model.visualization,
                        application: this.model.application
                    },
                    formatterDescription: this.options.formatterDescription
                });

                this.listenTo(this, 'show', function() {
                    this.$onOpenFocus = this.children.visualizationControls.$('a').first();
                });
            },

            applyChanges: function() {
                this.model.visualization.validate();
                // Only valid attributes should be set on the report content,
                // invalid attributes are ignored.
                var setObject = {};
                _(this.model.visualization.changedAttributes()).each(function(value, key) {
                    if (this.model.visualization.isValid(key)) {
                        setObject[key] = value;
                    }
                }, this);
                if (_.isEmpty(setObject)) {
                    return;
                }
                this.model.report.entry.content.set(setObject);
                // hackery to make sure Safari renders any resulting changes to the visualization (SPL-108655)
                // for some reason, blurring and re-focusing the active element will force pending renders
                if (userAgent.isSafari()) {
                    setTimeout(function() {
                        $(document.activeElement).blur().focus();
                    }, 100);
                }
                var reportIsDirty = !_.isEmpty(
                    generalUtils.filterObjectByRegexes(setObject, Report.DIRTY_WHITELIST, { allowEmpty: true })
                );
                if(reportIsDirty && this.options.saveOnApply) {
                    this.model.report.save();
                }
            },

            render: function() {
                this.$el.html(this.template);
                if (this.options.warningMsg) {
                    var html = _.template(this.warningMessageTemplate, {
                        hasLearnMoreLink: this.options.warningLearnMoreLink != null,
                        message: this.options.warningMsg,
                        learn_more: _("Learn More").t(),
                        link: this.options.warningLearnMoreLink
                    });
                    $(html).appendTo(this.$(".popdown-dialog-body"));
                }
                this.children.visualizationControls.render().appendTo(this.$('.popdown-dialog-body'));
                return this;
            },
            warningMessageTemplate: '\
                <div class="vizformat-message">\
                    <i class="icon icon-warning"></i>\
                    <span class="message-text"><%- message %></span>\
                    <% if (hasLearnMoreLink) {%>\
                    <a class="learn-more external" href="<%- link %>"><%- learn_more %></a>\
                    <% } %>\
                </div>\
            '
        });
    }
);
