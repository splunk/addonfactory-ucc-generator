define([
    'jquery',
    'jquery.ui.dataview-backbone',
    'jquery.ui.widget', //no import
    'jquery.ui.dataview',
    'jquery.ui.grid',
    'jquery.ui.gird-sort',
    'jquery.ui.dataview',
    'jquery.ui.dataviewlocal'

],function($, backboneCollectionDataView ){

    $.widget( "ui.backboneCollectionDataView", $.ui.dataview, {
        // all dataview implementations share a common event prefix
        widgetEventPrefix: "dataview",
        options: {
            resource: null, //resource is a backbone-collection
            filter: null,
            baseFilter : null,
            sort: [],
            paging: {
                limit: null,
                offset: 0
            }
        },

        _create: function() {
            this.data = [];
            this.options.source = this.source.bind(this);//TODO might not want to use bind
        },
        isRequestInCache: function(data, offset, limit){
            //TODO optimize by returning a new offset/limit to caller if we dont need to fill in an entire set (limit)
            data = this.data || [];
            if(typeof data[offset] === 'undefined' || typeof data[offset+limit] === "undefined"){
                return false;
            }

            for(var i=1;i<limit;i++){
                if(typeof data[i+offset] === "undefined"){
                    return false;
                }
            }
            return true;
        },
        source: function(request, response) {
            var self = this;
            var baseParams = this.getReqParams();
            var offset = this.options.paging.offset;
            var limit = this.options.paging.limit;

            if(this.isRequestInCache(this.data, offset, limit)){
                var d = this.data.slice(offset, offset+limit);
                response(d, this.count);
            }else{
                var reqParams = $.extend({}, baseParams, {
                    success: function(resource){
                        self.convertResourceToData(resource, offset, limit);
                        var count = self.count = self.getTotalCount(resource);
                        var d = self.data.slice(offset, offset+limit);
                        response(d, count);
                    },
                    error: function(){
                        //TODO something here
                    }
                });
                request.resource.fetch(reqParams);
            }
        },

        convertResourceToData: function(collection, offset) {
            var self = this,
                i = 0;
            collection.each(function(model, index){
                var itemIndex = (i++)+offset;
                self.data[itemIndex] = model.attributes; //TODO is there a better way to grab all attributes?
                self.data[itemIndex].index = itemIndex;
            });
        },

        getTotalCount: function(collection) {
            var count = 0;
            if(collection.length>0){
                count = collection.at(0).get('total_count');
            }
            return count;
        },

        //this is here only for debug. TODO remove refresh overide
        refresh: function(callback, error){
            //this._super();

            //below copied from this._super()
            this._trigger( "request" );
            var request = $.extend( {}, this.options, {
                page: this.page()
            });

            var that = this;
            this.options.source( request, function( data, totalCount ) {
                that.totalCount = parseInt(totalCount, 10);
                //$.observable( that.result ).replaceAll( data );
                that.result = data;
                that._trigger( "response" );
                if (callback) {
                    callback.apply(that, arguments);
                }
            }, function () {
                if (error) {
                    error.apply(that, arguments);
                }
            });
            return this;
        },

        _setOption: function( key, value ) {
            //todo change all "key" ifs to a switch statement
            // reset offset to 0 when changing limit
            if (key === "paging" && value.limit !== this.options.paging.limit) {
                this.options.paging.offset = 0;
            }
            if (key === "sort" && value !== this.options.sort) {
                this.options.paging.offset = 0;
                this.data = [];
            }
            if(key == 'filter' && value !== this.options.filter){
                this.options.paging.offset = 0;
                this.getCount();
                this.data = [];
            }
            if(key == 'author' && value !== this.options.author){
                this.options.paging.offset = 0;
                this.data = [];
            }
            this._super( key, value );
        },
        getCount: function(){
            //purposely empty in this dataview implementation
        },
        page: function( pageIndex ) {
            var limit = this.options.paging.limit;
            if ( pageIndex !== undefined ) {
                this.option( "paging.offset", pageIndex * limit - limit );
                return this;
            }
            return Math.ceil( this.options.paging.offset / limit + 1 );
        },
        getReqParams: function(){
            var fetchParams = {
                data: {
                    count: this.options.paging.limit,
                    offset: this.options.paging.offset
                }
            };

            var search = [];
            //app
            if(this.options.app){
                search.push('eai:acl.app='+this.options.app);
            }

            //author
            if(this.options.author){
                search.push('eai:acl.owner='+this.options.author);
            }
            //search filter
            if(this.options.baseFilter){
                search.push(this.options.baseFilter);
            }
            if(this.options.defaultSearchFilterFieldName && this.options.filter){
                search.push(this.options.defaultSearchFilterFieldName + '=*' + this.options.filter + '*');
            }
            if(search.length > 0){
                fetchParams.data.search = search.join(' ');
            }

            if(this.options.sort[0]){
                fetchParams.data.sort_dir = this.options.sort[0].sort_dir;
                fetchParams.data.sort_key = this.options.sort[0].sort_key;
            }
            return fetchParams;
        }
    });

});









