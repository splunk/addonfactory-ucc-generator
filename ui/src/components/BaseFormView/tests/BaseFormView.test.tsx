import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { getBuildDirPath } from '../../../util/script';
import { setUnifiedConfig } from '../../../util/util';
import { GlobalConfig } from '../../../types/globalConfig/globalConfig';
import mockCustomControlMockForTest from '../../CustomControl/CustomControlMockForTest';
import mockCustomHookMockForTest from '../../CustomControl/CustomHookMockForTest';
import BaseFormView from '../BaseFormView';
import {
    getGlobalConfigMockCustomControl,
    getGlobalConfigMockCustomHook,
    getGlobalConfigMockFourInputServices,
    getGlobalConfigMockGroupsForConfigPage,
    getGlobalConfigMockGroupsForInputPage,
} from './configMocks';
import { MOCK_CONTEXT_STATE_ACCOUNT, MOCK_CONTEXT_STATE_THREE_INPUTS } from './contextMocks';
import { PAGE_INPUT } from '../../../constants/pages';
import { invariant } from '../../../util/invariant';
import TableContext, { TableContextDataTypes } from '../../../context/TableContext';
import { server } from '../../../mocks/server';
import { getConfigWithAllTypesOfOauth } from '../../EntityModal/TestConfig';
import { Mode } from '../../../constants/modes';
import { StandardPages } from '../../../types/components/shareableTypes';
import {
    CustomComponentContextProvider,
    CustomComponentContextType,
} from '../../../context/CustomComponentContext';

const handleFormSubmit = vi.fn();

const PAGE_CONF = 'configuration';
const SERVICE_NAME = 'account';
const STANZA_NAME = 'stanzaName';
const CUSTOM_MODULE = 'CustomControl';
const CUSTOM_HOOK = 'CustomHook';

vi.mock('../../../util/api', async () => ({
    ...(await vi.importActual('../../../util/api')),
    postRequest: (await vi.importActual('../../../util/__mocks__/mockApi')).postRequest,
}));

const getElementsByGroup = (group: string) => {
    const firstField = screen.queryByText(`Text 1 Group ${group}`);
    const secondField = screen.queryByText(`Text 2 Group ${group}`);
    return { firstField, secondField };
};
const verifyDisplayedGroup = (group: string) => {
    const { firstField, secondField } = getElementsByGroup(group);
    expect(firstField).toBeInTheDocument();
    expect(secondField).toBeInTheDocument();
};
const verifyNotDisplayedElement = (group: string) => {
    const { firstField, secondField } = getElementsByGroup(group);
    expect(firstField).not.toBeInTheDocument();
    expect(secondField).not.toBeInTheDocument();
};

const getControlGroupByDataName = (dataName: string) => {
    const controlGroups = screen.getAllByTestId('control-group');
    return controlGroups.find((el) => el.getAttribute('data-name') === dataName);
};

const getEntityTextBox = (entityField: string) => {
    const controlGroup = getControlGroupByDataName(entityField);
    invariant(controlGroup, `Control group with data-name="${entityField}" not found`);
    return within(controlGroup as HTMLElement).getByRole('textbox');
};

const initializeFormRef = (
    mockConfig: GlobalConfig,
    mockContext?: TableContextDataTypes,
    serviceName = 'example_input_four',
    mode: Mode = 'create',
    stanzaName = 'stanzaName',
    page: StandardPages = PAGE_INPUT,
    currentServiceState = {}
) => {
    setUnifiedConfig(mockConfig);

    const formRef = React.createRef<BaseFormView>();

    render(
        <TableContext.Provider
            value={{
                rowData: {},
                setRowData: () => {},
                setSearchText: () => {},
                setSearchType: () => {},
                pageSize: 10,
                setPageSize: () => {},
                setCurrentPage: () => {},
                currentPage: 0,
                searchText: '',
                searchType: 'all',
                ...mockContext,
            }}
        >
            <BaseFormView
                ref={formRef}
                page={page}
                stanzaName={stanzaName}
                serviceName={serviceName}
                mode={mode}
                handleFormSubmit={handleFormSubmit}
                currentServiceState={currentServiceState}
            />
        </TableContext.Provider>
    );
    return formRef;
};

