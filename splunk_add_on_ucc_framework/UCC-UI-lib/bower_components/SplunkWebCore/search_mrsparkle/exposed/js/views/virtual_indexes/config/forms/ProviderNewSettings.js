/**
 * @author jszeto
 * @date 9/3/14
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    './ProviderNewSettingRow'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        ProviderNewSettingRow
        ) {

        return BaseView.extend({
            moduleId: module.id,

            events: {
                'click .create-new-setting': function(e) {
                    e.preventDefault();
                    var newRow = new ProviderNewSettingRow({model:this.model, numRow: this.settingRows.length});
                    this.settingRows.push(newRow);
                    newRow.render().appendTo(this.$(".new-setting-placeholder"));
                    this.listenTo(newRow, "closeRow", this.onCloseRow);
                }
            },

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.settingRows = [];
            },

            onCloseRow: function(row, key) {
                var rowIndex = _(this.settingRows).indexOf(row);
                this.stopListening(row);
                row.detach();
                if (rowIndex != -1) {
                    this.settingRows.splice(rowIndex, 1); // Remove the row from our array
                }
            },

            render: function() {
                // Detach children

                // Use template
                this.$el.html(this.compiledTemplate({}));

                // Attach children and render them

                return this;
            },

            template: '\
                <div class="new-setting-placeholder"></div>\
                <div><a href="#" class="create-new-setting"><%- _("New Setting").t() %></a></div>\
            '
        });

    });

