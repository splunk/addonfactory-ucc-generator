Splunk.Context = $.klass({
    logger: Splunk.Logger.getLogger("search_context.js"),
    _root : {},
    
    initialize: function() {
        this._root = {};
    },
    enforceByValue: function(value) {
        // we must return objects by value, not by reference. 
        if (value instanceof Object) {
            if (typeof(value.clone) == "function") {
                return value.clone();
            }
            else if (typeof(value) == "function") {
                return value;
            }
            else if (value instanceof Array) {
                return $.extend(true, [], value);
            }
            else {
                return $.extend(true, {}, value);
            }
        }
        return value;
    },
    
    /**
     *  Generic getter method for all named keys. 
     *  if the context has no value for the given key, the call will return a 
     *  literal null value. 
     */
    get: function(name) {
        if (this.has(name)) {
            return this.enforceByValue(this._root[name]);
        }
        return null;
    },
    /**
     *  This will return ALL values at or below the specified name
     *  The keys will be the global namespace keys, minus the name. 
     *  so given keys "charting.chart.stackMode"  and "charting.chart"
     *  getAll("charting")  will return a map with two keys
     *  "chart.stackMode"   and "chart"
     *  A map is returned in all cases, regardless of whether there are 
     *  0 or 1 or N values matching.
     */
    getAll: function(name) {
        if (name=="") {
            return this.enforceByValue(this._root);
        }
        var hash = {};
        for (var key in this._root) {
            if (this._root.hasOwnProperty(key)) {
                var truncatedKey;
                if (key == name) {
                    truncatedKey = "";
                } else if (key.indexOf(name+".")!=-1) {
                    truncatedKey = key.replace(name+".", "");
                } else {
                    continue;
                }
                hash[truncatedKey] = this.enforceByValue(this._root[key]);
            }
        }
        return hash;
    },
    /**
     *  returns whether or not the context contains a literal value at the specified key
     *  The return value will not be an indicator of whether or not there is a value *deeper*
     *  than the specified key. 
     *   eg context.has("foo.bar.baz")   can return true,   
     *      but context.has("foo.bar") may well return false.
     */
    has: function(name) {
        return this._root.hasOwnProperty(name);
    },
    /**
     *  
     */
    set: function(name, value) {
        //this.logger.debug("setting " +  name + " to " + value);
        // if passed a value by reference, we are responsible for cloning it.
        // the client may make changes to the reference, but we do NOT allow 
        // those changes to alter our internals.
        // set is effectively a snapshot.
        value = this.enforceByValue(value);
        this._root[name] = value;
    },
    clone: function() {
        var clonedContext = new Splunk.Context();
        for (var key in this._root) {
            if (this._root.hasOwnProperty(key)) {
                clonedContext.set(key, this.get(key));
            }
        }
        return clonedContext;
    }
});