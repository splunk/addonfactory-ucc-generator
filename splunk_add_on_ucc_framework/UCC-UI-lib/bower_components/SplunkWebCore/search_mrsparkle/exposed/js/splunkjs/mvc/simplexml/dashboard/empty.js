define(function(require, exports, module) {
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var SplunkUtil = require('splunk.util');
    var route = require('uri/route');

    var DashboardEmptyState = Backbone.View.extend({
        initialize: function(options) {
            Backbone.View.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.state, 'change:editable change:edit', this.render, this);
        },
        events: {
            'click a.start-edit': function(e) {
                e.preventDefault();
                this.model.state.set('edit', true);
            }
        },
        render: function() {
            this.$el.empty().removeClass('empty-dashboard');
            this.$el.addClass('empty-dashboard');
            var alert = $('<div class="alert alert-error"><i class="icon-alert"></i></div>');
            if (this.model.state.get('editable')) {
                var msg;
                if (this.model.state.get('edit')) {
                    msg = _('Click Add Panel to start.').t();
                } else {
                    msg = _('This dashboard has no panels. %s to add panels.').t();
                    var startEditLink = SplunkUtil.sprintf('<a class="start-edit" href="#edit">%s</a>', _('Start editing').t());
                    msg = SplunkUtil.sprintf(msg, startEditLink);
                }
                $('<span></span>').html(msg).appendTo(alert);
            } else {
                $('<span></span>').text(_('This dashboard has no panels.').t()).appendTo(alert);
            }
            alert.appendTo(this.$el);
            return this;
        }
    });

    return DashboardEmptyState;
});