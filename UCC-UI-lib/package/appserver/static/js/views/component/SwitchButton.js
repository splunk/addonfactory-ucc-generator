import 'appCssDir/switchButton.css';

define([
    'lodash',
    'jquery',
    'backbone',
    'util/splunkd_utils'
], function(
    _,
    $,
    Backbone,
    splunkd_utils
) {
    return Backbone.View.extend({
        events: {
            'change input:not([disabled])': 'onSwitched'
        },

        initialize: function(options) {
            Backbone.View.prototype.initialize.apply(this, arguments);

            this.dispatcher = options.dispatcher;
            this.enabled = options.enabled;
            this.app = options.app;
            this.baseUrl = `${options.url}/${options.name}?&output_mode=json`;
        },

        render: function() {
            const checked = this.enabled ? 'checked' : '';
            this.$el.html(_.template(this.template)({checked}));
            this._renderLabel(checked);
            return this;
        },

        onSwitched: function(event) {
            const checked = event.currentTarget.checked;

            const url = splunkd_utils.fullpath(this.baseUrl, {
                app: this.app,
                sharing: 'app'
            });

            this._renderUpdating(true);

            $.post(url, {
                disabled: checked ? '0' : '1'
            }).done((response) => {
                this._renderLabel(checked);
                // Trigger toggle input event to update the cached collection
                if (response && response.entry && response.entry.length === 1) {
                    this.dispatcher.trigger('toggle-input', response.entry[0]);
                }
            }).fail(() => {
                this._renderLabel(!checked);
            }).always(() => {
                this._renderUpdating(false);
            });
        },

        _renderLabel: function(checked) {
            if (checked) {
                this.$('.switch-label')
                    .css('color', '#65a637')
                    .text('Enabled');
            } else {
                this.$('.switch-label')
                    .css('color', '#d5d5d5')
                    .text('Disabled');
            }

            this.$('input').prop('checked', checked);
        },

        _renderUpdating(updating) {
            if (updating) {
                this.$('.switch-button').addClass('disabled');
                this.$('input').prop('disabled', true);
                this.$('.switch-label')
                    .css('color', '#65a637')
                    .text('Updating...');
            } else {
                this.$('.switch-button').removeClass('disabled');
                this.$('input').prop('disabled', false);
            }
        },

        template: `
            <label class="switch-button">
                <input type="checkbox" <%- checked %>>
                <div class="slider round"></div>
            </label>
            <div class="switch-label"></div>
        `
    });
});
