import Backbone from 'backbone';
import route from 'uri/route';

export default Backbone.Model.extend({
    initialize: function (options) {
        Backbone.Model.prototype.initialize.apply(this, arguments);
        this.application = options.application;
    },

    navigateToRoot: function () {
        this.unset('params', {silent: true});
        this._updateUrl();
    },

    /**
     * navigate to a page with params
     * @param params
     */
    navigate: function(params) {
        this.set({params}, {silent: true});
        this._updateUrl();
    },

    _updateUrl: function () {
        let nextUrl = route.page(
            this.application.get('root'),
            this.application.get('locale'),
            this.application.get('app'),
            this.application.get('page')
        );

        if (this.has('params')) {
            nextUrl += '?';
            const params = [];
            for (const [key, value] of Object.entries(this.get('params'))) {
                params.push(key + '=' + value);
            }
            nextUrl += params.join('&');
        }
        this.set('url', nextUrl);
    }
});
