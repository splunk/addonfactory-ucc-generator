/**
 * @author jszeto
 * @date 11/1/12
 *
 * A mock dialog for use in unit tests.
 *
 * For documentation and usage, see: http://eswiki.splunk.com/QUnit#Shared_Testing_Code
 */

define(['underscore', 'mocks/views/MockView', 'mocks/models/MockModel'], function(_, MockView, MockModel) {

    return MockView.extend({

        _label : "",
        _value : "",
        settings : undefined,

        show : function() {return;},
        setText : function (text) {return;},
        getValue : function() {return this._value;},
        setValue : function(value) {this._value = value;},
        getLabel : function() {return this._label;},
        setLabel : function(label) {this._label = label;},

        initialize : function(options) {
            MockView.prototype.initialize.call(this, options);

            this.settings = new MockModel();
        }

    });

});