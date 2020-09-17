define([
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/delegates/Popdown'
    ],
    function (
        $,
        _,
        module,
        BaseView,
        Popdown
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: "action-cell",

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
            },

            events: {
                'click .delete-action': function(e) {
                    e.preventDefault();
                    this.model.controller.trigger("deleteEntity", this.model.entity);
                }
            },

            render: function() {
                var opts = { 
                    return_to: window.location.href,
                    return_to_page: 'server_classes_page'
                };

                var html = this.compiledTemplate({
                    dataInputsLink: this.model.entity.getDataInputsUrl(this.model.entity.getBundleType(), this.model.entity.getBundleName()),
                    editLinkHref: this.model.entity.getEditUrl(opts),
                    configureLinkHref: this.model.entity.getConfigureUrl(opts),
                    canEdit: this.model.entity.canEdit(),
                    canDelete: this.model.entity.canDelete(),
                    canConfigure: this.model.entity.canListStanzas()
                });

                this.$el.html(html);
                this.children.actionPopdown = new Popdown({ el: this.$el });

                return this;
            },

            template: '\
                <% if (canEdit || canConfigure) { %>\
                <a href="#" class="entity-action edit-menu dropdown-toggle">\
                    <%- _("Edit").t() %><span class="caret"></span>\
                </a>\
                <div class="dropdown-menu">\
                    <div class="arrow"></div>\
                    <ul>\
                    <% if (canEdit) { %> \
                    <li><a href="<%- editLinkHref %>" class="edit-action"><%- _("Edit Properties").t() %></a></li>\
                    <% } %> \
                    <% if (canConfigure) { %> \
                    <li><a href="<%- configureLinkHref %>" class="configure-action"><%- _("Edit Configuration").t() %></a></li> \
                    <% } %>\
                    </ul>\
                </div>\
                <% } %>\
                <a href="<%- dataInputsLink %>" class="entity-action input-action"><%- _("Manage Inputs").t() %></a>\
                <% if (canDelete) { %> \
                <a href="#" class="entity-action delete-action"><%- _("Delete").t() %></a> \
                <% } %>\
            ' 
        });
    }
);

