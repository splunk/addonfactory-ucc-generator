import { render, screen, within } from '@testing-library/react';
import React from 'react';

import { setUnifiedConfig } from '../../util/util';
import BaseFormView from './BaseFormView';
import { getGlobalConfigMockModificationToGroupsConfig } from './BaseFormConfigMock';

const handleFormSubmit = jest.fn();

const PAGE_CONF = 'configuration';
const SERVICE_NAME = 'account';
const STANZA_NAME = 'stanzaName';

it('should modify correctly all properties of field in groups', async () => {
    const mockConfig = getGlobalConfigMockModificationToGroupsConfig();
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
    await screen.findByRole('textbox', { name: 'Text 1 Group 2' });

    const getAndValidateGroupFieldLabels = (
        fieldId: string,
        label: string,
        help: string,
        markdownMsg: string
    ) => {
        const modifiedFieldSameGroup = document.querySelector(
            `[data-name="${fieldId}"]`
        ) as HTMLElement;

        expect(modifiedFieldSameGroup).toBeInTheDocument();

        expect(within(modifiedFieldSameGroup).getByTestId('help')).toHaveTextContent(label);
        expect(within(modifiedFieldSameGroup).getByTestId('label')).toHaveTextContent(help);
        expect(within(modifiedFieldSameGroup).getByTestId('msg-markdown')).toHaveTextContent(
            markdownMsg
        );
        return modifiedFieldSameGroup;
    };

    const modifiedFieldSameGroup = screen.getByRole('textbox', {
        name: 'label after mods 2-1',
        description: 'markdown message after mods 2-1 help after mods 2-1',
    });

    expect(modifiedFieldSameGroup).toBeInTheDocument();
    expect(modifiedFieldSameGroup).toHaveAttribute('required');

    const modifiedFieldDiffGroup = getAndValidateGroupFieldLabels(
        'text_field_2_group_2',
        'help after mods 2-2',
        'label after mods 2-2',
        'markdown message after mods 2-2'
    );

    expect(within(modifiedFieldDiffGroup).queryByText('*')).not.toBeInTheDocument();
});
