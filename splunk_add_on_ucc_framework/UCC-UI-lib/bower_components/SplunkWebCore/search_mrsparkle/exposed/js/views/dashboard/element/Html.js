define(
    [
        'module',
        'jquery',
        'underscore',
        'views/dashboard/Base',
        'splunkjs/mvc/tokenawaremodel',
        'splunkjs/mvc/tokenutils',
        'splunkjs/mvc/messages',
        'splunk.util',
        'splunkjs/mvc/utils',
        'splunkjs/mvc/simplexml/dashboard/tokendeps',
        'util/dashboard_utils',
        'uri/route',
        'util/htmlcleaner',
        'util/xml'
    ],
    function(module,
             $,
             _,
             BaseDashboardView,
             TokenAwareModel,
             TokenUtils,
             Messages,
             SplunkUtils,
             Utils,
             TokenDependenciesMixin,
             DashboardUtils,
             Route,
             HtmlCleaner,
             XML) {

        var LINK_ELEMENTS = {
            "a": "href",
            "iframe": "src",
            "img": "src"
        };

        return BaseDashboardView.extend(_.extend({}, TokenDependenciesMixin, {
            moduleId: module.id,
            viewOptions: {
                register: true
            },
            className: 'dashboard-element html',
            initialize: function() {
                BaseDashboardView.prototype.initialize.apply(this, arguments);
                this.elementModel = new TokenAwareModel({}, {
                    retainUnmatchedTokens: true,
                    tokenEscaper: TokenUtils.getEscaper('html'),
                    allowNoEscape: false
                });
                Utils.syncModels(this.settings, this.elementModel, {
                    include: ['html', 'serverSideInclude', 'tokenDependencies', 'useTokens'],
                    auto: 'push'
                });

                this.listenTo(this.settings, "change:serverSideInclude", this.getStaticFile);
                if (this.settings.has("serverSideInclude")) {
                    this.contentLoadedDfd = $.Deferred();
                    _.defer(_.bind(this.getStaticFile, this));
                }
                else {
                    this.contentLoadedDfd = $.Deferred().resolve();
                }
                this.listenTo(this.elementModel, 'change:html change:error', this.render);
                this.setupTokenDependencies();
            },
            getVisualizationType: function() {
                return "html";
            },
            getStaticFile: function() {
                var srcUri = this.settings.get('serverSideInclude');
                if (!srcUri) {
                    return;
                }
                var source = DashboardUtils.getAppAndSource(srcUri, this.model.view.entry.acl.get('app'));
                var root = this.model.application.get('root');
                var locale = this.model.application.get('locale');
                var contentUrl = Route.appStaticFile(root, locale, source.app, source.src);
                var useTokens = this.settings.get('useTokens');
                // test if srcUrl is accessing any of following unauthorized resource
                // absolute urls (containing http: or https:),
                // parent directory references (containing ..),
                // server-relative url (beginning with /)
                var elementModel = this.elementModel;
                var dfd = this.contentLoadedDfd;
                if (/^https?:/.test(srcUri) || /(^|\/)\.\.\//.test(srcUri) || /^\//.test(srcUri)) {
                    elementModel.set('error', _("Error loading HTML panel content: Invalid src attribute value specified.").t());
                    dfd.resolve();
                } else {
                    $.ajax({
                        dataType: "html",
                        type: "GET",
                        url: contentUrl,
                        error: function(xhr) {
                            elementModel.set('error', xhr.status === 404 ?
                                SplunkUtils.sprintf(_("Error loading HTML panel content: HTML file \"%s\" not found.").t(), srcUri) :
                                SplunkUtils.sprintf(_("Error loading HTML panel content: Error loading HTML file (HTTP status %d).").t(), xhr.statusCode)
                            );
                            dfd.resolve();
                        },
                        success: function(data) {
                            if (data !== "") {
                                elementModel.set({
                                    error: null,
                                    html: data
                                }, {tokens: useTokens});
                            }
                            dfd.resolve();
                        }
                    });
                }
            },
            normalizeLinks: function($el) {
                // SPL-70655 root-endpoint/locale prefix for server-relative URLs
                _(LINK_ELEMENTS).each(function(attr, name) {
                    var selector = SplunkUtils.sprintf("%s[%s]", name, attr);
                    $el.find(selector).each(function() {
                        var linkEl = $(this);
                        var url = linkEl.attr(attr);
                        if (url && url[0] === '/' && url[1] !== '/') {
                            linkEl.attr(attr, SplunkUtils.make_url(url));
                        }
                    });
                });
            },
            updateHtmlContent: function($body) {
                var html = this.elementModel.get('html');
                try {
                    // Attempt to replace CDATA XML nodes within the HTML content
                    var m = XML.serialize(XML.replaceCdataNodes(XML.$node('<tmp>' + html + '</tmp>'), true)).match(/^<tmp>([\s\S]*)<\/tmp>$/i);
                    if (m) {
                        html = m[1];
                    }
                } catch(e) {
                    // ignore if not valid XML
                }
                html = HtmlCleaner.clean(html, {allowInlineStyles: DashboardUtils.allowInlineStyles()});
                $body.html(html);
                this.normalizeLinks($body);
            },
            render: function() {
                var $body = this.$el.children('.panel-body');
                if (!$body.length) {
                    $body = $('<div class="panel-body html"></div>').appendTo(this.$el);
                }

                if (this.elementModel.has('error')) {
                    Messages.render({
                        icon: "warning-sign",
                        level: "error",
                        message: this.elementModel.get('error')
                    }, $body);

                } else if (this.elementModel.has('html')) {
                    this.updateHtmlContent($body);
                }
                return this;
            },
            getExportParams: function() {
                // Nothing to export
                return {};
            },
            componentReady: function() {
                return this.contentLoadedDfd.promise();
            },
            remove: function() {
                this.stopListeningToTokenDependencyChange();                
                BaseDashboardView.prototype.remove.apply(this, arguments);
            }
        }));
    }
);
