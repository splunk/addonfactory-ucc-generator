define(
	[
	 	'models/SplunkDBase', 
                'underscore'
	],
	function(SplunkDBaseModel, _) {
	    return SplunkDBaseModel.extend({
	        url: "deployment/server/applications", 
                initialize: function() {
                    SplunkDBaseModel.prototype.initialize.apply(this, arguments);
                }, 
                getDeploymentInstructions: function(){
                    var afterDeploymentInstructions = ''; 
                    if (this.entry.content.get("stateOnClient") == 'enabled') {
                        afterDeploymentInstructions += _('Enable App').t();
                    } else if (this.entry.content.get('stateOnClient') == 'noop') {
                        afterDeploymentInstructions += _('Unchanged from state on deployment server').t();
                    } else {
                        afterDeploymentInstructions += _('Disable App').t();
                    }

                    if (this.entry.content.get("restartSplunkd"))  
                        afterDeploymentInstructions += _(", Restart Splunkd").t(); 

                    return afterDeploymentInstructions; 
                }
	    });
	}
);
