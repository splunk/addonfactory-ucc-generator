define(
    [
        'jquery',
        'underscore',
        'views/dashboard/Base',
        'views/dashboard/EmptyStatus'
    ],
    function($,
             _,
             BaseDashboardView,
             EmptyStatusView) {

        return BaseDashboardView.extend({
            initialize: function(options) {
                BaseDashboardView.prototype.initialize.apply(this, arguments);
                this.model = _.extend({}, this.model);
                this.deferreds = _.extend({}, options.deferreds);
            },
            render: function() {
                BaseDashboardView.prototype.render.apply(this, arguments);
                this._updateEmptyMessage();
                return this;
            },
            captureStructure: function() {
                //implement by sub modules
                return {};
            },
            isEmpty: function() {
                //implement by sub modules
            },
            _updateEmptyMessage: function() {
                this.deferreds.componentReady.then(function() {
                    if (this.isEmpty()) {
                        if (!this.children.emptyMessage) {
                            this.children.emptyMessage = new EmptyStatusView({
                                model: this.model
                            });
                            this.children.emptyMessage.render().$el.appendTo(this.$el);
                        }
                    }
                    else {
                        if (this.children.emptyMessage) {
                            this.children.emptyMessage.remove();
                            this.children.emptyMessage = null;
                        }
                    }
                }.bind(this));
            },
            _onElementCreated: function() {
                this._updateEmptyMessage();
            },
            _onElementRemoved: function() {
                this._updateEmptyMessage();
            },
            _onInputCreated: function() {

            },
            _onInputRemoved: function() {

            },
            events: {
                'inputCreated': '_onInputCreated',
                'inputRemoved': '_onInputRemoved',
                'elementCreated': '_onElementCreated',
                'elementRemoved': '_onElementRemoved'
            }
        });
    }
);
