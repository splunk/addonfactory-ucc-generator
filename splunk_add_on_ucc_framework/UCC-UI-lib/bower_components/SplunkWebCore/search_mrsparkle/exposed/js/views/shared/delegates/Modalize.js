define(
    [
        'jquery',
        'underscore',
        'views/shared/delegates/Base',
        'util/keyboard'
    ],
    function(
        $,
        _,
       DelegateBase,
       keyboard
    ){
        return DelegateBase.extend({
            initialize: function() {
                var defaults = {
                    tbody: '> tbody',
                    parentContainerSelector: 'div',
                    overlayZIndex: 404,
                    secondaryRowSelector: ''
                };
                _.defaults(this.options, defaults);
                DelegateBase.prototype.initialize.apply(this, arguments);
            },
            show: function(rowIdx) {
                this.cleanup();
                if(!_.isNumber(rowIdx)) return;

                this.rowIdx = rowIdx; 
                this.$row = this.$(this.options.tbody).children(':not(' + this.options.secondaryRowSelector + ')').eq(this.rowIdx);
                var dimens = {
                    topHeight: 0,
                    bottomHeight: 0,
                    tableHeaderHeight: 0,
                    dockedThead: 0,
                    width: this.$el[0].scrollWidth + 'px'
                };
                this.$el.append(this.$top = $('<div class="modalize-table-top" />'));
                this.$el.append(this.$bottom = $('<div class="modalize-table-bottom" />'));
                $('.main-section-body').append(this.$overlay = $('<div class="modalize-table-overlay" />'));

                this.addEventHandlers(_.debounce(function(rowIdx) { this.show(rowIdx); }.bind(this), 100));
                
                this.$row.prevAll(':visible').each(function(index, el) {
                    dimens.topHeight += $(el).outerHeight(true);
                });

                this.$row.nextAll(':visible:not(' + this.options.secondaryRowSelector + ')').each(
                    function(index, el) {
                        dimens.bottomHeight += $(el).outerHeight(true);
                    }
                );
                this.$el.find('> table:not(.table-expanded, .table-embed)').each(function(i, el) {
                    dimens.tableHeaderHeight += $(el).find('tr').first().height();
                });
                this.applycss(dimens);
            },
            debouncedShow: function() {
                if (!this._debouncedShow) {
                    this._debouncedShow = _.debounce(this.show, 0);
                }
                this._debouncedShow.apply(this, arguments);
            },
            update: function() {
                if(this.rowIdx) {
                    this.show(this.rowIdx);
                }
            },
            addEventHandlers: function(show) {
                var unmodalize = function() {
                    this.$top.remove();
                    this.$bottom.remove();
                    this.$overlay.remove();
                    this.trigger('unmodalize', this.rowIdx);
                    this.$el.closest(this.options.parentContainerSelector).css({
                        'z-index': 0 
                    });
                }.bind(this);
                this.$top.on('click', unmodalize);
                this.$bottom.on('click', unmodalize);
                this.$overlay.on('click', unmodalize);

                this.$row.on('keydown.exit-on-escape', function(e) {
                    if (e.which === keyboard.KEYS.ESCAPE) {
                        unmodalize();
                    }
                });

                this.lastHeight = $(window).height();
                this.lastWidth  = $(window).width();
                $(window).on('resize.' + this.cid, function() {
                    var height = $(window).height(),
                        width  = $(window).width();
                    if(height != this.lastHeight  || width != this.lastWidth) {
                        this.lastHeight = height;
                        this.lastWidth = width;
                        show(this.rowIdx);
                    } 
                }.bind(this));
            },
            cleanup: function() {
                if(this.rowIdx) { 
                    delete this.rowIdx;
                }
                this.$top && this.$top.remove();
                this.$bottom && this.$bottom.remove();
                this.$overlay && this.$overlay.remove();
                this.$row && this.$row.off('.exit-on-escape');
                $(window).off('.' + this.cid);
                this.$el.closest(this.options.parentContainerSelector).css({
                    'z-index': 0 
                });
            },
            debouncedCleanup: function() {
                if (!this._debouncedCleanup) {
                    this._debouncedCleanup = _.debounce(this.cleanup, 0);
                }
                this._debouncedCleanup.apply(this, arguments);
            },
            applycss: function(dimens) {
                this.$el.closest(this.options.parentContainerSelector).css({
                    'z-index': this.options.overlayZIndex + 1
                });
                this.$top.css({
                    'width': dimens.width,
                    'height': dimens.topHeight + dimens.tableHeaderHeight + 'px'
                });
                this.$bottom.css({
                    'width': dimens.width,
                    'height': dimens.bottomHeight + 'px'
                });
                this.$overlay.css({
                    'z-index': this.options.overlayZIndex
                });
            },
            remove: function() {
                DelegateBase.prototype.remove.apply(this);
                $(window).off('resize.' + this.cid);
                this.$top && this.$top.remove();
                this.$bottom && this.$bottom.remove();
                this.$overlay && this.$overlay.remove();
                return this;
            }
        });
    }
);
