define(
    [
        'underscore',
        'jquery',
        'views/shared/PopTart',
        'module',
        'uri/route'
    ],
    function(
        _,
        $,
        PopTartView,
        module,
        route
    )
    {
        return PopTartView.extend({
            moduleId: module.id,
             /**
             * @param {Object} options {
             *     model: {
             *         application: <models.Application>,
             *     },
             *     collection: {
             *         unSelectedAlertActions: <collections.shared.ModAlertActions>
             *     }
             *     canViewAlertActionsManager: <bool> determins if the link to manager/alert_actions is shown. Defaults to false.
             * }
             */
            className: 'dropdown-menu dropdown-menu-wide dropdown-menu-width-auto add-alert-action-dropdown',
            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);
                
                var defaults = {
                    canViewAlertActionsManager: false
                };
                _.defaults(this.options, defaults);

                this.listenTo(this.collection.unSelectedAlertActions, 'add remove reset', this.debouncedRender);
            },
            events: {
                'click a': function(e) {
                    var $target = $(e.currentTarget),
                        name = $target.attr('data-name');
                    if (name) {
                        e.preventDefault();
                        var selectedAlertAction = this.collection.unSelectedAlertActions.findByEntryName($target.attr('data-name'));
                        this.collection.unSelectedAlertActions.remove(selectedAlertAction);
                        this.trigger('itemClicked', selectedAlertAction);
                    }
                    this.hide();
                } 
            },
            render: function() {
                var html = this.compiledTemplate({
                    _: _,
                    applicationModel: this.model.application,
                    unSelectedAlertActions: this.collection.unSelectedAlertActions,
                    route: route,
                    canViewAlertActionsManager: this.options.canViewAlertActionsManager,
                    manageLink: route.manager(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get('app'), ['alert_actions'])
                });
                this.el.innerHTML = PopTartView.prototype.template_menu;
                this.$el.append(html);

                return this;
            },
            template: '\
                <ul>\
                    <% _(unSelectedAlertActions.models).each(function(alertAction) { %>\
                        <li>\
                            <a href="#" class="unselected-action" data-name="<%- alertAction.entry.get("name") %>" >\
                                <img src="<%= route.alertActionIconFile(applicationModel.get("root"), applicationModel.get("locale"), alertAction.entry.acl.get("app"), {file: alertAction.entry.content.get("icon_path")}) %>">\
                                <span><%- _(alertAction.entry.content.get("label")).t() || _(alertAction.entry.get("name")).t() %></span>\
                                <span class="link-description"><%- _(alertAction.entry.content.get("description") || "").t() %></span>\
                            </a>\
                        </li>\
                    <% }) %>\
                    <% if (canViewAlertActionsManager) { %>\
                        <li>\
                            <a href="<%- manageLink %>" target="_blank" >\
                                <span><%- _("Manage Alert Actions").t() %><i class="icon-external"></i></span>\
                                <span class="link-description"><%- _("Manage available actions and browse more actions").t() %></span>\
                            </a>\
                        </li>\
                    <% } %>\
                </ul>\
            '
        });
    }
);
