define([
    'jquery',
    'underscore',
    'module',
    'uri/route',
    'views/Base',
    'helpers/user_agent'
],
function (
    $,
    _,
    module,
    route,
    BaseView,
    userAgent
) {
    return BaseView.extend({
        tagName: 'iframe',
        attributes: {
            height: "100%",
            width: "100%",
            scrolling: "no", 
            frameborder: "0",
            src: 'about:blank'
        },
        events: {
            'load': function(e){
                // SPL-88064: replace the route.redirectTo function in the iframe with the parent window's version.
                // This will ensure that any drilldown actions performed within the dashboard will redirect the parent window.
                var iframeWindow = $(document).find('iframe')[0].contentWindow; 
                if (iframeWindow && iframeWindow.require) {
                    iframeWindow.require(['uri/route'], function(iframeRouteModule) {
                        iframeRouteModule.redirectTo = _.bind(route.redirectTo, route);
                    });  
                }

                if (this.isLoadingDashboard) {
                    // Ignore 'load' events triggered by the user choosing a new dashboard
                    this.isLoadingDashboard = false;
                    return;
                }

                // SPL-95571 - prevent redirect when dashboard is auto refreshing
                if(e.currentTarget.contentDocument.URL.indexOf(this.model.dashboard.entry.get('name')) > -1) {
                    // SPL-113683 IE gets confused trying to reload the iframe in-place because of a polyfill
                    // that wraps native document methods.  So we trigger an event to notify our parent that the
                    // iframe needs to be removed and re-created.
                    if (userAgent.isIE()) {
                        this.trigger('nukeFromSpace');
                    }
                    return;
                }

                // catch-all for all other 'load' events triggered outside of drilldown.js.  This is a shittier user experience, because the redirect will happen after all of the 
                // assets in the iframe are loaded, but this will be a rare case.     
                window.location.href = this.$el[0].contentWindow.location.href;  
            }
        }, 
        moduleId: module.id,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.isLoadingDashboard = true;
            this.listenTo(this.model.dashboard, 'change:id', function() {
                this.render(); 
                this.isLoadingDashboard = true;
            });
        },
        render: function() {
            var src = 'about:blank';
            if (this.model.dashboard.isSimpleXML()) {
                src = route.dashboardFromID(this.model.application.get('root'), this.model.application.get('locale'), this.model.dashboard.get('id'), {data: {hideEdit: true, hideTitle: true, hideSplunkBar: true, hideAppBar: true, hideFooter: true, targetTop: true}});
                this.$el.attr('src', src);
            }
            return this;
        }
    });
});
