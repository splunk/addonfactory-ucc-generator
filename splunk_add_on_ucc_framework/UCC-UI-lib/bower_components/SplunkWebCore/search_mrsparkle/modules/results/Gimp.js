/**
 * An observer used for gathering and remapping context settings at the bottom 
 * of a tree for the SimpleXML panel editor.
 */ 
Splunk.Module.Gimp = $.klass(Splunk.Module, {
    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("Splunk.Module.Gimp");
    },
    /**
     * Find the current settings for a particular SimpleXML categorical type.
     * Deals with nuances of layering (module.conf -> view.xml -> viewstates.conf -> JavaScript module message bus).
     * @param {String} type The categorial Simple XML type
     * @param {String} prefix (Optional) Add a prefix to all remapped keys.
     * @type {Object}
     * @return A normalized one-level deep object of key/value pairs. If no matching type found
     *         an empty object is returned.
     */ 
    getPanelSettings: function(type, prefix) {
        var types = {
            event: this.remapEvent,
            table: this.remapTable,
            chart: this.remapCharting
        };
        var settings = (types[type]) ? types[type].apply(this) : {};
        if (prefix) {
            var newSettings = {};
            for (var setting in settings) {
                var value = settings[setting];
                if (value===null) {
                    this.logger.warn('dropping null value for setting', prefix + setting);
                    continue;
                }
                newSettings[prefix + setting] = value;
            }
            settings = newSettings;
        }
        return settings;
    },
    /**
     * Finds matching elements and renames them. Non-matched elements are dropped.
     *
     * @param {Object} obj A key/value ojecct literal to find and rename against.
     * @param {Object} map A key/value object literal to match and replace against. Key denotes the
     *                     target key that must exist and value is the replacement name.
     * @type {Object}
     * @return The newly renamed matching set of key value pairs.
     */
    findByKeyAndRename: function(obj, map) {
        var values = {};
        for (var key in map) {
            if (obj.hasOwnProperty(key)) {
                values[map[key]] = obj[key];
            }
        }
        return values;
    },
    /**
     * Context value remapping for SimpleXML chart panel.
     */
    remapCharting: function() {
        var values = {};
        var chartingProperties = this.getContext().getAll('charting');
        for (var key in chartingProperties) {
            values['charting.' + key] = chartingProperties[key];
        }
        var height = this.getContext().get('height');
        if (height) {
            values.height = height;
        }
        return values;
    },
    /**
     * Context value remapping for a SimpleXML table panel.
     */ 
    remapTable: function() {
        var obj = this.getContext().getAll('');
        var values = this.findByKeyAndRename(obj, {
            'results.count': 'count', 
            'results.displayRowNumbers': 'displayRowNumbers'
        });
        var displayRowNumbers = values['displayRowNumbers'];
        if (['on', 'off'].indexOf(displayRowNumbers)!=-1) { 
            values['displayRowNumbers'] = Splunk.util.normalizeBoolean(displayRowNumbers);
        }
        return values;
    },
    /**
     * Context value remapping for a SimpleXML event panel.
     */ 
    remapEvent: function() {
        var obj = this.getContext().getAll('');
        var values = this.findByKeyAndRename(obj, {
            'results.count': 'count',
            'results.displayRowNumbers': 'displayRowNumbers',
            'results.entityName': 'entityName',
            'results.segmentation': 'segmentation',
            'results.maxLines': 'maxLines',
	    'results.softWrap': 'softWrap'
        });
        return values;
    }
});
