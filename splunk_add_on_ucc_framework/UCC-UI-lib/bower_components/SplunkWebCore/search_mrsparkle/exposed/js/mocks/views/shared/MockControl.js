/**
 * @author jszeto
 * @date 10/8/13
 */

define(['underscore', 'mocks/views/MockView', 'mocks/models/MockModel'], function(_, MockView, MockModel) {

    return MockView.extend({

        enable: function() {this.options.enabled = true;},
        disable: function() {this.options.enabled = false;}


    });

});
