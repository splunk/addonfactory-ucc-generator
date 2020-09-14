/**
 * @author sfishel
 *
 * An abstract base collection for each type of pivot report element collection.
 */

define(['collections/Base'], function(BaseCollection) {

    return BaseCollection.extend({

        toReportJSON: function() {
            return this.invoke('toReportJSON');
        }

    });

});