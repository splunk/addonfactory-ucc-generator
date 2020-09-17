define([
            'underscore',
            'module',
            'views/shared/DropDownMenu',
            'util/datamodel/field_icon_utils'
        ],
        function(
            _,
            module,
            DropDownMenu,
            fieldIconUtils
        ) {

    return DropDownMenu.extend({

        moduleId: module.id,

        initialize: function() {
            this.options.labelIcon = 'plus-circle icon-no-underline';
            this.options.className = 'dropdown';
            this.options.anchorClassName = '';
            this.options.popdownOptions = { detachDialog: true };
            _(this.options.items).each(function(item) {
                item.icon = fieldIconUtils.fieldIconClassByType(item.type);
                item.label = item.displayName;
            }, this);
            DropDownMenu.prototype.initialize.call(this, this.options);
        }

    });

});