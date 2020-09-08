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

    var ZoomOutButton = function(hcChart){
        this.hcChart = hcChart;
        this.initialize();
        this.debouncedZoomOut = _.debounce(function(){
            hcChart.zoomOut();
        });
    };

    ZoomOutButton.prototype = $.extend({}, EventMixin, {

        initialize: function() {
            var axis = this.hcChart.xAxis[0], 
                extremes = axis.getExtremes(),
                btnTemplate = '<a class="btn-pill btn-zoom-out" href="#"><i class="icon-minus-circle"></i>' + _('Reset Zoom').t() + '</a>';
                
            if(!this.zoomOutBtn){
                this.zoomOutBtn = $(btnTemplate);
                $(this.hcChart.container).append(this.zoomOutBtn);
            }
            var topPos = this.hcChart.yAxis[0].top, 
                rightPos = this.hcChart.xAxis[0].right;
            this.zoomOutBtn.css({
                'position': 'absolute',
                'top':  topPos + 'px',
                'right': rightPos + 'px'
            });
            this.addEventHandlers();
        },

        addEventHandlers: function() {
            var that = this;

            if(this.zoomOutBtn){
                this.zoomOutBtn.on('click', function(e){
                    e.preventDefault();
                    that.debouncedZoomOut();
                });
            }
        },

        destroy: function() {
            if(this.zoomOutBtn){
                this.zoomOutBtn.remove();
                this.zoomOutBtn = undefined;
            }
            this.off();
        }

    });

    return ZoomOutButton;

});