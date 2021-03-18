import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import BaseFormView from './BaseFormView';
import { axiosCallWrapper } from '../util/axiosCallWrapper';
import { MODE_EDIT } from '../constants/modes';

function ConfigurationFormView({ serviceName }) {
    const form = useRef();
    const [error, setError] = useState(null);
    const [currentServiceState, setCurrentServiceState] = useState({});

    useEffect(() => {
        axiosCallWrapper({
            serviceName: `settings/${serviceName}`,
            handleError: true,
            callbackOnError: (error) => {
                setError(error);
            },
        }).then((response) => {
            setCurrentServiceState(response.data.entry[0].content);
        });
    }, []);

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
        <BaseFormView
            ref={form}
            page="configuration"
            serviceName={serviceName}
            mode={MODE_EDIT}
            currentInput={currentServiceState}
            renderSave
        />
    );
}

ConfigurationFormView.propTypes = {
    serviceName: PropTypes.string.isRequired,
};

export default ConfigurationFormView;
