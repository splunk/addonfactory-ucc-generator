define(['splunk.i18n', 'moment'],function(i18n, moment){
    var initFn = i18n.moment_install;
    if(typeof initFn === 'function') {
        initFn(moment);
    }
    return moment;
});