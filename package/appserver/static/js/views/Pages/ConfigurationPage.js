import {configManager} from 'app/util/configManager';

define([
    'jquery',
    'lodash',
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
        render: function () {
            const {configurationMap} = configManager;

            $(".addonContainer").append(_.template(PageTitleTemplate)(configurationMap.configuration.header));
            $(".addonContainer").append(_.template(TabTemplate));
            this.renderTabs(configurationMap.configuration.allTabs);
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
                const { title, token, view } = tab;
                let active;
                if (!self.tabName) {
                    active = tab.active;
                } else if (self.tabName && self.tabName === token) {
                    active = true;
                }
                $(".nav-tabs").append(_.template(tabTitleTemplate)({title, token, active}));
                $(".tab-content").append(_.template(tabContentTemplate)({token, active}));
                $(`#${token}-tab`).html(view.render().$el);
            });
        }
    });
});
