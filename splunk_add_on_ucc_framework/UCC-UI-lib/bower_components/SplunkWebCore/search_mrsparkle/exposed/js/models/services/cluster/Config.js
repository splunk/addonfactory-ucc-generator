define(
    [
        'jquery',
        'underscore',
        'models/StaticIdSplunkDBase'
    ],
    function($, _, BaseModel){
        return BaseModel.extend({
            url: 'cluster/config',
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            defaults: function() {
               var baseDefaults = BaseModel.prototype.defaults.apply(this, arguments);
                
               return _.extend(
                   {},
                   baseDefaults,
                   {
                       'ui.master_uri': '',
                       'ui.secret': ''
                   }
               );             
            },
            transposeToRest: function() {
                this.entry.content.set('master_uri', this.get('ui.master_uri'));
                this.entry.content.set('secret', this.get('ui.secret'));
                this.entry.content.set('replication_factor', this.get('ui.replication_factor'));
                this.entry.content.set('search_factor', this.get('ui.search_factor'));
                this.entry.content.set('replication_port', this.get('ui.replication_port'));
                this.entry.content.set('mode', this.get('ui.mode'));
                this.entry.content.set('cluster_label', this.get('ui.cluster_label'));
            },
            transposeFromRest: function() {
                var masteruri = this.entry.content.get('master_uri');
                (masteruri != '?') || (masteruri = 'https://'); // SPL-89869 - by default the 'host' value is a question mark, which doesn't help anything.

                var attr = {
                    'ui.master_uri': masteruri,
                    'ui.secret': this.entry.content.get('secret'),
                    'ui.replication_factor': this.entry.content.get('replication_factor'),
                    'ui.search_factor': this.entry.content.get('search_factor'),
                    'ui.replication_port': this.entry.content.get('replication_port'),
                    'ui.cluster_label': this.entry.content.get('cluster_label')
                };

                this.set(attr);
            }
        },
        {
            id: 'cluster/config/config'
        });
    }
);
