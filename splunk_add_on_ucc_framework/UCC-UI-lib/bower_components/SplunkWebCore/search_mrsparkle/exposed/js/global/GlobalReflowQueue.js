define(function(require, exports, module){
	var _  = require('underscore'),
		viewsToReflow = [],
		viewAddInterval,
		tickInterval = 50;


	var GlobalReflowQueue = {
		add: function(view) {
			viewsToReflow.push(view);
			//If there is at least one view to reflow, set an interval and validate the views
			//We set an interval in case a view is added while we are validating our existing views
			//This view will need to be processed after we have validated the current views to be reflowed.
			if (viewsToReflow.length === 1) {
				viewAddInterval = window.setInterval(GlobalReflowQueue.validateViews, tickInterval);	
			}
		},

		validateViews: function (){
			var internalViewsToReflow = _.sortBy(viewsToReflow, function(view) {
				return view.getReflowDepth();
			});
			for (var i = 0; i < internalViewsToReflow.length; i++) {
				internalViewsToReflow[i].validateReflow();
			}
			//If we have no more views to reflow, then clear the interval - we don't need to call the function again
			if (viewsToReflow.length === 0) {
				clearInterval(viewAddInterval);
			}
		},
		remove: function(view) {
			var indexToRemove = viewsToReflow.indexOf(view);
			if (indexToRemove > -1) {
				viewsToReflow.splice(indexToRemove, 1);
			}
			//If we have removed all of the views that we need to reflow, we don't need to validate views again.
			if (viewsToReflow.length === 0) {
				clearInterval(viewAddInterval);
			}
		},


		//For testing, not exposed in real API.
		getTickInterval: function() {
			return tickInterval;
		},

		clear: function() {
			viewsToReflow = [];
		}
	};
	return GlobalReflowQueue;
});