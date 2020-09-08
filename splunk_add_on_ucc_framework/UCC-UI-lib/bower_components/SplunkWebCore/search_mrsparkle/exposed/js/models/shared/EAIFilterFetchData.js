/**
 * @author jszeto
 * @date 5/10/13
 *
 * Represents the parameters to pass to the EAI REST endpoint to get sorting, pagination and filtering
 *
 * app {string} - only return objects for this app. Set to "-" to return objects for all apps.
 * owner {string} - only return objects for this owner. Set to "-" to return objects for all owners.
 *      If at least one of the previous two options are defined: servicesNS/owner/app/entity end point will be reached.
 * appSearch {string} - only return objects where eai:acl.app = this app. Append (eai:acl.app='app') to search String. Set to "*" to return objects for all apps.
 * ownerSeach {string} - only return objects where eai:acl.owner = this owner. Append (eai:acl.owner='owner') to search String. Set to "*" to return objects for all owners.
 *      The previous two options are be used in addition to app and owner for filtering.
 * visible {boolean} - if true, return the visible objects
 * nameFilter {string} - search string to match against the object's name. Can contain wildcards
 * count {number} - number of objects to return
 * offset {number} - index of first object to return
 * sort_dir {enum} - (asc/desc) return objects in ascending or descending order of the sort_key
 * sort_key {string} - field to use for sorting
 * search {string} - default is "". If specified, is the expression used to filter the response. Otherwise,
 * use getCalculatedSearch to return the search filter string.
 */

define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'splunk.util'
    ],
    function($, _, Backbone, BaseModel, splunk_utils) {
        return BaseModel.extend({
            initialize: function(attributes, options) {
                BaseModel.prototype.initialize.apply(this, arguments);
            },

            /**
             * Generates the search string to pass in the EAI Request. This is calculated from the app, owner, visibleInApp and
             * filter attributes.
             */
            getCalculatedSearch: function() {
                var appSearch = this.get("appSearch");
                var ownerSearch = this.get("ownerSearch");
                var nameFilter = this.get("nameFilter");
                var visible = splunk_utils.normalizeBoolean(this.get("visible"));

                var searchString = "";
                if (!_.isUndefined(ownerSearch) && !_.isEmpty(ownerSearch)) {
                    searchString += '(eai:acl.owner="' + ownerSearch + '")';
                }

                if (!_.isUndefined(appSearch) && !visible && !_.isEmpty(appSearch)) {
                    if (!_.isEmpty(searchString))
                        searchString += ' AND ';
                    searchString += '(eai:acl.app="' + appSearch + '")';
                }

                if (!_.isUndefined(nameFilter) && !_.isEmpty(nameFilter)) {
                    if (!_.isEmpty(searchString))
                        searchString += ' AND ';
                    searchString += nameFilter;
                }

                return searchString;
            },

            toJSON: function(options) {

                var json = BaseModel.prototype.toJSON.apply(this, arguments);

                if(json.sortKey) {
                    json.sort_key = json.sortKey;
                    json.sort_dir = json.sortDirection;
                }
                delete json.sortKey;
                delete json.sortDirection;

                json.search = this.getCalculatedSearch();
                delete json.appSearch;
                delete json.ownerSearch;
                delete json.nameFilter;
                delete json.visible;

                return json;
            }

        });
    }
);

