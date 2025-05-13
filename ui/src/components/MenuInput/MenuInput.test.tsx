import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { AnimationToggleProvider } from '@splunk/react-ui/AnimationToggle';
import { z } from 'zod';
import MenuInput from './MenuInput';
import { setUnifiedConfig } from '../../util/util';
import {
    InputsPageTableSchema,
    pages,
    TableFullServiceSchema,
    TableSchema,
} from '../../types/globalConfig/pages';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { PageContextProvider } from '../../context/PageContext';
import { getBuildDirPath } from '../../util/script';
import {
    CustomComponentContextType,
    CustomComponentContextProvider,
} from '../../context/CustomComponentContext';
import { CustomMenuBase } from '../CustomMenu/CustomMenuBase';

const mockRenderFunction = vi.fn().mockReturnValue(undefined);

class MockCustomRenderableCustomMenu extends CustomMenuBase {
    navigator = vi.fn<(arg0: unknown) => void>();

    render = mockRenderFunction;
}

function setup(inputs: z.infer<typeof pages.shape.inputs>) {
    const mockHandleRequestOpen = vi.fn();
    const globalConfigMock = getGlobalConfigMock();

    setUnifiedConfig({
        ...globalConfigMock,
        pages: {
            ...globalConfigMock.pages,
            inputs,
        },
    });

    render(
        <PageContextProvider platform="cloud">
            <AnimationToggleProvider enabled={false}>
                <MenuInput handleRequestOpen={mockHandleRequestOpen} />
            </AnimationToggleProvider>
        </PageContextProvider>
    );
    return { mockHandleRequestOpen };
}

function setupComponentContext(inputs: z.infer<typeof pages.shape.inputs>) {
    const mockHandleRequestOpen = vi.fn();
    const globalConfigMock = getGlobalConfigMock();

    const compContext: CustomComponentContextType = {
        CustomMenu: {
            component: MockCustomRenderableCustomMenu,
            type: 'menu',
        },
    };

    setUnifiedConfig({
        ...globalConfigMock,
        pages: {
            ...globalConfigMock.pages,
            inputs,
        },
    });

    render(
        <CustomComponentContextProvider customComponents={compContext}>
            <PageContextProvider platform="cloud">
                <AnimationToggleProvider enabled={false}>
                    <MenuInput handleRequestOpen={mockHandleRequestOpen} />
                </AnimationToggleProvider>
            </PageContextProvider>
        </CustomComponentContextProvider>
    );
    return { mockHandleRequestOpen };
}

function getCreateButton() {
    return screen.getByRole('button', { name: 'Create New Input' });
}

const table: z.infer<typeof TableSchema> = {
    header: [
        {
            field: 'name',
            label: 'Input Name',
        },
    ],
    moreInfo: [
        {
            field: 'name',
            label: 'Name',
        },
    ],
    actions: ['edit', 'delete', 'clone'],
};

describe('single service', () => {
    function getOneService(): z.infer<typeof TableFullServiceSchema>[] {
        return [
            {
                name: 'test-service-name',
                title: 'test-service-title',
                subTitle: 'test-service-subTitle',
                entity: [],
                table,
            },
        ];
    }

    it('should render button Create New Input', async () => {
        setup({ title: '', services: getOneService() });
        const createButton = getCreateButton();

        expect(createButton).toBeInTheDocument();
        expect(createButton).toHaveAttribute('data-test', 'button');
    });

    it('should call callback with service name on user click', async () => {
        const { mockHandleRequestOpen } = setup({ title: '', services: getOneService() });
        const createButton = getCreateButton();

        await userEvent.click(createButton);

        expect(mockHandleRequestOpen).toHaveBeenCalledWith({ serviceName: 'test-service-name' });
    });
});

