/**
 * @author sfishel
 *
 * A collection of fields contained in each data model object.
 *
 * To be used only as an internal members of the "models/services/datamodel/private/Object" module
 * and the "models/services/datamodel/private/Calculation" module
 */

define(['collections/Base', 'models/services/datamodel/private/Field'], function(Base, Field) {

    return Base.extend({ model: Field });

});