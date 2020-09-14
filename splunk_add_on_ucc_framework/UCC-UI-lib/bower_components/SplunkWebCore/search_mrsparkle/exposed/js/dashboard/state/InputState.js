define(['underscore', './ItemState'], function(_, ItemState) {

    return ItemState.extend({
        idAttribute: 'id',
        setState: function(input, options) {
            options || (options = { tokens: true });
            var settings = _.pick(
                input.settings.toJSON(options),
                "type", "token", "searchWhenChanged", "label", "choices", "labelField", "valueField", "managerid",
                "default", "prefix", "suffix", "seed", "initialValue", "valuePrefix", "valueSuffix", "delimiter");
            ItemState.prototype.setState.call(this, settings);
        }
    });
});
