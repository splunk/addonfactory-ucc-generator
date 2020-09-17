define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/PopTart'
    ],
    function(
        $,
        _,
        module,
        PopTartView
    ) {

        return PopTartView.extend({
            moduleId: module.id,
            className: 'dropdown-menu',
            initialize: function(options) {
                options = _.defaults(options, { mode: 'menu' });
                PopTartView.prototype.initialize.call(this, options);
            },

            events: {
                'click a.edit-location': function(e) {
                    e.preventDefault();
                    this.model.controller.set('uploadFile', false);
                    this.model.controller.trigger("editEntity", this.model.entity);
                },

                'click a.upgrade-app': function(e) {
                    e.preventDefault();
                    this.model.controller.set('uploadFile', true);
                    this.model.controller.trigger("editEntity", this.model.entity);
                },

                'click a.uninstall-app': function(e) {
                    e.preventDefault();
                    this.model.controller.trigger("deleteEntity", this.model.entity);
                }
            },

            render: function() {
                this.el.innerHTML = PopTartView.prototype.template_menu;
                this.$el.append(this.compiledTemplate({
                    canConfigure: this.model.entity.canListStanzas(),
                    configureLinkHref: this.model.entity.getConfigureUrl({ return_to: window.location.href, return_to_page: 'apps_page' }),
                    canEdit: this.model.entity.canEdit(),
                    canDelete: this.model.entity.canDelete()
                }));

                return this;
            },

            template: '\
                <ul class="first-group">\
                    <% if (canEdit) { %>\
                    <li><a href="#" class="edit-location"><%- _("Edit Properties").t() %></a></li>\
                    <% } %>\
                    <% if (canConfigure) { %> \
                    <li><a href="<%- configureLinkHref %>" class="configure-action"><%- _("Edit Configuration").t() %></a></li>\
                    <% } %> \
                    <% if (canEdit) { %>\
	                <li><a href="#" class="upgrade-app"><%- _("Update").t() %></a></li>\
                    <% } %>\
                    <% if (canDelete) { %>\
                    <li><a href="#" class="uninstall-app"><%- _("Uninstall").t() %></a></li>\
                    <% } %>\
                </ul>'
        });

    }
);
