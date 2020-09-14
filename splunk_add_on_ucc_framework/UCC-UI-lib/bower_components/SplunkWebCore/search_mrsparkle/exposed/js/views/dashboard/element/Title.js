define([
    'module',
    'jquery',
    'underscore',
    'views/dashboard/Base',
    'splunkjs/mvc/utils'
], function(module,
            $,
            _,
            BaseDashboardView,
            utils) {

    var DashboardElementTitleView = BaseDashboardView.extend({
        moduleId: module.id,
        viewOptions: {
            register: false
        },
        tagName: 'h3',
        constructor: function(options) {
            BaseDashboardView.prototype.constructor.call(this, options, {retainUnmatchedTokens: true});
            this.settings._sync = utils.syncModels(this.settings, this.model, {
                auto: 'pull',
                prefix: 'dashboard.element.',
                include: ['title']
            });
            this.listenTo(this.settings, 'change:title', this.render);
        },
        render: function() {
            var title = this.settings.get('title');
            if (title) {
                this.$el.text(_(title).t()).show();
            } else {
                this.$el.text('').hide();
            }
            return this;
        },
        remove: function() {
            if (this.settings) {
                if (this.settings._sync) {
                    this.settings._sync.destroy();
                }
            }
            BaseDashboardView.prototype.remove.apply(this, arguments);
        }
    });

    return DashboardElementTitleView;

});
