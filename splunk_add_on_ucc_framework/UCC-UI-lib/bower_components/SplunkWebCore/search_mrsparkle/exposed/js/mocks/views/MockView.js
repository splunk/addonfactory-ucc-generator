/**
 * @author sfishel
 *
 * A mock view for use in unit tests.
 *
 * For documentation and usage, see: http://eswiki.splunk.com/QUnit#Shared_Testing_Code
 */

define(['underscore', 'views/Base', 'mocks/mockify'], function(_, BaseView, mockify) {

    var MockView = BaseView.extend({

        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            mockify(this);
        }

    },
    {

        create: function(options) {
            return new MockView(options);
        }

    });

    return MockView;

});