/**
 * @author jszeto
 * @date 3/05/2014
 *
 * A collection of RexOutputFields contained in the Rex Calculation
 *
 * To be used only as an internal members of the "models/services/datamodel/private/RexCalculation" module
 */

define(['collections/services/datamodel/private/Fields', 'models/services/datamodel/private/RexOutputField'], function(Fields, RexOutputField) {

    return Fields.extend({ model: RexOutputField });

});