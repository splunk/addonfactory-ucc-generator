import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { _ } from '@splunk/ui-utils/i18n';
import styled from 'styled-components';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';

import BaseFormView from './BaseFormView';
import { StyledButton } from '../pages/EntryPageStyle';
import { axiosCallWrapper } from '../util/axiosCallWrapper';
import { MODE_CONFIG } from '../constants/modes';
import { WaitSpinnerWrapper } from './table/CustomTableStyle';
import { PAGE_CONF } from '../constants/pages';

const ButtonWrapper = styled.div`
    margin-left: 270px !important;
    width: 150px;
`;

function ConfigurationFormView({ serviceName }) {
    const form = useRef(); // nosemgrep: typescript.react.security.audit.react-no-refs.react-no-refs
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentServiceState, setCurrentServiceState] = useState({});

    useEffect(() => {
        axiosCallWrapper({
            serviceName: `settings/${serviceName}`,
            handleError: true,
            callbackOnError: (err) => {
                setError(err);
            },
        }).then((response) => {
            setCurrentServiceState(response.data.entry[0].content);
        });
    }, [serviceName]);

    /**
     * @param event {React.MouseEvent<HTMLButtonElement>}
     */
    const handleSubmit = (event) => {
        form.current.handleSubmit(event);
    };

    const handleFormSubmit = (set) => {
        setIsSubmitting(set);
    };

    if (error) {
        throw error;
    }

    // Ref is used here to call submit method of form only
    return Object.keys(currentServiceState).length ? (
        <>
            <BaseFormView // nosemgrep: typescript.react.security.audit.react-no-refs.react-no-refs
                ref={form}
                page={PAGE_CONF}
                stanzaName={serviceName}
                serviceName="settings"
                mode={MODE_CONFIG}
                currentServiceState={currentServiceState}
                handleFormSubmit={handleFormSubmit}
            />
            <ButtonWrapper>
                <StyledButton
                    className="saveBtn"
                    appearance="primary"
                    label={isSubmitting ? <WaitSpinner /> : _('Save')}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                />
            </ButtonWrapper>
        </>
    ) : (
        <WaitSpinnerWrapper size="medium" />
    );
}

ConfigurationFormView.propTypes = {
    serviceName: PropTypes.string.isRequired,
};

export default ConfigurationFormView;
