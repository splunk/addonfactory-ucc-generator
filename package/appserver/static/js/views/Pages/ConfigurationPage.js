import ConfigurationMap from 'app/config/ConfigurationMap';

/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'app/templates/common/PageTitle.html',
    'app/templates/common/TabTemplate.html'
], function (
    $,
    _,
    Backbone,
    PageTitleTemplate,
    TabTemplate
) {
    return Backbone.View.extend({
        initialize: function() {
        },

        render: function () {
            $(".addonContainer").append(_.template(PageTitleTemplate, ConfigurationMap.configuration.header));
            $(".addonContainer").append(_.template(TabTemplate));
            let tabs = ConfigurationMap.configuration.allTabs;
            this.renderTabs(tabs);
            //Router for each tab
            let Router = Backbone.Router.extend({
                routes: {
                    '*filter': 'changeTab'
                },
                changeTab: function (params) {
                    if (params === null) return;
                    self.tabName = params;
                    $('.nav-tabs li').removeClass('active');
                    $('#' + self.tabName + '-li').parent().addClass('active');
                    $('.tab-content div').removeClass('active');
                    $('#' + params + '-tab').addClass('active');
                }
            });
            var router = new Router();
            Backbone.history.start();
        },

        renderTabs: function (tabs) {
            let tabTitleTemplate = '<li <% if (active) { %> class="active" <% } %>><a href="#<%= token%>" id="<%= token%>-li"><%= title%></a></li>',
                tabContentTemplate = '<div id="<%= token%>-tab" class="tab-pane <% if (active){ %>active<% } %>"></div>',
                self = this;
            _.each(tabs, function (tab) {
                let title = tab.title,
                    token = title.toLowerCase().replace(/\s/g, '-'),
                    view = new tab.view({ containerId: `#${token}-tab` }),
                    active;
                if (!self.tabName) {
                    active = tab.active;
                } else if (self.tabName && self.tabName === token) {
                    active = true;
                }
                $(".nav-tabs").append(_.template(tabTitleTemplate, {title, token, active}));
                $(".tab-content").append(_.template(tabContentTemplate, {token, active}));
                $(`#${token}-tab`).html(view.render().$el);
            });
        }
    });
});
