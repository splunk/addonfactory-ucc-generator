define(
    [
        'underscore',
        'jquery',
        'module',
        'splunk/editors/TableColorEditor',
        'splunk/editors/TableFormatEditor',
        'views/shared/DraggablePopTart',
        'views/shared/results_table/ResultsTableColumnHelper',
        'views/shared/results_table/renderers/ColorCellRenderer',
        'views/shared/results_table/renderers/NumberFormatCellRenderer',
        './ColumnEditorPopTart.pcss',
        'jquery.ui.draggable'
    ],
    function(
        _,
        $,
        module,
        TableColorEditor,
        TableFormatEditor,
        DraggablePopTart,
        ResultsTableColumnHelper,
        ColorCellRenderer,
        NumberFormatCellRenderer,
        css
        /* jquery ui draggable */
    ){
        return DraggablePopTart.extend({
            moduleId: module.id,
            className: DraggablePopTart.prototype.className + ' column-editor',

            _selectedTab: 'edit-color',
            _colorEditor: null,
            _formatEditor: null,

            events: _.extend({}, DraggablePopTart.prototype.events, {
                'click .edit-color': function(e) {
                    e.preventDefault();
                    if (this._selectedTab !== 'edit-color') {
                        this._selectedTab = 'edit-color';
                        this._renderTabContent();
                    }
                },

                'click .edit-format': function(e) {
                    e.preventDefault();
                    if (this._selectedTab !== 'edit-format') {
                        this._selectedTab = 'edit-format';
                        this._renderTabContent();
                    }
                }
            }),

            remove: function() {
                if (this._colorEditor) {
                    this._colorEditor.dispose();
                }
                if (this._formatEditor) {
                    this._formatEditor.dispose();
                }

                return DraggablePopTart.prototype.remove.apply(this, arguments);
            },

            show: function($pointTo, options) {
                options.$onOpenFocus = this.$('.edit-color > a');
                DraggablePopTart.prototype.show.apply(this, arguments);
            },

            render: function() {
                DraggablePopTart.prototype.render.call(this);
                this.$('.popdown-dialog-body').append(_.template(this.tabsTemplate));
                this._renderTabContent();
                return this;
            },

            _renderTabContent: function() {
                var $tabContent = this.$('.tab-content');
                var table = this.options.table;
                var field = this.options.field;
                var overlay = this.options.configModel && this.options.configModel.get('display.statistics.overlay');
                var cellRenderer;

                if (this._colorEditor) {
                    this._colorEditor.remove(false);
                }
                if (this._formatEditor) {
                    this._formatEditor.remove(false);
                }

                $tabContent.html('');

                switch (this._selectedTab) {
                    case 'edit-color':
                        this.$('.edit-color').addClass('active');
                        this.$('.edit-format').removeClass('active');

                        if (this._colorEditor) {
                            this._colorEditor
                                .appendTo($tabContent[0])
                                .validate();  // validate immediately so popup dialog uses accurate content size when positioning
                        } else if (ResultsTableColumnHelper.canEdit(table, field, ColorCellRenderer)) {
                            cellRenderer = ResultsTableColumnHelper.getCellRenderer(table, field, ColorCellRenderer);
                            if (TableColorEditor.canEdit(cellRenderer)) {
                                this._colorEditor = new TableColorEditor()
                                    .set('cellRenderer', cellRenderer)
                                    .on('cellRenderer.change', function(e) {
                                        if (e.target === this) {
                                            ResultsTableColumnHelper.setCellRenderer(table, field, ColorCellRenderer, e.newValue);
                                        }
                                    })
                                    .appendTo($tabContent[0])
                                    .validate();  // validate immediately so popup dialog uses accurate content size when positioning
                            }
                        }

                        if (!this._colorEditor) {
                            $tabContent.append(_.template(this.uneditableMessage));
                        } else if ((overlay === 'heatmap') || (overlay === 'highlow')) {
                            $tabContent.append(_.template(this.warningMessage));
                        }

                        break;
                    case 'edit-format':
                        this.$('.edit-color').removeClass('active');
                        this.$('.edit-format').addClass('active');

                        if (this._formatEditor) {
                            this._formatEditor
                                .appendTo($tabContent[0])
                                .validate();  // validate immediately so popup dialog uses accurate content size when positioning
                        } else if (ResultsTableColumnHelper.canEdit(table, field, NumberFormatCellRenderer)) {
                            cellRenderer = ResultsTableColumnHelper.getCellRenderer(table, field, NumberFormatCellRenderer);
                            this._formatEditor = new TableFormatEditor()
                                .set('cellRenderer', cellRenderer)
                                .on('cellRenderer.change', function(e) {
                                    if (e.target === this) {
                                        ResultsTableColumnHelper.setCellRenderer(table, field, NumberFormatCellRenderer, e.newValue);
                                    }
                                })
                                .appendTo($tabContent[0])
                                .validate();  // validate immediately so popup dialog uses accurate content size when positioning
                        } else {
                            $tabContent.append(_.template(this.uneditableMessage));
                        }
                        break;
                }
            },

            tabsTemplate: '\
                <ul class="nav nav-tabs-left">\
                    <li class="edit-color">\
                        <a href="#"> <%- _("Color").t() %></a>\
                    </li>\
                    <li class="edit-format">\
                        <a href="#"><%- _("Number Formatting").t() %></a>\
                        \
                    </li>\
                </ul>\
                <div class="tab-content"></div>',

            warningMessage: '\
                <div class="alert alert-warning alert-warning-overlay">\
                    <i class="icon-alert"></i>\
                    <%- _("Table column color overrides heat map and high/low value data overlay.").t() %>\
                </div>',

            uneditableMessage: '\
                <div class="alert alert-warning alert-warning-uneditable">\
                    <i class="icon-alert"></i>\
                    <%- _("Custom configuration. Edit from source.").t() %>\
                </div>'
        });
    }
);
