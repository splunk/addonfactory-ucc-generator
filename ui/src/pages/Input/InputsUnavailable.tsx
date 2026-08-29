import React, { ReactElement } from 'react';
import styled from 'styled-components';
import Message from '@splunk/react-ui/Message';
import { _ } from '@splunk/ui-utils/i18n';

import {
    INPUTS_UNAVAILABLE_HEADING,
    INPUTS_UNAVAILABLE_MESSAGE,
} from '../../constants/inputsAvailability';

const Wrapper = styled.div`
    padding: 24px;
    max-width: 720px;
    margin: 48px auto 0 auto;
`;

const Heading = styled.h1`
    font-size: 18px;
    margin: 0 0 16px 0;
`;

interface InputsUnavailableProps {
    /**
     * Optional WARN text returned by the library. When provided, it is
     * rendered instead of the local default — this lets upstream copy
     * changes flow through to the UI without an UCC release.
     */
    message?: string;
}

/**
 * Page-level placeholder shown in lieu of the Inputs UI when the
 * library-side gate fires (Classic Splunk Cloud Search Heads where
 * inputs cannot be configured). Use of `<Message>` keeps the look
 * consistent with the rest of the form-error surface.
 */
function InputsUnavailable({ message }: InputsUnavailableProps): ReactElement {
    return (
        <Wrapper data-test="inputs-unavailable">
            <Heading>{_(INPUTS_UNAVAILABLE_HEADING)}</Heading>
            <Message appearance="fill" type="info">
                {_(message || INPUTS_UNAVAILABLE_MESSAGE)}
            </Message>
        </Wrapper>
    );
}

export default InputsUnavailable;
