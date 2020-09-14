define([
            'jquery',
            'underscore',
            'module',
            'views/Base',
            'util/console'
        ],
        function(
            $,
            _,
            module,
            Base,
            console
        ) {

    return Base.extend({

        _pendingRender: false,
        className: 'lazy-view-container',
        loadingMessage: _('Loading...').t(),
        loadFailedMessage: _('Failed to load component.').t(),
        loadModule: function() {
            throw new Error('loadModule must be implemented by classes that inherit from LazyView');
        },

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            this._wrappedViewLoadedDfd = $.Deferred();
            this.$el.height('100%').width('100%');
        },

        load: function() {
            if(!this._pendingLoad && !this.children.wrappedView) {
                var that = this;

                var onFailure = function() {
                    var errorMessage = that._getLoadFailedMessage();
                    that._showMessage(errorMessage, 'error');
                    that.trigger('loadFailed');
                    that._wrappedViewLoadedDfd.reject();
                };

                this._pendingLoad = true;
                this.$el.addClass('loading');
                this._showMessage(this.loadingMessage);
                this.trigger('loadStart');
                this.loadModule()
                    .done(function(WrappedViewConstructor) {
                        if(that._removed) {
                            return;
                        }
                        var deps = _(arguments).toArray().slice(1);
                        var wrappedViewOptions = that._getWrappedViewOptions.apply(that, deps);
                        try {
                            that.children.wrappedView = that.wrappedView = new WrappedViewConstructor(wrappedViewOptions);
                        } catch(e) {
                            onFailure();
                            setTimeout(function() { throw e; }, 0);
                            return;
                        }
                        if(that.active) {
                            that._bindWrappedViewEvents();
                        }
                        if(that._rendered && that.active && that.awake) {
                            that.children.wrappedView.render();
                        }
                        if(that.active) {
                            that.children.wrappedView.activate({ deep: true });
                        } else {
                            that.children.wrappedView.deactivate({ deep: true });
                        }
                        that._clearMessage();
                        that.children.wrappedView.appendTo(that.el);
                        that._onWrappedViewLoaded();
                        that.trigger('loadComplete');
                        that._wrappedViewLoadedDfd.resolve();
                    })
                    .fail(function(err) {
                        console.error('Error dynamically loading view: ' + err);
                        onFailure();
                    })
                    .always(function() {
                        that.$el.removeClass('loading');
                        that._pendingLoad = false;
                    });
            }
            return this;
        },

        render: function() {
            if(this.children.wrappedView) {
                this.children.wrappedView.render();
            } else {
                this._rendered = true;
            }
            return this;
        },

        remove: function() {
            this._removed = true;
            return Base.prototype.remove.apply(this, arguments);
        },

        startListening: function() {
            Base.prototype.startListening.apply(this, arguments);
            this._bindWrappedViewEvents();
        },
        
        wrappedViewLoaded: function() {
            return this._wrappedViewLoadedDfd.promise();
        },

        _bindWrappedViewEvents: function() {
            if(this.children.wrappedView) {
                this.listenTo(this.children.wrappedView, 'all', this.trigger);
            }
        },

        _showMessage: function(message, alertType) {
            this._clearMessage();
            this.$el.html(this.compiledTemplate({
                message: message,
                alertType: alertType || 'info'
            }));
        },

        _clearMessage: function() {
            this.$el.empty();
        },

        _getLoadFailedMessage: function() {
            return this.loadFailedMessage;
        },

        _onWrappedViewLoaded: function() {},

        _getWrappedViewOptions: function() {
            return _.omit(this.options, 'el');
        },

        template: '\
            <div class="alert alert-<%- alertType %>">\
                <i class="icon-alert"></i>\
                <%- message %>\
            </div>\
        '

    });

});