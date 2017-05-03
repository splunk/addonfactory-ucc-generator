import {
    MODE_CLONE,
    MODE_CREATE,
    MODE_EDIT
} from 'app/constants/modes';
import Backbone from 'backbone';
import _ from 'lodash';
import $ from 'jquery';

const MAPPING = {
    [MODE_CREATE]: 'Create New Input',
    [MODE_EDIT]: 'Update Input',
    [MODE_CLONE]: 'Clone Input'
}

export default Backbone.View.extend({
    className: 'create-input-header',

    events: {
        'click a.breadcrumbs-inputs': function (e) {
            e.preventDefault();
            this.navModel.navigator.navigateToRoot();
        },

        'click a.breadcrumbs-action': function (e) {
            e.preventDefault();
            this.navModel.navigator.navigate({
                service: this.service,
                action: this.action
            });
        }
    },

    initialize: function (options) {
        this.navModel = options.navModel;
        // service, action, component
        _.extend(this, this.navModel.navigator.get('params'));
        if (this.component) {
            this.title = this.component;
            this.actionNav = MAPPING[this.action];
        } else {
            this.title = MAPPING[this.action];
            this.actionNav = '';
        }
    },

    render: function () {
        this.$el.html(_.template(this.template)({
            title: this.title,
            actionNav: this.actionNav
        }));
        return this;
    },

    template: `
        <div class="title"><%- _(title).t() %></div>
        <div class="title-crumbs">
            <a href="#" class="breadcrumbs-inputs">Inputs</a> &raquo
            <% if (actionNav) { %>
                <a href="#" class="breadcrumbs-action"><%- _(actionNav).t() %>
                </a> &raquo
            <% } %>
            <span class="subtitle"><%- _(title).t() %></span>
        </div>
    `
});
