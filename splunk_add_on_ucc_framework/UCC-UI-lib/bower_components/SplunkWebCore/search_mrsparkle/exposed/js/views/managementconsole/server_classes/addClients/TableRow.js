/**
 * Created by rtran on 2/11/16.
 */
define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'util/time',
    'contrib/text!./TableRow.html'],
    function(
        $,
        _,
        module,
        BaseView,
        time_utils,
        Template
    ) {
        return BaseView.extend({
            moduleId: module.id,
            template: Template,
            tagName: 'tr',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.allClientsSelected = this.options.allClientsSelected;
            },

            render: function() {
                this.$el.html(this.compiledTemplate(_.extend(this.model.entry.content.toJSON(), {allClientsSelected: this.allClientsSelected, convertToRelativeTime: time_utils.convertToRelativeTime, _: _, selected: this.model.entry.content.get('selected')})));
                return this;
            }
        });
    }
);