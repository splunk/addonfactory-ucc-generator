define([
    'jquery',
    'underscore',
    'module',
    'views/shared/Modal'
],
    function(
        $,
        _,
        module,
        Modal
        ) {
        return Modal.extend({
            moduleId: module.id,
            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    this.model.wizard.trigger('disable');
                    e.preventDefault();
                }
            }),
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Disable Clustering').t());
                var html = this.compiledTemplate({
                    mode: this.model.clusterConfig.entry.content.get('mode')
                });
                this.$(Modal.BODY_SELECTOR).append(html);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">'+_('Disable clustering').t()+'</a>');
                return this;
            },
            template: "<% if (mode=='master') { %>\
                <%= _('Before disabling clustering, make sure all the peers are disabled from the master. Are you sure you want to continue?').t() %>\
            <% } else { %>\
                <%= _('This will disable clustering on this node. Are you sure you want to continue?').t() %>\
            <% } %>"
        });
    });
