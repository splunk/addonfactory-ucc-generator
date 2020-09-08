define(['mocks/models/MockSplunkD'], function(MockSplunkD) {

    return MockSplunkD.extend({

        initialize: function(attributes) {
            this._attributes = attributes || {};
            MockSplunkD.prototype.initialize.call(this, attributes);
        },
        canSchedulePDF: function() {
            return this._attributes['can_schedule_pdf'] !== false;
        },
        isXML: function() {
            return true;
        },
        isHTML: function() {
            return this._attributes['is_html'] === true;
        },
        getLabel: function() {
            return this._attributes['label'] || 'label';
        },
        isDashboard: function() {
            return this._attributes['is_dashboard'] !== false;
        },
        isForm: function() {
            return this._attributes['is_dashboard'] !== false;
        },
        isSimpleXML: function() {
            return this._attributes['is_simplexml'] !== false;
        }
    });

});
