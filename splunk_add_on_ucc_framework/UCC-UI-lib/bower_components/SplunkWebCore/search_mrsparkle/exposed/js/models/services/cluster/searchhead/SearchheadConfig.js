define([
    'models/SplunkDBase'
],
function(SplunkDBaseModel) {
    return SplunkDBaseModel.extend({
        urlRoot: "cluster/searchhead/searchheadconfig/",
        url: "cluster/searchhead/searchheadconfig/",
        initialize: function() {
            SplunkDBaseModel.prototype.initialize.apply(this, arguments);
        },
        encodeName: function(name){
            //cant simply encode this. backend uses specialized encoding rules
            name = name || this.entry.get('name');
            name = name.replace('://', '%3A%252F%252F');
            name = name.replace(/:/g,'%3A');
            name = name.replace(/\[/g,'%5B');
            name = name.replace(/\]/g,'%5D');
            return name;
        },
        defaults: {
            'ui.host': '',
            'ui.port': '',
            'ui.secret': null
        },
        transposeToRest: function() {
            this.entry.set('name', this.get('ui.master_uri'));
            this.entry.content.set('name', this.get('ui.master_uri'));
            this.entry.content.set('master_uri', this.get('ui.master_uri'));
            this.entry.content.set('secret',  this.get('ui.secret'));
        },
        transposeFromRest: function() {
            var indexOfPort,port,host;
            var masteruri = this.entry.get('name');
            var secret = this.entry.content.get('secret');
            if(typeof masteruri === 'string' && masteruri.lastIndexOf(':') > 0){
                indexOfPort = masteruri.lastIndexOf(':');
                port = masteruri.substring(indexOfPort+1);
                host = masteruri.substring(0, indexOfPort);
            }

            var attr = {
                'ui.host': host,
                'ui.port': port,
                'ui.secret': secret
            };

            this.set(attr);
        }
    });
});