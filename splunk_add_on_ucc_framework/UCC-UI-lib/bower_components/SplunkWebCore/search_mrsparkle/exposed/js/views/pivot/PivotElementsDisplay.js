/**
 * @author sfishel
 *
 * A view that displays the state of a pivot report.
 *
 * Child Views:
 *
 * inspectorView <views/pivot/config_popups/ElementInspector> the popup dialog used to edit a pivot an element in place
 * creatorView <views/pivot/config_popups/ElementCreator> the popup dialog used to add a new pivot element
 */

define([
            'jquery',
            'underscore',
            'module',
            'models/shared/Application',
            'models/pivot/PivotReport',
            'views/extensions/DeclarativeDependencies',
            'views/Base',
            'views/pivot/config_popups/PivotConfigWizard',
            'views/pivot/config_popups/TimeRangeInspector',
            'views/shared/delegates/Popdown',
            'uri/route',
            'helpers/user_agent',
            './PivotElementsDisplay.pcss',
            'jquery.ui.sortable',
            'bootstrap.tooltip'
        ],
        function(
            $,
            _,
            module,
            Application,
            PivotReport,
            DeclarativeDependencies,
            BaseView,
            PivotConfigWizard,
            TimeRangeInspector,
            Popdown,
            route,
            userAgent,
            css
            // remaining dependencies do not export
        ) {

    // SPL-70729, tooltips do not play well with drag-and-drop in IE 7
    var USE_BOOTSTRAP_TOOLTIPS = !userAgent.isIE7();

    // this is duplicated in PivotReport, but circular references happen if we try to import that module here
    var REPORT_LEVEL_ATTR_FILTER = [
        '^showRowSummary$',
        '^rowLimitType$',
        '^rowLimitAmount$',
        '^showColSummary$',
        '^colLimitAmount$',
        '^showOtherCol$'
    ];

    var PivotElementsDisplay = BaseView.extend({

        DROP_TO_REMOVE_CLASS: 'ui-sortable-drop-to-remove',
        ACCEPT_DROP_CLASS: 'ui-sortable-drop-acceptor',

        ELEMENT_WIDTH: 170,
        ELEMENT_OFFSET: 100,

        moduleId: module.id,

        /**
         * @constructor
         * @param options {Object} {
         *     model: {
         *         report: <models/pivot/PivotReport> the pivot report model
         *         dataModel: <models/services/datamodel/DataModel> the data model being reported on
                   appLocal <models.services.AppLocal> the local splunk app
                   application <models.services.AppLocal> the application model
                   user <models.services/admin.User> the current user
         *     }
         *     collection: {
         *         timePresets <collections/services/data/ui/Times> the user-specific preset time preferences
         *     }
         * }
         */

        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);

            this.inspectorPopdown = new Popdown({
                el: this.el,
                toggle: '.inspect-button, .clickable-label',
                dialog: '.inspector-dialog',
                mode: 'dialog',
                attachDialogTo: 'body',
                ignoreClasses: ['dropdown-menu', 'ui-datepicker']
            });

            this.inspectorPopdown.on('show', function($target) {
                var id = this.resolveElementId($target[0]),
                    type = this.resolveElementType($target[0]);

                this.onInspectorShow(type, id);
            }, this);

            this.inspectorPopdown.on('shown', function() {
                this.children.inspectorView.onShown();
            }, this);

            this.creatorPopdown = new Popdown({
                el: this.el,
                toggle: '.add-button',
                dialog: '.creator-dialog',
                mode: 'dialog',
                attachDialogTo: 'body',
                scrollContainer: false,
                ignoreClasses: ['dropdown-menu', 'ui-datepicker']
            });

            this.creatorPopdown.on('show', function($target) {
                var type = this.resolveElementType($target[0]);
                this.onCreatorShow(type);
            }, this);

            this.creatorPopdown.on('shown', function() {
                this.children.creatorView.onShown();
            }, this);

        },

        remove: function() {
            var $filterList = this.$('.element-list[data-elem-type="filter"]'),
                $rowList = this.$('.element-list[data-elem-type="row"]'),
                $columnList = this.$('.element-list[data-elem-type="column"]'),
                $cellList = this.$('.element-list[data-elem-type="cell"]');

            $filterList.sortable('destroy');
            $cellList.sortable('destroy');
            $rowList.sortable('destroy');
            $columnList.sortable('destroy');
            this.removeTooltips(this.$el);
            this.inspectorPopdown.off(null, null, this);
            this.creatorPopdown.off(null, null, this);
            return BaseView.prototype.remove.call(this);
        },

        disable: function() {
            this.$disabledScreen = $('<div class="disabled-screen"></div>');
            this.$el.append(this.$disabledScreen);
        },

        render: function() {
            var html = _(this.rootTemplate).template({
                model: this.model.report,
                tableHelpHref: route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.pivot.about'
                )
            });

            this.$el.html(html);
            this.$creatorDialogEl = this.$('.creator-dialog');
            this.$inspectorDialogEl = this.$('.inspector-dialog');
            this.renderFilters();
            this.renderCells();
            this.renderRows();
            this.renderColumns();

            this.configureSortable();
            return this;
        },

        // TODO: maybe move these next four out to separate views?
        renderFilters: function() {
            if(!this.awake) {
                return;
            }
            var container = this.$('.element-list[data-elem-type="filter"]'),
                filterList = this.model.report.getFilterList(),
                timestampFilter = _(filterList).findWhere({ type: 'timestamp' });

            // special case for the time-picker control, render it first and as a non-draggable element
            if(timestampFilter) {
                var timestampFilterHtml = _(this.nonDraggableElementTemplate).template({ element: timestampFilter });
                container.find('.list-header').after(timestampFilterHtml);
            }

            this.updateElementList(container, _(filterList).without(timestampFilter));
        },

        renderCells: function() {
            if(!this.awake) {
                return;
            }
            var container = this.$('.element-list[data-elem-type="cell"]');
            this.updateElementList(container, this.model.report.getCellList());
        },

        renderRows: function() {
            if(!this.awake) {
                return;
            }
            var rowList = this.model.report.getRowList(),
                $container = this.$('.element-list[data-elem-type="row"]');
            this.updateElementList($container, rowList);
        },

        renderColumns: function() {
            if(!this.awake) {
                return;
            }
            var columnList = this.model.report.getColumnList(),
                $container = this.$('.element-list[data-elem-type="column"]');
            this.updateElementList($container, columnList);
        },

        onInspectorShow: function(type, id) {
            var elementModel = this.model.report.getElement(type, id),
                elementClone = elementModel.clone(),
                reportClone = this.cloneReportLevelAttributes(this.model.report);

            if(this.children.inspectorView) {
                this.children.inspectorView.off();
                this.children.inspectorView.remove();
            }
            if(type === 'filter' && elementModel.get('type') === 'timestamp') {
                this.children.inspectorView = new TimeRangeInspector({
                    apiResources: this.apiResources.timeRangeInspector,
                    model: {
                        element: elementClone
                    }
                });
                this.listenToOnce(elementClone.timeRange, 'applied', function() {
                    this.inspectorPopdown.hide();
                });
            }
            else {
                this.children.inspectorView = new PivotConfigWizard({
                    apiResources: this.apiResources.configWizard,
                    model: {
                        existingElement: elementClone,
                        report: reportClone
                    },
                    elementType: type,
                    elementIndex: this.model.report.getElementCollectionByType(type).indexOf(elementModel)
                });
            }
            this.children.inspectorView.render().$el.appendTo(this.$inspectorDialogEl);

            // we have to do a hot-swap to correctly update the model, since the user may have selected a different data type
            this.children.inspectorView.on('action:update', function(type, updatedModel) {
                // make sure the element and report are valid
                // and that the new state of the element is compatible with the current report state
                if(!updatedModel.isValid(true) || !reportClone.isValid(true) || !this.elementIsCompatible(updatedModel)) {
                    this.inspectorPopdown.adjustPosition();
                    return;
                }
                if(!_.isEqual(elementModel.attributes, updatedModel.attributes)) {
                    // update the report-level attributes silently since hotSwapElement will always trigger a change event
                    this.updateReportLevelAttributes(reportClone, { silent: true });
                    this.model.report.hotSwapElement(type, elementModel, updatedModel.attributes);
                }
                else {
                    // update the report-level attributes with no flags and let change events fire as needed
                    this.updateReportLevelAttributes(reportClone);
                }
                this.inspectorPopdown.hide();
            }, this);
            this.children.inspectorView.on('action:removeElement', function() {
                this.model.report.removeElement(type, elementModel);
                this.inspectorPopdown.hide();
            }, this);
            this.children.inspectorView.on('changeContents', function() {
                this.inspectorPopdown.adjustPosition();
            }, this);
            this.children.inspectorView.on('hide', function() {
                this.inspectorPopdown.hide();
            }, this);
        },

        onCreatorShow: function(type) {
            var reportClone = this.cloneReportLevelAttributes(this.model.report);
            if(this.children.creatorView) {
                this.children.creatorView.off();
                this.children.creatorView.remove();
            }
            this.children.creatorView = new PivotConfigWizard({
                apiResources: this.apiResources.configWizard,
                model: {
                    report: reportClone
                },
                elementType: type,
                elementIndex: this.model.report.getElementCollectionByType(type).length
            });
            this.children.creatorView.render().$el.appendTo(this.$creatorDialogEl);

            this.children.creatorView.on('action:addElement', function(type, model) {
                // make sure the element and report are valid
                // and that the new element is compatible with the current report state
                if(!model.isValid(true) || !reportClone.isValid(true) || !this.elementIsCompatible(model)) {
                    this.creatorPopdown.adjustPosition();
                    return;
                }
                // update the report-level attributes silently since addElement will always trigger a change event
                this.updateReportLevelAttributes(reportClone, { silent: true });
                this.model.report.addElement(type, model);
                this.creatorPopdown.hide();
            }, this);
            this.children.creatorView.on('hide', function() {
                this.creatorPopdown.hide();
            }, this);
        },

        // a way to clone the report but only get the pivot-relevant report level attributes
        // this is defending against the case where unrelated attributes might be in an invalid state
        cloneReportLevelAttributes: function(report) {
            var clone = new report.constructor();
            clone.setFromPivotJSON(report.getPivotJSON());
            clone.entry.content.set(
                report.entry.content.filterByWildcards(REPORT_LEVEL_ATTR_FILTER, { allowEmpty: true })
            );
            return clone;
        },

        updateReportLevelAttributes: function(clone, options) {
            var setObject = clone.entry.content.filterByWildcards(REPORT_LEVEL_ATTR_FILTER, { allowEmpty: true });
            this.model.report.entry.content.set(setObject, options);
        },

        elementIsCompatible: function(element) {
            var elementType = element.get('elementType');

            var labelAlreadyExists = function(collection, element) {
                return collection.any(function(model) {
                    return !(model.get('fieldName') === element.get('fieldName') && model.get('elementType') === element.get('elementType'))
                                && model.getComputedLabel() === element.getComputedLabel();
                });
            };

            // for row-splits and cell values, no two elements can have the same label
            if(elementType in { row: true, cell: true } &&
                    (labelAlreadyExists(this.model.report.getElementCollectionByType('row'), element)
                        || labelAlreadyExists(this.model.report.getElementCollectionByType('cell'), element))) {

                var errorMessage = _('Each Row Split and Column Value label must be unique.').t();

                // this needs to be deferred because the validation plugin also defers its events
                _.defer(function() {
                    element.trigger('validated', false, element, { label: errorMessage });
                });
                return false;
            }
            return true;
        },

        updateElementList: function($container, elementList) {
            var elem, $elem,
                byIdMap = {},
                $addButton = $container.find('.add-button');

            this.removeTooltips($container);

            // begin element update routine
            // first detach each element from the DOM and store them in a map by id
            _($container.find('.draggable-element')).each(function(elem) {
                var id = this.resolveElementId(elem);
                $(elem).detach();
                byIdMap[id] = elem;
            }, this);
            // then loop through the collection and use it to update the DOM
            _(elementList).each(function(element) {
                // if this element already existed, re-insert and update the info
                if(byIdMap[element.id]) {
                    elem = byIdMap[element.id];
                    $elem = $(elem);
                    $addButton.before(elem);
                    $elem.find('.element-label').text(element.label).attr('title', element.label);
                    // null the element out of the map so we know it has been dealt with
                    byIdMap[element.id] = null;
                }
                // otherwise, run the template and create a new one
                else {
                    var html = _(this.elementTemplate).template({
                        element: element
                    });
                    $addButton.before($(html));
                }
            }, this);
            // last, explicitly remove any elements left in the map to avoid memory leaks
            _(byIdMap).each(function(elem) {
                if(_(elem).isElement()) {
                    $(elem).remove();
                }
            });

            if(USE_BOOTSTRAP_TOOLTIPS) {
                $container.find('.element-label').tooltip({
                    animation: false,
                    container: 'body',
                    placement: function(tooltip) {
                        // Use the placement hook to add a custom classname to the tooltip container.
                        $(tooltip).addClass('tooltip-full-width');
                        return 'top';
                    }
                });
            }
        },

        removeTooltips: function($container) {
            if(USE_BOOTSTRAP_TOOLTIPS) {
                $container.find('.element-label').each(function() { $(this).tooltip('destroy'); });
            }
        },

        configureSortable: function() {
            var that = this,
                $filterList = this.$('.element-list[data-elem-type="filter"]'),
                $rowList = this.$('.element-list[data-elem-type="row"]'),
                $columnList = this.$('.element-list[data-elem-type="column"]'),
                $cellList = this.$('.element-list[data-elem-type="cell"]'),

                $container = this.$('.config-table'),
                containerTop, containerBottom;

            var sortableOptions = {
                tolerance: 'pointer',
                items: '.draggable-element',
                scroll: false,
                delay: 5,
                helper: 'clone',
                appendTo: 'body',
                start: function(event, ui) {
                    containerTop = $container.offset().top;
                    containerBottom = containerTop + $container.height();
                    that.onSortStart(ui.placeholder[0]);
                },
                sort: function(event, ui) {
                    var itemElem = ui.helper[0],
                        originalElem = ui.item[0],
                        itemOffset = ui.helper.offset(),
                        containerBounds = {
                            top: containerTop,
                            bottom: containerBottom
                        };

                    that.onSortDrag(itemElem, itemOffset, containerBounds, originalElem);
                },
                stop: function(event, ui) {
                    var itemElem = ui.item[0],
                        receiverElem = this;

                    that.onSortStop(itemElem, receiverElem);
                }
            };

            var connectedSortableOptions = $.extend({}, sortableOptions, {

                connectWith: '.connected-list',

                receive: function(event, ui) {
                    var itemElem = ui.item[0],
                        senderElem = ui.sender[0],
                        receiverElem = this,
                        removeOriginal = !event.altKey;

                    that.onSortTransferReceive(itemElem, senderElem, receiverElem, removeOriginal);
                },
                activate: function(event, ui) {
                    var itemElem = ui.item[0],
                        receiverElem = this;

                    that.onSortReceiverActivate(receiverElem, itemElem);
                },
                deactivate: function(event, ui) {
                    var recieverElem = this;
                    that.onSortReceiverDeactivate(recieverElem);
                }
            });

            $filterList.sortable(sortableOptions);
            $cellList.sortable(connectedSortableOptions);
            $rowList.sortable(connectedSortableOptions);
            $columnList.sortable(connectedSortableOptions);
        },

        onSortStart: function(placeHolderElem) {
            // FIXME: this is a temporary hack, need some text inside the placeholder for the add button to align to
            $(placeHolderElem).text('&nbsp;');
        },

        onSortDrag: function(itemElem, itemOffset, containerBounds, originalElem) {
            var $item = $(itemElem),
                $original = $(originalElem),
                itemTop = itemOffset.top,
                itemBottom = itemTop + $item.height();

            if(itemBottom < containerBounds.top || itemTop > containerBounds.bottom) {
                $item.addClass(this.DROP_TO_REMOVE_CLASS);
                $original.addClass(this.DROP_TO_REMOVE_CLASS);
            }
            else {
                $item.removeClass(this.DROP_TO_REMOVE_CLASS);
                $original.removeClass(this.DROP_TO_REMOVE_CLASS);
            }
        },

        onSortStop: function(itemElem, receiverElem) {
            var type, $item = $(itemElem);
            if($item.hasClass(this.DROP_TO_REMOVE_CLASS)) {
                // the item was dropped outside the sort area, remove it
                type = this.resolveElementType(itemElem);
                var id = this.resolveElementId(itemElem);

                this.model.report.removeElement(type, id);
            }
            else {
                // the item was dropped back in the same element bucket, update the order
                type = this.resolveElementType(receiverElem);
                var newOrder = _($('.element', $(receiverElem))).map(function(elem) {
                        return this.resolveElementId(elem);
                    }, this);
                this.model.report.reSortElements(type, newOrder);
            }
        },

        // FIXME: this is a little dirty, there must be a better way...
        onSortTransferReceive: function(itemElem, senderElem, receiverElem, removeOriginal) {
            var $itemElem = $(itemElem),
                $senderElem = $(senderElem),
                sourceType = this.resolveElementType(senderElem),
                elementId = this.resolveElementId(itemElem);

            if($itemElem.hasClass(this.DROP_TO_REMOVE_CLASS)) {
                this.model.report.removeElement(sourceType, elementId);
                $itemElem.removeClass(this.DROP_TO_REMOVE_CLASS);
                $senderElem.sortable('cancel');
                return;
            }
            var destinationType = this.resolveElementType(receiverElem),
                fieldType = this.resolveFieldType(itemElem);

            if(fieldType in { objectCount: true, childCount: true } && destinationType in { row: true, column: true }) {
                $senderElem.sortable('cancel');
                return;
            }

            var insertIndex = _($(receiverElem).find('.element')).chain()
                .map(function(elem) {
                    return this.resolveElementId(elem);
                }, this)
                .indexOf(elementId)
                .value();

            $senderElem.sortable('cancel');
            this.model.report.transferElement(sourceType, destinationType, elementId, {
                at: insertIndex,
                removeOriginal: !!removeOriginal
            });
        },

        onSortReceiverActivate: function(receiverElem, itemElem) {
            var destinationType = this.resolveElementType(receiverElem),
                sourceFieldType = this.resolveFieldType(itemElem);

            if(sourceFieldType === 'objectCount' && destinationType in { row: true, column: true }) {
                return;
            }
            $(receiverElem).addClass(this.ACCEPT_DROP_CLASS);

        },

        onSortReceiverDeactivate: function(receiverElem) {
            $(receiverElem).removeClass(this.ACCEPT_DROP_CLASS);
        },

        resolveElementType: function(elem) {
            return $(elem).closest('.element-list').attr('data-elem-type');
        },

        resolveFieldType: function(elem) {
            return $(elem).closest('.element').attr('data-field-type');
        },

        resolveElementId: function(elem) {
            return $(elem).closest('.element').attr('data-elem-id');
        },

        rootTemplate: '\
            \
            <a class="table-help-link" href="<%- tableHelpHref %>" target="_blank"><span><%- _("Documentation").t() %></span><i class="icon-external icon-no-underline"></i></a>\
            <table class="table table-bordered config-table">\
                <thead>\
                    <tr>\
                        <td>\
                            <div class="element-list" data-elem-type="filter">\
                                <h6 class="list-header"><%- _("Filters").t() %></h6>\
                                <a href="#" class="btn add-button">+</a>\
                            </div>\
                        </td>\
                        <td>\
                            <div class="element-list connected-list" data-elem-type="column">\
                                <h6 class="list-header"><%- _("Split Columns").t() %></h6>\
                                <a href="#" class="btn add-button">+</a>\
                            </div>\
                        </td>\
                    </tr>\
                    <tr>\
                        <td>\
                            <div class="element-list connected-list" data-elem-type="row">\
                                <h6 class="list-header"><%- _("Split Rows").t() %></h6>\
                                <a href="#" class="btn add-button">+</a>\
                            </div>\
                        </td>\
                        <td>\
                            <div class="element-list connected-list" data-elem-type="cell">\
                                <h6 class="list-header"><%- _("Column Values").t() %></h6>\
                                <a href="#" class="btn add-button">+</a>\
                            </div>\
                        </td>\
                    </tr>\
                </thead>\
            </table>\
            <div class="popdown-dialog inspector-dialog">\
                <div class="arrow"></div>\
            </div>\
            <div class="popdown-dialog creator-dialog">\
                <div class="arrow"></div>\
            </div>\
        ',

        elementTemplate: '\
            <div class="btn-combo element draggable-element" \
            data-elem-id="<%= element.id %>" data-field-type="<%= element.type %>">\
                <div class="btn btn-draggable element-label" title="<%- element.label %>"><%- element.label %></div>\
                <a href="#" class="btn inspect-button"><i class="icon-pencil"></i></a>\
            </div>\
        ',

        nonDraggableElementTemplate: '\
            <div class="btn-combo element" \
            data-elem-id="<%= element.id %>" data-field-type="<%= element.type %>">\
                <div class="btn element-label clickable-label" title="<%- element.label %>"><%- element.label %></div>\
                <a href="#" class="btn inspect-button"><i class="icon-pencil"></i></a>\
            </div>\
        '

    },
    {
        apiDependencies: {
            report: PivotReport,
            application: Application,

            configWizard: PivotConfigWizard,
            timeRangeInspector: TimeRangeInspector
        }
    });

    return DeclarativeDependencies(PivotElementsDisplay);

});
