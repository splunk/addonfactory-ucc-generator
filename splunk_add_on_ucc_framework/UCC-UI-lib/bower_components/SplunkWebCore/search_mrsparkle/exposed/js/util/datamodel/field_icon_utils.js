/**
 * @author sfishel
 *
 * A util package with re-usable functions for generating data-type specific icons for data model object fields.
 */

define(['underscore'], function(_) {

    var fieldIconClassByType = function(type) {
        switch(type) {
            case 'string':
            case 'ipv4':
                return 'string';
            case 'number':
            case 'objectCount':
            case 'childCount':
                return 'number';
            case 'boolean':
                return 'boolean';
            case 'timestamp':
                return 'clock';
            default:
                return false;
        }
    };
    
    var fieldIconByType = function(type) {
        var iconClass = fieldIconClassByType(type);
        if(iconClass) {
            return '<i class="icon-' + iconClass + '"></i>';
        }
        return '<i>&nbsp;</i>';
    };

    var fieldHiddenIcon = function(hidden) {
        if(hidden) {
            var hiddenTitle = _("Hidden").t();
            return '<i class="icon-hidden" title="' + hiddenTitle + '"></i>';
        }
        var visibleTitle = _("Visible").t();
        return '<i class="icon-visible" title="' + visibleTitle + '"></i>';
    };

    var fieldRequiredIcon = function(required) {
        if(required) {
            var requiredTitle = _("Required").t();
            return '<i class="icon-alert-circle" title="' + requiredTitle + '"></i>';
        }
        var optionalTitle = _("Optional").t();
        return '<i class="icon-circle" title="' + optionalTitle + '"></i>';
    };

    return ({
        fieldIconByType: fieldIconByType,
        fieldIconClassByType: fieldIconClassByType,
        fieldHiddenIcon: fieldHiddenIcon,
        fieldRequiredIcon: fieldRequiredIcon
    });
    
});