/**
 * A delegate view to handle a statically positioned table header.
 */

define(['jquery', 'underscore', 'views/shared/delegates/DetachedTableHeader'], function($, _, DetachedTableHeader) {

    return DetachedTableHeader.extend({
        active: false,
        initialize: function(options) {
            var defaults = {
                    headerContainer: "> .header-table-static",
                    scrollContainer: "> .scroll-table-wrapper",
                    offset: 0,
                    // index of the column to "flex" to fit remaining width, can be set to false for no flex
                    flexWidthColumn: -1,
                    fixedColumnWidths: false,
                    defaultLayout:'auto',
                    draggable: false
                };

            _.defaults(this.options, defaults);

            if (!this.options.table) {
                this.options.table = this.options.scrollContainer + ' > table';
            }
            
            // specified scroll container could be self or a downstream element
            this.$scrollContainer = (this.$el.is(this.options.scrollContainer)) ? this.$el : this.$(this.options.scrollContainer);
            DetachedTableHeader.prototype.initialize.call(this, options);
            this.disableAutoResize = options.disableAutoResize;
            
            this.activate({noUpdate: true});
        },
        wake: function() {
            return this.activate();
        },
        activate: function(options) {
            options || (options = {});
            if(this.active) {
                return DetachedTableHeader.prototype.activate.call(this, options);
            }
            if(!this.disableAutoResize) {
                var debouncedResizeHandler = _.debounce(this.handleContainerResize, 50);
                $(window).on('resize.' + this.cid, _(debouncedResizeHandler).bind(this));
            }
            
            this.$scrollContainer = (this.$el.is(this.options.scrollContainer)) ? this.$el : this.$(this.options.scrollContainer);
            this.$scrollContainer.on('scroll.' + this.cid, _(this.handleContainerScroll).bind(this));
            
            if(!options.noUpdate) {
                _.defer(this.update.bind(this));
            }

            return DetachedTableHeader.prototype.activate.call(this, options);
        },
        startListening: function(options) {
            // Sometimes, you want to update the TableHeadStatic's th classes without actually calling update().
            // Ex: you want classes to change on a mouseenter event, which means you can't re-render the header.
            this.listenTo(this, 'addClass', function(addClass) {
                this.$headerContainer && this.$headerContainer.find('th').addClass(addClass);
            });

            this.listenTo(this, 'removeClass', function(classes) {
                var $headers;
                if (this.$headerContainer) {
                    $headers = this.$headerContainer.find('th');
                    if (!_.isArray(classes)) {
                        $headers.removeClass(classes);
                    } else {
                        _.each(classes, function(cls) {
                            $headers.removeClass(cls);
                        }.bind(this));
                    }
                }
            });
        },
        sleep: function() {
            return this.deactivate();
        },
        deactivate: function(options) {
            options || (options = {});
            if(!this.active) {
                return DetachedTableHeader.prototype.deactivate.call(this, options);
            }
            DetachedTableHeader.prototype.deactivate.call(this, options);

            $(window).off('resize.' + this.cid);
            this.$scrollContainer.off('scroll.' + this.cid);
            this.$headerTable && this.$headerTable.off('.' + this.cid);
            
            return this;
        },
        remove: function() {
            DetachedTableHeader.prototype.remove.apply(this);
            $(window).off('resize.' + this.cid);
            this.$scrollContainer.off('scroll.' + this.cid);
            this.$headerTable && this.$headerTable.off('.' + this.cid);
            return this;
        },
        update: function() {
            if(!this.active) {
                return;
            }
            this.$scrollContainer = (this.$el.is(this.options.scrollContainer)) ? this.$el : this.$(this.options.scrollContainer);
            this.$table = this.$(this.options.table).first();
            this.$headerContainer = this.$(this.options.headerContainer);
            this.$headerContainer.empty();
            var $headerWrapper = $('<div class="header-table-wrapper"></div>').appendTo(this.$headerContainer);
            $headerWrapper.css({ 'margin-right': this.$scrollContainer[0].offsetWidth - this.$scrollContainer[0].clientWidth});
            this.$headerTable = $('<table>');
            this.$headerTable.attr('class', this.$table.attr('class')).width(this.$table.outerWidth()).css('table-layout', 'fixed');
            // SPL-77034, for in-place updates make sure we don't clone the visibility: hidden; that is added later
            this.$table.find('> thead').clone().css('visibility', 'visible').appendTo(this.$headerTable);
            $headerWrapper.prepend(this.$headerTable);

            // 508: make sure the browser doesn't tab to the original table header
            this.$table.find('thead').css('visibility', 'hidden');
            
            this.$headerTable.on('click.' + this.cid, 'th', function (e) {
                this.trigger('headCellClick', e);
                this.proxyEventToRealTh(e, 'click');
            }.bind(this));

            this.$headerTable.on('mouseenter.' + this.cid, 'th', function(e) {
                this.proxyEventToRealTh(e, 'mouseenter');
            }.bind(this));

            this.$headerTable.on('mouseleave.' + this.cid, 'th', function(e) {
                this.proxyEventToRealTh(e, 'mouseleave');
            }.bind(this));

            this.$headerTable.on('mousedown.' + this.cid, 'th', function(e) {
                this.proxyEventToRealTh(e, 'mousedown');
            }.bind(this));

            if (this.options.draggable) {
                this.$headerTable.on('dragstart.' + this.cid, 'th', function(e) {
                    this.proxyEventToRealTh(e, 'dragstart');
                }.bind(this));

                this.$headerTable.on('dragenter.' + this.cid, 'th', function(e) {
                    this.proxyEventToRealTh(e, 'dragenter');
                }.bind(this));

                this.$headerTable.on('dragover.' + this.cid, 'th', function(e) {
                    this.proxyEventToRealTh(e, 'dragover');
                }.bind(this));

                this.$headerTable.on('dragleave.' + this.cid, 'th', function(e) {
                    this.proxyEventToRealTh(e, 'dragleave');
                }.bind(this));

                this.$headerTable.on('drop.' + this.cid, function(e) {
                    this.proxyEventToRealTh(e, 'drop');
                }.bind(this));

                this.$headerTable.on('dragend.' + this.cid, 'th', function(e) {
                    this.proxyEventToRealTh(e, 'dragend');
                }.bind(this));
            }
            // the newly rendered table head will be scrolled all the way to the left
            // reset this instance variable so that handleContainerScroll will do the right thing
            this.scrollLeft = 0;
            var updateDom = _(function() {
                if (!this.options.fixedColumnWidths) {
                    this.syncColumnWidths();
                }
                this.handleContainerScroll();
                this.trigger('updated', this.$headerTable);
            }).bind(this);

            if(this.$table.is(':visible')) {
                updateDom();
            } else {
                _.defer(updateDom);
            }
        },

        // ------ private methods ------ //
        handleContainerScroll: function() {
            // no-op if update has not been called yet
            if(!this.$table) {
                return;
            }
            var scrollLeft = this.$scrollContainer.scrollLeft();
            if(scrollLeft !== this.scrollLeft) {
                this.$headerTable.css('marginLeft', -scrollLeft + 'px');
                this.scrollLeft = scrollLeft;
            }
        },
        handleContainerResize: function() {
            // no-op if update has not been called yet
            if(!this.$table) {
                return;
            }
            this.syncColumnWidths();
        },

        proxyEventToRealTh: function(e, eventName) {
            e.stopPropagation();
            if (e.isDefaultPrevented()) {
                return;
            }
            if (eventName === "click") {
                e.preventDefault();
            }
            var colIndex = $(e.currentTarget).prevAll().length + 1;
            this.$table.find('> thead > tr > th:nth-child(' + colIndex + ')').trigger(eventName, e);
        }
    });

});
