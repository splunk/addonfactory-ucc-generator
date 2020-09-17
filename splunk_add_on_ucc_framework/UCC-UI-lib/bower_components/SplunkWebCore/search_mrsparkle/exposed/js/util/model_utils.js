/**
 * Util package for working with models.
 */

define(['underscore'], function(_) {

    var collectionsAreEquivalent = function(coll1, coll2) {
        return _(coll1.toJSON()).isEqual(coll2.toJSON());
    };

    /**
     * @author sfishel
     *
     * A method to reset a collection, first checks that the new data is different from the data already there
     *
     * @param collection {Collection} the collection to reset
     * @param data {Array<Object>} the data to reset the collection
     * @param options {Object} options to be passed to Backbone's reset method
     */

    var safeResetCollection = function(collection, data, options) {
        var comparisonCollection = new collection.constructor();
        comparisonCollection.reset(data, options);
        if(!collectionsAreEquivalent(collection, comparisonCollection)) {
            collection.reset(data, options);
        }
    };

    /**
     * @author sfishel
     *
     * Parse out and handle the JSON representation of a nested collection from a raw sync response.
     *
     * @param model {Model} - the parent model
     * @param response {Object} - the JSON sync response
     * @param keyName {String} - the name of the model attribute that should contain the collection
     * @param collType {Constructor} - the constructor for the nested collection
     */

    var parseNestedCollection = function(model, response, keyName, collType) {
        response = response || {};
        // if the nested collection doesn't exist yet, create a new one
        if(!model.attributes || !model.get(keyName)) {
            // TODO: what if we needed to parse at the collection level here?
            response[keyName] = new collType(response[keyName] || [], { parse: true });
        }
        // otherwise reset the collection if new models were specified in the response
        else if(response[keyName]) {
            var collection = model.get(keyName),
            // have to explicitly call the collection's parse method
                parsedModels = collection.parse.call(collection, response[keyName]),
            // create new collection to compare to the old one to see if anything changed
                comparisonCollection = new collType(parsedModels, { parse: true });

            // if the two collections are different, reset the model's collection to the contents of the new one
            if(!collectionsAreEquivalent(collection, comparisonCollection)) {
                collection.reset(comparisonCollection.toArray());
            }
            // remove the objects from the response so they don't get passed to 'set'
            delete(response[keyName]);
        }
    };

    /**
     * @author sfishel
     *
     * Bind to a nested collection and bubble up some custom events at the model level.
     *
     * @param model {Model} - the parent model
     * @param keyName {String} - the name of the model attribute that contains the collection
     * @param collType {Constructor} - the constructor for the nested collection
     */
    
    var bindNestedCollection = function(model, keyName, collType, options) {
        if(!model.get(keyName)) {
            model.set(keyName, new collType(), options);
        }
        var collection = model.get(keyName);
        // TODO: should we pass some information along when these events are triggered?
        collection.on('add', function(added, collection, options) {
            model.trigger('add:' + keyName, added, collection, options);
            model.trigger('change');
        });
        collection.on('remove', function(removed, collection, options) {
            model.trigger('remove:' + keyName, removed, collection, options);
            model.trigger('change');
        });
        collection.on('reset', function(collection, options) {
            model.trigger('reset:' + keyName, collection, options);
            model.trigger('update:' + keyName);
            model.trigger('change');
        });
        collection.on('change', function(changed, options) {
            model.trigger('change:' + keyName, changed, options);
            model.trigger('update:' + keyName);
            model.trigger('change');
        });
    };
    
    /**
     * Create a random GUID (guid) / UUID (uuid) for an internal model to use as a unique id.
     * 
     * This was taken from the answer provided by "Briguy37" in the StackOverflow: 
     * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
     * 
     */
    
    var generateUUID = function() {
        var d = new Date().getTime(),
            uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x3|0x8)).toString(16);
            });
        
        return uuid;
    };
    
    return ({
        safeResetCollection: safeResetCollection,
        parseNestedCollection: parseNestedCollection,
        bindNestedCollection: bindNestedCollection,
        generateUUID: generateUUID
    });
    
});