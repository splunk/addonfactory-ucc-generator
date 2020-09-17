define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var mvc = require('../../mvc');
    var BaseView = require('../../basesplunkview');
    var DashboardController = require('../controller');
    var TokenDependenciesMixin = require('./tokendeps');

    /**
     * The dashboard row view is a delegate view which handles the layout of dashboard panels within a row. Actions are
     * executed when panels are shown, hidden or removed.
     */
    var DashboardRowView = BaseView.extend(_.extend({}, TokenDependenciesMixin, {
        className: 'dashboard-row',
        _uniqueIdPrefix: 'row',
        initialize: function() {
            this.configure();
            this.listenTo(DashboardController.getStateModel(), 'change:edit', this.onEditStateChange, this);
            this.setupTokenDependencies();
        },
        onEditStateChange: function() {
            this.onContentChange();
        },
        bindToDOMChanges: function() {
            this.unbindFromDOMChanges();
            if (!this.isEditMode() && this.$('.dashboard-panel').length > 1) {
                this.$el.on('DOMSubtreeModified', this.throttledAlignItemHeights.bind(this));
                this.throttledAlignItemHeights();
            }
        },
        unbindFromDOMChanges: function() {
            this.$el.off('DOMSubtreeModified');
        },
        isEditMode: function() {
            return DashboardController.getStateModel().get('edit');
        },
        onContentChange: function() {
            this.unbindFromDOMChanges();
            var cells = this.$el.children('.dashboard-cell');
            if (cells.length === 0) {
                this.$el.addClass('empty');
                return;
            }
            var visibleCells = this.isEditMode() ? cells : cells.filter(':not(.hidden)');
            cells.removeClass('last-visible');
            visibleCells.last().addClass('last-visible');

            var visibleCellCount = visibleCells.length;
            var cellWidth = String(100 / visibleCellCount) + '%';

            cells.css({ width: cellWidth }).find('.panel-element-row').each(function() {
                var elements = $(this).find('.dashboard-element');
                elements.css({ width: String(100 / elements.length) + '%' });
            });
            
            if (this.isEditMode()) {
                this.alignOff();
            } else {
                if (visibleCellCount > 0) {
                    this.throttledAlignItemHeights();
                }
                this.bindToDOMChanges();
            }
        },
        onPanelVisibilityChange: function() {
            this.onContentChange();
            // Force charts to re-render since widths of the panels have probably changed
            $(window).trigger('resize');
        },
        throttledAlignItemHeights: function() {
            var self = this;
            if (!self._alignTimer) {
                var immediate = self._lastAlign == null || ((+new Date()) - self._lastAlign > 1000);
                self._alignTimer = setTimeout(function() {
                    self.alignItemHeights();
                    self._alignTimer = null;
                }, immediate ? 50 : 1000);
            }
        },
        alignItemHeights: function() {
            var row = this.$el, items = row.find('.dashboard-panel');
            items.css({ 'min-height': 0 });
            if (items.length > 1) {
                items.css({
                    'min-height': _.max(_.map(items, function(i) {
                        return $(i).height();
                    }))
                });
            }
            this._lastAlign = +new Date();
        },
        alignOff: function(){
            clearTimeout(this._alignTimer);
            this._alignTimer = null;
            this.$el.find('.dashboard-panel').css({ 'min-height': 0 });
        },
        getChildContainer: function() {
            return this.$el;
        },
        events: {
            'cellContentChange': 'onContentChange',
            'cellRemoved': 'onContentChange',
            'structureChange': 'onContentChange',
            'panelVisibilityChanged': 'onPanelVisibilityChange'
        },
        render: function() {
            if (this.isEmpty()) {
                this.$el.addClass('empty');
            }
            this.onContentChange();
            return this;
        },
        hide: function(){
            this.$el.addClass('hidden');
        },
        show: function(){
            this.$el.removeClass('hidden');
        },
        renderFromDOM: function() {
            var originalId = this.$el.data('original-id');
            if (originalId) {
                this.settings.set('originalId', originalId);
            }
            return this.render();
        },
        isEmpty: function() {
            return this.$el.children('.dashboard-cell').length === 0;
        },
        removeIfEmpty: function() {
            if (this.isEmpty()) {
                this.remove();
            }
        },
        remove: function() {
            this.unbindFromDOMChanges();
            this.stopListeningToTokenDependencyChange();
            return BaseView.prototype.remove.apply(this, arguments);
        },
        serializeStructure: function(options) {
            options || (options = {});
            return {
                panels: _(this.$el.children('.dashboard-cell')).chain()
                            .map(function(cell){ return $(cell).attr('id'); })
                            .map(_.bind(mvc.Components.get, mvc.Components))
                            .filter(function(panel){ return panel && options.omitHidden !== true || !panel.$el.is('.hidden'); })
                            .map(function(panel){ return panel.serializeStructure(options); })
                            .value(),
                tokenDependencies: this.settings.get('tokenDependencies', { tokens: true }),
                id: this.settings.get('originalId')
            };
        }
    }));

    return DashboardRowView;
});