//TODO split out to new file
/* NOT USED leaving in for future reference
(function ($) {
    $.widget( "ui.searchPreviewDataView", $.ui.backboneCollectionDataView, {
        // all dataview implementations share a common event prefix
        widgetEventPrefix: "dataview",
        _create: function(){
            var self = this;
            this.jobId = $.Deferred();
            this.options.source = this.source.bind(this);//TODO might not want to use bind
            this.options.resultsBuilder.__job.on('change:sid', function(){
                self.jobId.resolve(self.options.resultsBuilder.__job.id);
            });
        },
        //TODO change this getCount function to count()
        getCount: function(){
            var dfd = $.Deferred();
            var self = this;
            var reqParams = $.extend({},this.getReqParams());
            this.jobId.done(function(jobId){
                reqParams.sid = jobId;
                reqParams.data.count = 1;
                reqParams.data.offset = 0;
                reqParams.data.search = reqParams.data.search || '';
                reqParams.data.search += '|stats count';
                reqParams.success = function(collection){

                    //console.log('collection TODO why does this fire twice', collection);

                    var count = collection.at(0).get('count');
                    self.options.totalCount = count;
                    dfd.resolve(count);
                };
                var resultsCount = new Splunk.models.SearchResultsPreviews();
                resultsCount.fetch(reqParams);
            });
            return dfd;
        },
        getReqParams: function(){
            var fetchParams = {
                data: {
                    count: this.options.paging.limit,
                    offset: this.options.paging.offset
                }
            };
            var searchStr = [];
            if(this.options.defaultSearchFilterFieldName && this.options.filter){
                searchStr.push('search '+ this.options.defaultSearchFilterFieldName + '=*' + this.options.filter + '*');
            }
            if(this.options.sort[0]){
                var sort = '|sort ';
                sort += this.options.sort[0].sort_dir == 'asc' ? '': '-';
                sort += this.options.sort[0].sort_key;
                searchStr.push(sort);
            }
            if(searchStr.length){
                fetchParams.data.search = searchStr.join(' ');
            }
            return fetchParams;
        },
        source: function(request, response) {
            var dataDfd = $.Deferred();
            var getReqParams = this.getReqParams();

            var reqParams = $.extend({}, getReqParams, {
                success: function(collection){
                    var data = [];
                    collection.each(function(model){
                        data.push(model.attributes); //TODO is there a better way to grab all attributes?
                    });
                    dataDfd.resolve(data);
                },
                error: function(){
                    //TODO something here
                }
            });
            request.resultsBuilder.getResults(reqParams);

            $.when( this.jobId, dataDfd, this.getCount() ).done(function(jobId, data, count){
                response(data, count);
            });

        }
    });
})(jQuery);

*/

/*
// TODO: should move this out to a new file
(function($) {

    $.widget( "ui.dataModelsDataView", $.ui.backboneCollectionDataView, {
        // all dataview implementations share a common event prefix
        widgetEventPrefix: "dataview",

        convertResourceToData: function(collection) {
            this.data = collection.toJSON();
        },

        getTotalCount: function(collection) {
            return collection.length;
        }

    });

})(jQuery);




// TODO: should move this out to a new file
(function($) {

    $.widget( "ui.dataModelObjectsDataView", $.ui.backboneCollectionDataView, {
        // all dataview implementations share a common event prefix
        widgetEventPrefix: "dataview",

        convertResourceToData: function(model) {
            this.data = model.getFlattenedHierarchy();
        },

        getTotalCount: function(model) {
            return model.getObjectCount();
        }

    });

})(jQuery);
    */