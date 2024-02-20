import { render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { AnimationToggleProvider } from '@splunk/react-ui/AnimationToggle';
import { z } from 'zod';
import MenuInput from './MenuInput';
import { mockCustomMenu, MockCustomRenderable } from '../../tests/helpers';
import { getUnifiedConfigs } from '../../util/util';
import {
    InputsPageTableSchema,
    pages,
    TableFullServiceSchema,
    TableSchema,
} from '../../types/globalConfig/pages';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';

jest.mock('../../util/util');

const getUnifiedConfigsMock = getUnifiedConfigs as jest.Mock;
let mockCustomMenuInstance: MockCustomRenderable;

beforeEach(() => {
    mockCustomMenuInstance = mockCustomMenu().mockCustomMenuInstance;
});

function setup(inputs: z.infer<typeof pages.shape.inputs>) {
    const mockHandleRequestOpen = jest.fn();
    const globalConfigMock = getGlobalConfigMock();

    getUnifiedConfigsMock.mockImplementation(() => ({
        ...globalConfigMock,
        pages: {
            ...globalConfigMock.pages,
            inputs,
        },
    }));
    render(
        <AnimationToggleProvider enabled={false}>
            <MenuInput handleRequestOpen={mockHandleRequestOpen} />
        </AnimationToggleProvider>
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
        const { mockHandleRequestOpen } = setup({ title: '', services: getTwoServices() });
        await userEvent.click(getCreateDropdown());
        await userEvent.click(screen.getByText('test-service-title2'));
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
            setup(getGroupedServices());
            // open dropdown
            await userEvent.click(getCreateDropdown());
            // check sub menu is not rendered
            expect(screen.queryByText('test-subservice1-title1')).not.toBeInTheDocument();
            expect(screen.queryByText('test-subservice-subTitle2')).not.toBeInTheDocument();
            // click on group title
            await userEvent.click(screen.getByText('test-group-title1'));
            // check sub menu is rendered
            expect(screen.queryByText('test-subservice1-title1')).toBeInTheDocument();
            expect(screen.queryByText('test-subservice-subTitle2')).toBeInTheDocument();
            await waitFor(() => screen.queryByText('test-group-title1'), { timeout: 1000 });
            expect(screen.queryByText('test-group-title1')).not.toBeInTheDocument();

            await userEvent.click(screen.getByRole('menuitem', { name: 'Back' }));
            await waitFor(() =>
                expect(screen.queryByText('test-subservice-subTitle1')).not.toBeInTheDocument()
            );
            expect(screen.queryByText('test-group-title1')).toBeInTheDocument();
        });

        it('should render group as menu item if no underlying services', async () => {
            setup({
                ...getGroupedServices(),
                groupsMenu: [{ groupName: 'test-group-name1', groupTitle: 'test-group-title1' }],
            });
            await userEvent.click(getCreateDropdown());
            // await userEvent.click(screen.getByText('test-group-title1'));
            expect(screen.getByText('test-group-title1')).toBeInTheDocument();
            expect(screen.getByText('test-group-title1')).not.toHaveAttribute('aria-haspopup');
        });

        it('should call handleRequestOpen callback on click', async () => {
            const { mockHandleRequestOpen } = setup(getGroupedServices());
            await userEvent.click(getCreateDropdown());

            await userEvent.click(screen.getByText('test-group-title1'));
            await userEvent.click(screen.getByText('test-subservice1-title1'));

            expect(mockHandleRequestOpen).toHaveBeenCalledWith({
                groupName: 'test-group-name1',
                serviceName: 'test-subservice1-name1',
            });
        });
    });

    describe('menu', () => {
        it('should render CustomMenu wrapper with groupsMenu without rendering underlying custom component', async () => {
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
            await waitFor(() => expect(loadingEl).not.toHaveTextContent('Loading...'));

            const createNewInputBtn = screen.queryByRole('button', { name: 'Create New Input' });

            expect(createNewInputBtn).toBeInTheDocument();
            // that's weird
            expect(mockCustomMenuInstance.render).not.toHaveBeenCalled();
        });

        it('should render CustomMenu wrapper without groupsMenu without rendering underlying custom component', async () => {
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
            await waitFor(() => expect(loadingEl).not.toHaveTextContent('Loading...'));

            expect(mockCustomMenuInstance.render).toHaveBeenCalled();
            const createNewInputBtn = screen.queryByRole('button', { name: 'Create New Input' });
            expect(createNewInputBtn).not.toBeInTheDocument();
        });
    });
});
