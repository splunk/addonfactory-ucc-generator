import React, { useRef, useEffect, useState } from 'react';

import BaseFormView from './BaseFormView';
import { axiosCallWrapper } from '../util/axiosCallWrapper';
import { MODE_EDIT } from '../constants/modes';

const SingleFormView = ({ serviceName, handleSavedata }) => {
    const form = useRef();
    const [error, setError] = useState(null);

    useEffect(() => {
        axiosCallWrapper({
            serviceName: `settings/${serviceName}`,
            handleError: true,
            callbackOnError: (error) => {
                setError(error);
            },
        }).then((response) => {
            console.log(response);
        });
    }, []);

    const handleSubmit = () => {
        const { result, data } = form.current.handleSubmit();
        if (result) {
            const save = handleSavedata(data);
            if (save) {
                console.log('saved!');
            } else {
                console.log('failed to save!');
            }
        }
    };

    if (error?.uccErrorCode) {
        throw error;
    }
    return (
        <div style={{ marginTop: '10px' }}>
            <BaseFormView
                ref={form}
                isInput={false}
                serviceName={serviceName}
                mode={MODE_EDIT}
                currentInput="abc"
                renderSave
            />
        </div>
    );
};

export default SingleFormView;
