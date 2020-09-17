define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'splunk.util'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        splunkUtils
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'commandeditor-section-padded row-count-container',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            events: {
                'click .add-row-count': function(e) {
                    e.preventDefault();
                    this.model.command.set('rowCount', true);
                    this.render();
                },
                'click .delete-row-count': function(e) {
                    e.preventDefault();
                    this.model.command.set('rowCount', false);
                    this.render();
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    rowCountEnabled: splunkUtils.normalizeBoolean(this.model.command.get('rowCount'))
                }));

                return this;
            },

            template: '\
                <% if (rowCountEnabled) { %>\
                    <div class="row-count-label"><%- _("Row count").t() %></div>\
                    <div class="row-count-field">count</div>\
                    <a class="delete-row-count commandeditor-group-remove">\
                        <i class="icon-x"></i>\
                    </a>\
                <% } else { %>\
                    <a href="#" class="add-row-count">\
                    <i class="icon-plus"></i>\
                        <%- _("Add row count...").t() %>\
                    </a>\
                <% } %>\
            '
        });
    }
);