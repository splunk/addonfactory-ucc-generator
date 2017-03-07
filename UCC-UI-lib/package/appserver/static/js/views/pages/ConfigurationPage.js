import {configManager} from 'app/util/configManager';
import CustomizedTabView from 'app/views/configuration/CustomizedTabView';

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
        initialize: function(options) {
            const {unifiedConfig: {pages: {configuration}}} = configManager;
            this.stateModel = new Backbone.Model({
                selectedTabId: this._generateTabId(configuration.tabs)
            });
        },

        events: {
            "click ul.nav-tabs > li > a":  function(e) {
                e.preventDefault();
                const tabId = e.currentTarget.id.slice(0, -3);
                this.changeTab(tabId);
            }
        },

        render: function () {
            const {unifiedConfig: {pages: {configuration}}} = configManager;

            const header = this._parseHeader(configuration);
            this.$el.append(_.template(PageTitleTemplate)(header));
            this.$el.append(_.template(TabTemplate));

            const tabs = this._parseTabs(configuration);
            this.renderTabs(tabs);
            return this;
        },

        changeTab: function (params) {
            if (params === null) return;
            this.tabName = params;
            $('.nav-tabs li').removeClass('active');
            $('#' + this.tabName + '-li').parent().addClass('active');
            $('.tab-content div').removeClass('active');
            $(`#${params}-tab`).addClass('active');
            this.stateModel.set('selectedTabId', `#${params}-tab`);
        },

        _parseHeader({title, description}) {
            return {
                title: title ? title : '',
                description: description ? description : '',
                enableButton: false,
                enableHr: false
            };
        },

        _generateTabToken(tabs, title) {
            const token = (title || tabs[0].title).toLowerCase().replace(/\s/g, '-');

            return token;
        },

        _generateTabId(tabs, title) {
            if (!title) {
                title = tabs[0].title;
            }
            const tabId = `#${this._generateTabToken(tabs, title)}-tab`;

            return tabId;
        },

        _parseTabs({tabs}) {
            return tabs.map((d, i) => {
                const {title} = d,
                    token = title.toLowerCase().replace(/\s/g, '-'),
                    viewType = CustomizedTabView;

                const view = new CustomizedTabView({
                    containerId: this._generateTabId(tabs, title),
                    pageState: this.stateModel,
                    props: d
                });
                return {
                    active: i === 0,
                    title,
                    token: this._generateTabToken(tabs, title),
                    view
                };
            }).filter(d => !!d);
        },

        renderTabs: function (tabs) {
            let tabTitleTemplate = `
                    <li <% if (active) { %> class="active" <% } %>>
                        <a href="#" id="<%- token %>-li">
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
                this.$(".nav-tabs").append(_.template(tabTitleTemplate)({title, token, active}));
                this.$(".tab-content").append(_.template(tabContentTemplate)({token, active}));
                this.$(this._generateTabId(tabs, title)).html(view.render().$el);
            });
        }
    });
});
