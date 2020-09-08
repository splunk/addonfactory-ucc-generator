define(['jquery',
       'jquery.ui.widget',
       'splunk.i18n',
       'imports?jQuery=jquery!contrib/jquery-ui-1.10.4/jquery.ui.datepicker'], function(jQuery, widget, i18n) {
    var initFn = i18n.jQuery_ui_datepicker_install;
    if (typeof initFn === 'function') {
        initFn(jQuery);
    }
    return jQuery;
});
