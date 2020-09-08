define([
        'module',
        'jquery',
        'underscore',
        'backbone',
        'splunkjs/mvc',
        'views/dashboard/form/Input',
        'views/dashboard/layout/BaseLayout',
        'views/dashboard/layout/Panel',
        'views/dashboard/layout/row_column/Row',
        'views/dashboard/form/GlobalFieldset',
        'views/dashboard/layout/row_column/Dragndrop',
        'controllers/dashboard/helpers/EditingHelper'
    ], function(module,
                $,
                _,
                Backbone,
                mvc,
                Input,
                BaseLayout,
                Panel,
                Row,
                GlobalFieldsetView,
                DragnDropView,
                EditingHelper) {

        var RowManager = Backbone.View.extend({
            initialize: function(options) {
                this.layout = options.layout;
                this._debouncedRowStructureChange = _.debounce(this._onRowStructureChange.bind(this), 10);
            },
            enable: function() {
                this.delegateEvents();
                this._listenToRowDOMChange();
                this._onRowStructureChange();
            },
            disable: function() {
                this.undelegateEvents();
                this._stopListenRowDOMChange();
            },
            _listenToRowDOMChange: function() {
                this._stopListenRowDOMChange();
                if (this.$('.dashboard-panel').length > 1) {
                    this.$el.on('DOMSubtreeModified', this._throttledAlignItemHeights.bind(this));
                    this._throttledAlignItemHeights();
                }
            },
            _stopListenRowDOMChange: function() {
                this.$el.off('DOMSubtreeModified');
            },
            // handle structure change
            _onRowStructureChange: function() {
                var editMode = this.layout.isEditMode();
                this._stopListenRowDOMChange();
                var cells = this.$el.children('.dashboard-cell');
                if (cells.length === 0) {
                    this.$el.addClass('empty');
                    return;
                }
                this._updateCellVisibility(cells);
                var visibleCells = editMode ? cells : cells.filter(':not(.hidden)');
                cells.removeClass('last-visible');
                visibleCells.last().addClass('last-visible');

                var visibleCellCount = visibleCells.length;
                var cellWidth = String(100 / visibleCellCount) + '%';

                cells.css({width: cellWidth}).find('.panel-element-row').each(function() {
                    var elements = $(this).find(editMode ? '.dashboard-element' : '.dashboard-element:not(.hidden)');
                    elements.css({width: String(100 / elements.length) + '%'});
                });
                if (visibleCellCount > 0) {
                    this._throttledAlignItemHeights();
                }
                this._listenToRowDOMChange();
            },
            _updateCellVisibility: function(cells) {
                // add hidden class to panel if all its children is hidden
                _.each(cells, function(cell) {
                    var $cell = $(cell);
                    var panel = mvc.Components.get($cell.attr('id'));
                    if (panel.tokenDependenciesMet()) {
                        var $elements = $cell.find('.dashboard-element');
                        var $inputs = $cell.find('.input');
                        var $hiddenElements = $elements.filter('.hidden');
                        if ($inputs.length == 0 && $elements.length > 0 && $hiddenElements.length == $elements.length) {
                            // hide panel in this case.
                            $cell.addClass('hidden');
                        }
                        else {
                            $cell.removeClass('hidden');
                        }
                    }
                }, this);
            },
            _throttledAlignItemHeights: function() {
                var self = this;
                if (!self._alignTimer) {
                    var immediate = self._lastAlign == null || ((+new Date()) - self._lastAlign > 1000);
                    self._alignTimer = setTimeout(function() {
                        self._alignItemHeights();
                        self._alignTimer = null;
                    }, immediate ? 50 : 1000);
                }
            },
            _alignItemHeights: function() {
                var row = this.$el, items = row.find('.dashboard-panel');
                items.css({'min-height': 0});
                if (items.length > 1) {
                    items.css({
                        'min-height': _.max(_.map(items, function(i) {
                            return $(i).height();
                        }))
                    });
                }
                this._lastAlign = +new Date();
            },
            events: {
                'structureChanged': '_debouncedRowStructureChange',
                'elementVisibilityChanged': '_debouncedRowStructureChange'
            }
        });

        return BaseLayout.extend({
            moduleId: module.id,
            className: 'dashboard-layout-row-column',
            initialize: function() {
                BaseLayout.prototype.initialize.apply(this, arguments);
                this.rowManagers = {};
                this.children.fieldset = null;
                this.listenTo(this.model.state, 'change:mode', this._onModeChange);
            },
            addChild: function(component) {
                var editMode = this.isEditMode() && this.deferreds.componentReady.state() == 'resolved';
                if (component instanceof Row) {
                    component.render().$el.appendTo(this.$el);
                    this._bindRowManager(component);
                    if (editMode) {
                        this.dragnDrop && this.dragnDrop.restart();
                        EditingHelper.highlight(component);
                    }
                } else if (component instanceof Panel) {
                    var row = new Row();
                    row.addChild(component);
                    this.addChild(row);
                } else if (component instanceof Input) {
                    this.children.fieldset && (this.children.fieldset.addChild(component));
                } else if (component instanceof GlobalFieldsetView) {
                    this.children.fieldset = component;
                    component.render().$el.prependTo(this.$el);
                } else {
                    throw new Error('Cannot add unknown component as child of RowColumnLayout');
                }
                return component;
            },
            isEmpty: function() {
                return this.getRows().length === 0;
            },
            getRows: function() {
                return this.getChildElements('.dashboard-row');
            },
            getFieldset: function() {
                return this.children.fieldset;
            },
            render: function() {
                BaseLayout.prototype.render.apply(this, arguments);
                this._onModeChange();
                return this;
            },
            remove: function() {
                if (this.children.fieldset) {
                    this.children.fieldset.remove();
                    this.children.fieldset = null;
                }
                BaseLayout.prototype.remove.apply(this, arguments);
            },
            _bindRowManager: function(row) {
                this.rowManagers[row.id] = new RowManager({
                    el: row.el,
                    layout: this
                });
                this.rowManagers[row.id].enable();
            },
            _bindRowManagers: function() {
                this._clearRowManagers();
                _.each(this.getRows(), this._bindRowManager, this);
            },
            _clearRowManagers: function() {
                _.each(this.rowManagers, function(manager, id) {
                    manager.disable();
                    manager = null;
                }, this);
                this.rowManagers = {};
            },
            _onModeChange: function() {
                this._disableDragAndDrop();
                this._bindRowManagers();
                switch (this.model.state.get('mode')) {
                    case 'edit':
                        // the current implementation of drag and drop can not support adding empty rows at runtime
                        this.deferreds.componentReady.then(function() {
                            // create fieldset if not exist
                            this._createFieldset();
                            this._enableDragAndDrop();
                            this._updateFieldsetEditor();
                        }.bind(this));
                        break;
                    case 'view':
                        this._updateFieldsetEditor();
                        break;
                }
                return this;
            },
            _disableDragAndDrop: function() {
                if (this.dragnDrop) {
                    this.dragnDrop.off();
                    this.dragnDrop.destroy();
                    this.dragnDrop = null;
                }
            },
            _enableDragAndDrop: function() {
                this.dragnDrop = new DragnDropView({
                    el: this.el
                });
                this.dragnDrop.on('sortupdate', _.debounce(this._updateLayout, 0), this);
                this.dragnDrop.render();
            },
            _updateFieldsetEditor: function() {
                if (this.children.fieldset) {
                    var mode = this.model.state.get('mode');
                    var inputs = this.getChildElements('.input');
                    var submit = this.getChildElements('.form-submit');
                    var hasInput = (inputs.length + submit.length) > 0;
                    if (mode == 'view' || !hasInput) {
                        this.children.fieldset.resetFieldsetEditor();
                    }
                    else if (mode == 'edit') {
                        this.children.fieldset.renderFieldsetEditor();
                    }
                }
            },
            _createFieldset: function(options) {
                if (!this.children.fieldset) {
                    options = _.extend({
                        model: this.model,
                        submitButton: false
                    }, options);
                    var fieldset = new GlobalFieldsetView(options, {tokens: true});
                    this.addChild(fieldset);
                    this.model.controller.trigger('new:fieldset', {fieldsetId: fieldset.id});
                }
            },
            _updateLayout: function() {
                this.model.controller.trigger('edit:layout');
            },
            captureStructure: function(options) {
                options || (options = {});
                var omitHidden = options.omitHidden ? function(el) { return $(el).is(':visible'); } : function() { return true; };

                var rows = _(this.$el.children('.dashboard-row')).chain()
                    .filter(function(row) {
                        return $(row).find('.dashboard-cell').length > 0;
                    })
                    .filter(omitHidden)
                    .map(function(row) {
                        var $row = $(row);
                        var panels = _($row.find('.dashboard-cell')).chain()
                            .filter(omitHidden)
                            .map(function(panel) {
                                return mvc.Components.get($(panel).attr('id')).captureStructure(options);
                            }).value();
                        return {
                            type: 'row',
                            id: $row.attr('id'),
                            children: panels
                        };
                    }).value();
                var fieldset = [];
                if (options.omitFormInputs !== true) {
                    // get inputs
                    var field = this.$el.children('.fieldset');
                    var fieldsetChildren = [];
                    // we need to keep the order of children
                    _($(field).children()).chain()
                        .filter(omitHidden)
                        .each(function(child) {
                            if ($(child).is('.input')) {
                                fieldsetChildren.push({
                                    type: 'input',
                                    id: $(child).attr('id')
                                });
                            }
                            else if ($(child).is('.html')) {
                                fieldsetChildren.push({
                                    type: 'element',
                                    id: $(child).attr('id')
                                });
                            }
                        });
                    // generate fieldset node if there's more than one input in the dashboard (not necessary under current fielset)
                    if (this.getChildElements('.fieldset > .input').length > 0 || this.getChildElements('.fieldset > .html').length > 0) {
                        fieldset = [{
                            type: 'fieldset',
                            id: field.attr('id'),
                            children: fieldsetChildren
                        }];
                    }
                }
                return {
                    type: "row-column-layout",
                    children: _.union(fieldset, rows)
                };
            },
            _onInputCreated: function() {
                this._updateFieldsetEditor();
            },
            _onInputRemoved: function() {
                this._updateFieldsetEditor();
            }
        });
    }
);