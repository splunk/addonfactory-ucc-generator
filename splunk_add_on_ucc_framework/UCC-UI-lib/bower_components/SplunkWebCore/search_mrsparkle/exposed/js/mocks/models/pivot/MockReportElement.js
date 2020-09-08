/**
 * @author sfishel
 *
 * A mock for the "models/pivot/elements/BaseElement" model
 */

define(['mocks/models/MockModel'], function(MockModel) {

    return MockModel.extend({

        // mock getLabel to return the field name (or owner if there's no display name) with the cid appended
        getComputedLabel: function() {
            if(this.has('label')) {
                return this.get('label');
            }
            return (this.get('fieldName') || this.get('owner')) + '_' + this.cid;
        },

        setTimeRange: function(timeRange) {
            this.set({
                earliestTime: timeRange.get('earliest'),
                latestTime: timeRange.get('latest') || ''
            });
        },

        refreshLabel: function() {}

    });

});