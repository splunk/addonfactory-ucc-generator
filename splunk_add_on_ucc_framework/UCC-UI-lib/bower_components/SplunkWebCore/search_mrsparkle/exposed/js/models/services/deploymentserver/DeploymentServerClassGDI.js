define(
    [
        'underscore',
        'models/services/deploymentserver/DeploymentServerClass',
        'util/splunkd_utils'
    ],
    function(
        _,
        DeploymentServerClassModel,
        splunkDUtils
    ) {
        /*
        This is a wrapper around the deploymentServerClass for the AddData workflow
         */

        var deploymentServerClassGDI;
        deploymentServerClassGDI = DeploymentServerClassModel.extend({
            transposeToRest: function () {
                this.FIELD_PREFIX = 'ui.';
                var newAttrs = {};
                for (var attr in this.attributes) {
                    if (attr.indexOf(this.FIELD_PREFIX) === 0) {
                        var val = this.get(attr);
                        if (val === null || val === '') {
                            continue;
                        }
                        newAttrs[attr.substring(this.FIELD_PREFIX.length)] = val;
                    }
                }
                this.entry.content.set(newAttrs, {silent: true});
                _.each(this.get('fwders'), function (item, ix) {
                    var key = 'whitelist.' + ix;
                    this.entry.content.set(key, item);
                }.bind(this));
            },
            validation: {
                'ui.name': [
                    {
                        fn: 'checkGroupName'
                    }
                ],
                'fwders': [
                    {
                        fn: 'checkForwarders'
                    }
                ],
                'group': [
                    {
                        fn: 'checkGroup'
                    },
                    {
                        fn: 'checkForwarders'
                    }
                ]
            },

            checkGroup: function () {
                if (this.get('viewBy') === 'existing') {
                    if (_.isUndefined(this.get('group')) || (this.get('group') === '')) {
                        return _('Server class must be selected.').t();
                    }
                }
            },

            checkGroupName: function () {
                if (this.get('viewBy') === 'new') {
                    if (_.isUndefined(this.get('ui.name'))) {
                        return _('Server class name is required.').t();
                    }
                }
            },

            checkForwarders: function () {
                var fwders = [];
                if (this.get('viewBy') === 'new') {
                    fwders = this.get('fwders');
                    if (_.isUndefined(fwders) || !fwders.length) {
                        return _('At least one forwarding host must be selected.').t();
                    }
                } else if (this.get('viewBy') === 'existing') {
                    fwders = this.get('fwders');
                    if (_.isUndefined(fwders) || !fwders.length) {
                        return _('Server class must contain at least one forwarding host.').t();
                    }
                }

                var hasWindows = false,
                    hasOther = false;
                var isNonuniform = _.find(fwders, function(fwder) {
                    // Check if fwder oses are uniform
                    var fwdProps = this.associated.deploymentClientsCollection.getClientDetails(fwder);
                    if (fwdProps) {
                        if (fwdProps.os.toLowerCase().indexOf('windows') === 0) {
                            hasWindows = true;
                        } else {
                            hasOther = true;
                        }
                        return (hasWindows && hasOther);
                    }
                }.bind(this));
                if (isNonuniform) {
                    return _('Forwarders from different operating systems cannot be combined.').t();
                } else {
                    this.set('fwdGroupIsWindows', hasWindows);
                }
            },

            _onerror: function(collection, response, options) {
                // Remove 'In handler' prefix from server messages
                var messages = splunkDUtils.xhrErrorResponseParser(response, this.id);

                _.each(messages, function(msgObj) {
                    var msg = msgObj.message;
                    if (msg) {
                        var res = msg.match(/: serverclass=(.+)\salready exists/);
                        if (res) {
                            msgObj.message = 'Server Class "'+res[1]+'" already exists. Please provide a unique name, or choose "'+res[1]+'" from the list of existing server classes.';
                        }

                    }
                });

                this.trigger('serverValidated', false, this, messages);
            }
        });

        return deploymentServerClassGDI;
    }
);

