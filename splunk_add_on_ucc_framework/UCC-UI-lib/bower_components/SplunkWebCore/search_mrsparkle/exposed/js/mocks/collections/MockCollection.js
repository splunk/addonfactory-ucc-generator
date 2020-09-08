/**
 * @author sfishel
 *
 * A mock collection for use in unit tests.
 *
 * For documentation and usage, see: http://eswiki.splunk.com/QUnit#Shared_Testing_Code
 */

define(['underscore', 'collections/Base', 'mocks/models/MockModel', 'mocks/mockify'], function(_, Base, MockModel, mockify) {

    return Base.extend({

        model: MockModel,

        initialize: function(models, options){
            mockify(this, { dontSpy: 'sync' });
            Base.prototype.initialize.call(this, models, options);
        }

    });

});