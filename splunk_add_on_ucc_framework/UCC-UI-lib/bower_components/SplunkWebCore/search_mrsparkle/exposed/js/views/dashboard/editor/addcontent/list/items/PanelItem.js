define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'dashboard/DashboardParser',
        'dashboard/DashboardFactory',
        'views/dashboard/editor/addcontent/Utils'
    ],
    function(module,
             $,
             _,
             BaseView,
             Parser,
             Factory,
             AddContentUtils) {

        var PanelItem = BaseView.extend({
            moduleId: module.id,
            className: 'dashboard-panel-list-item panel-content',
            tagName: 'li',
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.title = this._getTitle();
                this.icon = AddContentUtils.getPanelIcon(this.model.panel);
                this.hasPlusIcon = AddContentUtils.getPanelElements(this.model.panel).length > 1;
                this.hasCloneRestriction = AddContentUtils.hasCloneRestriction(this.model.panel);
                this.listenTo(this.model.sidebarState, 'change:select', this._onItemSelected);
            },
            _getTitle: function() {
                var panelTitle = this.model.panel.settings['title'];
                if (!panelTitle) {
                    var element = _(this.model.panel.children).chain()
                        .find(function(element) {
                            return element.reportContent && element.reportContent['dashboard.element.title'];
                        })
                        .value();
                    if (element) {
                        panelTitle = element.reportContent['dashboard.element.title'];
                    } else {
                        panelTitle = "Untitled Panel";
                    }
                }
                return panelTitle;
            },
            render: function() {
                var name = _(this.title || this.model.panel.id).t();
                this.$el.html(this.compiledTemplate({
                    icon: this.icon,
                    hasPlusIcon: this.hasPlusIcon,
                    name: name,
                    title: name
                }));

                // some panels cannot be cloned
                if (this.hasCloneRestriction) {
                    this.$el.addClass('clone-error');
                    this.$('a').attr('title', this.hasCloneRestriction);
                }

                this.$('a').tooltip({
                    template: '<div class="tooltip add-content-name"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
                    container: 'body',
                    delay: {show: 500, hide: 0}
                });
                return this;
            },
            events: {
                'click a': 'select'
            },
            select: function(e) {
                e.preventDefault();

                if (this.hasCloneRestriction) {
                    return;
                }

                this.trigger('preview', this.model.panel);
                this.model.sidebarState.set('select', this.cid);
            },
            _onItemSelected: function() {
                if (this.model.sidebarState.get('select') === this.cid) {
                    this.$el.addClass('selected');
                } else {
                    this.$el.removeClass('selected');
                }
            },
            template: '\
                <a href="#" title="<%- title %>">\
                    <div class="icons">\
                        <i class="<%- icon %>"></i>\
                        <% if (hasPlusIcon) { %><i class="icon-plus"/><% } %>\
                    </div>\
                    <%- name %>\
                </a>\
            '
        });

        return PanelItem;
    });