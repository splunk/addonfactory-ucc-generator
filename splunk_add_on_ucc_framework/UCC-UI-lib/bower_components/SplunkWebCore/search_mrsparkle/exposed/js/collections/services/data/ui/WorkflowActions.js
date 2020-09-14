define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/services/data/ui/WorkflowAction',
        'collections/SplunkDsBase',
        'util/general_utils'
    ],
    function($, _, Backbone, WorkflowActionModel, SplunkDsBaseCollection, generalUtils) {
        return SplunkDsBaseCollection.extend({
            url: 'data/ui/workflow-actions',
            model: WorkflowActionModel,
            initialize: function(){
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },
            getEventActions: function(event) {
                var idxs = [];
                this.each(function(model, i) {
                    if(model.isInEventMenu() && !model.isRestrictedByEventtype(event) && !model.isRestrictedByPresenceOfAllFields(event)){
                        idxs.push(i);
                    }
                },this);
                return idxs;
            },
            getFieldActions: function(event, field) {
                var idxs = [];
                this.each(function(model, q) {
                    
                    if(model.isInFieldMenu() && !model.isRestrictedByEventtype(event)) {
                        var fields = _(model.entry.content.get('fields').split(',')).map(function(field) { 
                                return $.trim(field); 
                            },this),
                            k = 0,
                            len = fields.length;
                            
                        for(k; k<len; k++) {
                            var rex = generalUtils.globber(fields[k]);
                            
                            if(rex) {
                                var value = rex.exec(field);
                                if(value && value.length > 0) {
                                    idxs.push(q);
                                    break;
                                }
                            }
                            
                        }
                    }
                },this);
                return idxs;
            }
        });
    }
);
