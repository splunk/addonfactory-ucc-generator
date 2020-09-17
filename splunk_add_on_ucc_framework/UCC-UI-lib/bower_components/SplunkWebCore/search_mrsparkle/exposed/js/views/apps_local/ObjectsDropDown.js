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
            className: 'dropdown-menu dropdown-menu-wide dropdown-menu-width-auto category-dropdown',
            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click .reports-item': function(e) {
                    e.preventDefault();
                    var pageRouter = route.getContextualPageRouter(this.model.application);
                    window.location.href = pageRouter.reports({data:{ns:this.options.appId}});
                },
                'click .alerts-item': function(e) {
                    e.preventDefault();
                    var pageRouter = route.getContextualPageRouter(this.model.application);
                    window.location.href = pageRouter.alerts({data:{ns:this.options.appId}});
                },
                'click .indexes-item': function(e) {
                    e.preventDefault();
                    var pageRouter = route.getContextualPageRouter(this.model.application);
                    window.location.href = pageRouter.manager(['data','indexes'], {data:{ns:this.options.appId}});
                },
                'click .panels-item': function(e) {
                    e.preventDefault();
                    var pageRouter = route.getContextualPageRouter(this.model.application);
                    window.location.href = pageRouter.manager(['data','ui','panels'], {data:{ns:this.options.appId}});
                },
                'click .total-item': function(e) {
                    e.preventDefault();
                    var pageRouter = route.getContextualPageRouter(this.model.application);
                    window.location.href = pageRouter.manager(['admin','directory'], {data:{ns:this.options.appId,app_only:1}});
                }
            },
            render: function() {
                this.el.innerHTML = PopTartView.prototype.template_menu;
                var listNode = $('<ul></ul>');
                this.$el.append(listNode);
                if (this.model.appObjectsCounts.attributes.length != 0) {
                    listNode.append(this.createDropDownItem('alerts-item', 'alerts', _("Alerts").t(),
                        this.model.appObjectsCounts.get('alertsCt')));
                    listNode.append(this.createDropDownItem('indexes-item', 'indexes', _("Indexes").t(),
                        this.model.appObjectsCounts.get('indexesCt')));
                    listNode.append(this.createDropDownItem('reports-item', 'index', _("Reports").t(),
                        this.model.appObjectsCounts.get('reportsCt')));
                    listNode.append(this.createDropDownItem('panels-item', 'panels', _("Prebuilt panels").t(),
                        this.model.appObjectsCounts.get('panelsCt')));
                    listNode.append(this.createDropDownItem("total-item", 'total', _("All Objects").t(),
                        this.model.appObjectsCounts.get('adminDirCt')));
                }
                else {
                    listNode.append(this.createDropDownItem("empty-item", 'empty', _("No objects").t(), -1));
                }
                return this;
            },
            createDropDownItem: function(className, value, name, count) {
                if (count > 0) {
                    return this.templateListItem({
                        className: className,
                        count: count,
                        name: name,
                        value: value
                    });
                }
                else if (count == -1) {
                    return this.templateListItemEmpty({
                        className: className,
                        count: count,
                        name: name,
                        value: value
                    });
                }
                else {
                    return undefined;
                }
            },
            templateListItem: _.template(
                '<li>\
                    <a class="<%- className %>">\
                        <span><%- name %></span>\
                        <span data-value="<%- value %>" class="object-ct"><%- count %></span>\
                    </a>\
                </li>'
            ),
            templateListItemEmpty: _.template(
                '<li>\
                    <div class="empty-ct"><%- name %></div>\
                </li>'
            )
        });
    }
);
