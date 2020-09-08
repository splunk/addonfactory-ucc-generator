/**
 * @author vkroy
 * @date 07/07/2016
 *
 * SyntheticSelectControl to choose a default app
 * Please refer to SyntheticSelectControl.js for documentations.
 */


define(
    [
        'jquery',
        'underscore',
        'views/shared/controls/SyntheticSelectControl',
        'module'
    ],
    function(
        $,
        _,
        SyntheticSelectControl,
        module
        )
    {
        return SyntheticSelectControl.extend({
            moduleId: module.id,
            className: 'control btn-group select-field-type',

            initialize: function () {
                var app_list = this.model.entry.content.get('app_list');
                var inListItems = _.filter(this.collection.appLocals.models, function (item) {
                    var id = item.getAppId();
                    return (app_list.indexOf(id) > -1);
                });

                var menuItems = _.map(inListItems, function (item) {
                    var id = item.getAppId();
                    return {label: item.entry.content.get('label'), value: id};
                });

                var selectedItem = menuItems.find(function(item) {
                    return item.value == this.model.entry.content.get('default_namespace');
                }.bind(this));

                $.extend(this.options, {
                    toggleClassName: 'btn',
                    items: menuItems,
                    label: (this.options.showDefaultLabel !== false) ? _("Default App").t() : ''
                });

                SyntheticSelectControl.prototype.initialize.call(this, this.options);
                if (selectedItem && selectedItem.value) {
                    this.setValue(selectedItem.value);
                }
            }
        });
    });
