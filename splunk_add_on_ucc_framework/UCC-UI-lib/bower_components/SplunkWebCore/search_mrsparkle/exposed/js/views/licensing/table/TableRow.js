define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'splunk.i18n',
        'util/format_numbers_utils'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        i18n,
        numbersUtils
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'expand',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.$el.addClass((this.options.index % 2) ? 'even' : 'odd');
            },

            render: function() {
                var licenseQuota = parseInt(this.model.license.entry.content.get('quota'), 10);
                var absoluteExpirationTime = this.model.license.entry.content.get('expiration_time');
                var relativeExpirationTime = Infinity;
                if (this.model.license.entry.content.get('relative_expiration_start') && this.model.license.entry.content.get('relative_expiration_interval')) {
                    relativeExpirationTime = this.model.license.entry.content.get('relative_expiration_start')  + this.model.license.entry.content.get('relative_expiration_interval'); 
                }

                var expirationTime = i18n.format_datetime(Math.min(absoluteExpirationTime, relativeExpirationTime));
                
                //if year is 2030 or greater, license is considered perpetual
                var dateOfExpiration = new Date(expirationTime);
                if (dateOfExpiration.getFullYear() >= 2030) {
                    expirationTime = _('Perpetual').t();
                }

                this.$el.html(this.compiledTemplate({
                    licenseName: this.model.license.entry.content.get('label'),
                    numbersUtils: numbersUtils,
                    licenseQuota: licenseQuota,
                    expirationTime: expirationTime
                }));
                return this;
            },

            template: '\
                <td class="expands">\
                    <a href="#"><i class="icon-triangle-right-small"></i></a>\
                </td>\
                <td class="license-name"><%=licenseName%></td>\
                <td class="daily-volume"><%= numbersUtils.bytesToFileSize(licenseQuota) %></td>\
                <td class="expires-on"><%=expirationTime%></td>\
                '
        });
    }
);