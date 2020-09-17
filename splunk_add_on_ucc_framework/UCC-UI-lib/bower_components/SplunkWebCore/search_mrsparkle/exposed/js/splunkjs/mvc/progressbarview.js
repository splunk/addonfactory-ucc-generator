define(function(require, exports, module) {
    var $ = require('jquery');
    var mvc = require('./mvc');
    var Backbone = require('backbone');
    var BaseSplunkView = require('./basesplunkview');
    var _ = require('underscore');
    var PopdownView = require('views/shared/delegates/Popdown');
    var SplunkUtil = require('splunk.util');
    var splunkConfig = require('splunk.config');
    var SearchJobModel = require('models/search/Job');
    var ProgressBar = require('views/shared/ProgressBar');

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name ProgressBarView
     */
    var ProgressBarView = BaseSplunkView.extend(/** @lends splunkjs.mvc.ProgressBarView.prototype */{
        moduleId: module.id,

        className: 'splunk-progressbar',
        configure: function() {
            // Silently rewrite the deprecated 'manager' setting if present
            if (this.options.manager) {
                this.options.managerid = this.options.manager;
            }

            BaseSplunkView.prototype.configure.apply(this, arguments);
        },
        initialize: function() {
            this.configure();

            if(!this.children) {
                this.children = {};
            }
            this.bindToComponentSetting('managerid', this.onManagerChange, this);
            this.model = { jobState: new Backbone.Model(), messages: new Backbone.Model() };
            var debouncedRender = _.debounce(this.render);
            this.model.jobState.on('change', debouncedRender, this);
            this.model.messages.on('change', debouncedRender, this);
            this.model.searchJob = new SearchJobModel();
            this.children.progressBar = new ProgressBar({
                model: this.model.searchJob,
                animateRealTime: false
            });
        },
        onManagerChange: function(ctxs, ctx) {
            if(this.manager) {
                this.manager.off(null, null, this);
            }
            this.manager = ctx;
            if(!ctx) {
                return;
            }
            this.model.jobState.clear();
            this.model.messages.clear();
            this.manager.on("search:start", this.onSearchStart, this);
            this.manager.on("search:progress search:done", this.onSearchProgress, this);
            this.manager.on("search:error", this.onSearchFail, this);
            this.manager.on("search:fail", this.onSearchFail, this);
            this.manager.on("search:cancelled", this.onSearchCancelled, this);
            this.manager.replayLastSearchEvent(this);
        },
        onSearchStart: function() {
            var sid = this.manager.getSid();
            this.model.searchJob.set("id", sid);
            this.model.messages.clear();
            this.model.jobState.set({ progress: true });
        },
        onSearchProgress: function(properties) {
            this.model.searchJob.setFromSplunkD({ entry: [properties] });
            var content = properties.content || {};
            var dispatchState = content.dispatchState;

            if(content.messages) {
                var errMsgs = _(content.messages).chain().where({ 'type': 'ERROR' }).pluck('text').value();
                var warnMsgs = _(content.messages).chain().where({ 'type': 'WARN' }).pluck('text').value();
                this.model.messages.set('errors', errMsgs, { unset: _.isEmpty(errMsgs) });
                this.model.messages.set('warnings', warnMsgs, { unset: _.isEmpty(warnMsgs) });
            }

            if(dispatchState === undefined) {
                this.model.jobState.clear();
            } else if(dispatchState === 'FAILED') {
                this.model.jobState.clear();
            } else {

                if(content.dispatchState === 'DONE') {
                    this.model.jobState.clear();
                } else {
                    this.model.jobState.set({
                        progress: true
                    });
                }
            }
        },
        onSearchFail: function() {
            this.model.jobState.clear();
        },
        onSearchCancelled: function() {
            this.model.jobState.clear();
        },
        render: function() {
            if(this.model.jobState.has('progress') && this.$el.is(':empty')) {
                this.children.progressBar.render().prependTo(this.$el);
            }
            if(this.model.messages.has('errors') || this.model.messages.has('warnings')) {
                if(!this.$error) {
                    this.$error = $('<div class="error-details">' +
                                    '<a href="#" class="dropdown-toggle error-indicator"><i class="icon-warning-sign"></i></a>' +
                                    '<div class="dropdown-menu"><div class="arrow"></div>' +
                                        '<ul class="first-group error-list">' +
                                        '</ul>' +
                                    '</div>' +
                                    '</div>').appendTo(this.$el);
                }
                this.$error.find('.error-list').html(this.errorStatusTemplate(_.extend({ _:_, errors: null, warnings: null }, this.model.messages.toJSON())));

                if(!this.children.errorPopdown) {
                    this.children.errorPopdown = new PopdownView({ el: this.$error });
                }
                this.$error[this.model.messages.has('errors') ? 'addClass' : 'removeClass']('severe');
            } else {
                if(this.$error) {
                    this.$error.remove();
                    this.$error = null;
                }
                if(this.children.errorPopdown) {
                    this.children.errorPopdown.remove();
                    this.children.errorPopdown = null;
                }
            }

            return this;
        },
        remove: function() {
            _(this.children).invoke('remove');
            _(this.model).invoke('off');
            if(this.manager) {
                this.manager.off(null, null, this);
            }
            return BaseSplunkView.prototype.remove.call(this);
        },
        errorStatusTemplate: _.template(
                '<% _(errors).each(function(error){ %>' +
                    '<li class="error"><i class="icon-warning-sign"></i> <%- error %></li>' +
                '<% }); %>' +
                '<% _(warnings).each(function(warn){ %>' +
                    '<li class="warning"><i class="icon-warning-sign"></i> <%- warn %></li>' +
                '<% }); %>')
    });

    return ProgressBarView;
});
