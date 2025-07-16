import yaml from 'js-yaml';
import { getRequest } from './api';
// NOTE: if bundle script is put some dir instead of js/build, this function will broken.
export function getBuildDirPath() {
    const scripts = document.getElementsByTagName('script');
    const scriptsCount = scripts.length;
    for (let i = 0; i < scriptsCount; i += 1) {
        const s = scripts[i];
        // /js/build/custom/ is from non external custom components and is placed at the top of the page
        // which has incorrect src path
        if (s.src && s.src.match(/js\/build/) && !s.src.includes('/js/build/custom/')) {
            const lastSlashIndex = s.src.lastIndexOf('/');
            return s.src.slice(0, lastSlashIndex);
        }
    }
    return '';
}

async function loadJSONFile() {
    const data = await getRequest({
        endpointUrl: `${getBuildDirPath()}/globalConfig.json`,
        handleError: false,
    });
    if (typeof data === 'object') {
        return data;
    }
    if (typeof data === 'string') {
        return JSON.parse(data);
    }
    throw new Error('Invalid data type');
}

async function loadYAMLFile() {
    const data = await getRequest({
        endpointUrl: `${getBuildDirPath()}/globalConfig.json`,
        handleError: false,
    });
    if (typeof data === 'object') {
        return data;
    }
    if (typeof data === 'string') {
        yaml.load(data);
    }
    throw new Error('Invalid data type');
}

export function loadGlobalConfig() {
    return loadJSONFile().catch(() => loadYAMLFile());
}
