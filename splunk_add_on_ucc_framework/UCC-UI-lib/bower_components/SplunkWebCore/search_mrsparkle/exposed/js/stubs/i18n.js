define(['strftime', 'splunk.util'], function() {

    /*
     * monkey patches to the i18n library
     * see SPL-75565
     */

    // NOTE: this code block is duplicated in the util/test_i18n_patches.html unit test.
    //       any changes made here must also be reflected there.
    if(window.locale_name() in { ko_KR: true, zh_CN: true, zh_TW: true }) {
        window._i18n_locale.date_formats['short'] = { "pattern": "yy/MM/dd", "format": "%(yy)s/%(MM)s/%(dd)s" };
        window._i18n_locale.date_formats['medium'] = {"pattern": "yyyy/MM/dd", "format": "%(yyyy)s/%(MM)s/%(dd)s"};
        window._i18n_locale.time_formats['short'] = { "pattern": "H:mm", "format": "%(H)s:%(mm)s" };
        window._i18n_locale.time_formats['medium'] = { "pattern": "H:mm:ss", "format": "%(H)s:%(mm)s:%(ss)s" };
    }

    var asianLanguageDateReplacements = [
        [/^ccc MMM d$/, 'M/d (ccc)'],
        [/^YYYY-MM/, 'YYYY/MM'],
        [/MM-dd/, 'MM/dd']
    ];

    // maintain a hash of locales where custom string replacements are needed to get correct translation
    var FORMAT_DATE_REPLACEMENTS = {
        'ja_JP': asianLanguageDateReplacements,
        'ko_KR': asianLanguageDateReplacements,
        'zh_CN': asianLanguageDateReplacements,
        'zh_TW': asianLanguageDateReplacements
    };

    // maintain a list of replacements needed when a locale specifies that day comes before month
    var DAY_FIRST_FORMATS = [
        ['MMM d', 'd MMM']
    ];

    var oldFormatDate = window.format_date;
    window.format_date = function(date, format) {
        format = format || 'medium';
        var i, replacements,
            locale = window.locale_name();

        if(format && (typeof format === 'string') && window.locale_uses_day_before_month()) {
            replacements = DAY_FIRST_FORMATS;
            for(i = 0; i < replacements.length; i++) {
                format = format.replace(replacements[i][0], replacements[i][1]);
            }
        }
        if(format && (typeof format === 'string') && locale in FORMAT_DATE_REPLACEMENTS) {
            replacements = FORMAT_DATE_REPLACEMENTS[locale];

            for(i = 0; i < replacements.length; i++) {
                var replacement = replacements[i];
                format = format.replace(replacement[0], replacement[1]);
            }
        }
        return oldFormatDate(date, format);
    };
    
    return ({
        _: window.gettext,
        ungettext: window.ungettext,
        format_decimal: window.format_decimal,
        format_number: window.format_number,
        format_percent: window.format_percent,
        format_scientific: window.format_scientific,
        format_date: window.format_date,
        format_datetime: window.format_datetime,
        format_time: window.format_time,
        format_datetime_microseconds: window.format_datetime_microseconds,
        format_time_microseconds: window.format_time_microseconds,
        locale_uses_day_before_month: window.locale_uses_day_before_month,
        format_datetime_range: window.format_datetime_range,
        locale_name: window.locale_name,
        DateTime: window.DateTime,
        moment_install: window.moment_install,
        numeral_install: window.numeral_install,
        jQuery_ui_datepicker_install: window.jQuery_ui_datepicker_install
    });
});
