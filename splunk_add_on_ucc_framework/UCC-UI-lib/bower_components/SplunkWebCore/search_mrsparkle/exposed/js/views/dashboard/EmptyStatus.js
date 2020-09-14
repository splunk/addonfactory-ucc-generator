define([
    'module',
    'jquery',
    'underscore',
    'backbone',
    'splunk.util'
], function(module,
            $,
            _,
            Backbone,
            SplunkUtil) {

    return Backbone.View.extend({
        moduleId: module.id,
        initialize: function(options) {
            Backbone.View.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.state, 'change:mode', this.render, this);
        },
        events: {
            'click a.start-edit': function(e) {
                e.preventDefault();
                this.model.controller.trigger('mode:edit');
            }
        },
        render: function() {
            var editable = this.model.view.entry.acl.canWrite();
            this.$el.empty().addClass('empty-dashboard');
            var alert = $('<div class="alert alert-error"><i class="icon-alert"></i></div>');
            if (editable) {
                var msg;
                if (this.model.state.get('mode') == 'edit') {
                    msg = _('Click Add Panel to start.').t();
                } else {
                    if (this.model.page.get("hideTitle") == true || this.model.page.get("hideEdit") == true) {
                        msg = _('This dashboard has no panels.').t();
                    }else {
                        msg = _('This dashboard has no panels. %s to add panels.').t();
                        var startEditLink = SplunkUtil.sprintf('<a class="start-edit" href="#edit">%s</a>', _('Start editing').t());
                        msg = SplunkUtil.sprintf(msg, startEditLink);
                    }
                }
                $('<span></span>').html(msg).appendTo(alert);
            } else {
                $('<span></span>').text(_('This dashboard has no panels.').t()).appendTo(alert);
            }
            alert.appendTo(this.$el);
            return this;
        }
    });
});
