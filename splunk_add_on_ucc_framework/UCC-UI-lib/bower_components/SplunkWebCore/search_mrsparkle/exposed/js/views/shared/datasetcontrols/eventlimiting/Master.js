define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/datasetcontrols/eventlimiting/Dialog',
        'splunk.util',
        'splunk.i18n'
    ],
    function(
        _,
        $,
        module,
        SyntheticSelectControl,
        EventLimitingDialog,
        splunkUtil,
        i18n
    ) {
        return SyntheticSelectControl.extend({
            moduleId: module.id,
            className: 'dataset-event-limiting',
            defaultItems: [
                {value: 'unlimited', label: _('None').t()},
                {value: '1000', label: splunkUtil.sprintf(_("~%s").t(), i18n.format_decimal(1000))},
                {value: '10000', label: splunkUtil.sprintf(_("~%s").t(), i18n.format_decimal(10000))},
                {value: '100000', label: splunkUtil.sprintf(_("~%s").t(), i18n.format_decimal(100000))},
                {value: '1000000', label: splunkUtil.sprintf(_("~%s").t(), i18n.format_decimal(1000000))}
            ],
            customItem: [
                {value: 'custom', label: _('Custom...').t()},
                { value: 'newSample', label: _('New Sample').t()}
            ],
            initialize: function(options) {
                $.extend(true, options, {
                    items: this.generateItems(),
                    modelAttribute: 'dataset.display.limiting',
                    defaultValue: '100000',
                    toggleClassName: 'btn-pill',
                    menuClassName: 'dropdown-menu',
                    label: _('Event Limiting:').t(),
                    popdownOptions: {detachDialog: true}
                });

                SyntheticSelectControl.prototype.initialize.call(this, options);
            },

            activate: function() {
                if (this.active) {
                    return SyntheticSelectControl.prototype.activate.apply(this, arguments);
                }

                this.setItems(this.generateItems());

                return SyntheticSelectControl.prototype.activate.apply(this, arguments);
            },

            openEventLimitingDialog: function() {
                this.children.limitingDialog = new EventLimitingDialog({
                    model: this.model,
                    onHiddenRemove: true
                });

                this.children.limitingDialog.render().appendTo($("body")).show();
                // Use this listener to update the selected item in the list immediately upon setting a custom value
                this.children.limitingDialog.once('updateListItems', function(customValue) {
                    this.setItems(this.generateItems(customValue));
                    SyntheticSelectControl.prototype.setValue.call(this, customValue, true);
                }, this);
            },

            setValue: function(value, render, suppressEvent) {
                if (value === 'custom') {
                    this.openEventLimitingDialog();
                    return;
                } else if (value === 'newSample') {
                    this.model.trigger('newSample');
                    return;
                }

                SyntheticSelectControl.prototype.setValue.call(this, value, render, suppressEvent);
            },

            generateItems: function(customValue) {
                var items = this.defaultItems.slice();

                // Check if limit is customized
                var customLimit = customValue || this.model.get('dataset.display.limiting');
                if (customLimit && (!_.findWhere(this.defaultItems, {value: customLimit}))) {
                    items.push({
                        value: customLimit,
                        label: splunkUtil.sprintf(_("~%s (Custom)").t(), i18n.format_decimal(customLimit))
                    });
                }

                return [items, this.customItem];
            }
        });
    }
);