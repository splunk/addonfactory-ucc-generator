import {configManager} from 'app/util/configManager';
import CustomizedTabView from 'app/views/Configuration/CustomizedTabView';

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
            const {unifiedConfig: {pages: {configuration}}} = configManager;

            const header = this._parseHeader(configuration);
            $(".addonContainer").append(_.template(PageTitleTemplate)(header));
            $(".addonContainer").append(_.template(TabTemplate));

            const tabs = this._parseTabs(configuration);
            this.renderTabs(tabs);
            //Router for each tab
            let Router = Backbone.Router.extend({
                routes: {
                    '*filter': 'changeTab'
                },
                changeTab: params => {
                    if (params === null) return;
                    this.tabName = params;
                    $('.nav-tabs li').removeClass('active');
                    $('#' + this.tabName + '-li').parent().addClass('active');
                    $('.tab-content div').removeClass('active');
                    $('#' + params + '-tab').addClass('active');
                }
            });
            var router = new Router();
            Backbone.history.start();
        },

        _parseHeader({title, description}) {
            return {
                title: title ? title : '',
                description: description ? description : '',
                enableButton: false,
                enableHr: false
            };
        },

        _parseTabs({tabs}) {
            return tabs.map((d, i) => {
                const {title} = d,
                    token = title.toLowerCase().replace(/\s/g, '-'),
                    viewType = CustomizedTabView;

                if(viewType) {
                    const view = new viewType({
                        containerId: `#${token}-tab`,
                        props: d
                    });
                    return {
                        active: i === 0,
                        title,
                        token,
                        view
                    };
                }
            }).filter(d => !!d);
        },

        renderTabs: function (tabs) {
            let tabTitleTemplate = `
                    <li <% if (active) { %> class="active" <% } %>>
                        <a href="#<%- token %>" id="<%- token %>-li">
                            <%- _(title).t() %>
                        </a>
                    </li>
                `,
                tabContentTemplate = `
                    <div id="<%- token %>-tab" class="tab-pane <% if (active){ %>active<% } %>">
                    </div>
                `;
            _.each(tabs, tab => {
                const { title, token, view } = tab;
                let active;
                if (!this.tabName) {
                    active = tab.active;
                } else if (this.tabName && this.tabName === token) {
                    active = true;
                }
                $(".nav-tabs").append(_.template(tabTitleTemplate)({title, token, active}));
                $(".tab-content").append(_.template(tabContentTemplate)({token, active}));
                $(`#${token}-tab`).html(view.render().$el);
            });
        }
    });
});
