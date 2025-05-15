import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { GlobalConfigSchema } from '../../../types/globalConfig/globalConfig';

export function getGlobalConfigMockCustomHook(customTabFileName: string, title: string) {
    const basicConfig = getGlobalConfigMock();

    const configWithHook = {
        ...basicConfig,
        pages: {
            ...basicConfig.pages,
            configuration: {
                ...basicConfig.pages.configuration,
                tabs: [
                    {
                        name: 'custom_tab',
                        title,
                        customTab: {
                            src: customTabFileName,
                            type: 'external',
                        },
                    },
                ],
            },
        },
    };

    return GlobalConfigSchema.parse(configWithHook);
}
