import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
import route from 'uri/route';

export default Backbone.Model.extend({
    initialize: function (options) {
        Backbone.Model.prototype.initialize.apply(this, arguments);
        this.application = options.application;
    },

    initialPage: function (service, action, name) {
        this.set({
            service, action, name
        }, {silent: true});
    },

    navigateToRoot: function () {
        this._updateLastVisit(this.toJSON());
        this.unset('service', {silent: true});
        this.unset('action', {silent: true});
        this.unset('name', {silent: true});
        this._updateUrl();
    },

    /**
     * navigate to a page with action and name
     * @param service
     * @param action in ['create','edit']
     * @param name key of the resource, required when action == 'edit'
     */
    navigateToPage: function (service, action, name) {
        var lastVisit = this.toJSON();

        this.set({
                'service': service,
                'action': action,
                'name': name
            }, {silent: true});

            var currentUrl = this.get('url');
            this._updateUrl();

            if (currentUrl !== this.get('url')) {
                this._updateLastVisit(lastVisit);
            }
    },

    /**
     * navigate back to last visit page
     * @returns {boolean}
     */
    navigateBack: function () {
        if (this.lastVisit) {
            this.navigateToPage(
                this.lastVisit.service,
                this.lastVisit.action,
                this.lastVisit.name
            );
            return true;
        } else {
            return false;
        }
    },

    _updateLastVisit: function (lastVisit) {
        this.lastVisit = lastVisit;
    },

    _updateUrl: function () {
        var nextUrl = route.page(
            this.application.get('root'),
            this.application.get('locale'),
            this.application.get('app'),
            this.application.get('page'));
        if (this.has('service')) {
            nextUrl += '?service=' + this.get('service');
            if (this.has('action')) {
                nextUrl += '&action=' + this.get('action');
                if (this.has('name')) {
                    nextUrl += '&name=' + this.get('name');
                }
            }
        }
        this.set('url', nextUrl);
    }
});
