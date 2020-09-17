define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'views/shared/delegates/Popdown',
        'bootstrap.tooltip'
    ],
    function(module,
             $,
             _,
             BaseView,
             Popdown) {

        return BaseView.extend({
            moduleId: module.id,
            className: 'dashboard-panel-editor',
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.popdownLabel = options.label || _("Inline Panel").t();  // Inline Panel or Prebuilt Panel
                this.icon = options.icon || 'icon-gear'; // icon-gear or icon-lock
                this.actions = options.actions;
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    popdownLabel: this.popdownLabel,
                    icon: this.icon
                }));

                var actions = _(this.actions).map(function(action) {
                    var link = $('<a href="#"></a>').addClass(action.className).text(action.label).attr('name', action.name);
                    if (action.tooltip) {
                        link.tooltip({
                            animation: false,
                            title: action.tooltip,
                            container: 'body'
                        });
                    }
                    return $('<li></li>').append(link);
                });
                this.$('.dashboard-panel-actions').append(actions);
                this.children.popdown = new Popdown({el: this.el, mode: 'dialog'});
                return this;
            },
            events: {
                'click li>a': function(e) {
                    e.preventDefault();
                    if (!$(e.currentTarget).is('.disabled')) {
                        var actionName = $(e.currentTarget).attr('name');
                        this.trigger(actionName);
                        this.children.popdown.hide();
                    }
                }
            },
            template: '\
                <a href="#" class="dropdown-toggle btn-pill">\
                    <span class="<%- icon %>"></span>\
                    <span class="caret"></span>\
                </a>\
                <div class="dropdown-menu">\
                    <div class="arrow"></div>\
                        <ul class="dashboard-panel-actions">\
                            <li class="panel-type-label"><%- popdownLabel %></li>\
                        </ul>\
                </div>\
            '
        });
    });