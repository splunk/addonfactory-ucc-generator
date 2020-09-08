/**
 * A model to represent an instance of a pivot search.  Each pivot search can be expressed in a variety of ways:
 * - pivotSearch: a search string using the "| pivot" search command
 * - tstatsSearch: a search string using the "| tstats" search command (assuming it was given an associated tsidx namespace)
 * - searchString: a raw search string that doesn't use "| pivot" or "| tstats"
 * - openInSearch: a search string that is functionally equivalent to the raw search string but looks prettier
 * - pivotJson: a JSON string that defines the pivot elements used to generate the searches above
 *
 * Fetching the full representation of the pivot search can be done by either supplying the pivotSearch or the pivotJson,
 * along with an optional tsidx namespace.
 *
 * This model will aggressively memoize all fetches, and does so across multiple instances.
 * Each unique combination of dataModel, namespace (or lack thereof), and either pivotSearch or pivotJson
 * should only be fetched once.  Additionally, when either a pivotSearch or pivotJson value is fetched, its
 * counterpart will also be added to the memoization.
 */

define([
            'jquery',
            'models/Base',
            'util/splunkd_utils',
            'util/general_utils'
        ],
        function(
            $,
            Base,
            splunkdUtils,
            generalUtils
        ) {

    var fetchCache = {};

    return Base.extend({

        parse: function(response, options) {
            var parsedContent = $.extend({}, response.entry[0].content);
            generalUtils.transferKey(parsedContent, 'pivot_search', 'pivotSearch');
            generalUtils.transferKey(parsedContent, 'pivot_json', 'pivotJson');
            generalUtils.transferKey(parsedContent, 'tstats_search', 'tstatsSearch');
            generalUtils.transferKey(parsedContent, 'open_in_search', 'openInSearch');
            generalUtils.transferKey(parsedContent, 'drilldown_search', 'drilldownSearch');
            this.memoizeContent(parsedContent, options);
            return parsedContent;
        },

        /**
         * Sync supports only read operations.  To fetch, either pivotSearch or pivotJson must be populated.
         *
         * Also has a required fetch data param "dataModel", which is the fully qualified id of the data model.
         * And optional fetch data param "namespace", which is the tsidx namespace to use.
         */

        sync: function(method, model, options) {
            if(method !== 'read') {
                throw new Error('Unsupported method: ' + method);
            }
            var optionsData = options.data || {};
            if(!optionsData.dataModel && !optionsData.modelJson) {
                throw new Error('The dataModel parameter or the modelJson parameter is required when fetching');
            }
            if(optionsData.dataModel) {
                // TODO [sff] this is a little wonky, would be nice if the data model could give you a report link
                options.url = splunkdUtils.fullpath(
                    optionsData.dataModel.replace(/datamodel\/(model|generate)/, 'datamodel/pivot')
                );
                delete optionsData.dataModel;
                delete optionsData.app;
                delete optionsData.owner;
                optionsData.output_mode = 'json';
            }
            else {
                options = splunkdUtils.prepareSyncOptions(options, 'datamodel/pivot');
                options.data.model_json = options.data.modelJson;
                delete options.data.modelJson;
                options.data.name = 'pivot_from_model_json';
                options.type = 'POST';
            }
            var modelAttrs = model.toJSON();
            if(!modelAttrs.pivotSearch && !modelAttrs.pivotJson) {
                throw new Error('Either pivotSearch or pivotJson must be populated before fetching');
            }

            $.extend(options.data, {
                pivot_search: modelAttrs.pivotSearch,
                pivot_json: modelAttrs.pivotJson
            });

            var memoizedContent = this.getMemoizedContent(options);
            if(memoizedContent) {
                return this.generateResponse(memoizedContent, options);
            }
            return Base.prototype.sync.call(this, method, model, options);
        },

        memoizeContent: function(content, fetchOptions) {
            var prefix = this.getMemoizationPrefix(fetchOptions);
            fetchCache[prefix + content.pivotSearch] = content;
            fetchCache[prefix + content.pivotJson] = content;
        },

        getMemoizedContent: function(fetchOptions) {
            var prefix = this.getMemoizationPrefix(fetchOptions),
                fetchData = fetchOptions.data;

            if(fetchData.pivot_search) {
                return fetchCache[prefix + fetchData.pivot_search];
            }
            return fetchCache[prefix + fetchData.pivot_json];
        },

        generateResponse: function(content, options) {
            var fullPayload = {
                entry: [
                    {
                        content: {
                            pivot_search: content.pivotSearch,
                            pivot_json: content.pivotJson,
                            tstats_search: content.tstatsSearch,
                            search: content.search,
                            open_in_search: content.openInSearch,
                            drilldown_search: content.drilldownSearch
                        }
                    }
                ]
            };
            var dfd = $.Deferred().resolve().promise();
            this.trigger('request', this, dfd, options);
            options.success(fullPayload);
            return dfd;
        },

        getMemoizationPrefix: function(fetchOptions) {
            var fetchData = fetchOptions.data || {},
                modelJson = fetchData.modelJson || fetchData.model_json;

            if(modelJson) {
                var modelName = '';
                try {
                    modelName = JSON.parse(modelJson).modelName || '';
                }
                catch(e) {}
                return modelName + '-' + (fetchData.namespace || '') + '-';
            }
            return fetchOptions.url + '-' + (fetchData.namespace || '') + '-';
        }

    },
    {

        // for testing only
        clearCache: function() {
            fetchCache = {};
        }

    });

});