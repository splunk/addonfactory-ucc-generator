/*
 * A pop-down dialog that provides formatting controls for a visualization based on a provided schema or custom html.
 *
 * This view renders the activator button and wires up dynamically creating and showing the dialog child view.
 */

define([
            'jquery',
            'underscore',
            'module',
            'views/Base',
            './Dialog',
            './Master.pcss'
        ],
        function(
            $,
            _,
            module,
            Base,
            Dialog,
            css
        ) {

    return Base.extend({

        /**
         * @param {Object} options {
         *     model: {
         *         report: <models.search.Report>,
         *         application: <models.shared.Application>
         *     },
         *     saveOnApply: <Boolean> whether to save the report when any changes are submitted
         *     excludeAttributes: <Array> a list of report attribute names whose controls should not be rendered
         *     formatterDescription: the schema or html defining formatter controls to render, this can updated
         *         after instantiation via setFormatterDescription() see:
         *         https://confluence.splunk.com/display/PROD/Internal+Mod+Viz+ERD#InternalModVizERD-VisualizationEditorSchema
         * }
         */

        moduleId: module.id,

        className: 'btn-group',

        events: {
            'click .format': function(e) {
                e.preventDefault();
                var $target = $(e.currentTarget);

                // If schema is provided, filter out excluded attributes
                var filteredDescription = _.isObject(this.options.formatterDescription)
                    ? this._filterSchema(this.options.formatterDescription)
                    : this.options.formatterDescription;

                this.children.format = new Dialog({
                    model: {
                        report: this.model.report,
                        application: this.model.application
                    },
                    formatterDescription: filteredDescription,
                    onHiddenRemove: true,
                    saveOnApply: this.options.saveOnApply,
                    dashboard: this.options.dashboard,
                    warningMsg: this.options.warningMsg,
                    warningLearnMoreLink: this.options.warningLearnMoreLink,
                    ignoreClasses: ['color-picker-container', 'select2-drop', 'select2-drop-mask', 'dropdown-menu']
                });
                this.children.format.render().activate().appendTo($('body'));
                this.children.format.show($target);
                $target.addClass('active');

                this.listenTo(this.children.format, 'hidden', function() {
                    $target.removeClass('active');
                });
            }
        },

        _filterSchema: function(schema) {
            return _(this.options.formatterDescription).map(function(schemaEntry) {
                return _.extend({}, schemaEntry, {
                    formElements: _(schemaEntry.formElements).reject(function(formElement) {
                        return _(this.options.excludeAttributes || []).contains(formElement.name);
                    }, this)
                });
            }, this);
        },

        setFormatterDescription: function(formatterDescription) {
            this.options.formatterDescription = formatterDescription;
        },

        render: function() {
            this.$el.html(this.compiledTemplate());
        },

        template: '\
            <a class="btn-pill popdown-toggle format" href="#">\
                <i class="icon-paintbrush"/><span class="link-label"><%- _("Format").t() %></span><span class="caret"></span>\
            </a>\
        '

    });

});
