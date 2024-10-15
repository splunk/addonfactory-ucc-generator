import { Platforms } from '../types/globalConfig/pages';

export const shouldHideForPlatform = (hideForPlatform: Platforms, platform: Platforms) => {
    if (platform && hideForPlatform === platform) {
        return true;
    }
    // hide by default if platform information was not read yet
    if (!platform && hideForPlatform) {
        return true;
    }

    return false;
};
