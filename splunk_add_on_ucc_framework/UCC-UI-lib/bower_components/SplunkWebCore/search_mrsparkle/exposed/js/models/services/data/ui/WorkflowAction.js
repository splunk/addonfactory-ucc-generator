define(
    [
        'jquery',
        'backbone',
        'underscore',
        'models/SplunkDBase',
        'util/general_utils',
        'splunk.util'
    ],
    function($, Backbone, _, SplunkDBaseModel, generalUtils, splunkUtil) {
        var RAW_REX = /\$_raw\$/g;
        return SplunkDBaseModel.extend({
            url: "data/ui/workflow-actions",
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            },
            /**
             *  $field$ 
             */
            fieldSubstitute: function(key, text, data, fieldName, fieldValue) {
                var regex = /\$([\s\S]+?)\$/g,
                    $matches$ = text.match(regex),
                    templateVars = {};
                
                if ($matches$) {
                    _($matches$).each(function($string$) {
                        var realMatch = $string$.match(/\$([\s\S]+?)\$/)[1],
                            encodeValue = realMatch.charAt(0) !== "!",
                            match = encodeValue ? realMatch : realMatch.substring(1),
                            matchValue = match === fieldName ? fieldValue : data[match];
                        
                        if (match == "_raw" && typeof matchValue === "object") {
                            // _raw field is an object
                            // if it is an array use the first element else use field.value
                            // ref: getRawText implementation in Result.js
                            matchValue = _.isArray(matchValue) ? matchValue[0]: matchValue.value;
                        }
                        if (!matchValue) {
                            //underscore templates will raise if the value to be replaced
                            //is undefined.  Like 5.0, we will strip out $ delimited values
                            //if they do not exist in event. 
                            text = text.replace($string$, '');
                        } else {
                            if (_.isArray(matchValue)) {
                                matchValue = matchValue[0];
                            }
                            
                            //all of the field values come back as arrays
                            //we don't not support anything other than the first value
                            if (key === "link.uri") {
                                templateVars[match] = encodeValue ? encodeURIComponent(matchValue) : matchValue;
                            } else {
                                templateVars[match] = splunkUtil.escapeQuotes(splunkUtil.escapeBackslash(matchValue));
                            }
                        }
                    }, this);
                }
                return text.replace(regex, function($match$) {
                    var realMatch = $match$.match(/\$([\s\S]+?)\$/)[1],
                        match = realMatch.charAt(0) !== "!" ? realMatch : realMatch.substring(1);
                    return templateVars[match];
                });
            },
            /**
             * $@sid$ $@offset$, $@namespace$, $@latest_time$, $@field_name$, $@field_value$ 
             */
            systemSubstitute: function(key, text, sid, offset, namespace, latest_time, fieldName, fieldValue) {
                var settings = {
                        interpolate: /\$@([\s\S]+?)\$/g
                    },
                    encodeValue = key === "link.uri" ,
                    data = {
                        sid: encodeValue && sid ? encodeURIComponent(sid): sid,
                        offset: encodeValue && offset ? encodeURIComponent(offset): offset,
                        namespace: encodeValue && namespace ? encodeURIComponent(namespace): namespace,
                        latest_time: encodeValue && latest_time ? encodeURIComponent(latest_time): latest_time,
                        field_name: encodeValue && fieldName ? encodeURIComponent(fieldName): fieldName,
                        field_value: encodeValue && fieldValue ? encodeURIComponent(fieldValue): fieldValue
                    };
                return _.template(text, data, settings);
            },
            isInFieldMenu: function() {
                return (this.entry.content.get('display_location') != 'event_menu');
            },
            isInEventMenu: function() {
                return (this.entry.content.get('display_location') != 'field_menu');
            },
            isRestrictedByPresenceOfAllFields: function(event) {
                var requiredFields = _(this.entry.content.get('fields').split(',')).map(function(field) {
                    return $.trim(field);
                }, this);
                var existingFields = _(event.toJSON()).keys();
                return !generalUtils.isFuzzySubset(requiredFields, existingFields);
            }, 
            isRestrictedByEventtype: function(event) {
                var requiredEventTypes = this.entry.content.has('eventtypes') ?
                    _(this.entry.content.get('eventtypes').split(',')).map(function(eventType) {
                        return $.trim(eventType);
                    }, this) :
                    [];
                var existingEventTypes = event.has('eventtype') ? event.get('eventtype') : [];
                return !generalUtils.isFuzzySubset(requiredEventTypes, existingEventTypes);
            }
        });
    }
);
