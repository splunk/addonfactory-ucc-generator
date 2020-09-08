/**
 * @author cburke
 *
 * A mock model for use in unit tests.
 *
 * For documentation and usage, see: http://eswiki.splunk.com/QUnit#Shared_Testing_Code
 */

define(
	[
        'underscore',
	 	'models/Base',
	 	'mocks/mockify'
	],
	function(_, BaseModel, mockify) {

	    var Model = BaseModel.extend({

	        initialize: function(attributes) {
                mockify(this, { dontSpy: 'sync' });
	            BaseModel.prototype.initialize.call(this, attributes);
	        }

	    });
	    
	    return new Model();
	}
);