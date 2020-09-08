define(['underscore', 'util/Ticker', 'helpers/Session'], function(_, Ticker, Session) {
    /**
     * @mixin modelcollection
     */
    return {
        safeFetch: function() {
            if (this.isFetching()) {
                this.touched = arguments;
                return;
            }
            delete this.touched;
            this.fetch.apply(this, arguments);
        },
        isFetching: function() {
            return this.fetchXhr && this.fetchXhr.state && this.fetchXhr.state()==='pending';
        },
        fetchAbort: function() {
            if (this.isFetching()) {
                delete this.touched;//fetch data will leak memory
                if(_.isFunction(this.fetchXhr.abort)) {
                    this.fetchXhr.abort();
                }
            }
        },
        deepOff: function() {
            this.fetchAbort();
            _(this.associated).each(function(associated) {
                if (_.isFunction(associated.deepOff)) {
                    associated.deepOff();
                }
            }, this);
            if (_.isFunction(this.fetchData.deepOff)) {
                this.fetchData.deepOff();
            } else {
                this.fetchData.off();
            }
            this.off();
        },

        DEFAULT_POLLING_DELAY: 1000,
        ticker: null,
        /**
         * Start polling the model/collection.
         * @param {Object} options
         *     @param {Number} options.delay time to wait after each fetch before fetching again, in milliseconds, default is 1000
         *     @param {Object} options.data the data that will be sent with each fetch
         *     @param {Boolean} options.stopOnError stop polling if an error occurs on the model/collection, defaults to true
         *     @param {Boolean} options.uiInactivity stop polling if a session timeout event occurs, defaults to false
         *     @param {Function} options.condition callback to test if polling should continue
         *                           will be passed the model/collection and should return boolean indicating whether polling should continue
         *                           default behavior is to continue polling until cancelled for other reasons
         * @memberOf modelcollection
         */
        startPolling: function(options) {
            options = options || {};
            if(this.ticker) {
                throw new Error('startPolling cannot be called while already polling');
            }

            this.ticker = new Ticker({interval: options.delay || this.DEFAULT_POLLING_DELAY});
            this.ticker.on('tick', function() {
                if(options.condition && !options.condition(this)) {
                    this.stopPolling();
                }
                else {
                    this.safeFetch({ data: options.data });
                }
            }, this);

            if(options.stopOnError !== false) {
                this.on('error', this.stopPolling, this);
            }

            if(options.uiInactivity) {
                Session.on('timeout', this.stopPolling, this);
            }

            this.ticker.start(true);
        },
        stopPolling: function() {
            if(this.ticker) {
                this.ticker.stop();
                this.ticker.off();
            }
            this.off('error', this.stopPolling, this);
            Session.off('timeout', this.stopPolling, this);
            this.ticker = null;
        }
    };
});
