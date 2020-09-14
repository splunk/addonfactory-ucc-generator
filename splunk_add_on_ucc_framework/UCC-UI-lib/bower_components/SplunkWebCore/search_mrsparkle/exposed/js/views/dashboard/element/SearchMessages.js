define(
    [
        'module',
        'jquery',
        'underscore',
        'backbone',
        'views/dashboard/Base',
        'views/shared/delegates/Popdown'
    ],
    function(module,
             $,
             _,
             Backbone,
             BaseDashboardView,
             PopdownView
         ) {
        return BaseDashboardView.extend({
            moduleId: module.id,
            initialize: function(options) {
                BaseDashboardView.prototype.initialize.apply(this, arguments);
                this.bindToComponentSetting('managerid', this.onManagerChange, this);
                this.model = _.extend({
                    messages: new Backbone.Model()
                }, this.model);
                var debouncedRender = _.debounce(this.render);
                this.model.messages.on('change', debouncedRender, this);
            },
            onManagerChange: function(ctxs, ctx) {
                if (this.manager) {
                    this.manager.off(null, null, this);
                }
                this.manager = ctx;
                if (!ctx) {
                    return;
                }
                if (this._shouldShowProgress()) {
                    this.model.messages.clear();
                }
                this.manager.on("search:progress search:done", this.onSearchProgress, this);
                this.manager.replayLastSearchEvent(this);
            },
            onSearchProgress: function(properties) {
                var content = properties.content || {};

                // Pass this progress event if we are not showing progress and
                // the job is not done.
                if (!this._shouldShowProgress() && !content.isDone) {
                    return;
                }

                if (content.messages) {
                    var errMsgs = _(content.messages).chain().where({ 'type': 'ERROR' }).pluck('text').value();
                    var warnMsgs = _(content.messages).chain().where({ 'type': 'WARN' }).pluck('text').value();
                    this.model.messages.set('errors', errMsgs, { unset: _.isEmpty(errMsgs) });
                    this.model.messages.set('warnings', warnMsgs, { unset: _.isEmpty(warnMsgs) });
                }
            },
            render: function() {
                if (this.model.messages.has('errors') || this.model.messages.has('warnings')) {
                    if (!this.$error) {
                        this.$error = $('<div class="error-details">' +
                                        '<a href="#" class="dropdown-toggle error-indicator"><i class="icon-warning-sign"></i></a>' +
                                        '<div class="dropdown-menu"><div class="arrow"></div>' +
                                            '<ul class="first-group error-list">' +
                                            '</ul>' +
                                        '</div>' +
                                        '</div>').appendTo(this.$el);
                    }
                    this.$error.find('.error-list').html(this.errorStatusTemplate(_.extend({ _:_, errors: null, warnings: null }, this.model.messages.toJSON())));

                    if (!this.children.errorPopdown) {
                        this.children.errorPopdown = new PopdownView({ el: this.$error });
                    }
                    this.$error[this.model.messages.has('errors') ? 'addClass' : 'removeClass']('severe');
                } else {
                    if (this.$error) {
                        this.$error.remove();
                        this.$error = null;
                    }
                    if (this.children.errorPopdown) {
                        this.children.errorPopdown.remove();
                        this.children.errorPopdown = null;
                    }
                }
                return this;
            },
            _shouldShowProgress: function() {
                var refreshDisplay = this.model.report.entry.content.get('dashboard.element.refresh.display');
                return refreshDisplay === 'none' ? !this.manager.isRefresh() : true;
            },
            remove: function() {
                _(this.children).invoke('remove');
                _(this.model).invoke('off');
                return BaseDashboardView.prototype.remove.call(this);
            },
            errorStatusTemplate: _.template(
                    '<% _(errors).each(function(error){ %>' +
                        '<li class="error"><i class="icon-warning-sign"></i> <%- error %></li>' +
                    '<% }); %>' +
                    '<% _(warnings).each(function(warn){ %>' +
                        '<li class="warning"><i class="icon-warning-sign"></i> <%- warn %></li>' +
                    '<% }); %>')
        });
    }
);
