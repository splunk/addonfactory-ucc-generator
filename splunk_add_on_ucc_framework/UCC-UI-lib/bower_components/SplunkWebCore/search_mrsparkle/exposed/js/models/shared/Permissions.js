define(
    [
        'jquery',
        'underscore',
        'models/Base',
        'collections/SplunkDsBase',
        'splunk.util'
    ],
    function($, _, BaseModel, BaseCollection, splunkUtil) {
        var Permissions = BaseModel.extend({
                initialize: function() {
                    BaseModel.prototype.initialize.apply(this, arguments);
                },

                translateToPermsModel: function(options) {
                    var perms = options.perms || {},
                        rolesCollection = options.rolesCollection;
                    if(!rolesCollection || !rolesCollection instanceof BaseCollection){
                        return; //invalid input - do nothing
                    }
                    // add 'Everyone' attributes
                    this.set('Everyone.name', _('Everyone').t());
                    this.set('Everyone.read', _.indexOf(perms.read, '*')!=-1);
                    this.set('Everyone.write', _.indexOf(perms.write, '*')!=-1);

                    // add 'name', 'read' and 'write' attributes for each role
                    rolesCollection.each(function(roleModel, i){
                        var roleName = roleModel.entry.get("name"), j = i + 1;
                        this.set('role_' + j + '.name', roleName);
                        this.set('role_' + j + '.read', _.indexOf(perms.read, roleName)!=-1);
                        this.set('role_' + j + '.write', _.indexOf(perms.write, roleName)!=-1);
                    }, this);
                },
                translateFromPermsModel: function() {
                    var perms = {
                        read: [],
                        write: []
                    };

                    _(this.toJSON()).each(function(value, key){
                        var splitKey = key.split('.'),
                            role = splitKey[0],
                            type = splitKey[1];
                        if (type === 'read' || type === 'write') {
                            if (value) {
                                // can read or write
                                if(role === 'Everyone') {
                                    perms[type].push('*');
                                } else {
                                    perms[type].push(this.get(role + '.name'));
                                }
                            }
                        }
                    }.bind(this));

                    return perms;
                }
            });

        return Permissions;
    }
);
