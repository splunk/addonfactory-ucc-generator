define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var classicurl = require('models/url');
    var console = require('util/console');

    var DashboardRouter = Backbone.Router.extend({
        initialize: function(options) {
            console.warn('splunkjs dashboard router is DEPRECATED!');
            this.model = options.model;
            this.app = options.app;
        },
        routes: {
            ':locale/app/:app/:page?*qs': 'view',
            ':locale/app/:app/:page': 'view',
            ':locale/app/:app/:page/?*qs': 'view',
            ':locale/app/:app/:page/': 'view',
            ':locale/app/:app/:page/edit?*qs': 'edit',
            ':locale/app/:app/:page/edit': 'edit',
            '*root/:locale/app/:app/:page?*qs': 'rootedView',
            '*root/:locale/app/:app/:page': 'rootedView',
            '*root/:locale/app/:app/:page/?*qs': 'rootedView',
            '*root/:locale/app/:app/:page/': 'rootedView',
            '*root/:locale/app/:app/:page/edit?*qs': 'rootedEdit',
            '*root/:locale/app/:app/:page/edit': 'rootedEdit',
            ':locale/manager/:app/:page?*qs': 'view',
            ':locale/manager/:app/:page': 'view',
            ':locale/manager/:app/:page/?*qs': 'view',
            ':locale/manager/:app/:page/': 'view',
            '*root/:locale/manager/:app/:page?*qs': 'rootedView',
            '*root/:locale/manager/:app/:page': 'rootedView',
            '*root/:locale/manager/:app/:page/?*qs': 'rootedView',
            '*root/:locale/manager/:app/:page/': 'rootedView',
            'dj/:app/:page/': 'splunkdj',
            'dj/:app/:page/?*qs': 'splunkdj',
            '*root/dj/:app/:page/': 'rootedSplunkdj',
            '*root/dj/:app/:page/?*qs': 'rootedSplunkdj'
        },
        view: function() {
            console.log('ROUTE: view');
            this.page.apply(this, arguments);
            this.model.set('edit', false);
        },
        edit: function() {
            console.log('ROUTE: edit');
            this.page.apply(this, arguments);
            this.model.set('edit', true);
        },
        rootedView: function(root) {
            this.app.set('root', root);
            this.view.apply(this, _.rest(arguments));
        },
        rootedEdit: function(root) {
            this.app.set('root', root);
            this.edit.apply(this, _.rest(arguments));
        },
        page: function(locale, app, page) {
            console.log('ROUTE: page(locale=%o, app=%o, page=%o)', locale, app, page);
            this.app.set({
                locale: locale,
                app: app,
                page: page
            });
            classicurl.fetch();
            if(classicurl.get('dialog') === 'schedulePDF') {
                this.model.set('dialog', classicurl.get('dialog'));
                classicurl.unset('dialog');
                this.updateUrl({ replace: true });
            }
        },
        splunkdj: function(app, page) {
            this.page('en-US', app, page);
        },
        rootedSplunkdj: function(root) {
            this.app.set('root', root);
            this.splunkdj.apply(this, _.rest(arguments));
        },
        updateUrl: function(options) {
            var parts = [ this.app.get('root') || '', this.app.get('locale'), 'app', this.app.get('app'), this.app.get('page') ];
            if (this.model.get('edit')) {
                parts.push('edit');
            }
            var url = [ parts.join('/') ], params = classicurl.encode();
            if (params.length) {
                url.push(params);
            }
            this.navigate(url.join('?'), _.extend({ replace: false }, options));
        }
    });
    return DashboardRouter;
});
