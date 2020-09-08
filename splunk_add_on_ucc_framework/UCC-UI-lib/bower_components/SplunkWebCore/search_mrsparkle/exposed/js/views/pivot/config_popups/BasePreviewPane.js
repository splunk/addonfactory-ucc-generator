/**
 * @author sfishel
 *
 * An abstract base view for previewing/editing the settings of a pivot element
 *
 * Child Views:
 *
 * formView <sub-class of views/pivot/config_forms/BaseFormElement> the view with form controls for the editing the element
 *
 * Custom Events:
 *
 * changeContents - triggered when a change to the element might have resulted in a re-size of the view
 */

define([
            'jquery',
            'underscore',
            'views/Base',
            'views/pivot/config_forms/form_view_factory',
            'views/pivot/config_forms/AllSplitsForm',
            'views/shared/FlashMessages'
        ],
        function(
            $,
            _,
            Base,
            formViewFactory,
            AllSplitsForm,
            FlashMessages
        ) {

    return Base.extend({

        /**
         * @constructor
         * @param options {Object} {
         *     model: {
         *         element: <sub-class of models/pivot/elements/BaseElement> the pivot element to inspect/edit
         *         report: <models/pivot/PivotReport> the pivot report model
         *         dataModel: <models/services/datamodel/DataModel> the data model being reported on
         *         application: <models/shared/Application> the application state model
         *     }
         *     elementType: {String} the element type ("filter", "cell", "row", or "column")
         *     elementIndex: {Integer} the index of the element being edited, or the index where it will be added
         * }
         */

        initialize: function(options) {
            Base.prototype.initialize.call(this, options);
            options = options || {};
            this.elementType = options.elementType;
            this.elementIndex = options.elementIndex;

            this.children.flashMessages = new FlashMessages({
                model: {
                    element: this.model.element,
                    report: this.model.report.entry.content
                }
            });
        },

        render: function() {
            var html = _(this.template).template({
                element: this.model.element
            });
            this.$el.html(html);
            this.children.flashMessages.replaceAll(this.$('.flash-messages-placeholder'));
            this.renderFormView();
            this.renderButtons();
            return this;
        },

        renderButtons: function() {
            var html = _(this.buttonsTemplate).template({ });
            this.$('.buttons-wrapper').html(html);
        },

        // ----- methods/properties to be overridden/extended by sub-classes ----- //

        /**
         * (To be optionally extended)
         *
         * Renders form sub-view inside the view's root element.
         */

        renderFormView: function() {
            var elementType = this.model.element.get('elementType');

            if(this.children.formView) {
                this.children.formView.remove();
            }
            this.children.formView = formViewFactory.create({
                model: {
                    element: this.model.element,
                    report: this.model.report,
                    dataModel: this.model.dataModel,
                    application: this.model.application,
                    dataTable: this.model.dataTable
                }
            });

            this.$('.element-form-placeholder').replaceWith(this.children.formView.render().el);
            if(elementType in { row: true, column: true }) {
                this.children.allSplitsForm = new AllSplitsForm({
                    model: {
                        element: this.model.element,
                        report: this.model.report
                    },
                    elementType: this.elementType,
                    elementIndex: this.elementIndex
                });
                var $sharedFormPlaceholder = this.$('.shared-form-placeholder');
                $(_(this.allSplitsSubPaneHeader).template({ elementType: this.elementType })).insertBefore($sharedFormPlaceholder);
                $sharedFormPlaceholder.replaceWith(this.children.allSplitsForm.render().el);
            }
            else {
                this.$('.shared-form-placeholder').remove();
            }

            this.children.formView.on('changeContents', function() {
                this.trigger('changeContents');
            }, this);
        },

        /**
         * (Required to be defined by sub-classes)
         *
         * The template to use when rendering the buttons below the form view
         */

        buttonsTemplate: '',

        // ----- private methods/properties ----- //

        template: '\
            <div class="pivot-config-content">\
                <div class="flash-messages-placeholder"></div>\
                <h4>\
                    <%- element.get("displayName") %>\
                </h4>\
                <div class="element-form-placeholder"></div>\
                <div class="shared-form-placeholder"></div>\
            </div>\
            <div class="buttons-wrapper popdown-dialog-footer"></div>\
        ',

        allSplitsSubPaneHeader: '\
            <div class="sub-pane-divider"></div>\
            <h4>\
                <%- elementType === "row" ? _("All Rows").t() : _("All Columns").t() %>\
            </h4>\
        '

    });

});