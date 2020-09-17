define([
    'underscore',
    'models/Base',
    'backbone',
    'splunk.util',
    'util/math_utils'
], function (
    _,
    BaseModel,
    Backbone,
    splunkUtils,
    mathUtils
) {
    return BaseModel.extend({
        idAttribute: 'name',
        defaults: {
            name: '',
            server: '',
            autoLBFrequency: '',
            useACK: '',
            maxQueueSize: '',
            selectedDefaultGroup: '',
            serverclass: ''
        },
        validation: {
            name: {
                required: true
            },
            server: {
                required: true
            },
            autoLBFrequency: {
                fn: function (val, attr, obj) {
                    if (_.isEmpty(val)) {
                        return false;
                    }
                    if (mathUtils.isInteger(val) && parseInt(val, 10) > 0) {
                        return false;
                    }
                    return _('{label} needs to be an integer greater than 0.').t();
                }
            },
            serverclass: {
                fn: function (val, attr, obj) {
                    // server class
                    if (obj.selectedDefaultGroup === 'custom' && _.isEmpty(obj.serverclass)) {
                            return _('Select a server class').t();
                    }
                    return false;
                }
            }
        },
        initialize: function (options) {
            BaseModel.prototype.initialize.apply(this, arguments);

            this.originalModel = options.originalModel;

            if (!options.originalModel.isNew()) {
                this.copyFromOriginalModel();
            }
        },

        copyFromOriginalModel: function () {
            var obj = {};
            obj.name = this.originalModel.entry.get('name');
            obj.server = (_.isArray(this.originalModel.entry.content.get('server')) ?
                this.originalModel.entry.content.get('server').join(',') :
                '');
            obj.autoLBFrequency = this.originalModel.entry.content.get('autoLBFrequency');
            obj.useACK = this.originalModel.entry.content.get('useACK');
            obj.maxQueueSize = this.originalModel.entry.content.get('maxQueueSize');

            var defaultGroup = this.originalModel.entry.content.get('@inDefaultGroup');
            var belongsToType = this.originalModel.entry.acl.get('@bundleType');
            var belongsToId = this.originalModel.entry.acl.get('@bundleId');
            if (belongsToType === 'builtin' && belongsToId === 'forwarders') {
                // the group is created under forwarders;
                // you get multiple options in defaultGroup
                var types =  _.pluck(defaultGroup, '@bundleType');
                var isHomogeneousType = _.every(types, function (item) { return types[0] === item; });
                if (isHomogeneousType) {
                    if (defaultGroup[0] && defaultGroup[0]['app'] === '__forwarders') {
                        obj.selectedDefaultGroup = '__forwarders';
                    } else {
                        obj.selectedDefaultGroup = defaultGroup[0] && defaultGroup[0]['@bundleType'] || '';
                    }
                    obj.bundle = splunkUtils.fieldListToString(_.pluck(defaultGroup, 'app'));
                    if (obj.selectedDefaultGroup === 'custom') {
                        obj.serverclass = obj.bundle;
                        obj.serverclassLabels = _.pluck(defaultGroup, '@bundleId').join(',');
                    }
                }
            } else {
                // you get only 2 options for default Group
                if (_.isEmpty(defaultGroup)) {
                    obj.selectedDefaultGroup = '';
                } else {
                    obj.selectedDefaultGroup = this.originalModel.entry.acl.get('app');
                }
                obj.bundleValue = obj.bundle = this.originalModel.entry.acl.get('app');
                obj.bundleLabel = belongsToId;
            }
            this.set(obj);
        },

        saveToOriginalModel: function () {
            var value;
            var entry = this.originalModel.entry;
            entry.set('name', this.get('name'));

            // server has to be an array
            value = this.get('server');
            value = _.isEmpty(value) ? '' : value.split(',');
            this.setValue(entry.content, 'server', value);

            value = this.get('useACK');
            if (value === 0 || value === 1) {
                value = "" + !!value;
                this.setValue(entry.content, 'useACK', value);
            }

            // value is validated to be an integer greater than 0
            value = this.get('autoLBFrequency');
            if (_.isEmpty(value)) {
                entry.content.unset('autoLBFrequency');
            } else if (mathUtils.isInteger(value) && parseInt(value, 10) > 0) {
                value = parseInt(value, 10);
                entry.content.set('autoLBFrequency', value);
            }

            this.setValue(entry.content, 'maxQueueSize', this.get('maxQueueSize'));

            value = this.get('selectedDefaultGroup');
            var newDefaultGroup = null;
            var currentDefaultGroup = _.pluck(entry.content.get('@inDefaultGroup'), 'app');

            if (_.isEmpty(value) ) {
                newDefaultGroup = [];
            } else if (value === 'custom') {
                // copy from serverclass, expects array
                newDefaultGroup = splunkUtils.stringToFieldList(this.get('serverclass'));
            } else {
                // takes selectedDefaultGroup value, expects an array.
                newDefaultGroup = value.split(',');
            }

            if (!this.originalModel.isNew() && _.isEqual(newDefaultGroup, currentDefaultGroup)) {
                entry.content.unset('@inDefaultGroup');
            } else {
                entry.content.set('@inDefaultGroup', newDefaultGroup);
            }
        },

        setValue: function (model, attr, value) {
            if (_.isEmpty(value)) {
                model.unset(attr);
            } else {
                model.set(attr, value);
            }
        }

    });
});
