define(function(require, exports, module) {
    var $ = require('jquery');
    var mvc = require('./mvc');
    var Backbone = require('backbone');
    var BaseSplunkView = require('./basesplunkview');
    var moment = require('util/moment');
    require('util/moment/compactFromNow');
    var _ = require('underscore');
    var SplunkUtil = require("splunk.util");
    var GeneralUtils = require("util/general_utils");

    var timerCallbacks = {}, globalRefreshTimer;

    function _runCallbacks() {
        _(timerCallbacks).each(function(cb){
            cb();
        });
    }

    function removeTimerCallback(name) {
        delete timerCallbacks[name];
        if(_.isEmpty(timerCallbacks)) {
            clearInterval(globalRefreshTimer);
            globalRefreshTimer = null;
        }
    }

    function registerTimerCallback(name, cb, scope) {
        if(timerCallbacks[name]) {
            removeTimerCallback(name);
        }
        timerCallbacks[name] = _.bind(cb, scope);
        if(!globalRefreshTimer) {
            globalRefreshTimer = setInterval(_runCallbacks, 1000);
        }
    }

    var RefreshTimeIndicatorView = BaseSplunkView.extend(/** @lends splunkjs.mvc.RefreshTimeIndicatorView.prototype */{
        moduleId: module.id,
        
        className: 'splunk-timeindicator',
        events: {
            "click a.refresh-btn": 'refresh'
        },
        configure: function() {
            // Silently rewrite the deprecated 'manager' setting if present
            if (this.options.manager) {
                this.options.managerid = this.options.manager;
            }

            this.options["refresh.time.visible"] = GeneralUtils.normalizeBoolean(this.options["refresh.time.visible"], {'default': true});

            if (SplunkUtil.isInt(this.options["refresh.auto.interval"])){
                this.options["refresh.auto.interval"] = parseInt(this.options["refresh.auto.interval"], 10);
            }
            else {
                this.options["refresh.auto.interval"] = 0;
            }
            BaseSplunkView.prototype.configure.apply(this, arguments);
            this.refreshTimeModel = new Backbone.Model();
            this.listenTo(this.refreshTimeModel, 'change', this.renderRefreshTime, this);
        },
        initialize: function() {
            this.configure();
            this.bindToComponentSetting('managerid', this.onManagerChange, this);
            this.timer = _.uniqueId('timer_');
            this.listenTo(this.settings, 'change', this.updateContent);
        },
        onManagerChange: function(managers, manager) {
            if(this.manager) {
                this.manager.off(null, null, this);
            }
            if(!manager) {
                return;
            }
            this.manager = manager;
            this.manager.on("search:start", this.clear, this);
            this.manager.on("search:progress", this.onSearchProgress, this);
            this.manager.on("search:done", this.onSearchProgress, this);
            this.manager.on("search:fail", this.clear, this);
            this.manager.on("search:cancelled", this.clear, this);
            manager.replayLastSearchEvent(this);
        },
        clear: function() {
            removeTimerCallback(this.timer);
            this.$el.html('&nbsp;');
        },
        updateRefreshTime: function() {
            if(this.refreshTime) {
                if(moment().diff(this.refreshTime) >= 10000) {
                    this.refreshTimeModel.set({
                        text: this.refreshTime.compactFromNow(),
                        title: _("Last refresh: ").t() + this.refreshTime.format('LLL') 
                    });
                }
            }
        },
        renderRefreshTime: function() {
            this.$('.time-freshness').text(this.refreshTimeModel.get('text')).show();
            this.$('.time-freshness').attr('title', this.refreshTimeModel.get('title'));
            this.$el.show();
        },
        onSearchProgress: function(properties) {
            this.lastContent = (properties || {}).content || {};
            this.updateContent();
        },
        updateContent: function() {
            var content = this.lastContent;
            if (this.autoRefresh){
                clearInterval(this.autoRefresh);
                this.autoRefresh = null;
            }
            if(content.dispatchState === 'FAILED') {
                this.clear();
            } else if(content.dispatchState === 'PARSING' || content.dispatchState === 'QUEUED') {
                this.clear();
            } else if(content.dispatchState === 'RUNNING') {
                if(content.isRealTimeSearch) {
                    removeTimerCallback(this.timer);
                    this.$el.text(_("Real-time").t());
                } else {
                    this.clear();
                }
            } else if(content.dispatchState === 'DONE') {
                //this.$el.hide();
                this.refreshTime = moment(this.manager.get('published'));
                this.clear();
                if (this.refreshTime && this.settings.get('refresh.time.visible')){
                    this.$el.append($('<span class="time-freshness"/>'));
                    this.updateRefreshTime();
                    registerTimerCallback(this.timer, this.updateRefreshTime, this);
                }
                if (this.settings.get('refresh.auto.interval')){
                    this.autoRefresh = setTimeout(_.bind(this.refresh, this), 1000 * this.settings.get('refresh.auto.interval'));
                }
            }
        },
        refresh: function(event){
            if (event){
                event.preventDefault();
            }
            this.manager.startSearch();
        },
        render: function() {
            this.$el.html('&nbsp;');
            return this;
        },
        remove: function() {
            removeTimerCallback(this.timer);
            if (this.autoRefresh){
                clearInterval(this.autoRefresh);
                this.autoRefresh = null;
            }
            this.onManagerChange(null, null);
            return BaseSplunkView.prototype.remove.call(this);
        }
    });

    return RefreshTimeIndicatorView;
});
