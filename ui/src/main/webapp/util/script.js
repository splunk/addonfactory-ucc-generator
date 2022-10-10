import axios from 'axios';

// NOTE: if bundle script is put some dir instead of js/build, this function will broken.
export function getBuildDirPath() {
    const scripts = document.getElementsByTagName('script');
    const scriptsCount = scripts.length;
    for (let i = 0; i < scriptsCount; i += 1) {
        const s = scripts[i];
        if (s.src && s.src.match(/js\/build/)) {
            const lastSlashIndex = s.src.lastIndexOf('/');
            return s.src.slice(0, lastSlashIndex);
        }
    }
    return '';
}

function loadJSONFile() {
    return axios.get(`${getBuildDirPath()}/globalConfig.json`).then((res) => {
        return typeof res.data === 'object' ? res.data : JSON.parse(res.data);
    });
}

function loadYAMLFile() {
    const yaml = require('js-yaml');
    return axios.get(`${getBuildDirPath()}/globalConfig.yaml`).then((res) => {
        return typeof res.data === 'object' ? res.data : yaml.load(res.data);
    });
}

export function loadGlobalConfig() {
    return loadJSONFile().catch(e => loadYAMLFile());
}
