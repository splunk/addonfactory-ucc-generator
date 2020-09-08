define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/Modal',
        'uri/route'
     ],
     function(_, module, Base, Modal, route){
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            render: function() {
                var routeToManager = route.managerEdit(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get("app"),
                    ['saved', 'searches', this.model.alert.entry.get('name')],
                    this.model.alert.entry.id
                );
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Unsupported Alert.").t());

                this.$(Modal.BODY_SELECTOR).append(this.compiledTemplate({
                    _: _
                }));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="' + routeToManager + '" class="btn btn-primary">' + _("Edit Alert in Settings").t() + '</a>');
                return this;
            },
            template: '\
                <p>\
                    <%- _("A real-time alert with a time range of all-time and a condition other than always is not supported. It is recommended you change the time range of the alert to something other than Start Time \'rt\' Finish Time \'rt\' in Settings.").t() %>\
                </p>\
            '
       });
    }
);
