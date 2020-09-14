define(
    [
        'module',
        'underscore',
        'views/Base',
        'contrib/text!views/account/login/Error.html'
    ],
    function(
        module,
        _,
        BaseView,
        template
    ) {
        return BaseView.extend({
            template: template,
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.listenTo(this.model.login, 'error', this.render);
                this.listenTo(this.model.duo, 'error', this.render);
            },
            render: function() {
                var html = this.compiledTemplate({
                    _: _,
                    model: {
                        login: this.model.login,
                        serverInfo: this.model.serverInfo,
                        application: this.model.application,
                        session: this.model.session,
                        mfaStatus: this.model.mfaStatus,
                        duo: this.model.duo
                    } 
                });
                this.$el.html(html);
                return this;
            }
        });
    }
);
