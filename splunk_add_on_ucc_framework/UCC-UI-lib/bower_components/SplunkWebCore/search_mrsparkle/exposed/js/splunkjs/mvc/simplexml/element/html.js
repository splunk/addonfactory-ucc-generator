define(function(require) {
    var _ = require('underscore');
    var $ = require('jquery');
    var mvc = require('../../../mvc');
    var utils = require('../../utils');
    var DashboardElement = require('./base');
    var Dashboard = require('../controller');
    var TokenUtils = require('../../tokenutils');
    var SplunkUtil = require('splunk.util');
    var SharedModels = require('../../sharedmodels');
    var route = require('uri/route');
    var Mapper = require('../mapper');
    var TokenAwareModel = require('../../tokenawaremodel');
    var Messages = require('../../messages');
    var console = require('util/console');
    
    Mapper.register("html", Mapper.extend({
        toXML: function(report, options) {
            
            var xmlSettings = {
                type: "html",
                attributes: {
                    tokens: report.get('useTokens')
                }
            };
            
            var src = report.get('serverSideInclude');
            if (src && options.flatten !== true) {
                return _.extend(xmlSettings, { attributes: { src: src }, content: null });
            } else {
                return _.extend(xmlSettings, { 
                    content: report.get('html', options)
                });
            }
        }
    }));
    
    var LINK_ELEMENTS = {
        "a": "href",
        "iframe": "src",
        "img": "src"
    };
    
    var HtmlElement = DashboardElement.extend({
        options: {
            serverSideInclude: undefined,
            html: undefined,
            useTokens: true
        },
        configure: function() {
            this.options.settingsOptions = _.extend({
                tokenEscaper: TokenUtils.getEscaper('html'),
                allowNoEscape: false
            }, this.options.settingsOptions || {});
            
            DashboardElement.prototype.configure.apply(this, arguments);
        },
        initialize: function() {
            this.configure();
            this.model = new TokenAwareModel({}, { 
                retainUnmatchedTokens: true, 
                tokenEscaper: TokenUtils.getEscaper('html') 
            });
            utils.syncModels(this.settings, this.model, {
                include: ['html', 'serverSideInclude', 'tokenDependencies', 'useTokens'],
                auto: 'push'
            });
            this.reportReady = $.Deferred().resolve(this.model);
            this.contentLoadedDfd = $.Deferred();
            this.listenTo(this.settings, "change:serverSideInclude", this.getStaticFile);
            if (this.settings.has("serverSideInclude")) {
                _.defer(_.bind(this.getStaticFile, this));
            } else {
                this._checkExistingMarkup = true;
            }
            this.listenTo(Dashboard.getStateModel(), 'change:edit', this.onEditModeChange, this);
            this.listenTo(this.model, 'change:html change:error', this.render);
            this.setupTokenDependencies();
        },
        updatePanelHead: function() {
            this.$('.panel-head').remove();
            if(Dashboard.isEditMode()) {
                $('<div class="panel-head"><h3><span class="untitled">HTML Panel</span></h3></div>').prependTo(this.$el);
            }
        },
        getVisualizationType: function(){
            return "html";
        },
        // called when dashboard containing html in Add Panel sidebar is to be
        // loaded from a static source in current app directory
        getStaticFile: function() {
            var srcUri = this.settings.get('serverSideInclude');
            if (!srcUri) {
                return;
            }
            var app = SharedModels.get('app').toJSON();
            var contentUrl = route.appStaticFile(app.root, app.locale, this.settings.get('app') || app.app, srcUri);
            var model = this.model;
            var useTokens = this.settings.get('useTokens');
            model.unset({ html: undefined, error: undefined });
            var contentLoadedDfd = this.contentLoadedDfd;
            
            // test if srcUrl is accessing any of following unauthorized resource
            // absolute urls (containing http: or https:), 
            // parent directory references (containing ..),
            // server-relative url (beginning with /)
            if (/^https?:/.test(srcUri) || /(^|\/)\.\.\//.test(srcUri) || /^\//.test(srcUri)) {
                model.set('error', _("Error loading HTML panel content: Invalid src attribute value specified.").t());
                contentLoadedDfd.resolve();
            } else {
                console.log('Loading static asset %s (url=%s) for HTML panel', srcUri, contentUrl);
                $.ajax({
                    dataType: "html",
                    type: "GET",
                    url: contentUrl,
                    error: function(xhr) {
                        model.set('error', xhr.status === 404 ?
                                SplunkUtil.sprintf(_("Error loading HTML panel content: HTML file \"%s\" not found.").t(), srcUri) :
                                SplunkUtil.sprintf(_("Error loading HTML panel content: Error loading HTML file (HTTP status %d).").t(), xhr.statusCode)
                        );
                        contentLoadedDfd.resolve();
                    },
                    success: function(data) {
                        if (data !== "") {
                            model.set({
                                error: undefined,
                                html: data
                            }, { tokens: useTokens });
                        }
                        contentLoadedDfd.resolve();
                    }
                });
            }
        },
        normalizeLinks: function($el) {
             // SPL-70655 root-endpoint/locale prefix for server-relative URLs
            _(LINK_ELEMENTS).each(function(attr, name){
                var selector = SplunkUtil.sprintf("%s[%s]", name, attr);
                $el.find(selector).each(function(){
                    var linkEl = $(this);
                    var url = linkEl.attr(attr);
                    if (url && url[0] === '/' && url[1] !== '/') {
                        linkEl.attr(attr, SplunkUtil.make_url(url));
                    }
                });
            });
        },
        loadExistingMarkup: function(el) {
            this.settings.set('html', $.trim(el.html()), { tokens: this.settings.get('useTokens') });
            this.contentLoadedDfd.resolve();
        },
        render: function() {
            if (this.$el.is(':empty')) {
                this.$el.html('<div class="panel-body"></div>');
            }
            this.$el.addClass('html');
            
            var $body = this.$el.children('.panel-body');
            $body.addClass('html');
                           
            if (this._checkExistingMarkup) {
                this._checkExistingMarkup = false;
                if (!this.settings.has('html')) {
                    this.loadExistingMarkup($body);
                }
            }
            
            if (this.model.has('error')) {
                Messages.render({ 
                    icon: "warning-sign",
                    level: "error",
                    message: this.model.get('error') 
                }, $body);
                
            } else if (this.model.has('html')) {
                $body.html(this.model.get('html'));
                this.normalizeLinks($body);
            }

            this.onEditModeChange(Dashboard.getStateModel());
            return this;
        },
        getExportParams: function() {
            // Nothing to export
            return {};
        },
        contentLoaded: function() {
            return this.contentLoadedDfd.promise();
        },
 		componentReady: function() {
			return $.Deferred().resolve();
		}       
    });
    
    return HtmlElement;
});