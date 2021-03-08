let appData = null;
let unifiedConfigs = null;

export function setMetaInfo(data) {
    appData = data;
}

export function getMetaInfo() {
    return {
        appData: appData
    }
}

export function generateEndPointUrl(name) {
    return `${unifiedConfigs.meta.restRoot}/${name}`;
}

export function setUnifiedConfig(unifiedConfig) {
    unifiedConfigs = unifiedConfig;
}

export function getUnifiedConfigs() {
    return unifiedConfigs;
}
