define([
            'mocks/models/MockSplunkD'
        ],
        function(
            MockSplunkD
        ) {

    return MockSplunkD.extend({
        
        hasAttr: function(attr){
            return this.entry.content.has(attr);
        },
        isLite: function() {
            return false;
        },
        getVersion: function() {
            return '';
        },
        isCloud: function () {
          return false;
        },
        isFreeLicense: function() {
            return false;
        }
    });

});