it('should render base form correctly with name and File fields', async () => {
    const mockConfig = getGlobalConfigMock();
    setUnifiedConfig(mockConfig);

    render(
        <BaseFormView
            page={PAGE_CONF}
            stanzaName={STANZA_NAME}
            serviceName={SERVICE_NAME}
            mode="create"
            currentServiceState={{}}
            handleFormSubmit={handleFormSubmit}
        />
    );

    screen.getByRole('textbox', { name: 'Name' });
    const fileField = getControlGroupByDataName('name');
    expect(fileField).toBeInTheDocument();
});

it('should pass default values to custom component correctly', async () => {
    const mockConfig = getGlobalConfigMockCustomControl();
    setUnifiedConfig(mockConfig);

    // doMock is not hoisted to the top of the file
    vi.doMock(`${getBuildDirPath()}/custom/${CUSTOM_MODULE}.js`, () => ({
        default: mockCustomControlMockForTest,
    }));

    render(
        <BaseFormView
            page={PAGE_CONF}
            stanzaName={STANZA_NAME}
            serviceName={SERVICE_NAME}
            mode="config"
            currentServiceState={{
                custom_control_field: 'input_three',
                name: 'some_unique_name',
            }}
            handleFormSubmit={handleFormSubmit}
        />
    );
    const customModal = await screen.findByTestId('customSelect');
    expect(customModal).toBeInTheDocument();

    expect((customModal as HTMLSelectElement)?.value).toEqual('input_three');
});

it('should pass default values to custom component correctly - component via context', async () => {
    const mockConfig = getGlobalConfigMockCustomControl();
    setUnifiedConfig(mockConfig);

    const compContext: CustomComponentContextType = {
        [CUSTOM_MODULE]: {
            component: mockCustomControlMockForTest,
            type: 'control',
        },
    };

    render(
        <CustomComponentContextProvider customComponents={compContext}>
            <BaseFormView
                page={PAGE_CONF}
                stanzaName={STANZA_NAME}
                serviceName={SERVICE_NAME}
                mode="config"
                currentServiceState={{
                    custom_control_field: 'input_three',
                    name: 'some_unique_name',
                }}
                handleFormSubmit={handleFormSubmit}
                customComponentContext={compContext}
            />
        </CustomComponentContextProvider>
    );
    const customModal = await screen.findByTestId('customSelect');
    expect(customModal).toBeInTheDocument();

    expect((customModal as HTMLSelectElement)?.value).toEqual('input_three');
});

it.each([
    {
        page: 'configuration' as const,
        config: getGlobalConfigMockGroupsForConfigPage(),
        service: 'account',
    },
    {
        page: 'inputs' as const,
        config: getGlobalConfigMockGroupsForInputPage(),
        service: 'demo_input',
    },
])('entities grouping for page works properly %s', async ({ config, page, service }) => {
    setUnifiedConfig(config);

    render(
        <BaseFormView
            page={page}
            stanzaName={STANZA_NAME}
            serviceName={service}
            mode="create"
            currentServiceState={{}}
            handleFormSubmit={handleFormSubmit}
        />
    );
    const group1Header = await screen.findByText('Group 1', { exact: true });

    const group2Header = await screen.findByRole('button', { name: 'Group 2' });

    const group3Header = await screen.findByRole('button', { name: 'Group 3' });

    verifyDisplayedGroup('1');
    verifyDisplayedGroup('2');
    verifyNotDisplayedElement('3'); // group 3 is not expanded by default

    expect(group3Header).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(group3Header);
    verifyDisplayedGroup('3');
    expect(group3Header).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(group1Header); // does not change anything
    verifyDisplayedGroup('1');

    expect(group2Header).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(group2Header);
    expect(group2Header).toHaveAttribute('aria-expanded', 'false');

    /**
     * verifying aria-expanded attribute as in tests
     * child elements are not removed from the DOM
     * they are removed in browser
     * todo: verify behaviour
     */
    await userEvent.click(group2Header);
    verifyDisplayedGroup('1');
    verifyDisplayedGroup('2');
    verifyDisplayedGroup('3'); // after modifications all groups should be displayed
});

