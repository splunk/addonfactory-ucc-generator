/**
 * Add custom filters for the all configurations page
 * @author nmistry
 * @date 10/4/16
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/SyntheticRadioControl',
    'views/shared/controls/SyntheticSelectControl'
], function (
    $,
    _,
    Backbone,
    module,
    Base,
    SyntheticRadioControl,
    SyntheticSelectControl
) {
    return Base.extend({
        moduleId: module.id,

        initialize: function (options) {
            Base.prototype.initialize.call(this, options);
            this.children.orphanedFilter = new SyntheticRadioControl({
                model: this.model.metadata,
                modelAttribute: 'orphaned',
                items: [
                    { label: _('All').t(), value: false},
                    { label: _('Orphaned').t(), value: true}
                ]
            });
            this.children.configType = new SyntheticSelectControl({
                label: _('Object type').t() + ': ',
                model: this.model.metadata,
                modelAttribute: 'configType',
                toggleClassName: 'btn-pill',
                items: this.getConfigItems(),
                popdownOptions: {
                    detachDialog: true
                }
            });
            this.children.appOnly = new SyntheticSelectControl({
                model: this.model.metadata,
                modelAttribute: 'appOnly',
                toggleClassName: 'btn-pill',
                items: this.getAppOnlyItems(),
                popdownOptions: {
                    detachDialog: true
                }
            });
            this.listenTo(this.model.metadata, 'change:app', this.updateAppOnly);
        },

        updateAppOnly: function (model, value, options) {
            if (value === '') {
                this.model.metadata.set('appOnly', false);
                this.children.appOnly.disable();
            } else {
                this.children.appOnly.enable();
            }
        },

        getAppOnlyItems: function () {
            return [
                { value: false, label: _('All Objects').t() },
                { value: true, label: _('Objects created in the app').t() }
            ];
        },

        getConfigItems: function () {
            var items = ["All", "collections-conf", "commands", "conf-times", "eventtypes", "fieldaliases", "fvtags", "macros", "modalerts", "nav", "panels", "props-extract", "props-lookup", "savedsearch", "sourcetype-rename", "transforms-extract", "transforms-lookup", "views", "workflow-actions"];
            return _.map(items, function (type) {
                return {value: type, label: type};
            });
        },

        render: function () {
            var html = this.compiledTemplate();
            this.$el.html(html);
            this.children.orphanedFilter.render().appendTo(this.$('.orphaned-filter'));
            this.children.configType.render().appendTo(this.$('.config-type-filter'));
            this.children.appOnly.render().appendTo(this.$('.app-only-filter'));
            this.updateAppOnly(this.model.metadata, this.model.metadata.get('app'));
            return this;
        },

        template: '<span class="orphaned-filter"></span><span class="config-type-filter"></span><span class="app-only-filter"></span>'
    });
});
