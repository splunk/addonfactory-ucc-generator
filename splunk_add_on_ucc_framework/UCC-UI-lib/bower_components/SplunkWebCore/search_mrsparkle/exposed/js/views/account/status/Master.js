define(
    [
        'module',
        'contrib/text!./Master.html',
        'underscore',
        'splunk.util',
        'uri/route',
        'views/Base',
        'views/account/TOSAccept',
        'views/account/shared.pcss',
        './Master.pcss'
    ],
    function (module, template, _, splunkutil, route, BaseView, TOSAcceptView, cssShared, css) {
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            className: 'account',
            initialize: function () {
                BaseView.prototype.initialize.apply(this, arguments);
                var tos = this.model.tos.get('tos_version') || '';
                this.istos = (tos != '');
                this.children.tosAccept = new TOSAcceptView({
                    model: {
                        tos: this.model.tos,
                        login: this.model.login
                    }
                });
            },
            getMessage: function(){
                var message = {
                    status: false,
                    cssClass: '',
                    messageString: '',
                    authString: '',
                    errorURL: '',
                    errorURLLabel: ''
                };

                if(!this.istos && this.model.accountStatus && this.model.accountStatus.entry && this.model.accountStatus.entry[0] && this.model.accountStatus.entry[0].content) {
                    var content = this.model.accountStatus.entry[0].content;
                    message.status = content.samlStatus || false;
                    message.cssClass = message.status ? 'success' : 'error';
                    message.authString = message.status ? _('logged in').t() : _('not logged in').t();
                    message.messageString = content.statusStr || '';
                    message.errorURL = content.errorURL || '';
                    message.errorURLLabel = content.errorURLLabel || '';
                }

                return message;
            },
            baseRoute: function(path) {
                //TODO need to dry out this baseRoute function. it can also be found in static.html
                var url = '',
                    rootEndpoint  = this.model.web.entry.content.get('root_endpoint') || '';
                //strip leading '/'
                rootEndpoint = rootEndpoint.replace(/\/^/, '');
                //strip trailing '/'
                rootEndpoint = rootEndpoint.replace(/\/$/, '');
                if (rootEndpoint) {
                    url = '/' + rootEndpoint;
                }
                return url + '/' + encodeURIComponent(this.model.session.entry.content.get('lang')) +  path;
            },
            render: function () {
                var rootUrl = this.baseRoute('');
                if(this.istos) {
                    rootUrl = '';
                } else {
                    // AMI-1438: Send user to splunk.com, so that bad login does not put user into circular page loads.
                    if(this.model.serverInfo.isCloud()){
                        rootUrl = 'http://www.splunk.com';
                    }
                }
                var html = this.compiledTemplate({
                    _: _,
                    rootUrl : rootUrl,
                    message: this.getMessage(),
                    year: new Date().getFullYear(),
                    version: this.model.serverInfo.getVersion(),
                    build: this.model.serverInfo.getBuild(),
                    logo: this.model.serverInfo.getProductLogo(),
                    customLogo: route.loginPageLogo(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.serverInfo.entry.content.get('build'),
                        this.model.web.entry.content.get('loginCustomLogo')),
                    splunkutil: splunkutil
                });
                this.$el.html(html);
                if (this.istos) {
                    this.children.tosAccept.render().appendTo(this.$('.content'));
                }
                return this;
            }
        });
    }
);
