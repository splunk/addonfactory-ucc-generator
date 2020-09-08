define(
    [
        'module',
        'underscore',
        'views/Base',
        'uri/route'
    ],
    function(
        module,
        _,
        BaseView,
        route
    ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'p',
            className: 'spl-change-password-skip',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click .skip-change-pw-btn': function(e) {
                    e.preventDefault();
                    this.model.login.trigger('skipChangePassword');
                    window.location = route.returnTo(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        this.model.application.get("return_to") || "");
                }
            },
            render: function() {
                var html = this.compiledTemplate({
                    _: _
                });
                this.$el.html(html);
                return this;
            },
            template: '\
                <a href="#" class="skip-change-pw-btn"><%- _("Skip").t() %></a>\
            '
        });
    }
);
