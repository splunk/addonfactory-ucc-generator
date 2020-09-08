/**
 * @author sfishel
 *
 * A popup dialog view for adding a new pivot element.
 *
 * Child Views:
 *
 * objectFieldList <views/shared/datamodel/DataTableFieldList> a field list for selecting an element to add
 * previewPane <views/pivot/config_popups/AddElementPane or views/pivot/config_popups/AddTimeFilterPane>
 *             the view that renders form controls for editing the element before adding
 *
 * Custom Events:
 *
 * action:loadRecentElement - triggered when an element should be loaded from the recent element history
 *     @param elementType {String} the element type ("filter", "cell", "row", or "column")
 *     @param elementId {String} the cid of the element to load
 * action:addElement - triggered when an element should be added to the report
 *     @param elementType {String} the element type ("filter", "cell", "row", or "column")
 *     @param element <sub-class of models/pivot/elements/BaseElement> the element model to add
 *
 */


define([
            'jquery',
            'underscore',
            'module',
            'models/shared/Application',
            'models/services/datamodel/DataModel',
            'models/pivot/datatable/PivotableDataTable',
            'views/extensions/DeclarativeDependencies',
            'views/Base',
            'views/pivot/DataTableFieldList',
            './AddElementPane',
            './InspectElementPane'
        ],
        function(
            $,
            _,
            module,
            Application,
            DataModel,
            PivotableDataTable,
            DeclarativeDependencies,
            BaseView,
            DataTableFieldList,
            AddElementPane,
            InspectElementPane
        ) {

    var PivotConfigWizard = BaseView.extend({

        SLIDE_ANIMATION_DISTANCE: 460,
        SLIDE_ANIMATION_DURATION: 200,

        elementModel: null,
        previewPane: null,

        moduleId: module.id,

        events: {
            'click .back-button': function(e) {
                e.preventDefault();
                this.showFieldPicker();
            }
        },

        /**
         * @constructor
         * @param options {Object} {
         *     model: {
         *         report: <models/pivot/PivotReport> the pivot report model
         *         dataTable: <models/pivot/datatables/PivotableDataTabl> the data table being reported on
         *         dataModel: <models/services/datamodel/DataModel> the data model being reported on
         *         application: <models/shared/Application> the application state model
         *         existingElement: <sub-class of models/pivot/elements/BaseElement> (optional) an existing element, if we are editing in place
         *     }
         *     elementType: {String} the element type ("filter", "cell", "row", or "column")
         *     elementIndex: {Integer} the index of the element being edited, or the index where it will be added
         * }
         */

        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            options = options || {};
            this.elementType = options.elementType;
            this.elementIndex = options.elementIndex;
            // by default, start with the field picker active, this instance variable will track the active interface
            this.fieldPickerActive = true;

            var fieldListOptions = {
                model: this.model.dataTable,
                dataModelIsTemporary: this.model.dataModel.isTemporary()
            };
            if(this.elementType === 'cell') {
                fieldListOptions.dataTypeBlacklist = ['boolean'];
            }
            else {
                fieldListOptions.showEventFields = false;
            }

            if(this.elementType === 'filter') {
                fieldListOptions.showTimestampFields = false;
            }
            // figure out if any fields need to be hidden from the field picker list
            // here we are enforcing that the same row- or column-split cannot be added twice
            if(this.elementType in { row: true, column: true }) {
                fieldListOptions.hiddenFieldList = this.model.report.getElementCollectionByType(this.elementType).pluck('fieldName');
                if(this.model.existingElement) {
                    fieldListOptions.hiddenFieldList = _(fieldListOptions.hiddenFieldList).without(this.model.existingElement.get('fieldName'));
                }
            }
            this.children.objectFieldList = new DataTableFieldList(fieldListOptions);
            this.children.objectFieldList.on('action:selectField', function(name, owner) {
                var selectedField = this.model.dataTable.getFieldByName(name);
                this.showPreviewPane(selectedField);
            }, this);
            this.children.objectFieldList.on('action:saveDataModel', function() {
                this.trigger('hide');
                this.model.dataModel.trigger('save');
            }, this);
        },

        render: function() {
            var html = _(this.template).template({
                id: this.cid
            });
            this.$el.html(html);
            this.$('.field-list-container').append(this.children.objectFieldList.render().el);

            this.$slideArea = this.$('.slide-area').eq(0);
            this.$pickerPaneWrapper = this.$('.field-picker-wrapper').eq(0);
            this.$elementEditorWrapper = this.$('.element-editor-wrapper').eq(0);
            this.$previewPaneWrapper = this.$('.preview-pane-wrapper').eq(0);

            if(this.model.existingElement) {
                this.showPreviewPane($.extend({}, this.model.existingElement.attributes), true);
            }
            else {
                // if we're rendering with the field picker visible, make sure to hide the editor
                this.$elementEditorWrapper.css('display', 'none');
            }

            return this;
        },

        showPreviewPane: function(elementAttrs, skipAnimation) {
            // prepare and render the element preview pane view
            if(this.elementModel) {
                this.elementModel.off();
            }
            this.elementModel = this.model.report.createNewElement(this.elementType, elementAttrs);
            if(this.model.existingElement) {
                this.children.previewPane = new InspectElementPane({
                    model: {
                        element: this.elementModel,
                        report: this.model.report,
                        dataModel: this.model.dataModel,
                        application: this.model.application,
                        dataTable: this.model.dataTable
                    },
                    elementType: this.elementType,
                    elementIndex: this.elementIndex
                });
            }
            else {
                this.children.previewPane = new AddElementPane({
                    model: {
                        element: this.elementModel,
                        report: this.model.report,
                        dataModel: this.model.dataModel,
                        application: this.model.application,
                        dataTable: this.model.dataTable
                    },
                    elementType: this.elementType,
                    elementIndex: this.elementIndex
                });
            }
            this.$previewPaneWrapper.append(this.children.previewPane.render().el);

            if(skipAnimation) {
                this.showPreviewPaneImmediate();
            }
            else {
                this.showPreviewPaneAnimated();
            }

            // wire up event listeners
            this.children.previewPane.on('action:addElement', function(model) {
                this.trigger('action:addElement', this.elementType, model);
            }, this);
            this.children.previewPane.on('action:removeElement', function(model) {
                this.trigger('action:removeElement', this.elementType, model);
            }, this);
            this.children.previewPane.on('action:update', function(model) {
                this.trigger('action:update', this.elementType, model);
            }, this);
            this.children.previewPane.on('action:changeTab changeContents', function() {
                this.trigger('changeContents');
            }, this);
        },

        showFieldPicker: function() {
            var that = this,
                $from = this.$elementEditorWrapper,
                $to = this.$pickerPaneWrapper;

            this.onBeforePaneAnimation($from, $to);
            this.$slideArea.animate({
                height: this.$pickerPaneWrapper.height()
            },
            {
                duration: this.SLIDE_ANIMATION_DURATION,
                complete: function() {
                    that.onAfterPaneAnimation($from, $to);
                    that.fieldPickerActive = true;
                    that.onFieldPickerShown();
                    that.children.previewPane.remove();
                    that.trigger('changeContents');
                }
            });
            this.$pickerPaneWrapper.animate({
                marginLeft: 0
            }, {
                duration: this.SLIDE_ANIMATION_DURATION
            });
        },

        showPreviewPaneImmediate: function() {
            this.$pickerPaneWrapper.height(0).css({
                'margin-left': -this.SLIDE_ANIMATION_DISTANCE,
                display: 'none'
            });
            this.fieldPickerActive = false;
        },

        showPreviewPaneAnimated: function() {
            var that = this,
                $from = this.$pickerPaneWrapper,
                $to = this.$elementEditorWrapper;

            this.onBeforePaneAnimation($from, $to);
            this.$slideArea.animate({
                height: this.$elementEditorWrapper.height()
            },
            {
                duration: this.SLIDE_ANIMATION_DURATION,
                complete: function() {
                    that.onAfterPaneAnimation($from, $to);
                    that.fieldPickerActive = false;
                    that.onPreviewPaneShown();
                    that.trigger('changeContents');
                }
            });
            this.$pickerPaneWrapper.animate({
                marginLeft: -this.SLIDE_ANIMATION_DISTANCE
            }, {
                duration: this.SLIDE_ANIMATION_DURATION
            });
        },

        // sets up heights of the 'from' and 'to' elements for a smooth animation
        onBeforePaneAnimation: function($from, $to) {
            this.$slideArea.css('height', $from.height() + 'px');
            $to.css({ height: '', display: '' });
            $from.css({ display: '' });
        },

        // undo the height manipulations that were applied to make a smooth animation
        onAfterPaneAnimation: function($from, $to) {
            this.$slideArea.css('height', '');
            $from.css({ height: '0', display: 'none' });
        },

        onShown: function() {
            if(this.fieldPickerActive) {
                this.onFieldPickerShown();
            }
            else {
                this.onPreviewPaneShown();
            }
        },

        onPreviewPaneShown: function() {
            // TODO [sff] don't reach into preview pane sub-view
            this.adjustMaxHeight(this.$previewPaneWrapper.find('.pivot-config-content'));
            var $textInputs = this.$previewPaneWrapper.find('input[type="text"]');
            if($textInputs.length > 0) {
                $textInputs.first().focus();
            }
            else {
                this.$previewPaneWrapper.find('a').first().focus();
            }
        },

        onFieldPickerShown: function() {
            this.adjustMaxHeight(this.$pickerPaneWrapper.find('.pivot-config-content'));
            this.$pickerPaneWrapper.find('a').first().focus();
        },

        adjustMaxHeight: function($flexElement) {
            // TODO [sff] kind of hacky to reach up and measure the parent
            var buffer = 5,
                $container = this.$el.parent(),
                heightDiff = $container.offset().top + $container.height() - $(window).height(),
                targetMaxHeight = $flexElement.height() - parseFloat($flexElement.css('padding-bottom'))
                                            - parseFloat($flexElement.css('border-bottom-width')) - heightDiff - buffer,
                existingMaxHeight = parseFloat($flexElement.css('max-height'));

            if(!existingMaxHeight || targetMaxHeight < existingMaxHeight) {
                $flexElement.css('max-height', targetMaxHeight + 'px');
            }
        },

        template: '\
            <div class="slide-area">\
                <div class="field-picker-wrapper">\
                    <div class="pivot-config-content">\
                        <div id="new-<%= id %>" class="field-list-container"></div>\
                    </div>\
                </div>\
                <div class="element-editor-wrapper">\
                    <div class="back-button-column">\
                        <a href="#" class="btn back-button"><i class="icon-arrow-left"></i></a>\
                    </div>\
                    <div class="preview-pane-wrapper"></div>\
                </div>\
            </div>\
        '

    },
    {
        apiDependencies: {
            dataModel: DataModel,
            application: Application,
            dataTable: PivotableDataTable
        }
    });

    return DeclarativeDependencies(PivotConfigWizard);

});