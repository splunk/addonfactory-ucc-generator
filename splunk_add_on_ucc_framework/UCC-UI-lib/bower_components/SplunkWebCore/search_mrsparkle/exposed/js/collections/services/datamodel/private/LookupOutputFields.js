/**
 * @author jszeto
 *
 * A collection of LookupOutputFields contained in the Lookup or GeoIP Calculation
 *
 * To be used only as an internal members of the "models/services/datamodel/private/LookupCalculation" module
 * and the "models/services/datamodel/private/GeoIPCalculation" module
 */

define(['collections/services/datamodel/private/Fields', 'models/services/datamodel/private/LookupOutputField'], function(Fields, LookupOutputField) {

    return Fields.extend({ model: LookupOutputField });

});