/**
 * @author jszeto
 * @date 7/14/14
 *
 * Attributes:
 *
 * selectedStep {String} - The step the user is currently viewing
 * selectedVirtualIndex {String} - The selected virtual index ID
 * selectedProvider {String} --The human-readable name of provider for the selected vix
 * selectedVixName {String} -The human-readable name (String) and not the path of the selected Vix
 * selectedPath {String} - The current path in the virtual index
 * selectedRootPath {String} - The root path in the virtual index
 * selectedSource {String} - The full path of the selected source
 * selectedSourceType {String} - The sourcetype to associated with the source
 * appContext {String} - ID of the app to save into
 * appName {String} - The human-readable name of the app chosen
 * sharing {String} - the sharing level for the saved settings
 * rootPaths {Array} - array of root paths
 */
define([
    'jquery',
    'underscore',
    'models/Base',
    'splunk.util',
    'util/splunkd_utils'
],
    function(
        $,
        _,
        BaseModel,
        splunkUtils,
        splunkd_utils
        ) {

        return BaseModel.extend({

            defaults: {
                selectedStep: undefined,
                selectedVirtualIndex: undefined,
                selectedVixName: undefined,
                selectedProvider: undefined,
                selectedPath: undefined,
                selectedSource: undefined,
                selectedSourceType: undefined,
                selectedRootPath: undefined,
                appContext: undefined,
                appName: undefined,
                sharing: splunkd_utils.APP,
                rootPaths: []
            },

            initialize: function(attrs, options) {
                BaseModel.prototype.initialize.call(this, attrs, options);
            },

            getSourceFile: function() {
                var source = this.get("selectedSource");
                source = splunkUtils.trim(source, "/");
                var sourceArray = source.split("/");

                if (sourceArray.length > 0)
                    return sourceArray[sourceArray.length-1];

                return "";
            },

            toString: function() {
                return "selectedStep [" + this.get("selectedStep") +
                       "] selectedVirtualIndex [" + this.get("selectedVirtualIndex") +
                       "] selectedVixName [" + this.get("selectedVixName") +
                       "] selectedProvider [" + this.get("selectedProvider") +
                       "] selectedPath [" + this.get("selectedPath") +
                       "] selectedSource [" + this.get("selectedSource") +
                       "] selectedSourceType [" + this.get("selectedSourceType") +
                       "] selectedRootPath [" + this.get("selectedRootPath") +
                       "] appContext [" + this.get("appContext") +
                       "] appName [" + this.get("appName") +
                       "] sharing [" + this.get("sharing") +
                       "] rootPaths [" + this.get("rootPaths") + "]";
            }
        });
    });
