import { TOAST_TYPES } from '@splunk/react-toast-notifications/ToastConstants';
import Toaster, { makeCreateToast } from '@splunk/react-toast-notifications/Toaster';

let appData = null;
let unifiedConfigs = null;

export function setMetaInfo(data) {
    appData = data;
}

export function getMetaInfo() {
    return {
        appData: appData,
    };
}

export function generateEndPointUrl(name) {
    return `${unifiedConfigs.meta.restRoot}_${name}`;
}

export function setUnifiedConfig(unifiedConfig) {
    unifiedConfigs = unifiedConfig;
}

export function getUnifiedConfigs() {
    return unifiedConfigs;
}

const createToast = makeCreateToast(Toaster);
export const generateToast = (message, action = undefined) => {
    createToast({
        type: TOAST_TYPES.ERROR,
        message,
        autoDismiss: true,
        dismissOnActionClick: true,
        showAction: Boolean(action),
        action: action ? action : undefined,
    });
};
