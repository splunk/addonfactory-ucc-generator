/*
 * This view renders an individual panel in the pivot visualization config sidebar.
 *
 * The view manages the title bar and the "Add New" button, and will create the sub-panel
 * child views as needed.
 *
 * This view is the implementation of the config menu panels schema defined in
 * helpers/pivot/PivotVisualizationManager.  It determines which data table fields can be
 * added to the panel, displays validation errors and warnings when the panel is required
 * but not populated, and determines whether the panel should show a button for adding a
 * new subpanel.
 */

define([
            'jquery',
            'underscore',
            'module',
            'views/extensions/DeclarativeDependencies',
            'views/Base',
            'models/Base',
            'models/pivot/PivotReport',
            'models/pivot/datatable/PivotableDataTable',
            './VisualizationConfigSubpanel',
            './AddSubpanelDropDownMenu',
            'views/shared/FlashMessages',
            'helpers/pivot/PivotVisualizationManager',
            'splunk.util'
        ],
        function(
            $,
            _,
            module,
            DeclarativeDependencies,
            Base,
            BaseModel,
            PivotReport,
            PivotableDataTable,
            VisualizationConfigSubpanel,
            AddSubpanelDropDownMenu,
            FlashMessages,
            pivotVizManager,
            splunkUtils
        ) {

    var VisualizationConfigPanel = Base.extend({

        moduleId: module.id,

        className: 'config-panel-group concertina-group',

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
         *     elements {Array<Model>} a list of pivot element models to render in the panel
         *                             must be subclasses of <models/pivot/elements/BaseElement>
         *     panel {Object} a panel configuration object,
         *                    see helpers/pivot/PivotVisualization for full documentation
         * }
         */

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);

            // we use a mediator model to control which messages are passed our panel's flashMessages view
            // only messages pertaining to attributes in the chartingAttributeWhitelist should be displayed
            this.chartingAttributeWhitelist = _(this.options.panel.formElements || []).pluck('name');
            this.model.chartMessageMediator = new BaseModel();
            if (this.chartingAttributeWhitelist.length > 0) {
                this.model.visualization.on('validated', function(isValid, model, errors) {
                    if(isValid) {
                        this.model.chartMessageMediator.trigger('validated', isValid, model, errors);
                    }
                    else {
                        var mediatedErrors = _(errors).pick(this.chartingAttributeWhitelist);
                        if(_(mediatedErrors).isEmpty()) {
                            this.model.chartMessageMediator.trigger('validated', true, model, mediatedErrors);
                        }
                        else {
                            this.model.chartMessageMediator.trigger('validated', false, model, mediatedErrors);
                        }
                    }
                }, this);
            }
            var elementType = this.options.panel.elementType;
            this.reportAttributeWhitelist = [];
            if (elementType === pivotVizManager.ROW_SPLIT) {
                this.reportAttributeWhitelist.push('rowLimitAmount');
            } else if (elementType === pivotVizManager.COLUMN_SPLIT) {
                this.reportAttributeWhitelist.push('colLimitAmount');
            }
            this.model.reportMessageMediator = new BaseModel();
            this.model.report.entry.content.on('validated', function(isValid, model, errors) {
                if(isValid) {
                    this.model.reportMessageMediator.trigger('validated', isValid, model, errors);
                }
                else {
                    var mediatedErrors = _(errors).pick(this.reportAttributeWhitelist);
                    if(_(mediatedErrors).isEmpty()) {
                        this.model.reportMessageMediator.trigger('validated', true, model, mediatedErrors);
                    }
                    else {
                        this.model.reportMessageMediator.trigger('validated', false, model, mediatedErrors);
                    }
                }
            }, this);

            this.children.flashMessages = new FlashMessages({
                model: {
                    chartMessageMediator: this.model.chartMessageMediator,
                    reportMessageMediator: this.model.reportMessageMediator
                },
                helperOptions: {
                    removeDuplicates: true
                }
            });

            _(this.options.elements || []).each(function(element) {
                element.on('removeField', function() {
                    this.model.report.removeElement(element.get('elementType'), element);
                }, this);
                element.on('hotSwap', function(newAttrs) {
                    this.model.report.hotSwapElement(element.get('elementType'), element, newAttrs);
                }, this);

                this.children.flashMessages.flashMsgHelper.register(element);
            }, this);

            this.children.flashMessages.flashMsgCollection.on('add remove reset', function() {
                this.handleValidation(this.children.flashMessages.flashMsgCollection.length === 0);
            }, this);
        },

        stopListening: function() {
            _(this.options.elements || []).each(function(element) {
                element.off(null, null, this);
            }, this);
            this.children.flashMessages.flashMsgCollection.off(null, null, this);
            Base.prototype.stopListening.apply(this, arguments);
        },

        render: function() {
            _(this.children).each(function(child, childName) {
                if(child !== this.children.flashMessages) {
                    child.remove();
                    delete this.children[childName];
                }
            }, this);

            var panelOptions = this.options.panel,
                templateData = { panelOptions: panelOptions, headingMessage: null, headingClassName: null },
                useElements = this.options.hasOwnProperty('elements');

            if(useElements && panelOptions.required && this.options.elements.length === 0) {
                templateData.headingClassName = 'warning';
                var headingMessage = _('Required').t();
                templateData.headingMessage = headingMessage;
            }
            this.$el.html(this.compiledTemplate(templateData));
            // add the panel id as a data attribute for automated testing
            this.$el.attr('data-group-name', panelOptions.title.replace(/\W/g, '').toLowerCase());
            this.children.flashMessages.replaceAll(this.$('.flash-messages-placeholder'));

            var $panelBody = this.$('.panel-body');
            if(useElements) {
                this.insertMultiElementSubpanel($panelBody, panelOptions, this.options.elements);
                $panelBody.children().not(this.children.flashMessages.el).slice(0, -1).after(this.sectionDividerTemplate);
            }
            else {
                this.insertSimpleSubpanel($panelBody, panelOptions);
            }
            return this;
        },

        insertMultiElementSubpanel: function($container, panelOptions, elements) {
            _(elements).each(function(element) {
                this.insertSimpleSubpanel($container, panelOptions, element);
            }, this);
            if(!this.options.prerequisiteToAdd){
                if(!panelOptions.hasOwnProperty('maxLength') || elements.length < panelOptions.maxLength) {
                    this.insertAddNewButton($container, panelOptions.title);
                }
            }else{
                // Display message in place of 'add new' button as panel should not be enabled for add
                this.insertMessage($container, this.options.prerequisiteToAdd);
            }
        },

        insertMessage: function($container, message) {
            // Message should already have been translated by PivotVisualizationManager
            $container.append("<div class='concertina-message'>" + message + "</div>");
        },

        insertSimpleSubpanel: function($container, panelOptions, element) {
            var child = this.children['subpanel_' + _(this.children).size()] = new VisualizationConfigSubpanel({
                apiResources: this.apiResources.subpanel,
                panel: panelOptions,
                hideFieldPicker: this.options.hideFieldPicker,
                model: {
                    element: element,
                    visualization: this.model.visualization
                }
            });
            child.render().appendTo($container);
        },

        insertAddNewButton: function($container, panelTitle) {
             var possibleFields = this.model.dataTable.getFieldList(),
                 panelOptions = this.options.panel,
                 elementType = panelOptions.elementType;

            if(panelOptions.hasOwnProperty('dataTypes')) {
                possibleFields = _(possibleFields).filter(function(field) {
                    return _(panelOptions.dataTypes).contains(field.type);
                }, this);
            }
            // selective remove some fields from the list that are available for add
            // here we are enforcing that the same row- or column-split cannot be added twice
            if(elementType in { row: true, column: true }) {
                var existingFieldNames = this.model.report.getElementCollectionByType(elementType).pluck('fieldName');
                possibleFields = _(possibleFields).filter(function(field) {
                    return !_(existingFieldNames).contains(field.fieldName);
                }, this);
            }

            if(this.children.addSubpanelMenu) {
                this.children.addSubpanelMenu.remove();
            }
            this.children.addSubpanelMenu = new AddSubpanelDropDownMenu({
                items: possibleFields,
                label: splunkUtils.sprintf(_('Add %s').t(), panelTitle)
            });
            this.children.addSubpanelMenu.render().appendTo($container);
            this.children.addSubpanelMenu.on('itemClicked', function(fieldName, field) {
                this.addSubpanel(fieldName, field, this.model.dataTable);
            }, this);
        },

        addSubpanel: function(fieldName, field, dataTable) {
            var panelOptions = this.options.panel,
                elementType = panelOptions.elementType,
                newAttrs = dataTable.getFieldByName(field.fieldName);

            $.extend(newAttrs, panelOptions.setAttributes);
            if(panelOptions.hasOwnProperty('newElementHandler')) {
                var newElement = this.model.report.createNewElement(elementType, newAttrs),
                    addOptions = panelOptions.newElementHandler(newElement);

                this.model.report.addElement(elementType, newElement, addOptions);
            }
            else {
                this.model.report.addElement(elementType, newAttrs);
            }
        },

        handleValidation: function(isValid) {
            var $headingMessage = this.$('.heading-message');
            if(isValid) {
                this.$('.concertina-heading').removeClass('error');
                $headingMessage.text($headingMessage.attr('data-valid-text') || '');
            }
            else {
                this.$('.concertina-heading').addClass('error');
                $headingMessage.text(_('Error').t());
            }
        },

        template: '\
            <div class="concertina-heading <%- headingClassName || \'\' %>">\
                <a href="#" class="concertina-toggle">\
                    <!--i class="icon-circle"></i-->\
                    <%- panelOptions.description || panelOptions.title %>\
                    <span class="heading-message" data-valid-text="<%- headingMessage %>"><%- headingMessage || \'\' %></span>\
                </a>\
            </div>\
            <div class="concertina-group-body panel-body">\
                <div class="flash-messages-placeholder"></div>\
            </div>\
        ',

        sectionDividerTemplate: '<div class="panel-section-divider"></div>'

    },
    {
        apiDependencies: {
            dataTable: PivotableDataTable,

            subpanel: VisualizationConfigSubpanel
        }
    });

    return DeclarativeDependencies(VisualizationConfigPanel);

});
