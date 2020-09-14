define([
            'jquery',
            'underscore',
            '../helpers/EventMixin',
            'helpers/user_agent'
        ],
        function(
            $,
            _,
            EventMixin,
            userAgent
        ) {

    var SelectionWindow = function(hcChart) {
        this.id = _.uniqueId('selection_window');
        this.hcChart = hcChart;
        this.renderer = hcChart.renderer;
        this.axis = hcChart.xAxis[0];
        this.axisHasTickmarksBetween = this.axis.options.tickmarkPlacement === 'between';
        this.axisValueOffset = this.axisHasTickmarksBetween ? 0.5 : 0;
        this.isiOS = userAgent.isiOS();

        var rawX,
            right,
            selectionMarkerX,
            selectionMarkerWidth;
        this.pointer = hcChart.pointer;
        if(this.pointer.selectionMarker.renderer){
            // SelectionMarker was created by mouse drag
            this.zIndex = this.pointer.selectionMarker.attr('zIndex');
            selectionMarkerX = this.pointer.selectionMarker.attr('x');
            selectionMarkerWidth = this.pointer.selectionMarker.attr('width');
        }else{
            // SelectionMarker was created by touch pinch
            this.zIndex = 7; // default Highcharts pointer selection marker z-index
            selectionMarkerX = this.pointer.selectionMarker.x;
            selectionMarkerWidth = this.pointer.selectionMarker.width;
        }
        rawX = selectionMarkerX;
        right = this.snapXValue(
            rawX + selectionMarkerWidth,
            this.axisHasTickmarksBetween ? 'ceil' : 'round',
            'max'
        );
        this.x = this.snapXValue(rawX, this.axisHasTickmarksBetween ? 'floor' : 'round', 'min');

        this.width = right - this.x;
        this.createResizeHandles();
        this.ownedElements = [
            this.resizeHandleLeft.element,
            this.resizeHandleRight.element
        ];
        this.updateExtremesValues();
        var $chartContainer = $(this.hcChart.container);
        this.defaultContainerCursor = $chartContainer.css('cursor');
        $chartContainer.on('mousemove.' + this.id, _(this.onContainerMouseMove).bind(this));
        this.initialized = true;
    };

    SelectionWindow.prototype = $.extend({}, EventMixin, {

        handleWidth: userAgent.isiOS() ? 25 : 10,
        handleHeight: 50,
        handleBorderColor: 'rgb(255,255,255)',
        handleBgColor: 'rgba(79,79,79,0.5)',
        handleBorderRadius: 5,
        shadedAreaColor: 'rgba(100,100,100,0.3)',

        handleDragStartEvent: function(e) {
            var target = e.target,
                isSelectionDrag = target === this.hcChart.chartBackground.element &&
                    this.hcChart.isInsidePlot(e.chartX - this.hcChart.plotLeft, e.chartY - this.hcChart.plotTop);

            if(isSelectionDrag || _(this.ownedElements).contains(target)) {
                this.originalTarget = target;
                this.mouseDownX = this.getCurrentX();
                this.mouseDownWidth = this.getCurrentWidth();
                this.isDragging = true;
                return true;
            }
            return false;
        },

        handleDragEvent: function(e) {
            if(this.originalTarget === this.hcChart.chartBackground.element) {
                this.dragSelectionMarker(e);
            }
            if(this.originalTarget === this.resizeHandleLeft.element) {
                this.resizeSelectionLeft(e);
            }
            if(this.originalTarget === this.resizeHandleRight.element) {
                this.resizeSelectionRight(e);
            }
        },

        handleDropEvent: function(e) {
            if(this.isDragging) {
                this.updateExtremesValues();
                this.emitSelectionEvent();
                this.isDragging = false;
            }
        },

        getExtremes: function() {
            return { min: this.startValue, max: this.endValue };
        },

        setExtremes: function(extremes) {
            this.startValue = extremes.min;
            this.endValue = extremes.max;
            this.x = Math.round(this.axis.toPixels(this.startValue + this.axisValueOffset));
            this.width = Math.round(this.axis.toPixels(this.endValue + this.axisValueOffset)) - this.x;
            this.positionResizeHandles('both');
        },

        onContainerMouseMove: function(e) {
            e = this.pointer.normalize(e);
            if(e.target === this.hcChart.chartBackground.element &&
                    this.hcChart.isInsidePlot(e.chartX - this.hcChart.plotLeft, e.chartY - this.hcChart.plotTop)) {
                $(this.hcChart.container).css('cursor', 'move');
            }
            else {
                $(this.hcChart.container).css('cursor', this.defaultContainerCursor);
            }
        },

        onChartRedraw: function() {
            this.x = Math.round(this.axis.toPixels(this.startValue + this.axisValueOffset));
            this.width = Math.round(this.axis.toPixels(this.endValue + this.axisValueOffset)) - this.x;
            this.resizeHandleLeft.attr({
                y: this.hcChart.plotTop + (this.hcChart.plotHeight / 2) - (this.handleHeight / 2)
            });
            this.resizeHandleRight.attr({
                y: this.hcChart.plotTop + (this.hcChart.plotHeight / 2) - (this.handleHeight / 2)
            });
            this.shadedRegionLeft.attr({
                x: this.hcChart.plotLeft,
                y: this.hcChart.plotTop,
                height: this.hcChart.plotHeight
            });
            this.shadedRegionRight.attr({
                y: this.hcChart.plotTop,
                height: this.hcChart.plotHeight
            });
            this.positionResizeHandles('both');
        },

        destroy: function() {
            if(this.initialized) {
                this.resizeHandleLeft.destroy();
                this.resizeHandleRight.destroy();
                this.handleVerticalLineLeft.destroy();
                this.handleVerticalLineRight.destroy();
                this.shadedRegionRight.destroy();
                this.shadedRegionLeft.destroy();
                this.$resetButton.remove();
                this.initialized = false;
            }
            $(this.hcChart.container).off('mousemove.' + this.id);
            this.off();
        },

        dragSelectionMarker: function(e) {
            this.x = this.snapXValue(this.mouseDownX + e.chartX - this.pointer.mouseDownX, 'round');
            // don't let the marker outside the plot area
            this.x = Math.max(this.x, this.hcChart.plotLeft);
            this.x = Math.min(this.x, this.hcChart.plotLeft + this.hcChart.plotWidth - this.getCurrentWidth());
            this.positionResizeHandles('both');
        },

        resizeSelectionLeft: function(e) {
            var currentX = this.getCurrentX(),
                currentWidth = this.getCurrentWidth();

            // set the new x based on how far the mouse was dragged
            this.x = this.snapXValue(this.mouseDownX + e.chartX - this.pointer.mouseDownX, 'round');
            // don't let the marker outside the plot area
            this.x = Math.max(this.x, this.hcChart.plotLeft);
            // don't let the handle meet the other handle
            var right = currentX + currentWidth;
            this.x = Math.min(this.x, this.axis.toPixels(this.axis.toValue(right) - 1));
            this.width = currentWidth - this.x + currentX;
            this.positionResizeHandles('left');
        },

        resizeSelectionRight: function(e) {
            this.x = this.getCurrentX();
            // set the new width based on how far the mouse was dragged
            var newWidth = this.mouseDownWidth + e.chartX - this.pointer.mouseDownX,
                right = this.snapXValue(this.x + newWidth, 'round');

            this.width = right - this.x;
            // don't let the marker outside the plot area
            this.width = Math.min(this.width, this.hcChart.plotLeft + this.hcChart.plotWidth - this.x);
            // don't let the handle meet the other handle, i.e. width must be >= 1 axis unit
            this.width = Math.max(this.width, (this.axis.toPixels(1) - this.axis.toPixels(0)));
            this.positionResizeHandles('right');
        },

        emitSelectionEvent: function() {
            var xAxis = this.axis,
                rangeStart = xAxis.toValue(this.x) + this.axisValueOffset,
                rangeEnd = xAxis.toValue(this.x + this.width) - this.axisValueOffset;

            this.trigger('rangeSelect', [rangeStart, rangeEnd]);
        },

        createResizeHandles: function() {
            var handleAttrs = {
                    zIndex: this.zIndex + 1,
                    fill: {
                        linearGradient: { x1: 0, y1: 0.5, x2: 1, y2: 0.5},
                        stops: [
                            [0, this.handleBgColor],
                            [1/6, this.handleBorderColor],
                            [2/6, this.handleBgColor],
                            [3/6, this.handleBorderColor],
                            [4/6, this.handleBgColor],
                            [5/6, this.handleBorderColor],
                            [1, this.handleBgColor]
                        ]
                    },
                    'stroke-width': 2,
                    stroke: this.handleBgColor
                },
                handleLineAttrs = { 'stroke-width': 2, stroke: this.handleBgColor, zIndex: this.zIndex },
                shadedRegionAttrs = { zIndex: this.zIndex, fill: this.shadedAreaColor},
                top = this.hcChart.plotTop + (this.hcChart.plotHeight / 2) - (this.handleHeight / 2);

            this.shadedRegionRight = this.renderer.rect(0, this.hcChart.plotTop, 0, this.hcChart.plotHeight)
                .attr(shadedRegionAttrs)
                .add();
            this.handleVerticalLineRight = this.renderer.path().attr(handleLineAttrs).add();
            this.resizeHandleRight = this.renderer.rect(
                    0,
                    top,
                    this.handleWidth,
                    this.handleHeight,
                    this.handleBorderRadius
                )
                .attr(handleAttrs)
                .css({ cursor: 'ew-resize' })
                .add();

            this.shadedRegionLeft = this.renderer.rect(this.hcChart.plotLeft, this.hcChart.plotTop, 0, this.hcChart.plotHeight)
                .attr(shadedRegionAttrs)
                .add();
            this.handleVerticalLineLeft = this.renderer.path().attr(handleLineAttrs).add();

            this.resizeHandleLeft = this.renderer.rect(
                    0,
                    top,
                    this.handleWidth,
                    this.handleHeight,
                    this.handleBorderRadius
                )
                .attr(handleAttrs)
                .css({ cursor: 'ew-resize' })
                .add();

            this.positionResizeHandles('both');

            this.$resetButton = $(_(this.resetButtonTemplate).template({}));
            this.$resetButton.on('click', function(e) { e.preventDefault(); });
            this.$resetButton.css({ 
                top: this.hcChart.yAxis[0].top + 'px', 
                right: this.hcChart.xAxis[0].right + 'px',
                position: 'absolute' 
            });
            this.$resetButton.appendTo(this.hcChart.container);
        },

        positionResizeHandles: function(whichOnes) {
            var markerLeft = this.x,
                markerRight = markerLeft + this.width,
                plotTop = this.hcChart.plotTop,
                plotBottom = plotTop + this.hcChart.plotHeight,
                plotLeft = this.hcChart.plotLeft,
                plotRight = plotLeft + this.hcChart.plotWidth;

            if(whichOnes === 'both' || whichOnes === 'left') {
                this.shadedRegionLeft.attr({ width: markerLeft - plotLeft });
                this.handleVerticalLineLeft.attr({ d: ['M', markerLeft, plotTop, 'L', markerLeft, plotBottom] });
                this.resizeHandleLeft.attr({ x: markerLeft - (this.handleWidth / 2) });
            }
            if(whichOnes === 'both' || whichOnes === 'right') {
                this.shadedRegionRight.attr({ x: markerRight, width: plotRight - markerRight });
                this.handleVerticalLineRight.attr({ d: ['M', markerRight, plotTop, 'L', markerRight, plotBottom] });
                this.resizeHandleRight.attr({ x: markerRight - (this.handleWidth / 2) });
            }
        },

        getCurrentX: function() {
            return this.resizeHandleLeft.attr('x') + (this.handleWidth / 2);
        },

        getCurrentWidth: function() {
            return (this.resizeHandleRight.attr('x') + (this.handleWidth / 2)) - this.getCurrentX();
        },

        snapXValue: function(rawXValue, mathOperation) {
            var axis = this.axis,
                axisValue = axis.toValue(rawXValue);

            return axis.toPixels(Math[mathOperation](axisValue - this.axisValueOffset) + this.axisValueOffset);
        },

        updateExtremesValues: function() {
            this.startValue = Math.round(this.axis.toValue(this.x) - this.axisValueOffset);
            this.endValue = Math.round(this.axis.toValue(this.x + this.width) - this.axisValueOffset);
        },

        resetButtonTemplate: '<a class="btn-link btn-reset-selection" href="#"><i class="icon-minus-circle"></i><%= _("Reset").t() %></a>'

    });

    return SelectionWindow;

});