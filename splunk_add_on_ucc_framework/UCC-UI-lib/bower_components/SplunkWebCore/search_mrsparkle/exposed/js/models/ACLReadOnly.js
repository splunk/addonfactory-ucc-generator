define(
    [
         'jquery',
         'underscore',
         'backbone',
         'models/Base',
         'util/splunkd_utils'
     ],
     function($, _, Backbone, BaseModel, splunkd_utils) {
        return BaseModel.extend({
            initialize: function(attributes, options) {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            permsToObj: function() {
                var perms = $.extend(true, {}, this.get('perms'));
                perms.read = perms.read || [];
                perms.write = perms.write || [];
                return perms;
            },
            toDataPayload: function() {
                var perms = this.permsToObj(),
                    data = {
                        sharing: this.get('sharing'),
                        owner: this.get('owner')
                    };

                if (data.sharing !== splunkd_utils.USER && perms.read.length !== 0) {
                    if (_.indexOf(perms.read, '*') != -1) {
                        data['perms.read'] = '*';
                    } else {
                        data['perms.read'] = perms.read.join(',');
                    }
                }

                if (data.sharing !== splunkd_utils.USER && perms.write.length !== 0) {
                    if (_.indexOf(perms.write, '*') != -1) {
                        data['perms.write'] = '*';
                    } else {
                        data['perms.write'] = perms.write.join(',');
                    }
                }

                return data;
            },
            canWrite: function() {
                return this.get('can_write');
            }
        });
    }
);
