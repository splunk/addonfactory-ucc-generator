/**
 * A model representing a single data model object.
 *
 * To be used only as a model inside the "collections/services/datamodel/private/ObjectHierarchy" module.
 *
 * For a description of possible attributes, see http://eswiki.splunk.com/Data_Model_JSON_Specification#Object
 */

define(
    [
        'jquery',
        'underscore',
        'models/Base',
        'models/services/datamodel/private/Field',
        'collections/services/datamodel/private/Fields',
        'collections/services/datamodel/private/Calculations',
        'collections/services/datamodel/private/FieldSampleValues',
        'util/pivot/config_form_utils'
    ],
    function(
        $,
        _,
        BaseModel,
        Field,
        Fields,
        Calculations,
        FieldSampleValues,
        formElementUtils
    ) {

        return BaseModel.extend({

            ROOT_OBJECTS: ['BaseEvent', 'BaseTransaction', 'BaseSearch', 'BaseInterface', 'BaseImplements'],

            idAttribute: 'objectName',

            defaults: {
                constraints: [],
                objectsToGroup: []
            },

            validation: {
                displayName: [
                    {
                        required: true,
                        msg: _("Dataset Name is a required field.").t()
                    },
                    {
                        pattern: /^((?!\*).)*$/,
                        msg: _("Dataset Name can not contain an asterisk.").t()
                    }

                ],
                objectName: [
                    {
                        required: true,
                        msg: _("Dataset ID is a required field.").t()
                    },
                    {
                        pattern: /^[\w\-]+$/,
                        msg: _("Dataset ID can only contain alphanumeric characters, underscores or hyphens. Whitespace is not allowed.").t()
                    },
                    {
                        pattern: /^[^_].*/,
                        msg: _("Dataset ID can not start with an underscore character.").t()
                    }
                ],
                objectsToGroup: {
                    fn : function(value, attr, computedState) {
                        var rootParent = computedState.parentName;
                        if (rootParent == "BaseTransaction") {
                            if (value.length == 0) {
                                return _("Root transaction-based datasets require at least one Group Datasets value.").t();
                            }
                        }
                    }
                },
                baseSearch: {
                    fn: function(value, attr, computedState) {
                        if (computedState.parentName == "BaseSearch") {
                            if (_(value).isUndefined() || value == "") {
                                return _("Root search-based datasets require a Search String.").t();
                            }
                        }
                    }
                }
            },

            initialize: function(attrs, options) {
                BaseModel.prototype.initialize.apply(this, arguments);
                this.initializeAssociated();
                this.modelIdAndFechOptionsDataMapping = {};
            },

            // TODO: this depends on the object being inside of an ObjectHierarchy, it should really be moved
            // (only used in DataModel.js line 80)
            getBasicAttributes: function() {
                return ({
                    objectName: this.get('objectName'),
                    displayName: this.get('displayName'),
                    rootParent: this.get('rootParent'),
                    lineage: this.get('lineage')
                });
            },

            /**
             * Returns the field object corresponding to the given field name and (optionally) owner,
             * or undefined if no field matches.
             *
             * Searches over primitive fields and fields from calculations
             *
             * @param {String} name - the name of the field to match
             * @param {String) owner (optional) - the owner of the field to match
             */

            getFieldByName: function(name, owner) {
                var fields = this.getFieldList(),
                    calculatedFields = _(this.getCalculationList()).chain().pluck('outputFields').flatten().value(),
                    allFields = _.union(fields, calculatedFields);

                return _(allFields).find(function(field) {
                    return (field.fieldName === name && (!owner || field.owner === owner));
                });
            },

            /**
             * Returns the field object corresponding to the index time field, if one exists,
             * otherwise returns undefined.
             *
             * Enforces that the field must have type 'timestamp' to differentiate from user-created fields.
             * (see SPL-82440)
             *
             * @param {String} name - the name of the field to match
             * @param {String) owner (optional) - the owner of the field to match
             */
            getIndexTimeField: function() {
                var candidate = this.getFieldByName('_time');
                if(candidate && candidate.type === 'timestamp') {
                    return candidate;
                }
                return undefined;
            },

            /**
             * Returns a list representing all fields that are available on the object in a reporting context.
             *
             * Includes primitive fields and fields from calculations.
             * Primary sort is by field data type (objectCount then childCount then all others), secondary sort is
             * lexical by field name.
             *
             * @return {Array<Object>}
             */

            getReportFields: function() {
                var fields = _(this.getFieldList()).filter(function(field) { return !field.hidden; }),
                    calculatedFields = _(this.getCalculationList())
                        .chain()
                        .pluck('outputFields').flatten().filter(function(field) { return field.hidden !== true; })
                        .value(),
                    reportFields = _.union(fields, calculatedFields),
                    sortedReportFields = _(reportFields).sortBy(function(field) {
                        // objectCount fields come before the others, followed by childCount,
                        // then sort is alphabetical by field display name (not case-sensitive)
                        var displayNameLower = field.displayName.toLowerCase();
                        if(field.type === 'objectCount') {
                            return 'a' + displayNameLower;
                        }
                        if(field.type === 'childCount') {
                            return 'b' + displayNameLower;
                        }
                        return 'c' + displayNameLower;
                    }),
                    objectCountField = _(sortedReportFields).find(function(field) {
                        return field.type === 'objectCount';
                    });

                // FIXME: this is a little weird
                if(objectCountField) {
                    objectCountField.displayName = formElementUtils.getCellValueLabel(this.get('displayName'), 'count');
                }
                return sortedReportFields;
            },

            /**
             * In order to be opened in pivot, the object must have some report attributes in addition to its
             * "objectCount" and "childCount" fields
             */

            isPivotable: function() {
                return _(this.getReportFields()).any(function(field) {
                    return (field.type !== 'objectCount' && field.type !== 'childCount');
                });
            },

            /**
             * Returns the reportFields (see getReportFields above) and divides it by data type.
             *
             * Data type categories are "timestamp", "objectCount" (also includes childCount) and "other".
             * Return value is a dictionary of category names mapping to lists of field objects.
             *
             * @return {Object}
             */

            getGroupedReportFields: function() {
                var groups = _(this.getReportFields()).groupBy(function(field) {
                    if(field.type === 'timestamp') {
                        return 'timestamp';
                    }
                    if(field.type in { objectCount: true, childCount: true }) {
                        return 'objectCount';
                    }
                    return 'other';
                });

                groups.objectCount = groups.objectCount || [];
                groups.timestamp = groups.timestamp || [];
                groups.other = groups.other || [];
                return groups;
            },

            /**
             * Returns true if the Object's parentName is not BaseTransaction, BaseEvent or BaseSearch
             *
             * @return {Boolean}
             */
            isChildObject: function() {
                return _(this.ROOT_OBJECTS).indexOf(this.get('parentName')) == -1;
            },

            /**
             * Returns a list of field objects representing the fields inherited from the object's parents.
             *
             * Includes primitive fields and fields from calculations.
             *
             * @return {Array<Object>}
             */

            getInheritedFields: function() {
                var ownName = this.get('lineage'),
                    inheritedFields = _(this.getFieldList())
                        .chain()
                        .filter(function(field) { return (field.owner !== ownName && field.type !== 'childCount'); })
                        .sortBy(function(field) {
                            return field.displayName.toLowerCase();
                        })
                        .value(),
                    inheritedCalculatedFields = _(this.getCalculationList())
                    .chain()
                    .filter(function(calc) { return calc.owner !== ownName;})
                    .map(function(calc) {
                        return _(calc.outputFields).chain()
                                                   .map(function(outputField) {
                                                        return $.extend(outputField, {calculationID: calc.calculationID});})
                                                   .value();})
                    .flatten()
                    .value();

                return _.union(inheritedFields, inheritedCalculatedFields);
            },

            /**
             * Returns a list of field objects representing the fields defined by the object itself.
             *
             * Does not include fields from calculations.
             *
             * @return {Array<Object>}
             */

            getOwnFields: function() {
                var ownName = this.get('lineage');
                return _(this.getFieldList())
                    .chain()
                    .filter(function(field) {
                        return (field.owner === ownName && field.type !== 'childCount' && field.type !== 'objectCount'); })
                    .sortBy(function(field) {
                        return field.displayName.toLowerCase();
                    })
                    .value();
            },

            /**
             * Returns a list of own and inherited field objects of type ipv4
             *
             * Does not include fields from calculations.
             *
             * @return {Array<Object>}
             */
            getIPV4Fields: function() {
                return _(this.getAllowedInputFields()).filter(function(field) { return field.type === "ipv4"; });
            },

            /**
             * Returns a list of own and inherited field objects of type ipv4 that are not currently used
             * for a GeoIP Calculation of this Object or its ancestors
             *
             * Does not include fields from calculations.
             *
             * @return {Array<Object>}
             */
            getAvailableIPV4Fields: function() {
                var geoIPCalculations = this.calculations.filter(
                    function(calculation) { return calculation.get("calculationType") === "GeoIP";});

                return _(this.getAllowedInputFields()).filter(
                    function(field) { return field.type === "ipv4" && !_(geoIPCalculations).find(
                         function(calculation) {return field.fieldName === calculation.get("inputField"); }, this);},
                        this);
            },

            /**
             * Returns a list of calculation objects representing the calculations defined by the object itself.
             *
             * @return {Array<Object>}
             */

            getOwnCalculations: function() {
                return _(this.getCalculationList()).filter(function(calc) {
                    return this.isOwnCalculation(calc);
                }, this);
            },

            isOwnCalculation: function(calculation) {
                var outputFieldType = "";
                var ownName = this.get('lineage');

                if (calculation.calculationType == "Eval" && calculation.outputFields.length > 0) {
                    outputFieldType = calculation.outputFields[0].type;
                }

                // TODO [JCS] Don't show StatsField calculations until we decide how to add/edit them.
                return (calculation.owner === ownName && outputFieldType != "childCount"
                        && outputFieldType != "objectCount" && calculation.calculationType != "StatsField");
            },

            /**
             * Filters the collapsed constraints (see getCollapsedConstraints below) to the ones that are inherited
             * from a parent.
             *
             * @return {Array<Object>}
             */

            getInheritedConstraints: function() {
                return _(this.getCollapsedConstraints()).filter(function(constraint) {
                    return constraint.owner !== this.get('lineage');
                }, this);
            },

            /**
             * Filters the collapsed constraints (see getCollapsedConstraints below) to the one that is owned
             * by the object.
             *
             * @return {Array<Object>}
             */

            getOwnConstraint: function() {
                return _(this.getCollapsedConstraints()).find(function(constraint) {
                    return constraint.owner === this.get('lineage');
                }, this);
            },

            /**
             * Returns a list of field objects containing only those field names that can be referenced
             * in the search language.
             *
             * Includes primitive fields and those that come from calculations.
             * Removes all objectCount and childCount fields.
             *
             * @return {Array<String>}
             */

            getAllSearchFields: function() {
                var ownFieldNames = _(this.getOwnFields())
                        .chain()
                        .filter(function(field) { return !(field.type in { objectCount: true, childCount: true }); })
                        .value(),
                    inheritedFieldNames = _(this.getInheritedFields())
                        .chain()
                        .filter(function(field) { return !(field.type in { objectCount: true, childCount: true }); })
                        .value(),
                    ownCalculatedFieldNames = _(this.getOwnCalculations())
                        .chain()
                        .pluck('outputFields').flatten()
                        .value();

                return _.union(inheritedFieldNames, ownFieldNames, ownCalculatedFieldNames);
            },

            /**
             * Returns the results of getAllSearchFields plus the _raw field
             *
             * @return {Array}
             */
            getAllowedInputFields: function() {
                var rawField = [Field.createRawField().getBasicDescription()];
                var allFields = this.getAllSearchFields();

                return _.union(rawField, allFields);
            },

            /**
             * Return true if the field is owned by this Object
             *
             * @param fieldName
             * @return {Boolean}
             */
            isOwnField: function(fieldName) {
                var field = this.getField(fieldName);
                if (field && field.get("owner") == this.get("lineage"))
                    return true;
                return false;
            },


            /**
             * Returns a search string that will generate a table with only the object's search language fields.
             *
             * TODO: we may be able to remove this now that the back end appends it
             *
             * @return {String}
             */

            getPreviewSearch: function() {
                var allFieldNames = _(this.getAllSearchFields()).pluck('fieldName');
                return (this.get('objectSearch') + ' | fields ' + allFieldNames.join(','));
            },

            getCalculationPreviewSearch: function(calculationFieldNames, includeAllFields, includeTime) {
                var previewSearch = this.get("previewSearch") + " | fields ";

                var fieldsString = "";
                var useComma = false;

                if (includeTime)
                    calculationFieldNames.unshift("_time");

                _(calculationFieldNames).each(function(fieldName) {
                    if (useComma)
                        fieldsString += ",";
                    fieldsString += '"' + fieldName + '"';
                    useComma = true;
                }, this);

                if (includeAllFields) {
                    _(this.getAllSearchFields()).each(function(field) {
                        if (!_(calculationFieldNames).contains(field.fieldName)) {
                            if (useComma)
                                fieldsString += ",";
                            fieldsString += '"' + field.displayName + '"';
                            useComma = true;
                        }
                    }, this);

                    if (useComma)
                        fieldsString += ",";
                    fieldsString += "*";
                }

                return previewSearch + fieldsString;
            },

            /**
             * Add a new Field to the Object
             *
             * @param attributes
             * @param options
             * @return The new Field
             */
            addField: function(attributes, options) {
                attributes = $.extend({ owner: this.get('lineage') }, attributes);
                return this.fields.add(attributes, options);
            },
            /**
             * Removes a field from the object
             *
             * Will not remove the field if it is inherited.
             *
             * @param attributes {Object} - the attributes needed to find the field to remove,
             * will be matched by field name
             */

            removeField: function(attributes) {
                var toRemove = this.fields.get(attributes.fieldName);

                if(!toRemove || toRemove.get('owner') !== this.get('lineage')) {
                    // fail silently if the field doesn't exist or it is inherited
                    // FIXME: should we throw or log an error?
                    return;
                }
                this.fields.remove(toRemove);
            },

            getField: function(fieldName) {
                return this.fields.get(fieldName);
            },

            getCalculation: function(calculationID) {
                return this.calculations.get(calculationID);
            },

            getAnyField: function(fieldName, calculationID) {
                if (calculationID) {
                    var calc = this.getCalculation(calculationID);
                    if (calc)
                        return calc.getFieldByName(fieldName);
                }

                return this.getField(fieldName);
            },

            /**
             * Create a new calculation in the object and return a reference to it.
             *
             * @param attributes {Object} an object literal with the attributes to construct the new calculation
             * @param options {Object} - options to pass to the collection add method ("at" will be ignored)
             * @return {Model} - the newly created calculation model
             */

            createCalculation: function(attributes, options) {
                var calcs = this.calculations,
                    beforeLength = calcs.length;

                attributes = attributes || {};
                $.extend(attributes, {
                    owner: this.get('lineage'),
                    calculationID: Math.random().toString(36).slice(2)
                });

                // not supporting adding a calculation at a specific index, so delete the 'at' option
                options = options || {};
                delete options.at;

                calcs.add(attributes, options);
                // the new calculation is at the end of the collection,
                // so look it up based on the original length and return it
                var newCalc = calcs.at(beforeLength);

                // Prepopulate the outputFields for a GeoIP
                if (attributes.calculationType == "GeoIP")
                    newCalc.addGeoIPFields(options);

                return newCalc;
            },

            /**
             * Removes a calculation from the object
             *
             * @param calculationID - The calculationID attribute of the calculation to remove
             */

            removeCalculation: function(calculationID) {
                var toRemove = this.calculations.get(calculationID);
                this.calculations.remove(toRemove);
            },

            /**
             * Re-orders the objects calculations to match the given list of ids
             *
             * @param order {Array<String>} a list of calculation cid's
             */
            reOrderCalculations: function(order) {

                var ownCalculationIndices = [];

                // Populate ownCalculationIndices array with the indices of our own calculations
                // which might be sparsely located within the calculations array
                this.calculations.each(function(calculation, index) {
                    var calculationBasic = calculation.getBasicDescription();

                    if (this.isOwnCalculation(calculationBasic)) {
                        ownCalculationIndices.push(index);
                    }
                }, this);

                // We only want to reorder our own calculations. So non-own calculations stay at the
                // same index. Own calculations map from the new order array to the sparse indices.
                var newCollection = this.calculations.sortBy(function(calculation, index) {
                    var returnIndex = index;
                    var calculationBasic = calculation.getBasicDescription();

                    if (this.isOwnCalculation(calculationBasic))
                        returnIndex = ownCalculationIndices[_(order).indexOf(calculationBasic.calculationID+'')];

                    return returnIndex;
                }, this);

                this.calculations.reset(newCollection);

            },

            // apply the specified callback to each descendant of the specified parent object
            // TODO: this depends on the object being inside of an ObjectHierarchy, it should really be moved
            withEachDescendant: function(callback, context) {
                if(!this.children) {
                    return;
                }
                context = context || null;

                var recApplyFn = function(child) {
                    callback.call(context, child);
                    _(child.children).each(recApplyFn);
                };

                _(this.children).each(recApplyFn);
            },

            getSampleValuesModel: function(fieldName, owner, fetchOptions) {
                var safeFieldName = this.addLineagePrefix(fieldName, owner),
                    existingModel = this.fieldSampleValues.get(safeFieldName);

                if (existingModel) {
                    if (_.isEqual(this.modelIdAndFechOptionsDataMapping[existingModel.cid], fetchOptions.data)) {
                        return existingModel;
                    }
                    else if (this.modelIdAndFechOptionsDataMapping[existingModel.cid]) {
                        this.fieldSampleValues.remove(existingModel.cid);
                        delete this.modelIdAndFechOptionsDataMapping[existingModel.cid];
                    }
                }
                this.fieldSampleValues.add({ fieldName: safeFieldName });
                var newModel = this.fieldSampleValues.get(safeFieldName);
                newModel.fetch(fetchOptions);
                this.modelIdAndFechOptionsDataMapping[newModel.cid] = fetchOptions.data;

                return newModel;
            },

            addLineagePrefix: function(fieldName, owner) {
                var baseObjectNames = ['BaseEvent', 'BaseTransaction', 'BaseSearch', 'BaseInterface', 'BaseImplements'];
                if(!_(baseObjectNames).contains(owner)) {
                    return owner + '.' + fieldName;
                }
                return fieldName;
            },

            // ----- sync behavior ----- //

            initializeAssociated: function() {
                this.fieldSampleValues = this.fieldSampleValues || new FieldSampleValues();

                this.associated = this.associated || {};
                if (!this.fields) {
                    this.fields = this.associated.fields = new Fields();
                    this.fields.on({
                        "change": function(model, options) {this.triggerAssociatedChange("change", model, options);},
                        "associatedChange": function(model, options) {this.triggerAssociatedChange("associatedChange", model, options);},
                        "add":function(model, options) {this.triggerAssociatedChange("add", model, options);},
                        "remove":function(model, options) {this.triggerAssociatedChange("remove", model, options);},
                        "update":function(model, options) {this.triggerAssociatedChange("update", model, options);},
                        "reset":function(model, options) {this.triggerAssociatedChange("reset", model, options);}
                    }, this);
                }

                if (!this.calculations) {
                    this.calculations = this.associated.calculations = new Calculations();
                    this.calculations.on({
                        "change": function(model, options) {this.triggerAssociatedChange("change", model, options);},
                        "associatedChange": function(model, options) {this.triggerAssociatedChange("associatedChange", model, options);},
                        "add":function(model, options) {this.triggerAssociatedChange("add", model, options);},
                        "remove":function(model, options) {this.triggerAssociatedChange("remove", model, options);},
                        "update":function(model, options) {this.triggerAssociatedChange("update", model, options);},
                        "reset":function(model, options) {this.triggerAssociatedChange("reset", model, options);}
                    }, this);
                }
            },

            triggerAssociatedChange: function(eventName, model, options) {
                //console.log("Object [",this.cid,"] [",this.get("displayName"),"] event [",eventName, "] model [",model.id, "]");
                this.trigger("associatedChange", model, options);
            },

            clone: function(options) {
                var clone = BaseModel.prototype.clone.call(this);
                clone.fields.set(this.fields.toJSON(options));
                clone.calculations.set(this.calculations.toJSON(options));
                return clone;
            },

            parse: function(response, options) {
                response = $.extend(true, {}, response);
                // set the display name to the object name if none is specified
                if(!response.displayName) {
                    response.displayName = response.objectName;
                }
                return this.parseAssociated(response, options);
            },

            parseAssociated: function(response, options) {
                this.initializeAssociated();

                // Clear the fieldSampleValues cache and reapply the baseSearch string
                this.fieldSampleValues.reset();
                this.fieldSampleValues.setBaseSearch(response.objectSearch);
                this.fieldSampleValues.setTsidxNamespace(response.tsidxNamespace);

                if(response.fields) {
                    this.fields.set(response.fields, $.extend({ parse: true }, options));
                    delete response.fields;
                }
                if(response.calculations) {
                    this.calculations.set(response.calculations, $.extend({ parse: true }, options));
                    delete response.calculations;
                }
                return response;
            },

            toJSON: function(options) {
                var json = BaseModel.prototype.toJSON.apply(this, arguments);
                json.fields = this.fields.toJSON(options);
                json.calculations = this.calculations.toJSON(options);
                return json;
            },
            
            sync: function(method, model, options) {
                throw new Error('sync not allowed for a Data Model Object model');
            },

            // ----- private methods ----- //


            /**
             * Returns a list of object literals representing a simple description of the object's fields.
             *
             * @return {Array<Object>}
             */

            getFieldList: function() {
                return this.fields.map(function(field) {
                    return field.getBasicDescription();
                });
            },

            /**
             * Returns a list of object literals representing a simple description of the object's calculations.
             *
             * @return {Array<Object>}
             */

            getCalculationList: function() {
                return this.calculations.map(function(calc) {
                    return calc.getBasicDescription();
                });
            },

            /**
             * Returns a list of constraint objects where any constraints with the same owner have been combined.
             *
             * Constraints are combined by joining their "search" attribute on a space character
             *
             * For example if the object's constraints have this structure:
             *
             * [
             *   {
             *     owner: "Object1",
             *     search: "field1=value1"
             *   },
             *   {
             *     owner: "Object2",
             *     search: "field2=value2"
             *   },
             *   {
             *     owner: "Object2",
             *     search: "field3=value3"
             *   }
             * ]
             *
             * The method will return this structure:
             *
             * [
             *   {
             *     owner: "Object1",
             *     search: "field1=value1"
             *   },
             *   {
             *     owner: "Object2",
             *     search: "field2=value2 field3=value3"
             *   }
             * ]
             *
             * @return {Array<Object>}
             */

            getCollapsedConstraints: function() {
                var constraints = this.get('constraints'),
                    groupedList = _(constraints).groupBy('owner'),
                    ownerList = _(constraints).chain().pluck('owner').uniq().value();

                return _(ownerList).map(function(owner) {
                    return {
                        owner: owner,
                        search: _(groupedList[owner]).pluck('search').join(' ')
                    };
                });
            },

            toString: function() {
                return "Object ["+this.cid+"] displayName [" + this.get("displayName") + "] " + this.calculations.toString();
            }

	    });
	}
);