describe('Verify if submiting BaseFormView works', () => {
    it('Correctly pass form data via post', async () => {
        const formRef = initializeFormRef(
            getGlobalConfigMockFourInputServices(),
            MOCK_CONTEXT_STATE_THREE_INPUTS
        );

        const NAME_INPUT = 'new_unique_test_name';
        const INTERVAL_INPUT = '123123123';

        const nameInput = getEntityTextBox('name');
        await userEvent.type(nameInput, NAME_INPUT);

        const intervalInput = getEntityTextBox('interval');
        await userEvent.type(intervalInput, INTERVAL_INPUT);

        server.use(
            http.post(
                '/servicesNS/nobody/-/demo_addon_for_splunk_example_input_four',
                async ({ request }) => {
                    const formData = await request.formData();
                    const name = formData.get('name');
                    const interval = formData.get('interval');
                    expect(name).toEqual(NAME_INPUT);
                    expect(interval).toEqual(INTERVAL_INPUT);
                    return HttpResponse.json(
                        {
                            entry: [
                                {
                                    name,
                                    content: {
                                        interval,
                                    },
                                },
                            ],
                        },
                        { status: 201 }
                    );
                }
            )
        );

        await formRef.current?.handleSubmit({ preventDefault: () => {} } as React.FormEvent);

        // response was success(mocked) and handled
        await waitFor(() => expect(handleFormSubmit).toHaveBeenCalledWith(false, true));
    });

    it('should throw error as name already used', async () => {
        const formRef = initializeFormRef(
            getGlobalConfigMockFourInputServices(),
            MOCK_CONTEXT_STATE_THREE_INPUTS
        );

        const NAME_INPUT = 'test';
        const INTERVAL_INPUT = '123123123';

        const nameInput = getEntityTextBox('name');
        await userEvent.type(nameInput, NAME_INPUT);

        const intervalInput = getEntityTextBox('interval');
        await userEvent.type(intervalInput, INTERVAL_INPUT);

        await formRef.current?.handleSubmit({ preventDefault: () => {} } as React.FormEvent);

        const errorMessage = screen.getByText(`Name ${NAME_INPUT} is already in use`);
        expect(errorMessage).toBeInTheDocument();
    });

    const renderAndSubmitForm = async (
        inputsUniqueAcrossSingleService: boolean,
        nameInputValue: string,
        intervalInputValue: string
    ) => {
        const globalConfigMock = getGlobalConfigMockFourInputServices();

        if (globalConfigMock.pages.inputs) {
            // not ideal way to write property but seems easiest and more clean the others
            globalConfigMock.pages.inputs.inputsUniqueAcrossSingleService =
                inputsUniqueAcrossSingleService;
        }

        const formRef = initializeFormRef(
            globalConfigMock,
            MOCK_CONTEXT_STATE_THREE_INPUTS,
            'example_input_two'
        );

        const nameInput = getEntityTextBox('name');
        await userEvent.type(nameInput, nameInputValue);

        const intervalInput = getEntityTextBox('interval');
        await userEvent.type(intervalInput, intervalInputValue);

        server.use(
            http.post(
                '/servicesNS/nobody/-/demo_addon_for_splunk_example_input_two',
                async ({ request }) => {
                    const formData = await request.formData();
                    const name = formData.get('name');
                    const interval = formData.get('interval');
                    return HttpResponse.json(
                        {
                            entry: [
                                {
                                    name,
                                    content: {
                                        interval,
                                    },
                                },
                            ],
                        },
                        { status: 201 }
                    );
                }
            )
        );

        await formRef.current?.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    };

    it('Add already existing name for different service - inputsUniqueAcrossSingleService true', async () => {
        const NAME_INPUT = 'test'; // already existing as data in service example_input_one and example_input_four
        const INTERVAL_INPUT = '123123123';

        await renderAndSubmitForm(true, NAME_INPUT, INTERVAL_INPUT);
        // response was success(mocked) and handled
        // if response is sucess it is called twice with (true, false) and (false, true)
        await waitFor(() => expect(handleFormSubmit).toHaveBeenCalledWith(false, true));
    });

    it('Error name already exists for different service - inputsUniqueAcrossSingleService false', async () => {
        const NAME_INPUT = 'test'; // already existing as data in service example_input_one and example_input_four
        const INTERVAL_INPUT = '123123123';

        await renderAndSubmitForm(false, NAME_INPUT, INTERVAL_INPUT);

        const errorMessage = screen.getByText(`Name ${NAME_INPUT} is already in use`);
        expect(errorMessage).toBeInTheDocument();
    });
});

