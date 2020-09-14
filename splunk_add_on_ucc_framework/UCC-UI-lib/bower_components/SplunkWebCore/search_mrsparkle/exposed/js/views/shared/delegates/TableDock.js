/**
 *  A delegate view to handle docking table header, and scroll bar.
 *
 *  @param {Object} options {
 *      {String} table - Selector for the table to be docked.
 *      {Number} offset - The offset from the top that the header should be docked.
 *      {Boolean} dockScrollBar - Determines if bottom scroll bar is docked.
 *      {Number} flexWidthColumn - Index of column that has a flexable width. -1 if none.
 *      {auto | fixed} defaultLayout - Table layout style
 *      {Array of Strings} proxyThEvents - Events optionally with selectors within the table head to proxy to the original table.
 *                                         Examples: ['click label.checkbox', 'mouseup .icon-sort', 'mousedown']
 *  }
 **/
 
define(['jquery', 'underscore', 'views/shared/delegates/DetachedTableHeader'], function($, _, DetachedTableHeader) {

    return DetachedTableHeader.extend({
        awake: true,
        touch: false,
        initialize: function(options) {

            var defaults = {
                    table: "> table",
                    offset: 0,
                    dockScrollBar: true,
                    flexWidthColumn: -1,
                    defaultLayout:'auto',
                    proxyThEvents: ['click']
                };
    
            _.defaults(this.options, defaults);
            //always proxy click on the th.
            this.options.proxyThEvents = _.union(this.options.proxyThEvents, defaults.proxyThEvents);
            DetachedTableHeader.prototype.initialize.call(this, options);
            
            this.disabled = false;
            this.dockedScrollHidden = true;
            this.left = 0;
            this.scrollLeft = false;
            this.disableAutoResize = options.disableAutoResize;
            
            this.eventNS = 'table-dock-' + this.cid;
            this.activate();
        },
        activate: function(options) {
            options || (options = {});
            if(this.active) {
                return DetachedTableHeader.prototype.activate.call(this, options);
            }

            if(!this.disableAutoResize) {
                var debouncedResizeHandler = _.debounce(this.handleContainerResize, 50);
                $(window).on('resize.' + this.eventNS, _(debouncedResizeHandler).bind(this));
            }
            $(window).on('scroll.' + this.eventNS, _(this.handleWindowScroll).bind(this));
            _.defer(this.update.bind(this));
            this.options.dockScrollBar && this.$el.on('scroll.' + this.eventNS, this.handleContainerScroll.bind(this));

            return DetachedTableHeader.prototype.activate.call(this, options);
        },
        deactivate: function(options) {
            options || (options = {});
            if(!this.active) {
                return DetachedTableHeader.prototype.deactivate.call(this, options);
            }
            DetachedTableHeader.prototype.deactivate.call(this, options);
            
            if (this.$el.html()){
                this.$el.scrollLeft(0);
            }
            this.left = 0;
            this.scrollLeft = false;
            
            $(window).off('resize.' + this.eventNS);
            $(window).off('scroll.' + this.eventNS);
            this.$el.off('.' + this.eventNS);
            this.$headerTable && this.$headerTable.off('.' + this.eventNS);
            this.$dockedScroll && this.$dockedScroll.off('.' + this.eventNS);

            return this;
        },
        update: function() {
            if (!this._updateDebounced) {
                this._updateDebounced = _.debounce(this._update);
            }
            this._updateDebounced();
        },
        _update: function() {
            this.$table = this.$(this.options.table ).first();
            
            this.updateHeaders();
            this.options.dockScrollBar && this.updateScroll();

            if(this.$table.is(':visible')) {
                this.syncMeasurements();
            } else {
                _.defer(this.syncMeasurements.bind(this));
            }
        },
        syncMeasurements: function() {
            this.scrollLeft = false;
            this.syncColumnWidths();
            this.options.dockScrollBar && this.syncScrollWidths();
            this.handleWindowScroll();
            if (this.options.dockScrollBar) {
                this.$dockedScroll.css('min-width', this.$el.width());
                this.handleContainerScroll();
             }
            this.trigger('updated', this.$headerTable);
        },
        disable: function() {
            this.disabled = true;
            this.$disable && this.$disable.show();
        },
        enable: function() {
            this.disabled = false;
            this.$disable && this.$disable.hide();
        },
        updateHeaders: function() {
            if(this.$header) {
                this.$header.remove();
            }
            
            this.$header = $('<div class="header-table-docked" style="display:none"><table></table><div class="disable"></div></div>').css({top: this.options.offset, left:this.left, right: 0});
            this.$disable = this.$header.find('> .disable')[this.disabled ? 'show' : 'hide']();
            this.$headerTable = this.$header.find('> table');
            this.$headerTable.attr('class', this.$table.attr('class'));
            this.$table.find('> thead').clone().appendTo(this.$headerTable);
            this.$header.prependTo(this.el);
            _.each(this.options.proxyThEvents, function(event) { // click .btn-blah
                var action = (event.indexOf(' ') !== -1) ? event.substr(0,event.indexOf(' ')) : event, // click
                    selector = (event.indexOf(' ') !== -1) ? event.substr(event.indexOf(' ')+1) : '';  // .btn-blah
                this.$headerTable.on(action + '.' + this.eventNS, 'th ' + selector, function(e) {
                    e.stopPropagation();
                    // Allow consumers to subscribe to the "headCellClick" event to do any custom management
                    // of click events on the header cells.  If a handler exists that prevents the default 
                    // action, then this handler returns to prevent further processing of the event.
                    // This should only be used when the proxyThEvents API below is not enough,
                    // (e.g. the consumer needs access to the original element that was clicked).
                    if (action === 'click' && !selector) {
                        this.trigger('headCellClick', e);
                        if (e.isDefaultPrevented()) {
                            return;
                        }
                    }
                    e.preventDefault();
                    var colIndex = $(e.currentTarget).closest('th').prevAll().length + 1;
                    this.$table.find('> thead > tr > th:nth-child(' + colIndex + ') ' + selector)[action]();
                }.bind(this));
            }.bind(this));
        },
                
        updateScroll: function() {
            if(this.$dockedScroll) {
                this.$dockedScroll.remove();
            }
            
            this.$dockedScroll = $('<div />').addClass('table-scroll-bar-docked').hide().appendTo(this.$el).css('left', this.$el.position().left);
            this.dockedScrollHidden = true;
            this.$dockedScroll.on('scroll.' + this.eventNS, _(this.handleDockedScrollChange).bind(this));
        },

        // ------ private methods ------ //

        handleContainerResize: function() {
            // no-op if update has not been called yet
            if(!this.$table || !this.$table.is(':visible')) {
                return;
            }
            this.syncColumnWidths();
            
            if(this.options.dockScrollBar) {
                this.updateDockedScrollBar();
                this.syncScrollWidths();
            }
        },

        handleWindowScroll: function(e) {
            // no-op if update has not been called yet
            if(!this.$table || !this.$table.is(':visible')) {
                return;
            }
            var scrollTop = $(window).scrollTop(),
                tableOffsetTop = this.$table.offset().top;

            if(scrollTop >= tableOffsetTop - this.options.offset) {
                if(!this.$header.is(':visible')) {
                    this.$header.css('top', this.options.offset).show();
                }
            }
            else {
                this.$header.css('top', '-1000px').width(); //move off and force redraw
                this.$header.hide();
            }
            this.options.dockScrollBar && this.updateDockedScrollBar();
        },

        handleContainerScroll: function() {
            // no-op if update has not been called yet or the dock is hidden
            if( !this.$table) {
                return;
            }
            
            var scrollLeft = this.$el.scrollLeft();


            if(this.scrollLeft === scrollLeft) {
                return;
            }

            this.$headerTable.css('marginLeft', -scrollLeft + 'px');
            this.$dockedScroll.scrollLeft(scrollLeft);
            this.scrollLeft = scrollLeft;
        },

        handleDockedScrollChange: function() {
            var scrollLeft = this.$el.scrollLeft(),
                dockScrollLeft = this.$dockedScroll.scrollLeft();

            if(scrollLeft !== dockScrollLeft) {
                this.$headerTable.css('marginLeft', -dockScrollLeft + 'px');
                this.$el.scrollLeft(dockScrollLeft);
            }
        },
        syncColumnWidths: function() {
            DetachedTableHeader.prototype.syncColumnWidths.apply(this, arguments);
            this.left = this.$el.position().left;
            this.$header.css({left: this.left});
        },
        syncScrollWidths: function() {
            if(!this.$table || !this.$table[0]) {
                return;
            }

            var tableWidth = parseFloat(this.$table[0].scrollWidth),
                $fullWidthDiv = $('<div />').width(tableWidth).height(1);

            this.$dockedScroll.html($fullWidthDiv);
        },

        updateDockedScrollBar: function() {
            var scrollTop = $(window).scrollTop(),
                tableOffsetTop = this.$table.offset().top,
                windowHeight = $(window).height(),
                tableHeight = this.$el.outerHeight();

            if((tableOffsetTop + tableHeight > scrollTop + windowHeight)){
                if (!this.dockedScrollHidden) {
                    return;
                }
                this.$dockedScroll.show();
                this.dockedScrollHidden = false;
                this.handleContainerScroll();
            }
            else if (!this.dockedScrollHidden){
                this.$dockedScroll.hide();
                this.dockedScrollHidden = true;
            }
        },
        remove: function() {
            DetachedTableHeader.prototype.remove.apply(this);
            $(window).off('resize.' + this.eventNS);
            $(window).off('scroll.' + this.eventNS);
            this.$el.off('.' + this.eventNS);
            this.$headerTable && this.$headerTable.off('.' + this.eventNS);
            this.$dockedScroll && this.$dockedScroll.off('.' + this.eventNS);
            return this;
        }
    });

});
