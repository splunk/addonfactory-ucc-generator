import $ from 'jquery';
import _ from 'lodash';

// NOTE: The callback will only be executed if the globalConfig exsit
export function loadGlobalConfig(callback, errorHandler) {
    $.getJSON(`${getBuildDirPath()}/globalConfig.json`)
        .done(json => {
            window.__globalConfig = json;
            callback();
        })
        .fail((xhr, state, err) => {
            if (errorHandler) {
                errorHandler();
            } else {
                console.error(err);
            }
        });
}

// NOTE: if bundle script is put some dir instead of js/build, this function will broken.
export function getBuildDirPath() {
    const scripts = document.getElementsByTagName('script');

    const scriptsCount = scripts.length;
    for (let i = 0; i < scriptsCount; i++) {
        const s = scripts[i];
        if(s.src && s.src.match(/js\/build/)) {
            const lastSlashIndex = s.src.lastIndexOf('/');
            return s.src.slice(0, lastSlashIndex);
        }
    }

    return '';
}

export function parseFuncRawStr(rawStr) {
    let result;

    try {
        if (rawStr) {
            result = eval(`(${rawStr})`);
        }
    } catch (e) {
        console.warn(`${rawStr} ${_('is not a function').t()}${_('.').t()}`);
    }

    return result;
}
