(function(global) {

if (typeof global.Splunk=="undefined" || !global.Splunk) {
    /**
     * The Splunk global namespace object.  If Splunk is defined, the
     * existing Splunk object will not be overwritten so that existing
     * namespaces are preserved.
     */
    global.Splunk = {};
}
/**
 * Returns the namespace specified and creates it if it doesn't exist
 * <pre>
 * Splunk.namespace("property.package");
 * Splunk.namespace("Splunk.property.package");
 * </pre>
 * Either of the above would create Splunk.property, then
 * Splunk.property.package
 *
 * @method namespace
 * @static
 * @param  {String} name A "." delimited namespace to create
 * @return {Object} A reference to the last namespace object created
 */
global.Splunk.namespace = function(name) {
    var parts = name.split(".");
    var obj = Splunk;
    for (var i=(parts[0]=="Splunk")?1:0; i<parts.length; i=i+1) {
        obj[parts[i]] = obj[parts[i]] || {};
        obj = obj[parts[i]];
    }
    return obj;
};

})(this);
