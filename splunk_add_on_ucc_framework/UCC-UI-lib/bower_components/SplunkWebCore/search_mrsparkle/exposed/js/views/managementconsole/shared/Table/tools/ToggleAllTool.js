define([
    'jquery',
    'underscore',
    'backbone',
    'views/managementconsole/shared/ExpandAllToggle'
], function (
    $,
    _,
    Backbone,
    ExpandAllToggle
) {
    var ToggleAllTool = ExpandAllToggle.extend({
        className: 'control toggle-all-tool tool',
        toggleExpansion: function () {
            this.options.radio.trigger('toggleRows', !!this.getValue());
        }
    });
    return ({
        toolbarItems: {
            toggleAll: 'initializeToggleAll'
        },
        initializeToggleAll: function (config) {
            _.defaults(config, {
                attachTo: '.toolbar1',
                initialState: 'collapsed'
            });

            var localModel = new Backbone.Model();
            localModel.set('isExpanded', config.initialState === 'collapsed' ? false: true);

            var settings = {
                model: localModel,
                modelAttribute: 'isExpanded',
                label: '',
                radio: this.radio
            };
            _.extend(settings, config);

            this.children[config.type] = new ToggleAllTool(settings);
        }
    });
});