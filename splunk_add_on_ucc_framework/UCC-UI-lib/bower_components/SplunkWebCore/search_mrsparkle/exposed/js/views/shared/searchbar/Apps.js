define(
    [
        'underscore',
        'module',
        'views/shared/controls/SyntheticSelectControl',
        'uri/route'
    ],
    function(_, module, SyntheticSelectControl, route) {
        return SyntheticSelectControl.extend({
            moduleId: module.id,
            initialize: function() {
                this.options = _.defaults({
                    className: 'btn-group',
                    toggleClassName: 'btn',
                    iconURLClassName: "menu-icon",
                    menuClassName: "dropdown-menu-tall dropdown-menu-apps",
                    label: _("App: ").t(),
                    items: [],
                    model: this.model,
                    modelAttribute: 'display.prefs.searchContext',
                    popdownOptions: {attachDialogTo:'body'}
                }, this.options);

                this.collection.on('change', _.debounce(this.update, 0), this);
                SyntheticSelectControl.prototype.initialize.call(this, this.options);

                this.update();
            },
            update: function() {
                var items = [];
                this.collection.each(function(model) {
                    var navData = model.get('navData');
                    if (navData && navData.searchView) {
                        var appmodel = this.options.applicationModel;

                        var appIcon = route.appIconAlt(
                            appmodel.get('root'),
                            appmodel.get('locale'),
                            appmodel.get('owner'),
                            model.get('appName')
                        );

                        items.push({
                            value: model.get('appName'),
                            label: model.get('appLabel'),
                            iconURL: appIcon
                        });
                    }
                }.bind(this));

                this.setItems(items);
            }
        });
    }
);
