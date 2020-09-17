/**
 * @author lbudchenko
 * @date 8/13/15
 *
 * Grid component of listing page
 */
define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'helpers/grid/RowIterator',
    'views/shared/FlashMessages',
    'views/shared/delegates/TableRowToggle',
    'views/shared/controls/SyntheticCheckboxControl',
    './GridRow',
    'views/shared/delegates/ColumnSort',
    'contrib/text!./Grid.html',
    'uri/route',
    'util/splunkd_utils'
],
    function(
        $,
        _,
        module,
        BaseView,
        RowIterator,
        FlashMessagesView,
        TableRowToggleView,
        SyntheticCheckbox,
        GridRow,
        ColumnSort,
        template,
        route,
        splunkDUtils
        ){
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);

                this.options = options || {};

                this.options.bulkedit = this.options.bulkedit || {};
                _(this.options.bulkedit).defaults({
                   enable: false
                });

                if (this.options.customViews.MoreInfo) {
                    this.children.tableRowToggle = new TableRowToggleView({el: this.el, collapseOthers: false });
                }

                this.GridRowClass = this.options.customViews.GridRow || GridRow;

                this.children.columnSort = new ColumnSort({
                    el: this.el,
                    model: this.model.metadata,
                    autoUpdate: false
                });

                this.children.flashMessages = new FlashMessagesView({
                    className: 'message-single',
                    collection: {
                        sourcetypes: this.collection.entities
                    },
                    helperOptions: {
                        removeServerPrefix: true
                    }
                });

                this.collection.entities.on('change reset', function(){
                    this.debouncedRender();
                }, this);

                this.columns = this.options.grid.columns || this.GridRowClass.columns || [];
                this.canUseApps = this.model.user.canUseApps();
                this.children.gridRows = [];

                if (this.options.bulkedit.enable === true) {
                    this.children.selectAllCheckbox = new SyntheticCheckbox({
                        modelAttribute: 'selectall',
                        model: this.model.selectAllCheckbox,
                        additionalClassNames: 'select-all-checkbox'
                    });
                }

                /**
                 * If we have a column array of size n:
                 * - Expecting name column at index 0 of array (mandatory)
                 * - Force action   column at index 1 of array (mandatory)
                 * - All the n columns from this.columns if visible!
                 * - Force sharing  column at index last - 2 of array (if enabled)
                 * - Force status   column at index last - 1 of array (if enabled)
                 */
                if (this.options.customViews.GridRow) {
                    var tmpColumns = [];
                    if (this.columns.length > 0) {
                        tmpColumns.push(this.columns[0]);
                    }
                    // Skip index 0
                    for (var i = 1; i < this.columns.length; i++){
                        // Should not add the hidden columns to the list
                        var isVisibleFunction = this.columns[i].visible;
                        // isVisibleFunction not defined equivalent to default: visible=true
                        // Caution: isVisibleFunction is executed in the context of the Grid,
                        //          it is not executed in the context of the GridRow
                        if (_.isUndefined(isVisibleFunction) || isVisibleFunction.call(this)) {
                            tmpColumns.push(this.columns[i]);
                        }
                    }
                    if (this.options.grid.showSharingColumn) {
                        tmpColumns.push({
                            id: this.options.grid.sharingColumnSortKey || 'sharing',
                            title: _('Sharing').t()
                        });
                    }

                    if (this.options.grid.showStatusColumn) {
                        tmpColumns.push({
                            id: this.options.grid.statusColumnSortKey || 'status',
                            title: _('Status').t(),
                            noSort: !!this.options.grid.disableStatusColumnSort
                        });
                    }
                    this.columns = tmpColumns;
                }
            },
            events: {
                'click .select-all-checkbox': function (e) {
                    e.preventDefault();
                    this.model.controller.trigger('selectAllClicked');
                }
            },

            updateNoEntitiesMessage: function() {
                if (this.collection.entities.length === 0) {
                    this.children.flashMessages.flashMsgHelper.addGeneralMessage('no_entities',
                        {
                            type: splunkDUtils.ERROR,
                            html: this.createNoEntititesMessage()
                        });
                } else {
                    this.children.flashMessages.flashMsgHelper.removeGeneralMessage('no_entities');
                }
            },

            // for override
            createNoEntititesMessage: function() {
                return this.options.grid.noEntitiesMessage;
            },

            render: function() {
                var rowIterator = new RowIterator({
                    offset: this.collection.entities.paging.get('offset')
                });
                var html = this.compiledTemplate({
                    sortCellClass: ColumnSort.SORTABLE_ROW,
                    sortKeyAttribute: ColumnSort.SORT_KEY_ATTR,
                    canUseApps: this.canUseApps,
                    columns: this.columns,
                    that: this,
                    hasMoreInfo: this.options.customViews.MoreInfo,
                    enableBulkEdit: this.options.bulkedit.enable
                });
                var _GridRow = this.GridRowClass;

                var $html = $(html);

                this.removeGridRows();

                rowIterator.eachRow(this.collection.entities, function(entityModel, ix, rowNumber, isExpanded) {
                    var model = _.defaults({entity: entityModel}, this.model);
                    var gridRow = new _GridRow($.extend(this.options, {
                            model: model,
                            collection: this.collection,
                            customViews: this.customViews,
                            columns: this.columns,
                            template: this.options.templates.gridRow,
                            index: ix,
                            rowNumber: rowNumber
                        }));
                    $html.find(".grid-table-body").append(gridRow.render().el);

                    this.children.gridRows.push(gridRow);

                    if (this.options.customViews.MoreInfo) {
                        var moreInfo = new this.options.customViews.MoreInfo($.extend(this.options, {
                            model: model,
                            collection: this.collection,
                            customViews: this.customViews,
                            columns: this.columns,
                            index: ix
                        }));
                        $html.find(".grid-table-body").append(moreInfo.render().el);
                    }
                }, this);

                if (this.options.bulkedit.enable === true) {
                    this.children.selectAllCheckbox.render().appendTo($html.find('.col-entity-select-all'));
                }

                this.children.columnSort.update($html);
                this.$el.html($html);
                this.children.flashMessages.render().appendTo(this.$el);

                this.updateNoEntitiesMessage();

                return this;
            },

            removeGridRows: function () {
                this.children.gridRows = _.filter(this.children.gridRows, function (gridRow) {
                    gridRow.remove();
                    return false;
                }, this);
            }
        });
    });


