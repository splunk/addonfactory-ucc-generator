define(
    [
        'underscore',
        'module',
        'views/Base'
    ],
    function(
        _,
        module,
        BaseView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'indexes-and-sourcetypes-list-group',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _,
                    collection: this.collection
                }));

                return this;
            },

            template: '\
                <div class="indexes-and-sourcetypes-header"><%= _("Selected indexes and sourcetypes:").t() %></div>\
                <% this.collection.each(function(indexAndSourcetypesModel) { %>\
                    <div class="index-and-sourcetypes-item">\
                        <% var index = indexAndSourcetypesModel.get("index") %>\
                        <% if (_.isArray(index)) { %>\
                            <%- _("indexes").t() %> = <%- index.join(_(", ").t()) %>\
                        <% } else { %>\
                            <%- _("index").t() %> = <%- index %>\
                        <% } %>\
                        </br>\
                        <%- _("sourcetypes").t() %> = <%- indexAndSourcetypesModel.get("sourcetypes").join(_(", ").t()) %> \
                    </div>\
                <% }, this); %>\
            '
        });
    }
);