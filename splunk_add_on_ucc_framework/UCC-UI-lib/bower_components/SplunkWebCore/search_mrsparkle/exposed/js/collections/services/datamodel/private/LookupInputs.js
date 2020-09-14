/*
 * @author jszeto
 * @date 1/14/14
 *
 * A collection of LookupInputs contained in the Lookup Calculation
 *
 * To be used only as an internal members of the "models/services/datamodel/private/LookupInput" module
 */

define(['collections/Base', 'models/services/datamodel/private/LookupInput'], function(BaseCollection, LookupInput) {

    return BaseCollection.extend({model: LookupInput});

});
