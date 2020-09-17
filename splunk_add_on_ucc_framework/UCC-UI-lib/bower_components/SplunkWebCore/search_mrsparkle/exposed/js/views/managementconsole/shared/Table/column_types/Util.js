define([
    'underscore',
    'jquery',
    'splunk.util'
], function (_, $, splunkUtil) {

    var enabledTPL = _.template('<a href="#" class="<%- className %>" data-no="<%- no %>" data-fires="<%- fires %>" title="<%- label %>"><%- label %></a>');
    var disabledTPL = _.template('<span><%- label %></span>');

    var getLink = function (linkConfig, model, count, totalCounter, tplArgs, displayWhenDisabled) {
        // by default it is always enabled
        var options = {
            className: '',
            no: '',
            fires: '',
            label: '',
            enabled: true
        };
        $.extend(true, options, linkConfig, tplArgs, {no: count});
        var isEnabled = !_.isUndefined(options.enabled) ? options.enabled : true;
        displayWhenDisabled = !!displayWhenDisabled;

        // evaluate value for functions
        if (_.isFunction(isEnabled)) {
            isEnabled = isEnabled(linkConfig, model, count, totalCounter);
        }

        if (splunkUtil.normalizeBoolean(isEnabled)) {
            return enabledTPL(options);
        }
        if (displayWhenDisabled) {
            return disabledTPL(options);
        }
        return '';
    };

    var getValueUsingComplexKey = function (model, key) {
        if (!key) return void 0;
        if (key.indexOf('!') === 0 || key.indexOf('.') === -1) {
            return model.get(key);
        }
        var items = key.split('.');
        var obj = items.shift();
        if (_.has(model, obj)) {
            return getValueUsingComplexKey(model[obj], items.join('.'));
        } else if (model.has(obj)) {
            return getValueUsingComplexKey(model.get(obj), items.join('.'));
        } else if (obj === 'model' && items[0] in model && _.isFunction(model[items[0]])) {
            // cannot use _.has because the property may
            // not necessary belong to the model but base model.
            return model[items[0]].apply(model);
        }
        return void 0;
    };

    return {
        getValueUsingComplexKey: getValueUsingComplexKey,
        getLink: getLink
    };
});
