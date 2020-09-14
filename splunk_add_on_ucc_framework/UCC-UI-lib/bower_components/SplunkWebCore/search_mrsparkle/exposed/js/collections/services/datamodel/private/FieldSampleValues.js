define([
            'jquery',
            'collections/Base',
            'models/Base',
            'util/splunkd_utils'
        ],
        function(
            $,
            BaseCollection,
            BaseModel,
            splunkdUtils
        ) {

    var SampleValues = BaseModel.extend({

        idAttribute: 'fieldName',

        defaults: {
            limit: 10
        },

        sync: function(method, model, options) {
            if(method !== 'read') {
                throw new Error('sync method not supported: ' + method);
            }
            var baseUrl = 'search/jobs',
                ajaxData = $.extend(true, {}, options, {
                    data: {
                        exec_mode: 'oneshot',
                        output_mode: 'json_cols',
                        max_time: 30
                    },
                    type: 'POST',
                    dataType: 'json'
                });

            if(model.collection.tsidxNamespace) {
                ajaxData.data.search = '| tstats count from ' + model.collection.tsidxNamespace
                                                 + ' groupby ' + this.id + ' | sort limit=' + this.get('limit') + ' -count';
            }
            else {
                ajaxData.data.search = model.collection.baseSearch + ' | top ' + this.get('limit') + ' "' + this.id + '"';
            }

            return $.ajax(splunkdUtils.prepareSyncOptions(ajaxData, baseUrl));
        },

        parse: function(response) {
            var values = (response && response.columns && response.columns.length > 0 ) ? response.columns[0] : [];
            return { values: values };
        }

    });

    return BaseCollection.extend({

        model: SampleValues,

        initialize: function(models, options) {
            options = options || {};
            this.setBaseSearch(options.baseSearch);
            this.setTsidxNamespace(options.tsidxNamespace);
            BaseCollection.prototype.initialize.apply(this, arguments);
        },

        setBaseSearch: function(baseSearch) {
            this.baseSearch = baseSearch;
        },

        setTsidxNamespace: function(ns) {
            this.tsidxNamespace = ns;
        }

    });

});