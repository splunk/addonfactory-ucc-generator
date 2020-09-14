define(['backbone', 'underscore', 'models/shared/eventsviewer/UIWorkflowAction', 'collections/Base'],
    function(Backbone, _, WorkFlowAction, BaseCollection){
        return BaseCollection.extend({
            url: '/<%- locale %>/api/field/actions/<%-clientApp%>/<%-sid%>/<%-offset%>',
            model: WorkFlowAction,
            initialize: function() {
                BaseCollection.prototype.initialize.apply(this, arguments);
            },
            sync: function(method, collection, options) {
                options || (options = {});
                options.data || (options.data = {});
                
                options.url = _(this.url).template({
                    locale: options.data.locale || 'en-US',
                    clientApp: options.data.clientApp,
                    sid: options.data.sid,
                    offset: options.data.offset
                });
                delete options.data.locale;
                delete options.data.clientApp;
                delete options.data.sid;
                delete options.data.offset;
                return Backbone.sync.call(this, method, this, options);
            },
            parse: function(response){
                return response.data;
            }
        });
    }
);
