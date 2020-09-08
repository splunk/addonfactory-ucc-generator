/**
 * A model representing an individual data model.
 *
 * For a description of the backing endpoint, see: http://eswiki.splunk.com/Data_Model_JSON_Specification
 */

define([
            'jquery',
            'underscore',
            'backbone',
            'models/Base',
            'models/datamodel/DataModelWhiteList',
            'models/SplunkDBase',
            'models/services/datamodel/private/Acceleration',
            'models/services/datamodel/private/Object',
            'collections/services/datamodel/private/ObjectHierarchy',
            'util/console',
            'util/splunkd_utils',
            'util/general_utils',
            'splunk.util'
        ],
        function(
            $,
            _,
            Backbone,
            BaseModel,
            DataModelWhiteList,
            SplunkDBase,
            Acceleration,
            DataModelObject,
            ObjectHierarchy,
            console,
            splunkDUtils,
            generalUtils,
            splunkUtil
        ) {

    var CONSTS = {
        BASE_EVENT : "BaseEvent",
        BASE_TRANSACTION : "BaseTransaction",
        BASE_SEARCH : "BaseSearch",
        DOCUMENT_TYPES: {
            DATAMODEL: 'datamodel',
            TABLE: 'table'
        },
        DATASET_DISPLAY_TYPES: {
            TABLE: _('table').t(),
            DATA_MODEL: _('data model').t()
        }
    };

    var DataModel = SplunkDBase.extend({

        initialize: function(attributes, options) {
            options = options || {};
            options.splunkDWhiteList = options.splunkDWhiteList ?
                options.splunkDWhiteList : new DataModelWhiteList();

            SplunkDBase.prototype.initialize.call(this, attributes, options);
        },

        /**
         *  Returns the data model's object hierarchy as a flattened list of object literals with basic attributes.
         *
         *  For a full description of the structure returned, see the depthFirstMap method in the
         *  "collections/services/datamodel/private/ObjectHierarchy" module
         *
         *  @return {Array}
         */

        getFlattenedHierarchy: function() {
            return (this.entry.content.objects.depthFirstMap(function(obj) {
                return obj.getBasicAttributes();
            }));
        },

        /**
         * Returns a processed version fo the result of getFlattenedHierarchy.
         * Add an "isPivotable" boolean attribute to each object.
         */

        getPivotableHierarchy: function() {
            return _(this.getFlattenedHierarchy()).map(function(obj) {
                obj.isPivotable = this.objectByName(obj.objectName).isPivotable();
                return obj;
            }, this);
        },

        /**
         * Returns the flattened object hierarchy (see getFlattenedHierarchy above) and divides it into sub-hieararchies,
         * one for each of the abstract base object types.
         *
         * The data structure returned is a dictionary of base object names mapping to sub-hierarchies.
         *
         * @return {Object}
         */

        getGroupedFlattenedHierarchy: function() {
            var groupedObjects = _(this.getFlattenedHierarchy()).groupBy(function(obj) {
                return obj.rootParent;
            });

            var returnObject = {};
            returnObject[CONSTS.BASE_EVENT] = groupedObjects[CONSTS.BASE_EVENT] || [];
            returnObject[CONSTS.BASE_TRANSACTION] = groupedObjects[CONSTS.BASE_TRANSACTION] || [];
            returnObject[CONSTS.BASE_SEARCH] = groupedObjects[CONSTS.BASE_SEARCH] || [];

            return returnObject;
        },

        getObjectCount: function() {
            return this.entry.content.objects.length;
        },

        // since the model can be fetched in "concise" mode without the collection of objects,
        // this method provides a way to get the count of objects from the "objectSummary"
        // NOTE: dynamically added/removed objects will not be reflected in this count
        getSummarizedObjectCount: function() {
            // the groups are mutually exclusive, so we can just add up all of the counts
            return _(this.entry.content.objectSummary.toJSON()).reduce(function(runningTotal, groupCount) {
                return runningTotal + groupCount;
            }, 0);
        },

        isEmpty: function() {
            return this.getSummarizedObjectCount() === 0;
        },

        /**
         * Returns true if the data model is privately shared
         * @return {Boolean}
         */
        isPrivate: function() {
            return this.entry.acl.get("sharing") == splunkDUtils.USER;
        },
        /**
         * Returns true if the data model was generated from an sid and has not been saved to the back end.
         * @returns {boolean}
         */
        isTemporary: function() {
            return this.has('sid');
        },
        /**
         * Returns true if the model can be accelerated. Private models can not be accelerated.
         * @return {Boolean}
         */
        canAccelerate: function() {
            return splunkUtil.normalizeBoolean(this.entry.content.get("acceleration.allowed")) && !this.isPrivate();
        },

        /**
         * Returns true if the user can change the model's permissions
         * @return {Boolean}
         */
        canChangePermissions: function() {
            return this.entry.acl.get('can_change_perms');
        },

        /**
         * Returns true if the model can be deleted.
         *
         * @return {Boolean}
         */
        canDelete: function() {
            return this.entry.links.get("remove") ? true : false;
        },

        /**
         * Returns true if the model can be edited.
         * @return {Boolean}
         */
        canWrite: function() {
            return this.entry.acl.get('can_write') ? true : false;
        },

        getType: function() {
            return this.entry.content.get("dataset.type") === CONSTS.DOCUMENT_TYPES.TABLE ?
                CONSTS.DOCUMENT_TYPES.TABLE : CONSTS.DOCUMENT_TYPES.DATAMODEL;
        },

        getDatasetDisplayType: function() {
            if (this.getType() === CONSTS.DOCUMENT_TYPES.TABLE) {
                return CONSTS.DATASET_DISPLAY_TYPES.TABLE;
            } else {
                return CONSTS.DATASET_DISPLAY_TYPES.DATA_MODEL;
            }
        },

        isAccelerated: function() {
            return this.entry.content.acceleration ? (this.entry.content.acceleration.get("enabled") ? true : false) : false;
        },

        getAncestorsForObject: function(objectName) {
            return this.entry.content.objects.getAncestorsForObject(objectName);
        },

        /**
         * @param objName {String} - the objectName of an object to look up in the hierarchy
         * @return {Model} - a reference to the object, or undefined if it's not there
         */

        objectByName: function(objName) {
            return this.entry.content.objects.get(objName);
        },

        objectByLineage: function(lineage) {
            var objects = lineage.split(".");

            if (objects.length > 0) {
                return this.objectByName(objects[objects.length-1]);
            }

            return undefined;
        },

        /**
         * Adds a new object with the given attributes to the data model and returns a reference to it.
         *
         * @param attributes {Object} - an object literal with the attributes to construct the new object model
         * @param options {Object} - options to pass to the collection add method ("at" will be ignored)
         * @return {Model} - the newly created object model
         */

        addObject: function(attributes, options) {
            // TODO: maybe throw an error if objectName or parentName are not defined
            // TODO [JCS] Allow adding to a transaction, event or search
            if(!attributes.parentName) {
                console.warn('DataModel: addObject called with no parent name specified, using BaseEvent as a default');
                attributes.parentName = CONSTS.BASE_EVENT;
            }
            var objects = this.entry.content.objects,
                beforeLength = objects.length;

            // not supporting adding objects at a particular index, so delete the 'at' option
            options = options || {};
            delete options.at;
            objects.add(attributes, options);
            // the new object is at the end of the collection, so look it up based on the original length and return it
            return objects.at(beforeLength);
        },

        /**
         * Removes an object and its children from the data model.
         *
         * A no-op if the model is currently in the data model.
         *
         * @param object {Model} - the object model instance to be removed
         */

        removeObjectAndChildren: function(object) {
            object.withEachDescendant(function(child) {
                this.entry.content.objects.remove(child, { silent: true });
            }, this);
            this.entry.content.objects.remove(object);
        },

        // ------ sync behavior ---- //

        url: 'datamodel/model',
        generateUrl: 'datamodel/generate',

        sync: function(method, model, options) {
            options = options || {};
            options.data = options.data || {};
            // If an sid is included in the params for a fetch, populate the data model using the generate-from-sid endpoint.
            if (method === 'read' && options.data.sid) {
                options = $.extend(true, { output_mode: 'json' }, options);
                options = splunkDUtils.prepareSyncOptions(options, model.generateUrl);
                // The fields and field_coverage options are mutually exclusive, let fields trump field_coverage.
                if(options.data.fields) {
                    delete options.data.field_coverage;
                }
                return Backbone.Model.prototype.sync.call(this, method, model, options);
            }
            
            if (method === 'read' && options.data.dataset) {
                if (!options.data.type) {
                    throw new Error('type is required when generating a data model from a dataset');
                }
                options = $.extend(true, { output_mode: 'json' }, options);
                options = splunkDUtils.prepareSyncOptions(options, model.generateUrl);
                options.data.dataset = options.data.type + ':' + options.data.dataset;
                delete options.data.type;
            }
            
            return SplunkDBase.prototype.sync.apply(this, arguments);
        },

        initializeAssociated: function() {
            SplunkDBase.prototype.initializeAssociated.call(this);
            var content = this.entry.content;

            if (!content.objects) {
                content.objects = content.associated.objects = new ObjectHierarchy();
                content.objects.on("change associatedChange add remove update reset",
                                function(model, options) {this.trigger("associatedChange", model, options);}, this);
            }

            content.objectSummary = content.associated.objectSummary = content.objectSummary || new BaseModel();
            content.acceleration = content.associated.acceleration = content.acceleration || new Acceleration();
        },

        clone: function() {
            // TODO [sff] this is horrible...
            // have to set a temporary flag or if the model is accelerated it will not clone itself correctly
            this.entry.content.isCloning = true;
            var clone = new this.constructor();
            clone.setFromSplunkD(this.toSplunkD());
            // TODO [sff] do we have to call this?
            clone.entry.content.objects.buildHierarchy();
            this.entry.content.isCloning = false;
            return clone;
        },

        parse: function(response, options) {
            response = $.extend(true, {}, response);
            this.initializeAssociated();
            response = this.parseSplunkDPayload(response);
            // If the data model was generated from an sid, add that sid to the root attributes.
            if(options && options.data && options.data.sid) {
                response.sid = options.data.sid;
            }
            return SplunkDBase.prototype.parse.call(this, response);
        },
        
        parseFile: function(response) {
            response = $.extend(true, {}, response);
            this.initializeAssociated();
            response = this.parseSplunkDPayload(response);
            var response_entry = response.entry[0];
            this.entry.content.set(response_entry.content);
            delete response_entry.content;
            delete response.entry;
            return response;
        },
        
        setFromSplunkD: function(payload, options) {
            payload = $.extend(true, {}, payload);
            //console.log("DataModel.setFromSplunkD before parse",this.toString());
            payload = this.parseSplunkDPayload(payload, options);
            //console.log("DataModel.setFromSplunkD after parse",this.toString());
            return SplunkDBase.prototype.setFromSplunkD.call(this, payload, options);
        },

        parseSplunkDPayload: function(payload, options) {
            var entry = payload.entry;
            var acceleration;

            if(entry && entry.length > 0 && entry[0].content) {
                //console.log("DM.parseSplunkDPayload",this.cid,"objects[0].calculations");

                // Save the acceleration info and apply later since content gets clobbered
                if (entry[0].content.acceleration)
                    acceleration = JSON.parse(entry[0].content.acceleration); // String representation of the acceleration JSON
                // what we want to treat as content from now on is actually stringified into the "description" attribute

                var content;

                var accelerationAllowed = entry[0].content["acceleration.allowed"];

                if (_(entry[0].content).has("description")) {
                    // Merge the JSONified data model description with any dataset.* attributes in the content payload
                    content = entry[0].content = _.extend(
                        {}, generalUtils.filterObjectByRegexes(entry[0].content, /^dataset\.*/), 
                        JSON.parse(entry[0].content.description)
                    );
                } else {
                    content = entry[0].content;
                }

                // The "acceleration.allowed" attribute doesn't exist in the "acceleration" JSON blob so
                // preserve it here. We don't put it into the acceleration associated model because that model
                // will eventually go away (along w/ the "acceleration" attribute).
                content["acceleration.allowed"] = accelerationAllowed;

                // set the display name equal to the model name if no display name is given
                if(!content.displayName) {
                    content.displayName = content.modelName;
                }

                if(_(content.objects).isArray()) {
                    this.entry.content.objects.set(content.objects, $.extend({ parse: true }, options));
                    delete content.objects;
                }
                if (_(content.objectSummary).isObject()) {
                    this.entry.content.objectSummary.set(content.objectSummary, $.extend({ parse: true }, options));
                    delete content.objectSummary;
                }
                if (_(acceleration).isObject()) {
                    this.entry.content.acceleration.set(acceleration, $.extend({ parse: true }, options));
                }
            }
            return payload;
        },

        toString: function() {
            var children = "";
            this.entry.content.objects.each(function(object) {
                if (children != "") {
                    children += ", ";
                }
                children += object.toString();
            }, this);

            return "DataModel [" + this.cid + "] objects cid [" + this.entry.content.objects.cid + "] Objects: " + children;
        }

    }, CONSTS);

    // break the shared reference to Entry
    DataModel.Entry = SplunkDBase.Entry.extend({});
    // now we can safely extend Entry.Content
    DataModel.Entry.Content = SplunkDBase.Entry.Content.extend({

        toJSON: function(options) {
            var json = SplunkDBase.Entry.Content.prototype.toJSON.apply(this, arguments);
            var returnValue = {};

            if (this.objects.length > 0) {
                json.objects = this.objects.toJSON(options);
            }

            if (this.objectSummary) {
                json.objectSummary = this.objectSummary.toJSON(options);
            }

            if (this.acceleration) {
                returnValue.acceleration = JSON.stringify(this.acceleration.toJSON(options));
            }

            //console.log("=========== DataModelV2.toJSON =============");
            //console.log(JSON.stringify(json));
            if (json.name) {
                json.modelName = json.name;
                returnValue.name = json.name;
                delete json.name;
            }

            // Split the json into two types of attributes, ones that start with "dataset.*" and ones that do not
            var datasetAttrs = generalUtils.filterObjectByRegexes(json, /^dataset\.*/);

            // Copy the "dataset.*" attributes into the response
            _.extend(returnValue, datasetAttrs);

            // Exclude the "dataset.*" attributes from the description attribute
            _(datasetAttrs).each(function(value, key) {
                delete json[key];
            }, this);

            returnValue.description = JSON.stringify(json);

            return returnValue;
        }

    });

    // Expose a reference to the Data Model Object constructor for dependency declarations
    DataModel.Object = DataModelObject;

    return DataModel;

});
