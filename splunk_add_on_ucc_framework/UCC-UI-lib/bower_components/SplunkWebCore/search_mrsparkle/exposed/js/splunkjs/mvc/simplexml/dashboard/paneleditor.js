define(function(require, exports, module) {
    var $ = require('jquery');
    var _ = require('underscore');
    var BaseView = require('views/Base');
    var Popdown = require('views/shared/delegates/Popdown');
    require('bootstrap.tooltip');
    
    var DashboardPanelEditor = BaseView.extend({
        initialize: function(options) {
            if (options) {
                _.extend(this, _.pick(options, 'actions', 'popdownLabel'));
            }
            this._canConvert = options.canConvert;
            this.convertTooltip = options.convertTooltip;
        },
        render: function() {
            this.$el.addClass('dashboard-panel-editor').html(this.compiledTemplate({
                actions: this.getActions(),
                popdownLabel: this.getLabel(),
                className: this.className
            }));

            var actions = _(this.getActions()).map(function(action) {
                var link = $('<a href="#"></a>').addClass(action.className).text(action.label);
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
            
            this.children.popdown = new Popdown({ el: this.el, mode: 'dialog' });
            return this;
        },
        getActions: function() {
            return this.actions || [];
        },
        getLabel: function() {
            return this.popdownLabel || _("Panel").t();
        },
        canConvert: function() {
            return this._canConvert != null ? this._canConvert : true;
        },
        events: {
            'click li>a': function(e) {
                e.preventDefault();
                if (!$(e.currentTarget).is('.disabled')) {
                    this.children.popdown.hide();
                }
            }
        },
        template: 
            '<a href="#" class="dropdown-toggle btn-pill">' +
                '<% if(className === "inline-panel-editor") { %>' +
                    '<span class="icon-gear"></span>' +
                '<% } else if (className === "ref-panel-editor") { %> ' +
                    '<span class="icon-lock"></span>' +
                '<% } %>' +
                '<span class="caret"></span>' +
            '</a>' +
            '<div class="dropdown-menu">' +
                '<div class="arrow"></div>' +
                '<ul class="dashboard-panel-actions">' +
                    '<li class="panel-type-label"><%- popdownLabel %></li>' +
                '</ul>' +
            '</div>'
    });

    return DashboardPanelEditor;
});