define(
    [
        'jquery',
        'underscore',
        'views/Base',
        'module',
        'uri/route',
        'util/general_utils',
        'bootstrap.tooltip'
    ],
    function(
        $,
        _,
        BaseView,
        module,
        route,
        GeneralUtils,
        _bootstrapTooltip
    ) {
    return BaseView.extend({
        moduleId: module.id,
        tagName: 'tr',
        className: function() {
            return 'active-action ' + (this.isExpandable() ? 'expandable' : 'disabled');
        },
        attributes: function() {
            return {
                'data-name': this.model.selectedAlertAction.entry.get('name')
            };
        },
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model.selectedAlertAction, 'remove', this.remove);
        },
        events: {
            'click a.remove-action': function(e) {
                var name = this.model.selectedAlertAction.entry.get('name');
                if (name === 'list') {
                    this.model.alert.entry.content.set('alert.track', false);
                } else {
                    this.model.alert.entry.content.set('action.' + name, false);
                }
                this.collection.unSelectedAlertActions.add(
                    this.collection.selectedAlertActions.remove(this.model.selectedAlertAction));
                e.preventDefault();
            },
            'click td.action-title': function(e) {
                if (this.isExpandable()) {
                    this.model.alert.trigger('toggleRow', $(e.currentTarget.parentElement), true);
                }
                e.preventDefault();
            },
            'expand': function(e) {
                this.model.selectedAlertAction.set('isExpanded', true);
            },
            'collapse': function() {
                this.model.selectedAlertAction.set('isExpanded', false);
            }
        },
        isExpandable: function() {
            var isCustomAction = GeneralUtils.normalizeBoolean(this.model.selectedAlertAction.entry.content.get('is_custom'));
            return !isCustomAction || this.model.alertActionUI != null;
        },
        removeTooltip: function() {
            this.$('.expands').tooltip('destroy');
        },
        remove: function(){
            this.removeTooltip();
            return BaseView.prototype.remove.apply(this, arguments);
        },
        render: function() {
            var actionName = this.model.selectedAlertAction.entry.get('name');
            var isExpandable = this.isExpandable();
            this.removeTooltip();
            this.$el.html(this.compiledTemplate({
                _: _,
                actionName: actionName,
                actionLabel: this.model.selectedAlertAction.entry.content.get('label') || actionName,
                isExpanded: this.model.selectedAlertAction.get('isExpanded') && isExpandable,
                isExpandable: isExpandable,
                iconPath: route.alertActionIconFile(this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.selectedAlertAction.entry.acl.get('app'),
                    {file: this.model.selectedAlertAction.entry.content.get('icon_path')})
            }));
            
            if (!isExpandable) {
                this.$('.expands').tooltip({
                    animation: false,
                    title: _('This alert action does not require any user configuration.').t(),
                    container: 'body'
                });
            }
            return this;
        },
        template: '\
        <td class="expands<%- isExpandable ? \'\' : \' disabled\' %>" <% if (isExpanded) { %> rowspan="2" <% } %> <% if (isExpandable) { %> tabindex="0" <% } %> >\
            <a>\
                <i class="<%- isExpanded ? \'icon-triangle-down-small\' : \'icon-triangle-right-small\' %>">\
                </i>\
            </a>\
        </td>\
        <td class="action-title"><img src="<%= iconPath %>"><%- _(actionLabel).t() %></td>\
        <td class="action-actions"><a class="remove-action pull-right" href="#" ><%- _("Remove").t() %></a></td>\
    '
    });
});

