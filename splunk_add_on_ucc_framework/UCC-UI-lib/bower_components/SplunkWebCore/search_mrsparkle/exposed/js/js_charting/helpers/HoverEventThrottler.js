define(['jquery'], function($) {

    var Throttler = function(properties){
        properties              = properties || {};
        this.highlightDelay     = properties.highlightDelay || 200;
        this.unhighlightDelay   = properties.unhighlightDelay || 100;
        this.timer              = null;
        this.timer2             = null;
        this.mouseStatus        = 'over';
        this.isSelected         = false;
        this.onMouseOver        = properties.onMouseOver;
        this.onMouseOut         = properties.onMouseOut;
    };

    $.extend(Throttler.prototype, {

        setMouseStatus: function(status) { this.mouseStatus = status; },

        getMouseStatus: function() { return this.mouseStatus; },

        mouseOverHappened: function(someArgs) {
            var that = this,
                args = arguments;

            this.mouseOverFn = function() {
                that.onMouseOver.apply(null, args);
            };
            clearTimeout(this.timer);
            clearTimeout(this.timer2);
            this.setMouseStatus('over');
            this.timeOutManager();
        },

        mouseOutHappened: function(someArgs) {
            var that = this,
                args = arguments;
            this.mouseOutFn = function() {
                that.onMouseOut.apply(null, args);
            };
            this.setMouseStatus('out');
            this.timeOutManager();
        },

        timeOutManager: function(){
            var that = this;

            clearTimeout(this.timer);
            if(this.isSelected) {
                if(this.getMouseStatus()==='over') {
                    this.mouseEventManager();
                }
                else {
                    this.timer2 = setTimeout(function() {
                        that.setMouseStatus('out');
                        that.mouseEventManager();
                    }, that.unhighlightDelay);
                }
            }
            else {
                this.timer = setTimeout(function() {
                    that.isSelected = true;
                    that.mouseEventManager();
                }, that.highlightDelay);
            }
        },

        mouseEventManager: function() {
            var that = this;
            if(this.getMouseStatus()==='over') {
                this.mouseOverFn();
                this.isSelected = true;
                this.setMouseStatus('out');
            }
            else {
                this.mouseOutFn();
                this.isSelected = false;
                this.setMouseStatus('over');
            }
        }
    });

    return Throttler;

});
