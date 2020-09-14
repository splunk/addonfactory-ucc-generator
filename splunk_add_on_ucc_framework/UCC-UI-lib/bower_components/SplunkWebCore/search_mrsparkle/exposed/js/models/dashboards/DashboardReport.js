define(function(require){
    var Report = require('models/search/Report');
    var Dashboard = require('splunkjs/mvc/simplexml/controller');
    var Mapper = require('splunkjs/mvc/simplexml/mapper');
    var console = require('util/console');
    var TokenAwareModel = require('splunkjs/mvc/tokenawaremodel');

    var DashboardReport = Report.extend({
        initialize: function() {
            Report.prototype.initialize.apply(this, arguments);
        },
        saveXML: function(options) {
            var id = this.entry.content.get('display.general.id');
            console.log('[%o] Saving Panel Element XML...', id);
            return Dashboard.model.view.updateElement(id, this.mapToXML(), options);
        },
        mapToXML: function(options) {
            var type = this.entry.content.get('display.general.type'), sub = ['display', type, 'type'].join('.');
            if(this.entry.content.has(sub)) {
                type = [type, this.entry.content.get(sub)].join(':');
            }
            console.log('Looking up mapper for type ', type);
            var mapper = Mapper.get(type);
            console.log('Found mapper', mapper);
            return mapper.toXML(this, options);
        },
        deleteXML: function() {
            return Dashboard.model.view.deleteElement(this.entry.content.get('display.general.id'));
        },
        fetch: function(options){
            var that = this;
            that.entry.content._applyTokensByDefault = false;
            that._fetching = true;
            var dfd = Report.prototype.fetch.call(this, options);
            dfd.always(function(){
                that.entry.content._applyTokensByDefault = true;
                that._fetching = false;
            });
            return dfd;
        },
        setFromSplunkD: function(payload, options){
            options || (options = {});
            if(this._fetching && options.tokens === undefined) {
                options.tokens = false;
            }
            return Report.prototype.setFromSplunkD.call(this, payload, options);
        },
        parse: function() {
            this.entry.content._applyTokensByDefault = false;
            var ret = Report.prototype.parse.apply(this, arguments);
            this.entry.content._applyTokensByDefault = true;
            return ret;
        }
    },{
        Entry: Report.Entry.extend({},{
            Content: TokenAwareModel.extend({
                applyTokensByDefault: true,
                clone: function(){
                    // When cloning the report content, return a plain model instead of a token-aware
                    return new Report.Entry.Content(this.toJSON());
                }
            })
        })
    });


    return DashboardReport;

});
