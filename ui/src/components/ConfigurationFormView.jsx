import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { _ } from '@splunk/ui-utils/i18n';
import styled from 'styled-components';

import BaseFormView from './BaseFormView/BaseFormView';
import { UCCButton } from './UCCButton/UCCButton';
import { getRequest, generateEndPointUrl } from '../util/api';
import { MODE_CONFIG } from '../constants/modes';
import { WaitSpinnerWrapper } from './table/CustomTableStyle';
import { PAGE_CONF } from '../constants/pages';
import PageContext from '../context/PageContext';
import CustomComponentContext from '../context/CustomComponentContext';

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
        const abortController = new AbortController();
        getRequest({
            endpointUrl: generateEndPointUrl(`settings/${encodeURIComponent(serviceName)}`),
            handleError: true,
            signal: abortController.signal,
            callbackOnError: (err) => {
                if (abortController.signal.aborted) {
                    return;
                }
                setError(err);
            },
        })
            .catch((caughtError) => {
                if (abortController.signal.aborted) {
                    return null;
                }
                throw caughtError;
            })
            .then((data) => {
                if (!data) {
                    return;
                }
                setCurrentServiceState(data.entry[0].content);
            });

        return () => {
            abortController.abort();
        };
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
            <CustomComponentContext.Consumer>
                {(customComponentContext) => (
                    <PageContext.Consumer>
                        {(pageContext) => (
                            <BaseFormView // nosemgrep: typescript.react.security.audit.react-no-refs.react-no-refs
                                ref={form}
                                page={PAGE_CONF}
                                stanzaName={serviceName}
                                serviceName="settings"
                                mode={MODE_CONFIG}
                                currentServiceState={currentServiceState}
                                handleFormSubmit={handleFormSubmit}
                                pageContext={pageContext}
                                customComponentContext={customComponentContext}
                            />
                        )}
                    </PageContext.Consumer>
                )}
            </CustomComponentContext.Consumer>

            <ButtonWrapper>
                <UCCButton
                    className="saveBtn"
                    label={_('Save')}
                    onClick={handleSubmit}
                    loading={isSubmitting}
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
