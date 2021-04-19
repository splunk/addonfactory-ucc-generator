import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from '@splunk/react-ui/Select';
import ComboBox from '@splunk/react-ui/ComboBox';
import Button from '@splunk/react-ui/Button';
import Clear from '@splunk/react-icons/Clear';
import { _ } from '@splunk/ui-utils/i18n';
import axios from 'axios';
import styled from 'styled-components';

import { axiosCallWrapper } from '../util/axiosCallWrapper';
import { filterResponse } from '../util/util';

const SelectWrapper = styled(Select)`
    width: 300px !important;
`;

function SingleInputComponent(props) {
    const {
        field,
        disabled = false,
        error = false,
        controlOptions,
        dependencyValues,
        ...restProps
    } = props;
    const {
        endpointUrl,
        denyList,
        allowList,
        placeholder = _('Select a value'),
        dependencies,
        createSearchChoice,
        referenceName,
        disableSearch,
        labelField,
        autoCompleteFields,
    } = controlOptions;

    const [value, setSelectValue] = useState(props.value);

    function handleChange(e, { value: currentValue }) {
        setSelectValue(currentValue);
        restProps.handleChange(field, currentValue);
    }
    const Option = createSearchChoice ? ComboBox.Option : Select.Option;

    function generateOptions(items) {
        const data = [];
        items.forEach((item) => {
            if (item.value && item.label) {
                data.push(<Option label={item.label} value={item.value} key={item.value} />);
            }
            if (item.children && item.label) {
                data.push(<Select.Heading key={item.label}>{item.label}</Select.Heading>);
                item.children.forEach((child) => {
                    data.push(<Option label={child.label} value={child.value} key={child.value} />);
                });
            }
        });
        return data;
    }

    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState(null);

    useEffect(() => {
        if (autoCompleteFields) {
            setOptions(generateOptions(autoCompleteFields));
            return;
        }

        let current = true;
        const source = axios.CancelToken.source();

        // eslint-disable-next-line no-shadow
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
    const effectivePlaceholder = loading ? _('Loading') : placeholder;

    return (
        <>
            {createSearchChoice ? (
                <ComboBox
                    value={value}
                    name={field}
                    error={error}
                    placeholder={effectivePlaceholder}
                    disabled={effectiveDisabled}
                    onChange={handleChange}
                    inline
                >
                    {options && options.length > 0 && options}
                </ComboBox>
            ) : (
                <>
                    <SelectWrapper
                        value={value}
                        name={field}
                        error={error}
                        placeholder={effectivePlaceholder}
                        disabled={effectiveDisabled}
                        onChange={handleChange}
                        filter={!disableSearch}
                        inline
                    >
                        {options && options.length > 0 && options}
                    </SelectWrapper>
                    <Button
                        appearance="secondary"
                        icon={<Clear />}
                        onClick={() => setSelectValue()}
                    />
                </>
            )}
        </>
    );
}

SingleInputComponent.propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    error: PropTypes.bool,
    handleChange: PropTypes.func.isRequired,
    field: PropTypes.string,
    dependencyValues: PropTypes.object,
    controlOptions: PropTypes.shape({
        autoCompleteFields: PropTypes.array,
        endpointUrl: PropTypes.string,
        denyList: PropTypes.string,
        allowList: PropTypes.string,
        placeholder: PropTypes.string,
        dependencies: PropTypes.array,
        createSearchChoice: PropTypes.bool,
        referenceName: PropTypes.string,
        disableSearch: PropTypes.bool,
        labelField: PropTypes.string,
    }),
};

export default SingleInputComponent;
