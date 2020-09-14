/**
 * @author ahebert
 * @date 3/30/15
 *
 * Modal step prompting the user for a dashboard name.
 */
define(
    [
        'jquery',
        'underscore',
        'module',
        'backbone',
        'views/shared/Modal',
        'views/dashboards/AddDashboard'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        Modal,
        AddDashboardDialog
    ){
        return AddDashboardDialog.extend({
            moduleId: module.id,
            
            events: $.extend({}, Modal.prototype.events, {
                'click a.modal-btn-primary': function (e) {
                    this.model.dashboard.meta.validate();
                    if (this.model.dashboard.meta.isValid()) {
                        this.model.dashboard.meta.apply();
                        this.model.dashboard.save({}, {
                            data: this.model.application.getPermissions(this.model.perms.get('perms')),
                            success: function () {
                                this.collection.panels.trigger('createSuccess');
                                this.hide();
                                this.remove();
                            }.bind(this)
                        });
                    }
                    e.preventDefault();
                }
            }),

            render: function () {
                $.when(this.dashboardFetchDeferred).then(function(){
                    this.model.dashboard.entry.set('name', '');
                    this.model.dashboard.meta.set('label', '');

                    $.each(this.collection.panels.models, function(index, panel){
                        this.model.dashboard.appendPrebuiltPanel(panel);
                    }.bind(this));

                    this.$el.html(Modal.TEMPLATE);
                    this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Create new dashboard").t());
                    this.$(Modal.BODY_SELECTOR).prepend(this.children.flashMessages.render().el);
                    this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                    this.$(Modal.BODY_FORM_SELECTOR).append(this.children.title.render().el);
                    this.$(Modal.BODY_FORM_SELECTOR).append(this.children.name.render().el);
                    this.$(Modal.BODY_FORM_SELECTOR).append(this.children.description.render().el);
                    if (this.model.dashboard.entry.acl.get('can_share_app')) {
                        this.$(Modal.BODY_FORM_SELECTOR).append(this.children.permissions.render().el);
                    }
                    this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                    this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">' + _("Create dashboard").t() + '</a>');

                }.bind(this));
                return this;
            }
        });
    }
);