describe('Verify if oauth loads correctly', () => {
    const content: Record<string, string> = {
        basic: 'Basic Authentication',
        oauth: 'OAuth 2.0 Authentication',
        oauth_client_credentials: 'OAuth 2.0 Client Credentials',
    };

    it.each<{
        auth_type: string;
        stanza: string;
        mode: Mode;
    }>([
        { auth_type: 'basic', stanza: 'test_basic_oauth', mode: 'config' },
        { auth_type: 'oauth', stanza: 'test_oauth_oauth', mode: 'config' },
        {
            auth_type: 'oauth_client_credentials',
            stanza: 'test_oauth_client_creds',
            mode: 'config',
        },
        { auth_type: 'basic', stanza: 'test_basic_oauth', mode: 'edit' },
        { auth_type: 'oauth', stanza: 'test_oauth_oauth', mode: 'edit' },
        { auth_type: 'oauth_client_credentials', stanza: 'test_oauth_client_creds', mode: 'edit' },
    ])('load correctly oauth labels for - %s', async (authData) => {
        const mockConfig = getConfigWithAllTypesOfOauth();

        initializeFormRef(
            mockConfig,
            MOCK_CONTEXT_STATE_ACCOUNT,
            'account',
            authData.mode,
            authData.stanza,
            PAGE_CONF,
            {
                auth_type: authData.auth_type,
                name: 'some_unique_name',
            }
        );

        const oauthSelector = await screen.findByRole('combobox', {
            name: 'Auth Type',
        });

        expect(oauthSelector).toBeInTheDocument();
        expect(oauthSelector).toHaveTextContent(content[authData.auth_type]);
    });
});

describe('Verify if custom hook works correctly', () => {
    const setupViaCustomFile = () => {
        // doMock is not hoisted to the top of the file
        vi.doMock(`${getBuildDirPath()}/custom/${CUSTOM_HOOK}.js`, () => ({
            default: mockCustomHookMockForTest,
        }));

        render(
            <BaseFormView
                page={PAGE_CONF}
                stanzaName={STANZA_NAME}
                serviceName={SERVICE_NAME}
                mode="create"
                currentServiceState={{
                    custom_control_field: 'input_three',
                    name: 'some_unique_name',
                }}
                handleFormSubmit={handleFormSubmit}
            />
        );
    };

    const setupHookViaContext = () => {
        const compContext: CustomComponentContextType = {
            [CUSTOM_HOOK]: {
                component: mockCustomHookMockForTest,
                type: 'hook',
            },
        };
        render(
            <CustomComponentContextProvider customComponents={compContext}>
                <BaseFormView
                    page={PAGE_CONF}
                    stanzaName={STANZA_NAME}
                    serviceName={SERVICE_NAME}
                    mode="create"
                    currentServiceState={{
                        custom_control_field: 'input_three',
                        name: 'some_unique_name',
                    }}
                    handleFormSubmit={handleFormSubmit}
                    customComponentContext={compContext}
                />
            </CustomComponentContextProvider>
        );
    };
    it('custom hook via file in custom dir, loads name value from hook', async () => {
        const mockConfig = getGlobalConfigMockCustomHook(CUSTOM_HOOK);
        setUnifiedConfig(mockConfig);
        setupViaCustomFile();
        const nameInput = await screen.findByRole('textbox', { name: 'Name' });
        expect(nameInput).toBeInTheDocument();

        await waitFor(() => {
            expect(nameInput).toHaveValue('basic value for name loaded from hook');
        });
    });

    it('custom hook via file in custom dir, loads name markdown message via hook', async () => {
        const mockConfig = getGlobalConfigMockCustomHook(CUSTOM_HOOK);
        setUnifiedConfig(mockConfig);
        setupViaCustomFile();

        await waitFor(() => {
            expect(screen.getByText('This is a markdown message added from hook'));
        });
    });

    it('custom hook via context, loads name value from hook', async () => {
        const mockConfig = getGlobalConfigMockCustomHook(CUSTOM_HOOK);
        setUnifiedConfig(mockConfig);
        setupHookViaContext();

        const nameInput = await screen.findByRole('textbox', { name: 'Name' });
        expect(nameInput).toBeInTheDocument();

        await waitFor(() => {
            expect(nameInput).toHaveValue('basic value for name loaded from hook');
        });
    });

    it('custom hook via context, modifies name value correctly', async () => {
        const mockConfig = getGlobalConfigMockCustomHook(CUSTOM_HOOK);
        setUnifiedConfig(mockConfig);
        setupHookViaContext();
        const user = userEvent.setup();

        const nameInput = await screen.findByRole('textbox', { name: 'Name' });
        expect(nameInput).toBeInTheDocument();
        const newNameValue = 'addNumberAtEndInHook';
        await user.clear(nameInput);
        await user.type(nameInput, newNameValue);

        await waitFor(() => {
            expect(nameInput).toHaveValue(`${newNameValue}321`);
        });
    });
});
