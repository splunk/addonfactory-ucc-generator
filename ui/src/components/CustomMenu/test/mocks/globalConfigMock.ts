import { getGlobalConfigMock } from '../../../../mocks/globalConfigMock';
import { GlobalConfig } from '../../../../publicApi';

export type GroupsMenuType =
    | {
          groupName: string;
          groupTitle: string;
          groupServices?: string[] | undefined;
      }[];

export const getGlobalConfigMockCustomMenu = (
    customMenuFileName: string,
    groupsMenu?: GroupsMenuType
) => {
    const basicConfig = getGlobalConfigMock();

    return {
        ...basicConfig,
        pages: {
            ...basicConfig.pages,
            inputs: {
                ...basicConfig.pages.inputs!,
                menu: {
                    src: customMenuFileName,
                    type: 'external',
                },
                groupsMenu: groupsMenu
            },
        },
    } satisfies GlobalConfig;
};