describe('multiple services', () => {
    function getTwoServices() {
        return [
            {
                name: 'test-service-name1',
                title: 'test-service-title1',
                subTitle: 'test-service-subTitle1',
                entity: [],
                table,
            },
            {
                name: 'test-service-name2',
                title: 'test-service-title2',
                subTitle: 'test-service-subTitle2',
                entity: [],
                table,
            },
        ];
    }

    function getCreateDropdown() {
        return screen.getByRole('button', { name: 'Create New Input' });
    }

    it('should render dropdown Create New Input', async () => {
        setup({ title: '', services: getTwoServices() });
        const createDropdown = getCreateDropdown();
        expect(createDropdown).toBeInTheDocument();
        expect(createDropdown).toHaveAttribute('data-test', 'dropdown');
    });

    it('should render service menu items on opening dropdown', async () => {
        setup({ title: '', services: getTwoServices() });
        await userEvent.click(getCreateDropdown());
        expect(screen.getByTestId('menu')).toBeInTheDocument();
        expect(screen.getAllByTestId('item')).toHaveLength(2);
        expect(screen.getByText('test-service-title1')).toBeInTheDocument();
        expect(screen.getByText('test-service-subTitle2')).toBeInTheDocument();
    });

    it('should call callback with service name and default group name (main_panel) on menu item click', async () => {
        const user = userEvent.setup();
        const { mockHandleRequestOpen } = setup({ title: '', services: getTwoServices() });
        await user.click(getCreateDropdown());
        await user.click(screen.getByText('test-service-title2'));
        expect(mockHandleRequestOpen).toHaveBeenCalledWith({
            groupName: 'main_panel',
            serviceName: 'test-service-name2',
        });
    });

    describe('groups', () => {
        function getGroupedServices(): z.infer<typeof InputsPageTableSchema> {
            return {
                services: [
                    {
                        name: 'test-service-name1',
                        title: 'test-service-title1',
                        subTitle: 'test-service-subTitle1',
                        entity: [],
                    },
                    {
                        name: 'test-subservice1-name1',
                        title: 'test-subservice1-title1',
                        subTitle: 'test-subservice-subTitle1',
                        entity: [],
                    },
                    {
                        name: 'test-subservice1-name2',
                        title: 'test-subservice1-title2',
                        subTitle: 'test-subservice-subTitle2',
                        entity: [],
                    },
                    {
                        name: 'test-service-name2',
                        title: 'test-service-title2',
                        subTitle: 'test-service-subTitle2',
                        entity: [],
                    },
                ],
                groupsMenu: [
                    {
                        groupName: 'test-group-name1',
                        groupTitle: 'test-group-title1',
                        groupServices: ['test-subservice1-name1', 'test-subservice1-name2'],
                    },
                ],
                title: '',
                table: {
                    actions: [],
                    header: [
                        {
                            field: '',
                            label: '',
                        },
                    ],
                    customRow: {},
                },
            };
        }

        it('should render group title', async () => {
            setup(getGroupedServices());
            await userEvent.click(getCreateDropdown());
            expect(screen.getByText('test-group-title1')).toBeInTheDocument();
            expect(screen.getByText('test-group-title1')).not.toHaveAttribute('aria-haspopup');
        });

        it('should render group items', async () => {
            const userEventSetup = userEvent.setup();
            setup(getGroupedServices());

            // Open dropdown
            await userEventSetup.click(getCreateDropdown());

            // Check sub menu is not rendered
            expect(screen.queryByText('test-subservice1-title1')).not.toBeInTheDocument();
            expect(screen.queryByText('test-subservice-subTitle2')).not.toBeInTheDocument();

            // Click on group title
            await userEventSetup.click(screen.getByText('test-group-title1'));

            // Check sub menu is rendered
            expect(screen.getByText('test-subservice1-title1')).toBeInTheDocument();
            expect(screen.getByText('test-subservice-subTitle2')).toBeInTheDocument();

            // Ensure the group title disappears
            await waitFor(() =>
                expect(screen.queryByText('test-group-title1')).not.toBeInTheDocument()
            );

            // Click back button
            await userEventSetup.click(screen.getByRole('menuitem', { name: 'Back' }));

            await waitFor(() =>
                expect(screen.queryByText('test-subservice-subTitle1')).not.toBeInTheDocument()
            );

            // Ensure group title reappears
            expect(screen.getByText('test-group-title1')).toBeInTheDocument();
        });

        it('should render group as menu item if no underlying services', async () => {
            setup({
                ...getGroupedServices(),
                groupsMenu: [
                    { groupName: 'test-service-name1', groupTitle: 'test-service-title1' },
                ],
            });

            await userEvent.click(getCreateDropdown());

            expect(screen.getByText('test-service-title1')).toBeInTheDocument();
            expect(screen.getByText('test-service-title1')).not.toHaveAttribute('aria-haspopup');
        });

        it('should not render group as menu item if no services exists for groupName', async () => {
            const groupName = 'unexisting-name';
            const groupTitle = 'unexisting-title1';
            setup({
                ...getGroupedServices(),
                groupsMenu: [{ groupName, groupTitle }],
            });

            await userEvent.click(getCreateDropdown());

            expect(screen.queryByText(groupTitle)).not.toBeInTheDocument();
        });

        it('should render group as menu item only for existing services', async () => {
            const unexistingElement = {
                groupName: 'unexisting-name',
                groupTitle: 'unexisting-title1',
            };
            const elem1 = {
                groupName: 'test-service-name1',
                groupTitle: 'test-service-title1',
            };

            const elem2 = {
                groupName: 'test-group-name1',
                groupTitle: 'test-group-title1',
                groupServices: ['test-subservice1-name1', 'test-subservice1-name2'],
            };
            setup({
                ...getGroupedServices(),
                groupsMenu: [unexistingElement, elem1, elem2],
            });

            await userEvent.click(getCreateDropdown());

            expect(screen.queryByText(unexistingElement.groupTitle)).not.toBeInTheDocument();
            expect(screen.getByText(elem1.groupTitle)).toBeInTheDocument();
            expect(screen.getByText(elem2.groupTitle)).toBeInTheDocument();
        });

        it('should call handleRequestOpen callback on click', async () => {
            const user = userEvent.setup();
            const { mockHandleRequestOpen } = setup(getGroupedServices());

            await user.click(getCreateDropdown());

            await user.click(screen.getByText('test-group-title1'));
            await user.click(screen.getByText('test-subservice1-title1'));

            expect(mockHandleRequestOpen).toHaveBeenCalledWith({
                groupName: 'test-group-name1',
                serviceName: 'test-subservice1-name1',
            });
        });

        it('should not render hideForPlatform services', async () => {
            const user = userEvent.setup();
            setup({
                services: [
                    {
                        name: 'test-subservice1-name1',
                        title: 'test-subservice1-title1',
                        subTitle: 'test-subservice1-subTitle1',
                        entity: [],
                        hideForPlatform: 'enterprise',
                    },
                    {
                        name: 'test-subservice2-name1',
                        title: 'test-subservice2-title1',
                        subTitle: 'test-subservice2-subTitle1',
                        entity: [],
                        hideForPlatform: 'cloud',
                    },
                    {
                        name: 'test-subservice1-name2',
                        title: 'test-subservice1-title2',
                        subTitle: 'test-subservice1-subTitle2',
                        entity: [],
                        hideForPlatform: 'cloud',
                    },
                    {
                        name: 'test-subservice2-name2',
                        title: 'test-subservice2-title2',
                        subTitle: 'test-subservice2-subTitle2',
                        entity: [],
                        hideForPlatform: 'enterprise',
                    },
                    {
                        name: 'test-service-enterprise-hidden-name1',
                        title: 'test-service-enterprise-hidden-title1',
                        subTitle: 'test-service-enterprise-hidden-subTitle1',
                        entity: [],
                        hideForPlatform: 'enterprise',
                    },
                    {
                        name: 'test-service-cloud-hidden-name1',
                        title: 'test-service-cloud-hidden-title1',
                        subTitle: 'test-service-cloud-hidden-subTitle1',
                        entity: [],
                        hideForPlatform: 'cloud',
                    },
                    {
                        name: 'test-service-standard-name1',
                        title: 'test-service-standard-title1',
                        subTitle: 'test-service-standard-subTitle1',
                        entity: [],
                    },
                ],
                groupsMenu: [
                    {
                        groupName: 'test-service-enterprise-hidden-name1',
                        groupTitle: 'test-service-enterprise-hidden-title1',
                    },
                    {
                        groupName: 'test-service-standard-name1',
                        groupTitle: 'test-service-standard-title1',
                    },
                    {
                        groupName: 'test-service-cloud-hidden-name1',
                        groupTitle: 'test-service-cloud-hidden-title1',
                    },
                    {
                        groupName: 'test-group-name1',
                        groupTitle: 'test-group-title1',
                        groupServices: ['test-subservice1-name1', 'test-subservice1-name2'],
                    },
                    {
                        groupName: 'test-group-name2',
                        groupTitle: 'test-group-title2',
                        groupServices: ['test-subservice2-name1', 'test-subservice2-name2'],
                    },
                ],
                title: '',
                table: {
                    actions: [],
                    header: [
                        {
                            field: '',
                            label: '',
                        },
                    ],
                    customRow: {},
                },
            });
            // the loading indicator from CustomMenu component

            await user.click(getCreateDropdown());

            const openAndVerifyGroup = async ({
                groupTitle,
                existsTitles,
                doesNotExistsTitles,
                userEventSetup,
            }: {
                groupTitle: string;
                existsTitles: string[];
                doesNotExistsTitles: string[];
                userEventSetup: UserEvent;
            }) => {
                await userEventSetup.click(screen.getByText(groupTitle));

                // Ensure UI updates before assertions
                await waitFor(() => {
                    existsTitles.forEach((title) => {
                        expect(screen.getByText(title)).toBeInTheDocument();
                    });
                });

                // animation needs to finish, during animation elements are still visible
                await waitFor(
                    () =>
                        expect(screen.queryAllByRole('menuitem')).toHaveLength(
                            // length should be number of existsTitles + 1 (Back button)
                            existsTitles.length + 1
                        ),
                    { timeout: 1000 }
                );

                // elements are HIDDEN via hideForPlatform "cloud"
                doesNotExistsTitles.forEach((title) => {
                    expect(screen.queryByText(title)).not.toBeInTheDocument();
                });

                await userEventSetup.click(screen.getByText('Back'));
                await waitFor(() => expect(screen.queryByText('Back')).not.toBeInTheDocument(), {
                    timeout: 500,
                });
            };

            // 2+1+1 two groups, one standard service, one service not hidden for cloud
            expect(screen.queryAllByRole('menuitem')).toHaveLength(4);

            await openAndVerifyGroup({
                groupTitle: 'test-group-title1',
                existsTitles: ['test-subservice1-title1'],
                doesNotExistsTitles: ['test-subservice1-title2'],
                userEventSetup: user,
            });

            await openAndVerifyGroup({
                groupTitle: 'test-group-title2',
                existsTitles: ['test-subservice2-title2'],
                doesNotExistsTitles: ['test-subservice2-title1'],
                userEventSetup: user,
            });
        });
    });

    describe('menu', () => {
        it('should render CustomMenu wrapper with groupsMenu without rendering underlying custom component', async () => {
            vi.doMock(`${getBuildDirPath()}/custom/CustomMenu.js`, () => ({
                default: MockCustomRenderableCustomMenu,
            }));
            setup({
                services: [
                    {
                        name: 'test-service-name1',
                        title: 'test-service-title1',
                        subTitle: 'test-service-subTitle1',
                        entity: [],
                    },
                    {
                        name: 'test-subservice1-name1',
                        title: 'test-subservice1-title1',
                        subTitle: 'test-subservice-subTitle1',
                        entity: [],
                    },
                    {
                        name: 'test-subservice1-name2',
                        title: 'test-subservice1-title2',
                        subTitle: 'test-subservice-subTitle2',
                        entity: [],
                    },
                    {
                        name: 'test-service-name2',
                        title: 'test-service-title2',
                        subTitle: 'test-service-subTitle2',
                        entity: [],
                    },
                ],
                menu: {
                    src: 'CustomMenu',
                    type: 'external',
                },
                groupsMenu: [
                    {
                        groupName: 'test-group-name1',
                        groupTitle: 'test-group-title1',
                        groupServices: ['test-subservice1-name1', 'test-subservice1-name2'],
                    },
                ],
                title: '',
                table: {
                    actions: [],
                    header: [
                        {
                            field: '',
                            label: '',
                        },
                    ],
                    customRow: {},
                },
            });
            // the loading indicator from CustomMenu component
            const loadingEl = screen.getByText('Loading...');
            expect(loadingEl).toBeInTheDocument();
            await waitFor(() => expect(screen.queryByText('Loading...')).toBeNull());

            const createNewInputBtn = screen.queryByRole('button', { name: 'Create New Input' });

            expect(createNewInputBtn).toBeInTheDocument();
            // that's weird
            expect(mockRenderFunction).not.toHaveBeenCalled();
        });

        it('should render CustomMenu wrapper without groupsMenu without rendering underlying custom component', async () => {
            vi.doMock(`${getBuildDirPath()}/custom/CustomMenu.js`, () => ({
                default: MockCustomRenderableCustomMenu,
            }));

            setup({
                services: [
                    {
                        name: 'test-service-name1',
                        title: 'test-service-title1',
                        entity: [],
                    },
                ],
                menu: {
                    src: 'CustomMenu',
                    type: 'external',
                },
                title: '',
                table: {
                    actions: [],
                    header: [
                        {
                            field: '',
                            label: '',
                        },
                    ],
                    customRow: {},
                },
            });

            // the loading indicator is from CustomMenu component
            const loadingEl = screen.getByText('Loading...');
            expect(loadingEl).toBeInTheDocument();
            await waitFor(() => expect(screen.queryByText('Loading...')).toBeNull());
            expect(mockRenderFunction).toHaveBeenCalled();
            const createNewInputBtn = screen.queryByRole('button', { name: 'Create New Input' });
            expect(createNewInputBtn).not.toBeInTheDocument();
        });

        it('should render CustomMenu wrapper without groupsMenu without rendering underlying custom component - contex components', async () => {
            setupComponentContext({
                services: [
                    {
                        name: 'test-service-name1',
                        title: 'test-service-title1',
                        entity: [],
                    },
                ],
                menu: {
                    src: 'CustomMenu',
                    type: 'external',
                },
                title: '',
                table: {
                    actions: [],
                    header: [
                        {
                            field: '',
                            label: '',
                        },
                    ],
                    customRow: {},
                },
            });

            // the loading indicator is from CustomMenu component
            const loadingEl = screen.getByText('Loading...');
            expect(loadingEl).toBeInTheDocument();
            await waitFor(() => expect(screen.queryByText('Loading...')).toBeNull());
            expect(mockRenderFunction).toHaveBeenCalled();
            const createNewInputBtn = screen.queryByRole('button', { name: 'Create New Input' });
            expect(createNewInputBtn).not.toBeInTheDocument();
        });
    });
});
