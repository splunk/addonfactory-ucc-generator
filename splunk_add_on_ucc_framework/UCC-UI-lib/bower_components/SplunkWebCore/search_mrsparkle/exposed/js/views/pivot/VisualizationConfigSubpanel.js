/*
 * This view renders a sub-panel of form controls for a single pivot element.
 *
 * It sub-classes the visualization editor form view, and prepends pivot-specific
 * controls to the form body.  It also implements the "pivotFormElements" spec in
 * https://confluence.splunk.com/display/PROD/Internal+Mod+Viz+ERD#InternalModVizERD-PivotEditorSchema.
 * It creates the pivot control groups and manages their dynamic visibility.
 */

define([
            'jquery',
            'underscore',
            'module',
            'models/Base',
            'collections/services/data/ui/Times',
            'models/shared/Application',
            'models/shared/User',
            'models/pivot/PivotReport',
            'models/services/AppLocal',
            'models/pivot/datatable/PivotableDataTable',
            'views/extensions/DeclarativeDependencies',
            'views/pivot/custom_controls/FieldPickerControlGroup',
            'views/shared/vizcontrols/components/Form',
            'views/shared/controls/ControlGroup',
            'helpers/pivot/PivotVisualizationManager'
        ],
        function(
            $,
            _,
            module,
            BaseModel,
            Times,
            Application,
            User,
            PivotReport,
            AppLocal,
            PivotableDataTable,
            DeclarativeDependencies,
            FieldPickerControlGroup,
            Form,
            ControlGroup,
            pivotVizManager
        ) {

    var VisualizationConfigSubpanel = Form.extend({

        moduleId: module.id,
        className: 'form form-horizontal',

        /**
         * @constructor
         * @param options {
         *     model: {
         *         report <models/pivot/PivotReport> the current report
         *         dataTable <models/pivot/PivotableDataTable> the current data table
         *         element {Model} the report element the subpanel represents
         *                         must be subclasses of <models/pivot/elements/BaseElement>
         *         application: <models/shared/Application> the application state model
         *         appLocal <models.services.AppLocal> the local splunk app
         *         user <models.services/admin.User> the current user
         *     }
         *     collection {
         *         timePresets <collections/services/data/ui/Times> the current user's time presets
         *     }
         *     panel {Object} a panel configuration object,
         *                    see helpers/pivot/PivotVisualization for full documentation
         * }
         */

        initialize: function() {
            this.model.visualization = this.model.visualization || new BaseModel();
            if (this.model.element && !this.options.hideFieldPicker) {
                this.children.fieldPicker = new FieldPickerControlGroup({
                    model: this.model.element,
                    report: this.model.report,
                    dataTable: this.model.dataTable,
                    dataTypes: this.options.panel.dataTypes,
                    showRemoveButton: !this.options.panel.required
                });
            }
            _(this.options.panel.pivotFormElements).each(function(formElement) {
                this.children[formElement.id] = new formElement.group($.extend({}, formElement.groupOptions, {
                    model: (formElement.type === pivotVizManager.REPORT_CONTROL ? this.model.report.entry.content : this.model.element),
                    report: this.model.report,
                    dataTable: this.model.dataTable,
                    collection: this.collection ? this.collection.timePresets : undefined,
                    application: this.model.application,
                    appLocal: this.model.appLocal,
                    user: this.model.user,
                    visualization: this.model.visualization
                }));
            }, this);
            this.dynamicallyVisiblePivotElements = _(this.options.panel.pivotFormElements).filter(_.property('visibleWhen'));
            if (this.dynamicallyVisiblePivotElements.length > 0) {
                this.listenTo(this.model.element, 'change', this._refreshPivotGroupsVisibleState);
            }
            this.options.formElements = this.options.panel.formElements;
            Form.prototype.initialize.call(this, this.options);
        },

        render: function() {
            if (this.children.fieldPicker) {
                this.children.fieldPicker.render().appendTo(this.el);
            }
            _(this.options.panel.pivotFormElements).each(function(formElement) {
                this.children[formElement.id].render().appendTo(this.el);
            }, this);
            Form.prototype.render.call(this);
            this._refreshPivotGroupsVisibleState();
            return this;
        },

        _refreshPivotGroupsVisibleState: function() {
            _(this.dynamicallyVisiblePivotElements).each(function(formElement) {
                if (this._modelPassesPredicate(this.model.element, formElement.visibleWhen)) {
                    this.children[formElement.id].$el.show();
                } else {
                    this.children[formElement.id].$el.hide();
                }
            }, this);
        }

    },
    {
        apiDependencies: {
            report: PivotReport,
            dataTable: PivotableDataTable,
            application: Application,
            appLocal: AppLocal,
            user: User,
            timePresets: Times
        }
    });

    return DeclarativeDependencies(VisualizationConfigSubpanel);

});