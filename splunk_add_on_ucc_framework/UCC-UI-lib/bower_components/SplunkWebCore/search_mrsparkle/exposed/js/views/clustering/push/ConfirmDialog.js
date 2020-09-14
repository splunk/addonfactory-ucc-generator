define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'uri/route',
    'views/shared/Modal'
],
    function(
        $,
        _,
        Backbone,
        module,
        route,
        Modal
        ) {
        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME,
            /**
             * @param {Object} options {
        *       model: <models.>,
        *       collection: <collections.services.>
        * }
             */
            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
            },
            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    this.model.pushModel.trigger('confirmed');
                    this.hide();
                }
            }),
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Distribute Configuration Bundle").t());
                var root = this.model.application.get('root'),
                    locale = this.model.application.get('locale'),
                    link = route.docHelp(root, locale, 'manager.clustering.bundle');

                var html = this.compiledTemplate({learnmoreLink: link});
                this.$(Modal.BODY_SELECTOR).append(html);
                this.$(Modal.BODY_SELECTOR).show();
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">'+_('Push Changes').t()+'</a>');
                return this;
            },
            template: "<%= _('Some configuration changes might require a restart of all peers. Would you like to push the changes?').t() %> <a href='<%=learnmoreLink %>' class='external' target='_blank'><%= _('Learn More').t() %></a>"
        });
    });
