import {
    MODE_CLONE,
    MODE_CREATE,
    MODE_EDIT
} from 'app/constants/modes';
import Backbone from 'backbone';
import _ from 'lodash';

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
        }
    },

    initialize: function (options) {
        // component, navModel, mode
        _.extend(this, options);
        this.currentNav = MAPPING[this.mode] || '';
    },

    render: function () {
        this.$el.html(_.template(this.template)({
            serviceTitle: this.component.title,
            currentNav: this.currentNav
        }));
        return this;
    },

    template: `
        <div class="title"><%- _(serviceTitle).t() %></div>
        <div class="title-crumbs">
            <a href="#" class="breadcrumbs-inputs"><%- _('Inputs').t() %>
            </a> &raquo
            <span class="subtitle"><%- _(currentNav).t() %></span>
        </div>
    `
});
