define(['underscore','module', 'views/Base', 'util/splunkd_utils', 'bootstrap.tooltip'], function(_, module, BaseView, splunkd_utils /* bootstrap tooltip */) {
    return BaseView.extend({
        moduleId: module.id,
        className: 'stop btn-pill btn-square',
        tagName: 'a',
        attributes: {
            "href": "#"
        },
        initialize: function() {
            var attachTooltipTo = this.options.attachTooltipTo || this.$el;
            BaseView.prototype.initialize.apply(this, arguments);
            this.$el.tooltip({animation:false, title:_('Stop').t(), container: attachTooltipTo});
        },
        
        events: {
            "click": function(e) {
                e.preventDefault();
                var data = {
                    error: function(model, response) {
                        if (response.status == splunkd_utils.NOT_FOUND) {
                            this.model.trigger('jobControls:notFound');
                        }
                    }.bind(this)
                };
                if (!this.isActive()) {
                    return true;
                } else if (this.model.isQueued() || this.model.isParsing()) {
                    data.success = function() {
                        this.model.clear();
                    }.bind(this);
                    this.model.destroy(data);
                } else {
                    data.success = function() {
                        this.model.fetch();
                    }.bind(this);
                    this.model.finalize(data);
                }
                // Blur the element to avoid a sticky tooltip.
                this.$el.blur();
            }
        },
        
        isActive: function() {
            return !this.model.isNew() && !this.model.isDone() && this.model.entry.acl.canWrite();
        },
        
        render: function() {
            this.$el.html('<i class="icon-stop"></i><span class="hide-text">' + _("Stop").t() + '</span>');
            return this;
        }
    });
});
