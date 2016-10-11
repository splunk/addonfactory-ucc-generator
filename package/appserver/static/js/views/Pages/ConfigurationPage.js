import ConfigurationMap from 'app/config/ConfigurationMap';

/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'splunkjs/mvc/headerview',
    'app/templates/common/PageTitle.html',
    'app/templates/common/TabTemplate.html',
    'app/models/Authorization'
], function (
    $,
    _,
    Backbone,
    HeaderView,
    PageTitleTemplate,
    TabTemplate,
    Authorization
) {
    return Backbone.View.extend({
        initialize: function() {
            var configuration_template_data = ConfigurationMap.configuration.header,
                title_template = _.template(PageTitleTemplate),
                tab_title_template = '<li <% if (active) { %> class="active" <% } %>><a href="#<%= token%>" id="<%= token%>-li"><%= title%></a></li>',
                tab_content_template = '<div id="<%= token%>-tab" class="tab-pane <% if (active){ %>active<% } %>"></div>',
                self = this;

            $(".addonContainer").append(title_template(configuration_template_data));
            $(".addonContainer").append(_.template(TabTemplate));

            function renderTabs(tabs) {
                _.each(tabs, function (tab) {
                    var title = tab.title,
                        token = title.toLowerCase().replace(/\s/g, '-'),
                        view = new tab.view({ containerId: `#${token}-tab` }),
                        active;
                    if (!self.tabName) {
                        active = tab.active;
                    } else if (self.tabName && self.tabName === token) {
                        active = true;
                    }
                    $(".nav-tabs").append(_.template(tab_title_template, {title, token, active}));
                    $(".tab-content").append(_.template(tab_content_template, {token, active}));
                    $(`#${token}-tab`).html(view.render().$el);
                });
            }
            var tabs = ConfigurationMap.configuration.allTabs;
            renderTabs(tabs);

            //Router for each tab
            var Router = Backbone.Router.extend({
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
        }
    });
});
