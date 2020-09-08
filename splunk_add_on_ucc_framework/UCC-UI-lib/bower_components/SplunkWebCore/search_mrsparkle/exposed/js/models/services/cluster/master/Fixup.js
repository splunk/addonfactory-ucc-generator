/**
 * Created by ykou on 4/30/14.
 */
define(
    [
        'models/StaticIdSplunkDBase'
    ],
    function(BaseModel){
        return BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            }
            /* There are six model names:
             'checksum_sync'
             'data_safety'
             'generation'
             'replication_factor'
             'search_factor'
             'streaming'
             */
            /*
            getName: function() {
                return this.entry.get('name');
            },
            // return an array of bucket names based on index name
            // if 'name' parameter is null, then return all
            getBucketNames: function(name) {
                var allAttrs = this.entry.content.omit('eai:acl'); // get all attributes
                if (!(name || allAttrs)) { return allAttrs; }

                var re = new RegExp('^' + name); // use this regex to find bucket by name
                var buckets = [];

                for (var attr in allAttrs) {
                    if (allAttrs.hasOwnProperty(attr) && re.test(attr)) {
                        buckets.push(attr);
                    }
                }
                return buckets;
            }
            */
        },
        {
            id: 'cluster/master/fixup'
        });
    }
);
