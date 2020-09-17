define(
    [
        'underscore',
        'module',
        'views/Base',
        'uri/route',
        'splunk.util'
    ],
    function(_, module, Base, route, splunkUtil) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'span',
            showLinks: true,
            /**
            * @param {Object} options {
            *       model: {
            *           report: <models.Report>,
            *           application: <models.Application>
            *       },
            *       collection: {
            *          apps: <collections.services.AppLocals> (Optional)
            *       },
            *       alternateApp: <alternate_app_to_open> (Optional)
            * }
            */
            initialize: function(options) {
                Base.prototype.initialize.apply(this, arguments);
                this.model.report.entry.content.on('change:search', this.render, this);
                if(options.showLinks !== undefined) {
                    this.showLinks = options.showLinks;
                }
            },
            render: function() {
                var createdByRoute,
                    createdByAnchor,
                    appModel,
                    root = this.model.application.get('root'),
                    locale = this.model.application.get('locale'),
                    aclAppName = this.model.report.entry.acl.get('app'),
                    app = this.model.application.get('app');
                if (this.collection.apps) {
                    appModel = this.collection.apps.findByEntryName(aclAppName);
                    if (appModel && appModel.entry.content.get('visible')) {
                        app = aclAppName;
                    } else {
                        app = this.options.alternateApp;
                    }
                }
                if (this.model.report.isPivotReport()) {
                    createdByRoute = route.pivot(root, locale, app, {data: {s: this.model.report.id}});
                    if (this.showLinks) {
                        createdByAnchor = '<a href="' + createdByRoute +'" target="_blank">' + _("Pivot").t() +'</a>';
                    } else {
                        createdByAnchor = _("Pivot").t();
                    }
                } else {
                    createdByRoute = route.search(root, locale, app, {data: {s: this.model.report.id}});
                    if (this.showLinks){
                        createdByAnchor = '<a href="' + createdByRoute +'" target="_blank">' + _("Search").t() +'</a>';
                    } else {
                        createdByAnchor = _("Search").t();
                    }
                }
                this.$el.html(this.compiledTemplate({
                    _: _,
                    splunkUtil: splunkUtil,
                    createdByAnchor: createdByAnchor
                }));
                return this;
            },
            template: '\
                <%= splunkUtil.sprintf(_("Created by %s.").t(), createdByAnchor) %>\
            '
        });
    }
);
