define([
            'jquery',
            'underscore',
            '../helpers/EventMixin',
            '../util/color_utils'
        ],
        function(
            $,
            _,
            EventMixin,
            colorUtils
        ) {

    var PanButtons = function(hcChart){
        this.hcChart = hcChart;
        this.initialize();
    };

    PanButtons.prototype = $.extend({}, EventMixin, {

        initialize: function() {
            var axis = this.hcChart.xAxis[0], 
                extremes = axis.getExtremes(),
                leftButtonTemplate = '<a class="btn-pill btn-pan-left" href="#"><i class="icon-chevron-left"></i></a>', 
                rightButtonTemplate = '<a class="btn-pill btn-pan-right" href="#"><i class="icon-chevron-right"></i></a>';
                
            if(!this.panRightButton){
                this.panRightButton = $(rightButtonTemplate);
                //zoomed into left edge of chart - disable left pan
                if((this.hcChart.xAxis[0].options.tickmarkPlacement === 'between' && extremes.max >= extremes.dataMax) 
                    || (this.hcChart.xAxis[0].options.tickmarkPlacement === 'on' && extremes.max > extremes.dataMax)){
                    this.panRightButton.addClass('disabled');
                }
                $(this.hcChart.container).append(this.panRightButton);
            }
           
            if(!this.panLeftButton){
                this.panLeftButton = $(leftButtonTemplate);
                //zoomed into left edge of chart - disable left pan
                if(extremes.min === 0){
                    this.panLeftButton.addClass('disabled');
                }
                $(this.hcChart.container).append(this.panLeftButton);
            }

            var that = this;
            this.debouncedPanLeft = _.debounce(function() {
                that.handlePan('left');
                that.positionButtons();
            });
            this.debouncedPanRight = _.debounce(function() {
                that.handlePan('right');
                that.positionButtons();
            });
           
            this.positionButtons();
            this.bindPanListeners();
        },

        positionButtons: function() {
            var legendOptions = this.hcChart.legend.options,
                topPos = this.hcChart.plotHeight + this.hcChart.plotTop + 4,
                leftPos = this.hcChart.xAxis[0].left - 20, 
                rightPos = this.hcChart.xAxis[0].right - (legendOptions.align === 'right' ? 20 : 0);

            this.panRightButton.css({
                'position': 'absolute',
                'top':  topPos + 'px',
                'right': rightPos + 'px'
            });
            this.panLeftButton.css({
                'position': 'absolute',
                'top': topPos + 'px',
                'left': leftPos + 'px'
            });
        },

        handlePan: function(direction) {
            var axis = this.hcChart.xAxis[0],
                extremes = axis.getExtremes(),
                prevMin = Math.round(extremes.min),
                prevMax = Math.round(extremes.max),
                doRedraw, 
                newMin,
                newMax,
                min,
                max;
            if(direction === 'left'){
                min = extremes.dataMin;
                if(prevMin > min){
                    if(prevMin === min + 1){
                        // disable pan left button as we are now at the left chart edge
                        this.panLeftButton.addClass('disabled');
                    }
                    // enable pan right button as we are no longer at the right chart edge
                    if(this.panRightButton.hasClass('disabled')){
                        this.panRightButton.removeClass('disabled');
                    }
                    newMin = prevMin - 1;
                    newMax = prevMax - 1;
                    doRedraw = true;
                }
            }else if(direction === 'right'){
                max = extremes.dataMax + ((this.hcChart.xAxis[0].options.tickmarkPlacement === 'between') ? 0 : 1);
                if(prevMax < max){
                    if(prevMax === max - 1) {
                        // disable pan right button as we are now at the right chart edge
                        this.panRightButton.addClass('disabled');
                    }
                    // enable pan left button as we are no longer at the left chart edge
                    if(this.panLeftButton.hasClass('disabled')){
                        this.panLeftButton.removeClass('disabled');
                    }
                    newMin = prevMin + 1;
                    newMax = prevMax + 1;
                    doRedraw = true;
                }
            }

            axis.setExtremes(newMin, newMax, false, false, { trigger: 'pan' });

            if (doRedraw) {
                this.hcChart.redraw(false);
            }
        },

        bindPanListeners: function() {
            var that = this,
                pressTimer,
                clearPanTimeout = function(){
                    if(pressTimer){
                        clearInterval(pressTimer);
                    }
                }, 
                xAxis = this.hcChart.xAxis[0],
                extremes,
                min,
                max;

            if(this.panLeftButton){
                this.panLeftButton.on('click', function(e){
                    e.preventDefault();
                    that.debouncedPanLeft();
                });
                this.panLeftButton.on('mousedown', function(e){
                    clearPanTimeout();
                    pressTimer = window.setInterval(function(){
                        that.handlePan('left');
                    }, 200);
                });
                this.panLeftButton.on('mouseup', function(e){
                    clearPanTimeout();
                    extremes = xAxis.getExtremes();
                    that.trigger('pan', [extremes.min, extremes.max]);
                });
            }
            if(this.panRightButton){
                this.panRightButton.on('click', function(e){
                    e.preventDefault();
                    that.debouncedPanRight();
                });
                this.panRightButton.on('mousedown', function(e){
                    clearPanTimeout();
                    pressTimer = window.setInterval(function(){
                        that.handlePan('right');
                    }, 200);
                });
                this.panRightButton.on('mouseup', function(e){
                    clearPanTimeout();
                    extremes = xAxis.getExtremes();
                    that.trigger('pan', [extremes.min, extremes.max]);
                });
            }
        },

        onChartResize: function(chart) {
            if(this.panLeftButton && this.panRightButton){
                this.positionButtons();
            }
        },

        onChartRedraw: function(chart) {
            if(this.panLeftButton && this.panRightButton){
                this.positionButtons();
            }
        },

        destroy: function() {
            if(this.panLeftButton){
                this.panLeftButton.remove();
                this.panLeftButton = undefined;
            }
            if(this.panRightButton){
                this.panRightButton.remove();
                this.panRightButton = undefined;
            }
            this.off();
        }

    });

    return PanButtons;

});