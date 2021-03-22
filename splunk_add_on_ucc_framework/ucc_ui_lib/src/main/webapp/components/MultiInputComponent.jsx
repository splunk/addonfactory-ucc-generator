import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Multiselect from '@splunk/react-ui/Multiselect';
import { _ } from '@splunk/ui-utils/i18n';
import axios from 'axios';
import { axiosCallWrapper } from '../util/axiosCallWrapper';
import { filterResponse } from '../util/util';

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
        placeholder,
        createSearchChoice,
        labelField,
        delimiter = ',',
    } = controlOptions;

    function handleChange(e, { values }) {
        restProps.handleChange(field, values.join(delimiter));
    }

    function generateOptions(items) {
        return items.map((item) => (
            <Multiselect.Option label={item.label} value={item.value} key={item.value} />
        ));
    }

    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState(null);

    useEffect(() => {
        if (items) {
            setOptions(generateOptions(items));
            return;
        }

        let current = true;
        const source = axios.CancelToken.source();

        const options = { CancelToken: source.token, handleError: true };
        if (referenceName) {
            options.serviceName = referenceName;
        } else if (endpointUrl) {
            options.endpointUrl = endpointUrl;
        }

        if (dependencyValues) {
            options.params = dependencyValues;
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
                .catch((error) => {
                    if (current) {
                        setLoading(false);
                    }
                });
        }
        return () => {
            source.cancel('Operation canceled.');
            current = false;
        };
    }, [dependencyValues]);

    const effectiveDisabled = loading ? true : disabled;
    const effectivePlaceholder = loading ? _('Loading') : placeholder;

    const valueList = value ? value.split(delimiter) : [];

    return (
        <Multiselect
            values={valueList}
            error={error}
            name={field}
            placeholder={effectivePlaceholder}
            disabled={effectiveDisabled}
            allowNewValues={createSearchChoice}
            onChange={handleChange}
            inline
        >
            {options && options.length > 0 && options}
        </Multiselect>
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
        placeholder: PropTypes.string,
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
