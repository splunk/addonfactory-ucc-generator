define(
    [
        'underscore',
        'views/shared/BaseWorkflowAction'
    ], function(_, BaseWorkflowAction) {
    return BaseWorkflowAction.extend({
        className: 'event-actions dropdown-menu dropdown-menu-selectable',
        initialize: function() {
            BaseWorkflowAction.prototype.initialize.apply(this, arguments);
            this.collection.on('reset', this.render, this);
        },
        render: function() {
            var $arrow = null;
            if (this.el.innerHTML) {
                 $arrow = this.$('.arrow').detach();
            }
            
            var template = _(this.template).template({ rows: this.collection.models });
            this.$el.html(template);
            
            if ($arrow) {
                this.$('.arrow').replaceWith($arrow);
            }
            
            return this;
        },
        template: '\
                <div class="arrow"></div>\
                <ul>\
                    <% _(rows).each(function(row) { %>\
                        <li>\
                            <a href="<%- row.get("link.uri")%>" target="<%- row.get("link.target") %>" data-type="<%- row.get("type")%>"> <%- row.get("label") %></a>\
                        </li>\
                    <% }); %>\
                </ul>\
        '
    });
});
