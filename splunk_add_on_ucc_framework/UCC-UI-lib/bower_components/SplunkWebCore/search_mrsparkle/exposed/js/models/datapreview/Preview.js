/**
 *
 * This is an enriched model for Preview which extends the bare metal model services/indexing/Preview.
 * It provides:
 *  - categorization of attributes between explicit (set by user),
 *    preset (set by auto-detected sourcetype), or inherited by default
 *
 */
define(
    [
        'jquery',
        'underscore',
        'models/services/indexing/Preview',
        'splunk.util'
    ],
    function($, _, PreviewModel, splunkUtils, undefined) {
        return PreviewModel.extend({
            initialize: function() {
                PreviewModel.prototype.initialize.apply(this, arguments);

                // initialize local cache
                this.resetCache();

                // reset local cache whenever entry content attributes change (e.g. after fetch)
                this.entry.content.on('change', function() {
                    this.resetCache();
                }, this);
            },
            resetCache: function() {
                // clean up local cache
                this._propsExplicit = {};   // explicit props set by current sourcetype
                this._propsPreset = {};     // preset props from auto-detected sourcetype (if any)
                this._propsDefault = {};    // default props
                this._preferredSourcetype = undefined;
            },
            clear: function() {
                this.resetCache();
                return PreviewModel.prototype.clear.apply(this, arguments);
            },
            preview: function(inputFile, sid, sourcetypeOverride) {
                var attrs = {'input.path': inputFile};

                //use existing job in case of file upload, or hunk preview.
                if(sid){
                    attrs['job.id'] = sid;
                }

                if(sourcetypeOverride){
                    attrs['props.sourcetype'] = sourcetypeOverride;
                }

                // preview with explicit/preset props and override with any passed props
                var props = this.getProps('custom');
                _.each(props, function(value, key) {
                    // ignore undefined or null prop value
                    if (typeof value === undefined || value === null) return;

                    attrs['props.' + key] = value;
                });

                // Preview model does not support update. So clear model including
                // id property, so subsequent save translate to a create (POST)
                this.clear();

                return this.save({}, {data: attrs});
            },
            /**
             * Retrieves dictionary of props with respective values.
             * Caches results locally.
             *
             * @param {String} type Prop category (explicit/preset/default) or parent category (custom/inherited)
             *                           where custom=explicit+preset and inherited=preset+default
             * @return {Object} props Hash of requested props and values
             */
            getProps: function(type) {
                var props = this.entry.content.attributes,
                    preferredSourcetype = this.getPreferredSourcetype(),
                    preferredSourcetypeKey = this.constructor.PREFERRED_SOURCETYPE;

                if (type === "explicit" || type === "custom") {
                    if (_.isEmpty(this._propsExplicit)) {
                        this._propsExplicit = _.reduce(props.explicit, function(memo, propObj, prop) {
                            if (prop !== preferredSourcetypeKey) {
                                memo[prop] = propObj.value;
                            }
                            return memo;
                        }, {});
                    }
                }
                if (type === "preset" || type === "custom" || type == "inherited") {
                    if (_.isEmpty(this._propsPreset)) {
                        this._propsPreset = _.reduce(props.inherited, function(memo, propObj, prop) {
                            // props defined by auto-detected sourcetype are considered preset
                            // all others props are just inherited by the default sourcetype
                            if (propObj.stanza && propObj.stanza === preferredSourcetype) {
                                memo[prop] = propObj.value;
                            }
                            return memo;
                        }, {});
                    }
                }
                if (type === "default" || type == "inherited") {
                    if (_.isEmpty(this._propsDefault)) {
                        this._propsDefault = _.reduce(props.inherited, function(memo, propObj, prop) {
                            // inherited props are considered default props
                            // unless preset by auto-detected sourcetype (if any)
                            if (!propObj.stanza || propObj.stanza !== preferredSourcetype) {
                                memo[prop] = propObj.value;
                            }
                            return memo;
                        }, {});
                    }
                }

                switch (type) {
                    case "explicit":
                        return this._propsExplicit;
                    case "preset":
                        return this._propsPreset;
                    case "default":
                        return this._propsDefault;
                    case "custom":
                        return $.extend({}, this._propsPreset, this._propsExplicit);
                    case "inherited":
                        return $.extend({}, this._propsDefault, this._propsPreset);
                    default:
                        throw new Error('invalid props type: ' + type);
                }
            },
            /**
             * Sets/overwrites explicit props in entry's content explicit property.
             * Ignores props with same values as existing preset or inherited prop.
             * Will reset cache due to entry's content change listener.
             *
             * @param {String} newProps Hash of props and values to be set
             */
            setProps: function(newProps) {
                var attrsExplicitCloned = $.extend(true, {}, this.entry.content.attributes.explicit),
                    attrsInherited = this.getProps('inherited');

                _.each(newProps, function(value, key) {
                    // ignore prop if same value as an existing inherited prop (preset or default)
                    if (_.has(attrsInherited, key) && attrsInherited[key] === value) return;

                    if (_.has(attrsExplicitCloned, key)) {
                        attrsExplicitCloned[key].value = value;
                    } else {
                        attrsExplicitCloned[key] = {stanza: "", value: value};
                    }
                });
                this.entry.content.set('explicit', attrsExplicitCloned);
            },
            /**
             * Retrieves preferred sourcetype as auto-detected by splunkd.
             * Returns undefined if none found. Caches values locally.
             *
             * @return {String} sourcetype Sourcetype name auto-detected by splunkd
             */
            getPreferredSourcetype: function() {
                var props = this.entry.content.attributes,
                    propObj;

                if (typeof this._preferredSourcetype == "undefined") {
                    if (props && props.explicit) {
                        propObj = props.explicit[this.constructor.PREFERRED_SOURCETYPE];
                        this._preferredSourcetype = propObj && propObj.value;
                    }
                }
                return this._preferredSourcetype;
            }
        },
        {
            // constants
            PREFERRED_SOURCETYPE: 'PREFERRED_SOURCETYPE'
        });
    }
);