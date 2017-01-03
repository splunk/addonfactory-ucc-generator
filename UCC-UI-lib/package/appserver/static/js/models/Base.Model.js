import {getFormattedMessage} from 'app/util/messageUtil';

define([
    'jquery',
    'lodash',
    'app/models/ProxyBase.Model',
    'app/util/mixin',
    'app/mixins/WithDeepClone.Mixin'
], function (
    $,
    _,
    ProxyBase,
    Util,
    WithDeepClone
) {
    var BaseModel = ProxyBase.extend({
        initialize: function (attributes, options) {
            ProxyBase.prototype.initialize.call(this, attributes, options);
            options = options || {};
            this.targetCollection = options.targetCollection || this.collection;

            var targetApp, appMoveTo;

            // Just in case the proxyBase didn't set appData already
            if (options !== undefined) {
                if (options.appData !== undefined && !this.has('appData')) {
                    this.set('appData', options.appData);
                }

                if (!this.has('targetOwner')) {
                    if (options.targetOwner !== undefined) {
                        this.set("targetOwner", options.targetOwner);
                    }
                }
            }

            if (this.has('targetApp')) {
                targetApp = this.get('targetApp');
            } else {
                if (this.get('appData').targetApp !== undefined) {
                    targetApp = this.get('appData').targetApp;
                }
            }

            if (targetApp === '-') {
                console.error("targetApp should not be '-'");
            } else if (targetApp === undefined) {
                // Just in case proxyBase didnt do this
                targetApp = this.get('appData').app;
            }

            appMoveTo = targetApp;
            this.set("targetApp", targetApp);
            this.set("appMoveTo", appMoveTo);

            //Validation
            this.entry.content.validation = {
                'name': [this.nameValidator.bind(this)]
            };

            // setup Hooks
            this.validateFormData = options.validateFormData;
            this.widgetsIdDict = {};
            (options.fields || []).forEach(d => {
                this.widgetsIdDict[d.field] = `#${options.modelName}-${d.field}`;
            });
            if (options.shouldInvokeOnload) {
                this.on('sync', () => {
                    const {onLoad} = options;
                    if (onLoad) {
                        const formData = this.entry.content.toJSON();
                        onLoad(formData, this.widgetsIdDict);
                    }
                });
            }
        },
        clone: function () {
            var clone = ProxyBase.prototype.clone.apply(this, arguments),
                attrs = clone.entry.acl.attributes;

            // wah-wah.... rule#1 of backbone: model attributes should not be
            // mutables!
            attrs.perms = this.deepClone(attrs.perms);
            /*
             TODO: This is sort of a hack
             A better method would be to actually call the
             construtor when creating a new cloned object
             */
            clone.entry.content.validation = this.deepClone(this.entry.content.validation);


            // flag ourselves as a clone so our view might introspect.
            clone._isClone = true;

            // unset name and id attrs on entry... giving us an independent
            // clone
            clone.entry.unset("name", {silent: true});
            clone.entry.unset("id", {silent: true});
            clone.targetCollection = this.targetCollection;

            return clone;
        },

        isClone: function () {
            return !!this._isClone;
        },

        nameValidator: function (attr) {
            var value, matches;
            value = this.entry.content.attributes[attr];
            // name is immutable once created... at least as far as we're concerned
            if (!this.isNew()) {
                return undefined;
            }

            if (_.isUndefined(value)) {
                return getFormattedMessage(0);
            }

            if (_.isEmpty(value)) {
                return getFormattedMessage(0);
            }

            if (!_.isString(value)) {
                return getFormattedMessage(1);
            }

            if (this.targetCollection !== undefined) {
                matches = _.find(this.targetCollection.models, function (model) {
                    return model.entry.attributes.name === value;
                }.bind(this), this);
                if (matches !== undefined) {
                    return getFormattedMessage(2);
                }
            }

            if (_.startsWith(value, '_') || value === '.' || value === '..' || value.toLowerCase() === 'default') {
                return getFormattedMessage(3);
            }

            if (value.length >= 1024) {
                return getFormattedMessage(22);
            }
        },

        _getAttrLabel: function (attr) {
            var val = this.attr_labels[attr];
            if (val) {
                return val;
            }
            return attr;
        },

        getAttrLabel: function (attr) {
            return this._getAttrLabel(attr);
        },

        _all_validator: function (validator, attr) {
            var ret, fn;
            if (_.isFunction(validator)) {
                ret = validator(attr);
                if (ret) {
                    return ret;
                }
            } else if (_.isArray(validator)) {
                for (fn in validator) {
                    if (validator.hasOwnProperty(fn)) {
                        ret = this._all_validator(validator[fn], attr);
                        if (ret) {
                            return ret;
                        }
                    }
                }
            }
        },

        validate: function () {
            var validations = this.entry.content.validation,
                ret,
                name;
            if (!validations) {
                return;
            }

            for (name in validations) {
                if (validations.hasOwnProperty(name)) {
                    ret = this._all_validator(validations[name], name);
                    if (ret) {
                        return ret;
                    }
                }
            }

            if(this.validateFormData) {
                ret = this.validateFormData(this.entry.content.toJSON(), this.widgetsIdDict);
                if (typeof ret === 'string') {
                    return ret;
                }
            }
        },

        positiveNumberValidator: function (attr) {
            var ret = this.convertNumericAttr(attr);
            if (undefined === ret || isNaN(ret)) {
                return getFormattedMessage(5, this._getAttrLabel(attr));
            }
        },

        nonEmptyString: function (attr) {
            var val = this.entry.content.get(attr);
            if (!val || !String(val).replace(/^\s+|\s+$/gm, '')) {
                return getFormattedMessage(6, this._getAttrLabel(attr));
            }
        },

        addValidation: function (name, validator) {
            const {validation} = this.entry.content;
            if(!validation[name]) {
                validation[name] = [validator.bind(this)];
            } else {
                validation[name] = [...validation[name], validator.bind(this)];
            }
        },

        removeValidation: function (name) {
            delete this.entry.content.validation[name];
        },

        validRegexString: function (attr) {
            var val = this.entry.content.get(attr),
                regex,
                isValid;
            try {
                regex = new RegExp(val);
                if (regex !== undefined) {
                    isValid = true;
                }
            } catch (e) {
                isValid = false;
            }

            if (!isValid) {
                return getFormattedMessage(7, this._getAttrLabel(attr));
            }
        },

        emptyOr: function (furtherValidator) {
            return function (attr) {
                if (!this.nonEmptyString(attr)) {
                    return furtherValidator.bind(this)(attr);
                }
            }.bind(this);
        },

        validNumberInRange: function (start, end) {
            return function (attr) {
                var ret, val;
                ret = this.positiveNumberValidator(attr);
                if (ret) {
                    return ret;
                }

                val = this.convertNumericAttr(attr);
                if (_.isNumber(start) && _.isNumber(end)) {
                    if (val < start || val > end) {
                        return getFormattedMessage(8, this._getAttrLabel(attr), start, end);
                    }
                } else if (_.isNumber(start)) {
                    if (val < start) {
                        return getFormattedMessage(9, this._getAttrLabel(attr), start);
                    }
                } else if (_.isNumber(end)) {
                    if (val > end) {
                        return getFormattedMessage(10, this._getAttrLabel(attr), end);
                    }
                }
            }.bind(this);
        },

        getName: function () {
            return this.entry.get('name') || this.entry.content.get("name") || this.get('name');
        },
        jsonAttrs: [],
        nullableAttrs: [],
        nullStr: 'NULL',
        parse: function () {
            ProxyBase.prototype.parse.apply(this, arguments);

            var content = this.entry.content,
                raw,
                val;

            _.each(this.jsonAttrs, function (jsonAttr) {
                raw = content.get(jsonAttr);

                /*
                 Just in case something else already
                 parsed the json.
                 Splunkd base will turn "[]" into []
                 */
                if (_.isString(raw)) {
                    val = JSON.parse(raw);
                    content.set(jsonAttr, val);
                }

            }, this);

            _.each(this.nullableAttrs, function (attr) {
                if (content.get(attr) === '' || !content.has(attr)) {
                    content.set(attr, this.nullStr);
                }
            }, this);

            this.normalizeBooleanAttr('disabled');
        },
        sync: function (method, model, options) {
            var content = this.entry.content,
                val,
                jsonStr,
                targetApp,
                appMoveTo,
                syncDef,
                moveDef;

            if (method === "update" || method === "create") {
                _.each(this.jsonAttrs, function (jsonAttr) {
                    val = content.get(jsonAttr);
                    if (_.isArray(val) || _.isObject(val)) {
                        jsonStr = JSON.stringify(val);
                        /*
                         TODO:
                         Another way of doing this would be to set the
                         json str directly on the data that backbone
                         sends to the server.
                         This would be neccesary if we ever needed
                         to save the model, but not re-fetch immedietly.
                         */
                        content.set(jsonAttr, jsonStr, {silent: true});
                    } else {
                        console.warn(jsonAttr, " is not a string:", val);
                    }
                }, this);

                _.each(this.nullableAttrs, function (attr) {
                    if (content.get(attr) === this.nullStr) {
                        content.set(attr, '', {silent: true});
                    }
                }, this);
            }

            if (method === 'update') {
                targetApp = this.get('targetApp');
                appMoveTo = this.get('appMoveTo');

                if (appMoveTo !== undefined && appMoveTo !== targetApp) {
                    syncDef = $.Deferred();
                    moveDef = this.move();

                    moveDef.done(function () {
                        // update the appName so we can fetch again
                        // otherwise it will point to the old app name
                        // (the one before the move)
                        this.entry.content.set('eai:appName', appMoveTo);
                        this.entry.acl.set('app', appMoveTo);
                        this.set('targetApp', appMoveTo);

                        var proxyDef = ProxyBase.prototype.sync.call(this, method, model, options);
                        proxyDef.done(function () {
                            this.set('targetApp', appMoveTo);
                            syncDef.resolve.apply(syncDef, arguments);
                        }.bind(this));
                        proxyDef.fail(function () {
                            syncDef.reject.apply(syncDef, arguments);
                        });
                    }.bind(this));

                    moveDef.fail(function () {
                        syncDef.reject.apply(syncDef, arguments);
                    });

                    return syncDef;
                }
                return ProxyBase.prototype.sync.apply(this, arguments);
            }
            return ProxyBase.prototype.sync.apply(this, arguments);
        },
        getMoveUrl: function () {
            return this._getFullUrl() + "/move";
        },
        move: function () {
            var app, user;

            app = this.get("appMoveTo") || this.get("targetApp") || this.get("appData").app;
            user = this.get("targetOwner") || "nobody";

            return $.ajax({
                type: "POST",
                data: {
                    app: app,
                    user: user
                },
                url: this.getMoveUrl()
            });
        },
        enable: function () {
            return $.ajax({
                type: "POST",
                url: this._getFullUrl() + "/enable?output_mode=json"
            });
        },
        disable: function () {
            return $.ajax({
                type: "POST",
                url: this._getFullUrl() + "/disable?output_mode=json"
            });
        },
        normalizeBooleanAttr: function (attr) {
            var val = this.entry.content.get(attr);
            if (val !== undefined) {
                val = Splunk.util.normalizeBoolean(val);
                this.entry.content.set(attr, val);
            }
            return val;
        },
        convertNumericAttr: function (attr) {
            var val = this.entry.content.get(attr);
            if (val !== undefined) {
                val = Number(val);
                if (!isNaN(val)) {
                    this.entry.content.set(attr, val);
                }
            }
            return val;
        },
        toZeroBased: function (attr) {
            var val = this.entry.content.get(attr);

            // negative numbers and zero are out of range. -1 is used
            // by the backend and has special meaning
            if (_.isNumber(val) && val > 0) {
                val -= 1;
            }
            this.entry.content.set(attr, val);
            return val;
        },
        toOneBased: function (attr) {
            var val = this.entry.content.get(attr);

            // negative numbers are out of range. -1 is used
            // by the backend and has special meaning
            if (_.isNumber(val) && val >= 0) {
                val += 1;
            }
            this.entry.content.set(attr, val);

            return val;
        },
        getNumericAttr: function (attr) {
            var val = this.entry.content.get(attr);
            if (val !== undefined) {
                val = Number(val);

                if (isNaN(val)) {
                    return undefined;
                }
            }

            return val;
        },
        isDisabled: function () {
            // just in case, but it should be true|false
            var val = this.entry.content.get('disabled');
            return Splunk.util.normalizeBoolean(val);
        },
        //Make mixin an instance property so we can mixin dynamically
        mixin: Util.dynamicMixin
    }, {
        //make mixin a Class property so we can mixin using ClassName.mixin
        //at def time
        mixin: Util.modelMixin
    });

    BaseModel.mixin(WithDeepClone);

    return BaseModel;
});
