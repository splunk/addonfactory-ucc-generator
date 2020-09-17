define(['underscore', 'backbone'], function(_, Backbone) {
    var Ticker = function(options) {
        options || (options = {});
        this.interval = options.interval || 1000;
        this.cid = _.uniqueId('ticker');
        if (options.params) {
            this.params = options.params;
        }
        if (options.tick) {
            this.tick();
        }
        if (options.start) {
            this.start();
        }
    };
    _.extend(Ticker.prototype, Backbone.Events, {
        start: function(tick) {
            if (this._intervalId) {
                return false;
            }
            if (tick) {
                this.tick();
            }
            this._intervalId = setInterval(
                _.bind(this.tick, this),
                this.interval
            );
            return true;
        },
        stop: function(tick) {
            if (this._intervalId) {
                if (tick) {
                    this.tick();
                }
                clearInterval(this._intervalId);
                delete this._intervalId;
                return true;
            }
            return false;
        },
        restart: function(options) {
            options || (options = {});
            this.stop();
            if (options.interval) {
                this.interval = options.interval;
            }
            if (options.params) {
                this.params = options.params;
            }
            this.start(options.tick);
        },
        tick: function(params) {
            params || (params=this.params);
            var args = _.isArray(params) ? params : [params];
            this.trigger.apply(this, ['tick'].concat(args));
        }
    });
    return Ticker;
});