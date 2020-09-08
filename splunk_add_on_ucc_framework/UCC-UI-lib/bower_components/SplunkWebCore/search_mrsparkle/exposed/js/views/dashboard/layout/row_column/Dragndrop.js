define(
    [
        'jquery',
        'underscore',
        'backbone',
        'splunkjs/mvc',
        'views/dashboard/layout/row_column/Row',
        'jquery.ui.sortable'
    ],
    function($,
             _,
             Backbone,
             mvc,
             Row) {

        return Backbone.View.extend({
            initialize: function() {
                _.bindAll(this, 'updateRow');
            },
            render: function() {
                this.startDragAndDrop();
                return this;
            },
            events: {
                'mouseover .drag-handle': function(e) {
                    $(e.target).parents('.dashboard-panel').addClass('drag-hover');
                },
                'mouseout .drag-handle': function(e) {
                    $(e.target).parents('.dashboard-panel').removeClass('drag-hover');
                },
                'resetDragAndDrop': 'restart'
            },
            startDragAndDrop: function() {
                this.delegateEvents();
                this.$el.addClass('dragndrop-enabled');
                _.defer(_.bind(function() {
                    this.enablePanelDragAndDrop();
                    this.enableInputDragAndDrop();
                }, this));
            },
            getDragItemSize: function() {
                return Math.max(100, Math.min($(window).width() / 3, 600));
            },
            enablePanelDragAndDrop: function() {
                var that = this;
                var sortable, updateDims = _.debounce(that.updateDimensions.bind(this), 0),
                    enableDragAndDrop = _(this.enablePanelDragAndDrop).bind(this),
                    onEnd = _.once(function() {
                        if (sortable) {
                            try {
                                sortable.sortable('destroy');
                            } catch (e) {}
                            that.trigger('sortupdate');
                            _.defer(enableDragAndDrop);
                            that.cleanupEmptyRows();
                            sortable = null;
                            $(window).trigger('resize');
                            that.$('.dashboard-row').trigger('panelVisibilityChanged');
                        }
                    });
                this.createNewDropRow();
                sortable = this.$('.dashboard-row').sortable({
                    handle: '.drag-handle',
                    connectWith: this.$('.dashboard-row'),
                    placeholder: {
                        element: function() {
                            return $('<div class="sortable-placeholder"><div class="dashboard-panel"></div></div>');
                        },
                        update: function(ct, p) {
                            that.updateRow(p.parents('.dashboard-row'));
                        }
                    },
                    tolerance: 'pointer',
                    cursorAt: {left: that.getDragItemSize() / 2}
                }).on('sort', function(e) {
                    updateDims();
                }).on('sortupdate', function(e) {
                    onEnd();
                }).on('stop', function(e) {
                    onEnd();
                });
                updateDims();
                $(window).trigger('resize');
            },
            enableInputDragAndDrop: function() {
                var that = this;
                var sortable;
                var onEnd = _.once(function() {
                    if (sortable) {
                        try {
                            sortable.sortable('destroy');
                        } catch (e) {}
                        that.trigger('sortupdate');
                        _.defer(function() {
                            that.enableInputDragAndDrop();
                        });
                        sortable = null;
                    }
                });
                sortable = this.$('.fieldset.editable').sortable({
                    handle: '.drag-handle',
                    connectWith: this.$('.fieldset.editable'),
                    items: '>.input',
                    tolerance: "pointer",
                    placeholder: {
                        element: function(cur) {
                            var el = $('<div class="input ui-sortable-placeholder"><div class="placeholder-inner"></div></div>');
                            // Adjust height of the placeholder element to roughly match the size of the input being moved
                            var height = cur.height();
                            el.height(height - 5);
                            el.children().height(height - 15);
                            return el[0];
                        },
                        update: function() {
                        }
                    },
                    start: function() {
                        $('.dashboard-body').addClass('form-drag');
                        $('#search_btn').hide();
                    },
                    stop: function() {
                        $('.dashboard-body').removeClass('form-drag');
                        var submitButton = $('.form-submit'); // should be only one submit button
                        if (submitButton.length) {
                            submitButton.appendTo(submitButton.parent()).show();
                        }
                        $('.fieldset.editable').trigger("updateState");
                    }
                }).on('sortupdate', onEnd).on('stop', onEnd);
            },
            destroy: function() {
                this.undelegateEvents();
                this.$el.removeClass('dragndrop-enabled');
                this.cleanupEmptyRows();
                try {
                    this.$('.dashboard-row').sortable('destroy');
                    this.$('.fieldset.editable').sortable('destroy');
                } catch (e) {}
                this.updateDimensions();
            },
            restart: function() {
                this.destroy();
                this.render();
            },
            updateRow: function(r) {
                var $r = $(r);
                var els = $r.children().not('.ui-sortable-helper'), w = String(Math.floor(10000 / (els.not('.sortable-dragging').length)) / 100) + '%';
                els.css({width: w});
                $r.children('.ui-sortable-helper').css({width: this.getDragItemSize()});
            },
            updateDimensions: function() {
                _(this.$('.dashboard-row')).each(this.updateRow);
            },
            createNewDropRow: function() {
                this.cleanupEmptyRows();
                _(this.$('.dashboard-row')).each(function(row) {
                    new Row().render().$el.insertAfter(row);
                });
                var first = this.$('.dashboard-row').first();
                if (first) {
                    new Row().render().$el.insertBefore(first);
                }
            },
            cleanupEmptyRows: function() {
                _(this.$('.dashboard-row')).chain()
                    .map(function(r) { return $(r).attr('id'); })
                    .map(_.bind(mvc.Components.get, mvc.Components))
                    .invoke('removeIfDOMEmpty');

                this.$('.dashboard-row.empty').removeClass('empty');
            },
            getItemOrder: function() {
                return _(this.$('.dashboard-row')).map(function(row) {
                    return _($(row).find('.dashboard-panel')).map(function(panel) {
                        return _($(panel).find('.dashboard-element')).map(function(element) {
                            return $(element).attr('id');
                        });
                    });
                });
            }
        });
    }
);
