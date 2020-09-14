define([
            'jquery',
            'underscore',
            'module',
            'views/shared/controls/SyntheticSelectControl'
        ],
        function(
            $,
            _,
            module,
            SyntheticSelectControl
        ) {

    var ITEMS_TEMPLATE = [
        {
            label: _('Sequential').t(),
            value: 'sequential',
            description: _('Choose this to show the distribution of a variable across a geographic region.').t()
        },
        {
            label: _('Divergent').t(),
            value: 'divergent',
            description: _('Choose this to show how much a variable is above or below a neutral point.').t()
        },
        {
            label: _('Categorical').t(),
            value: 'categorical',
            description: _('Choose this to color areas of your maps according to different distinct categories.').t()
        }
    ];

    var ITEM_AUTODETECTED_LABEL = {
        sequential: _('Sequential (Recommended)').t(),
        divergent: _('Divergent (Recommended)').t(),
        categorical: _('Categorical (Recommended)').t()
    };

    return SyntheticSelectControl.extend({

        moduleId: module.id,

        initialize: function() {
            this.options.items = this._computeItems();
            SyntheticSelectControl.prototype.initialize.call(this, this.options);
        },

        startListening: function() {
            SyntheticSelectControl.prototype.startListening.apply(this, arguments);
            this.listenTo(this.model, 'change:autoDetectedColorMode', function() {
                this.setItems(this._computeItems());
            });
        },

        _computeItems: function() {
            var computedItems = $.extend(true, [], ITEMS_TEMPLATE);
            var autoDetectedColorMode = this.model.get('autoDetectedColorMode');
            var matchingItem = _(computedItems).findWhere({ value: autoDetectedColorMode });
            if (!matchingItem) {
                return computedItems;
            }
            matchingItem.label = ITEM_AUTODETECTED_LABEL[autoDetectedColorMode];
            matchingItem.value = 'auto';
            return _([matchingItem]).union(computedItems);
        }

    });

});
