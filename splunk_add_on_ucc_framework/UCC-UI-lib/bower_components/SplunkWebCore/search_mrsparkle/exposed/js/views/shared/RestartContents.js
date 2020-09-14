define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'splunk.util'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        SplunkUtil
    ) {
        return BaseView.extend({
            moduleId: module.id,

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this._onRestartSSL = this._onRestartSSL.bind(this);
                this.isCloud = this.model.serverInfo.isCloud();

                // listen to global 'restart_ssl' event
                $(document).on('restart_ssl', this._onRestartSSL);
            },

            stopListening: function() {
                // stop listening to global 'restart_ssl' event
                $(document).off('restart_ssl', this._onRestartSSL);

                BaseView.prototype.stopListening.apply(this, arguments);
            },

            render: function() {
                var restartMessage = '';

                if (this._sslBase) {
                    var url = this._sslBase + SplunkUtil.make_url('/'),
                        restartMsgExtra = '';

                    if (!this.isCloud) {
                        restartMsgExtra = SplunkUtil.sprintf( '%s <a href="%s">%s</a>.',
                            _('Check the web_service.log file to determine when Splunk has restarted and then').t(),
                            url, _('click here to continue').t());
                    }

                    restartMessage = SplunkUtil.sprintf(_('Restart in progress. Please wait. %s').t(), restartMsgExtra);
                } else {
                    restartMessage = _("Restart in progress. Please wait.").t();
                }

                var html = this.compiledTemplate({
                    restartMessage: restartMessage
                });
                this.$el.html(html);
                return this;
            },

            _onRestartSSL: function(e) {
                this._sslBase = e.sslBase;
                this.render();
            },

            template: '<p><%= restartMessage %></p>'
        });
    }
);
