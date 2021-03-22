import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@splunk/react-ui/Button';
import ControlGroup from '@splunk/react-ui/ControlGroup';

import BaseFormView from './BaseFormView';
import { axiosCallWrapper } from '../util/axiosCallWrapper';
import { MODE_EDIT } from '../constants/modes';

function ConfigurationFormView({ serviceName }) {
    const form = useRef();
    const [error, setError] = useState(null);
    const [currentServiceState, setCurrentServiceState] = useState({});

    // TODO: move this logic to BaseFormView
    useEffect(() => {
        axiosCallWrapper({
            serviceName: `settings/${serviceName}`,
            handleError: true,
            callbackOnError: (error) => {
                error.uccErrorCode = 'ERR0004';
                setError(error);
            },
        }).then((response) => {
            setCurrentServiceState(response.data.entry[0].content);
        });
    }, [serviceName]);

    const handleSubmit = () => {
        const { result, data } = form.current.handleSubmit();
        if (result) {
            console.log(result);
            console.log(data);
        }
    };

    if (error?.uccErrorCode) {
        throw error;
    }

    return (
        <>
            <BaseFormView
                ref={form}
                page="configuration"
                serviceName={serviceName}
                mode={MODE_EDIT}
                currentInput={currentServiceState}
            />
            <ControlGroup label="">
                <div style={{ flexGrow: 0 }}>
                    <Button appearance="primary" label="Save" />
                </div>
            </ControlGroup>
        </>
    );
}

ConfigurationFormView.propTypes = {
    serviceName: PropTypes.string.isRequired,
};

export default ConfigurationFormView;
