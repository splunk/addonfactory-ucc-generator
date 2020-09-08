define([
        'underscore',
        'module',
        'views/shared/Modal',
        'views/shared/reportcontrols/dialogs/embed_dialog/NotScheduled',
        'views/shared/reportcontrols/dialogs/embed_dialog/Confirmation',
        'views/shared/reportcontrols/dialogs/embed_dialog/Embed',
        'util/general_utils',
        './Master.pcss'
    ],
    function(
        _,
        module,
        ModalView,
        NotScheduledView,
        ConfirmationView,
        EmbedView,
        util,
        css
    ) {
    return ModalView.extend({
        moduleId: module.id,
        /**
        * @param {Object} options {
        * }
        */
        initialize: function(options) {
            ModalView.prototype.initialize.apply(this, arguments);
            this.children.notScheduled = new NotScheduledView({
                model: {
                    report: this.model.report,
                    application: this.model.application,
                    user: this.model.user,
                    appLocal: this.model.appLocal,
                    controller: this.model.controller
                }
            });
            this.children.notScheduled.on('hide', this.hide, this);
            this.children.confirmation = new ConfirmationView({
                model: this.model.report
            });
            this.children.embed = new EmbedView({
                model: {
                    report: this.model.report,
                    application: this.model.application
                }
            });
            this.children.embed.on('hide', this.hide, this);
            this.model.report.entry.content.on('change:embed.enabled', function() {
                if (util.normalizeBoolean(this.model.report.entry.content.get('embed.enabled'))) {
                    if (this.model.controller) {
                        this.model.controller.trigger('refreshEntities');
                    }
                    this.children.notScheduled.$el.hide();
                    this.children.confirmation.$el.hide();
                    this.children.embed.show();
                    return;
                }
                this.hide();
                if (this.model.controller) {
                    this.model.controller.trigger('refreshEntities');
                }
            }, this);
        },
        visibility: function() {
            if (!this.model.report.entry.content.get('is_scheduled')) {
                this.children.notScheduled.$el.show();
                this.children.confirmation.$el.hide();
                this.children.embed.$el.hide();
            } else if (!util.normalizeBoolean(this.model.report.entry.content.get('embed.enabled'))) {
                this.children.notScheduled.$el.hide();
                this.children.confirmation.$el.show();
                this.children.embed.$el.hide();
            } else {
                this.children.notScheduled.$el.hide();
                this.children.confirmation.$el.hide();
                this.children.embed.show();
            }
        },
        render : function() {
            this.$el.append(this.children.notScheduled.render().el);
            this.$el.append(this.children.confirmation.render().el);
            this.$el.append(this.children.embed.render().el);
            this.visibility();
        }
    });
});
