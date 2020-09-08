define(
    [
        'underscore',
        'module',
        'views/Base',
        'uri/route',
        'splunk.i18n',
        'splunk.util'
    ],
    function(_, module, Base, route, i18n, splunkUtil) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'span',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.actionsExpanded = true;
                this.listenTo(this.model.alert.entry.content, 'change:actions change:alert.track', this.debouncedRender);
            },
            events: {
                'click a': function(e) {
                    this.actionsExpanded = !this.actionsExpanded;
                    this.visibilty();
                    e.preventDefault();
                }
            },
            getAlertActions: function() {
                var actions = this.model.alert.entry.content.get('actions'),
                    actionsArray = actions ? actions.split(',') : [],
                    activeActions = [];

                if (splunkUtil.normalizeBoolean(this.model.alert.entry.content.get('alert.track'))) {
                    actionsArray.unshift('list');
                }
                _.each(actionsArray, function(activeAction) {
                    activeAction = activeAction.trim();
                    var alertAction = this.collection.alertActions.findByEntryName(activeAction);
                    if (alertAction) {
                        activeActions.push(alertAction);
                    }
                }, this);

                return activeActions;
            },
            visibilty: function() {
                var $expander = this.$('a.expand > i');
                if (this.actionsExpanded) {
                    $expander.addClass('icon-chevron-down');
                    $expander.removeClass('icon-chevron-right');
                    this.$('.action-item').show();
                } else {
                    $expander.addClass('icon-chevron-right');
                    $expander.removeClass('icon-chevron-down');
                    this.$('.action-item').hide();
                }
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _,
                    splunkUtil: splunkUtil,
                    i18n: i18n,
                    alertActions: this.getAlertActions(),
                    applicationModel: this.model.application,
                    route: route
                }));
                this.visibilty();
            },
            template: '\
                <div><a class="expand" href="#"><i class="icon-chevron-down"></i></a><%- splunkUtil.sprintf(i18n.ungettext("%s Action", "%s Actions", alertActions.length), alertActions.length) %></div>\
                <% _.each(alertActions, function(alertAction) { %>\
                    <div class="action-item">\
                        <img src="<%= route.alertActionIconFile(applicationModel.get("root"), applicationModel.get("locale"), alertAction.entry.acl.get("app"), {file: alertAction.entry.content.get("icon_path")}) %>">\
                        <span><%- _(alertAction.entry.content.get("label")).t() || _(alertAction.entry.get("name")).t() %></span>\
                    </div>\
                <% }); %>\
            '
        });
    }
);
