import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Multiselect from '@splunk/react-ui/Multiselect';
import styled from 'styled-components';
import axios from 'axios';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';

import { axiosCallWrapper } from '../util/axiosCallWrapper';
import { filterResponse } from '../util/util';

const MultiSelectWrapper = styled(Multiselect)`
    width: 320px !important;
`;

const WaitSpinnerWrapper = styled(WaitSpinner)`
    margin-left: 5px;
`;

function MultiInputComponent(props) {
    const {
        field,
        disabled = false,
        error = false,
        value,
        controlOptions,
        dependencyValues,
        ...restProps
    } = props;
    const {
        endpointUrl,
        denyList,
        allowList,
        items,
        dependencies,
        referenceName,
        createSearchChoice,
        labelField,
        delimiter = ',',
    } = controlOptions;

    function handleChange(e, { values }) {
        restProps.handleChange(field, values.join(delimiter));
    }

    function generateOptions(itemList) {
        return itemList.map((item) => (
            <Multiselect.Option label={item.label} value={item.value} key={item.value} />
        ));
    }

    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState(null);

    useEffect(() => {
        if (!endpointUrl && items) {
            setOptions(generateOptions(items));
            return;
        }

        let current = true;
        const source = axios.CancelToken.source();

        // eslint-disable-next-line no-shadow
        const options = { cancelToken: source.token, handleError: true, params: { count: -1 } };
        if (referenceName) {
            options.serviceName = referenceName;
        } else if (endpointUrl) {
            options.endpointUrl = endpointUrl;
        }

        if (dependencyValues) {
            options.params = { ...options.params, ...dependencyValues };
        }
        if (!dependencies || dependencyValues) {
            setLoading(true);
            axiosCallWrapper(options)
                .then((response) => {
                    if (current) {
                        setOptions(
                            generateOptions(
                                filterResponse(response.data.entry, labelField, allowList, denyList)
                            )
                        );
                        setLoading(false);
                    }
                })
                .catch(() => {
                    if (current) {
                        setLoading(false);
                    }
                });
        }
        // eslint-disable-next-line consistent-return
        return () => {
            source.cancel('Operation canceled.');
            current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dependencyValues]);

    const effectiveDisabled = loading ? true : disabled;
    const loadingIndicator = loading ? <WaitSpinnerWrapper /> : null;

    const valueList = value ? value.split(delimiter) : [];

    return (
        <>
            <MultiSelectWrapper
                values={valueList}
                error={error}
                name={field}
                disabled={effectiveDisabled}
                allowNewValues={createSearchChoice}
                onChange={handleChange} // eslint-disable-line react/jsx-no-bind
                inline
            >
                {options && options.length > 0 && options}
            </MultiSelectWrapper>
            {loadingIndicator}
        </>
    );
}

MultiInputComponent.propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    error: PropTypes.bool,
    handleChange: PropTypes.func.isRequired,
    field: PropTypes.string,
    dependencyValues: PropTypes.object,
    controlOptions: PropTypes.shape({
        delimiter: PropTypes.string,
        createSearchChoice: PropTypes.bool,
        referenceName: PropTypes.string,
        dependencies: PropTypes.array,
        endpointUrl: PropTypes.string,
        denyList: PropTypes.string,
        allowList: PropTypes.string,
        labelField: PropTypes.string,
        items: PropTypes.arrayOf(
            PropTypes.shape({
                label: PropTypes.string.isRequired,
                value: PropTypes.string.isRequired,
            })
        ),
    }),
};

export default MultiInputComponent;
