define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/SplunkDBase',
        'models/shared/fetchdata/EAIFetchData',
        'collections/Base',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        Backbone,
        SplunkDBaseModel,
        EAIFetchData,
        Base,
        splunkDUtils
    )
    {
        /**
         * @constructor
         * @memberOf collections
         * @name SplunkDsBase
         * @extends {collections.Base}
         */
        return Base.extend(/** @lends collections.SplunkDsBase.prototype */{
            model: SplunkDBaseModel,
            initialize: function(models, options) {
                options = options || {};
                options.fetchData = options.fetchData || new EAIFetchData();
                Base.prototype.initialize.call(this, models, options);
                this.initializeAssociated();
            },
            initializeAssociated: function() {
                this.links = this.links || new SplunkDBaseModel();
                this.paging = this.paging || new SplunkDBaseModel();
            },
            fetch: function(options) {
                return Base.prototype.fetch.call(this, $.extend(true, {}, { reset: true }, options));
            },
            sync: function(method, collection, options) {
                options = options || {};
                var bbXHR, url,
                    defaults = {data: {output_mode: 'json'}, traditional: true};

                switch (method) {
                    case 'read':
                        if((window.$C['SPLUNKD_FREE_LICENSE'] || options.isFreeLicense) && collection.FREE_PAYLOAD) {
                            if(options.success) {
                                options.success(collection, collection.FREE_PAYLOAD, options);
                            }
                            var dfd = $.Deferred();
                            return dfd.resolve.apply(dfd, [collection, collection.FREE_PAYLOAD, options]);
                        }
                        url = _.isFunction(collection.url) ? collection.url() : collection.url;
                        var appOwner = this.getAppOwner(options);
                        defaults.url = splunkDUtils.fullpath(url, appOwner);
                        $.extend(true, defaults, options);

                        delete defaults.data.app;
                        delete defaults.data.owner;
                        delete defaults.data.sharing;

                        return Backbone.sync.call(this, "read", collection, defaults);
                    default:
                        throw new Error('invalid method: ' + method);
                }
            },
            parse: function(response){
                // Make sure to initialize the associated (if they already exist this call will do nothing).
                // There are cases where parse can be called before initialize.
                this.initializeAssociated();
                this.links.set(response.links);
                delete response.links;
                if (response.paging) {
                    this.paging.set(response.paging);
                    // TODO: clean up after the paging gets added, and update any consumers of this information
                    // delete response.paging;
                }

                var results = response.entry,
                    header = $.extend(true, {}, response);
                delete header.entry;

                return _.map(results, function(result) {
                    var container = $.extend(true, {}, header);
                    container.entry = [$.extend(true, {}, result)];
                    return container;
                });
            },
            setFromSplunkD: function(payload, options){
                // have to use parse=true or the reset won't work correctly
                this.reset(payload, $.extend({parse: true}, options));
            },
            findByEntryName: function(name) {
                return this.find(function(model) {
                    return model.entry.get('name') === name;
                });
            },
            getAppOwner: function(options) {
                var appOwner = {};
                if(options.data){
                    appOwner = $.extend(appOwner, { //JQuery purges undefined
                        app: options.data.app || undefined,
                        owner: options.data.owner || undefined,
                        sharing: options.data.sharing || undefined
                    });
                }
                return appOwner;
            }
        }, {
            // When fetching with user equal to wildcard adding this string to the search param will 
            // limit results to items shared with or created by the owner.
            availableWithUserWildCardSearchString: function(owner) {
                return '((eai:acl.sharing="user" AND eai:acl.owner=' + splunkDUtils.quoteSearchFilterValue(owner) + ') OR (eai:acl.sharing!="user"))';
            }
        });
    }
);
