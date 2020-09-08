define(['splunk.i18n', 'numeral'],function(i18n, numeral){
    var initFn = i18n.numeral_install,
        localeMap = {
            'de_DE': 'de',
            'en_DEBUG': 'en-debug',
            'en_GB': 'en-gb',
            'en_US': 'en-us',
            'it_IT': 'it',
            'ko_KR': 'ko',
            'zh_CN': 'chs',
            'zh_TW': 'chs-traditional'
        };
    if(typeof initFn === 'function') {
        initFn(numeral);
        numeral.language(localeMap[i18n.locale_name()]);
    }
    return numeral;
});