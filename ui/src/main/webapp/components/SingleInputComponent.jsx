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
    width: 320px !important;
`;

const StyledDiv = styled.div`
    div:first-child {
        width: 320px !important;
    }
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
        hideClearBtn,
    } = controlOptions;

    function handleChange(e, obj) {
        restProps.handleChange(field, obj.value);
    }
    const Option = createSearchChoice ? ComboBox.Option : Select.Option;
    const Heading = createSearchChoice ? ComboBox.Heading : Select.Heading;

    function generateOptions(items) {
        const data = [];
        items.forEach((item) => {
            if (item.value && item.label) {
                data.push(<Option label={item.label} value={item.value} key={item.value} />);
            }
            if (item.children && item.label) {
                data.push(<Heading key={item.label}>{item.label}</Heading>);
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
        if (!endpointUrl && !referenceName && autoCompleteFields) {
            setOptions(generateOptions(autoCompleteFields));
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
    const effectivePlaceholder = loading ? _('Loading') : placeholder;
    // hideClearBtn=true only passed for OAuth else its undefined
    const effectiveIsClearable = effectiveDisabled ? false : !hideClearBtn;

    return (
        <>
            {createSearchChoice ? (
                <StyledDiv className="dropdownBox">
                    <ComboBox
                        value={props.value === null ? '' : props.value}
                        name={field}
                        error={error}
                        placeholder={effectivePlaceholder}
                        disabled={effectiveDisabled}
                        onChange={handleChange}
                        inline
                    >
                        {options && options.length > 0 && options}
                    </ComboBox>
                </StyledDiv>
            ) : (
                <>
                    <SelectWrapper
                        className="dropdownBox"
                        data-test-loading={loading}
                        value={props.value}
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
                    {effectiveIsClearable ? (
                        <Button
                            data-test="clear"
                            appearance="secondary"
                            icon={<Clear />}
                            onClick={() => restProps.handleChange(field, '')}
                        />
                    ) : null}
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
        hideClearBtn: PropTypes.bool,
    }),
};

export default SingleInputComponent;
