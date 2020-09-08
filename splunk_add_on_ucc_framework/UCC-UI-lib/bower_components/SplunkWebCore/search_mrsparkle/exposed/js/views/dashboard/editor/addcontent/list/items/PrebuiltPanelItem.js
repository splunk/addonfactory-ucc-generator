define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'splunkjs/mvc/simplexml/parser',
        'views/dashboard/editor/addcontent/Utils'
    ],
    function(module,
             $,
             _,
             BaseView,
             Parser,
             AddContentUtils) {

        var PrebuiltPanelItem = BaseView.extend({
            moduleId: module.id,
            tagName: 'li',
            className: 'panel-list-item panel-content',
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.id = options.id || _.uniqueId('panelref_');
                try {
                    this.parsedPanel = Parser.getDefault().parsePanel(this.model.panel.entry.content.get('eai:data'));
                    this.icon = AddContentUtils.getPanelIcon(this.parsedPanel);
                    this.hasPlusIcon = AddContentUtils.getPanelElements(this.parsedPanel).length > 1;
                    this.listenTo(this.model.sidebarState, 'change:select', this._onItemSelected);
                } catch (e) {
                    this.icon = "icon-warning-sign";
                    this.error = e.message || 'Invalid Panel';
                }
            },
            render: function() {
                var title = _(this.model.panel.entry.content.get('panel.title')).t();
                var model = {
                    icon: this.icon,
                    title: this.error && _(this.error).t() || title,
                    name: title,
                    hasPlusIcon: this.hasPlusIcon
                };
                this.$el.html(this.compiledTemplate(model));
                return this;
            },
            events: {
                'click a': 'select'
            },
            select: function(e) {
                e.preventDefault();
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

        return PrebuiltPanelItem;
    });