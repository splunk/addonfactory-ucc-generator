import { Platforms } from '../types/globalConfig/pages';

export const shouldHideForPlatform = (hideForPlatform: Platforms, platform: Platforms) => {
    if (platform && hideForPlatform === platform) {
        return true;
    }

    return false;
};
