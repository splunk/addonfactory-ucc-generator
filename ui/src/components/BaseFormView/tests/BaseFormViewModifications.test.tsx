import { render, screen, within } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';

import { setUnifiedConfig } from '../../../util/util';
import BaseFormView from '../BaseFormView';
import { getGlobalConfigMockModificationToFieldItself } from './configMocks';
import { invariant } from '../../../util/invariant';

const handleFormSubmit = jest.fn();

const PAGE_CONF = 'configuration';
const SERVICE_NAME = 'account';
const STANZA_NAME = 'stanzaName';

it('should modify correctly all properties of field, self modification', async () => {
    const mockConfig = getGlobalConfigMockModificationToFieldItself();
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

    await screen.findByText('default label');

    const controlGroups = screen.getAllByTestId('control-group');
    const modifyTextField = controlGroups.find(
        (el) => el.getAttribute('data-name') === 'text_field_with_modifications'
    ) as HTMLElement;

    expect(modifyTextField).toBeInTheDocument();

    invariant(modifyTextField, 'modification field should be defined');

    expect(within(modifyTextField).getByTestId('help')).toHaveTextContent('default help');
    expect(within(modifyTextField).getByTestId('label')).toHaveTextContent('default label');
    expect(within(modifyTextField).getByTestId('msg-markdown')).toHaveTextContent(
        'default markdown message'
    );
    expect(within(modifyTextField).queryByText('*')).not.toBeInTheDocument();

    const inputComponent = within(modifyTextField).getByRole('textbox');
    await userEvent.clear(inputComponent);
    await userEvent.type(inputComponent, 'modify itself');

    expect(within(modifyTextField).getByTestId('help')).toHaveTextContent(
        'help after modification'
    );
    expect(within(modifyTextField).getByTestId('label')).toHaveTextContent(
        'label after modification'
    );
    expect(within(modifyTextField).getByTestId('msg-markdown')).toHaveTextContent(
        'markdown message after modification'
    );
    expect(await within(modifyTextField).findByText('*')).toBeInTheDocument();
});
