define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'splunk.util',
        'splunk.i18n'
    ],
    function(
        $,
        _,
        module,
        Base,
        splunkUtil,
        i18n
    ){
        /**
         * @constructor
         * @memberOf views
         * @name FooterView
         * @description
         * @extends {Base}
         */
        return Base.extend(/** @lends views.Base.prototype */{
            moduleId: module.id,
            className: "footer",
            /**
             * @param {Object} options {
             *      model: {
             *         application: <model.shared.application>
             *         serverInfo: <model.services.server.serverInfo>
             *      }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);                        
            },
            
            render: function() {
                this.$el.html(this.compiledTemplate({
                    application: this.model.application,
                    serverInfo: this.model.serverInfo,
                    splunkUtil: splunkUtil,
                    i18n: i18n
                }));
                
                return this;
            },
            
            template: '\
                <p>\
                    <span class="emphatic"><%- _("Server info: ").t() %></span> \
                    <%- splunkUtil.sprintf(_("Splunk %(version)s, %(host)s, %(dateTime)s ").t(), {\
                            version: serverInfo.getVersion(),\
                            host: window.location.host,\
                            dateTime: i18n.format_datetime(new Date(),"eee MMM dd", "HH:mm:ss yyyy")\
                    }) %>\
                    <span class="emphatic"><%- _("User: ").t() %></span><%- application.get("owner")%>\
                </p>\
            '
        });
    }
);