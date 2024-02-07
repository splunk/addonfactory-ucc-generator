import React, { useState, useEffect, ReactElement } from 'react';
import Select from '@splunk/react-ui/Select';
import Button from '@splunk/react-ui/Button';
import ComboBox from '@splunk/react-ui/ComboBox';
import Clear from '@splunk/react-icons/enterprise/Clear';
import axios from 'axios';
import styled from 'styled-components';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';

import { axiosCallWrapper } from '../util/axiosCallWrapper';
import { filterResponse } from '../util/util';

const SelectWrapper = styled(Select)`
    width: 320px !important;
`;

const WaitSpinnerWrapper = styled(WaitSpinner)`
    margin-left: 5px;
`;

const StyledDiv = styled.div`
    div:first-child {
        width: 320px !important;
    }
`;

interface FormItem {
    label: string;
    value: string;
    children?: { label: string; value: string }[];
}

interface SingleInputComponentProps {
    id?: string;
    disabled?: boolean;
    value: string;
    error?: boolean;
    handleChange: (field: string, value: string | number | boolean) => void;
    field: string;
    dependencyValues?: Record<string, unknown>;
    controlOptions: {
        autoCompleteFields?: FormItem[];
        endpointUrl?: string;
        denyList?: string;
        allowList?: string;
        dependencies?: [];
        createSearchChoice?: boolean;
        referenceName?: string;
        disableSearch?: boolean;
        labelField?: string;
        hideClearBtn?: boolean;
    };
    required: boolean;
}

function SingleInputComponent(props: SingleInputComponentProps) {
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
        dependencies,
        createSearchChoice,
        referenceName,
        disableSearch,
        labelField,
        autoCompleteFields,
        hideClearBtn,
    } = controlOptions;

    function handleChange(e: unknown, obj: { value: string | number | boolean }) {
        restProps.handleChange(field, obj.value);
    }
    const Option = createSearchChoice ? ComboBox.Option : Select.Option;
    const Heading = createSearchChoice ? ComboBox.Heading : Select.Heading;

    function generateOptions(items: FormItem[]) {
        const data: ReactElement[] = [];
        items.forEach((item) => {
            if (item.value && item.label) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore JSX element type 'Option' does not have any construct or call signatures.
                data.push(<Option label={item.label} value={item.value} key={item.value} />);
            }
            if (item.children && item.label) {
                data.push(<Heading key={item.label}>{item.label}</Heading>);
                item.children.forEach((child) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore JSX element type 'Option' does not have any construct or call signatures.
                    data.push(<Option label={child.label} value={child.value} key={child.value} />);
                });
            }
        });
        return data;
    }

    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<ReactElement[]>([]);

    useEffect(() => {
        if (!endpointUrl && !referenceName && autoCompleteFields) {
            setOptions(generateOptions(autoCompleteFields));
            return;
        }

        let current = true;
        const source = axios.CancelToken.source();

        const backendCallOptions = {
            serviceName: '',
            endpointUrl: '',
            cancelToken: source.token,
            handleError: true,
            params: { count: -1 },
        };
        if (referenceName) {
            backendCallOptions.serviceName = referenceName;
        } else if (endpointUrl) {
            backendCallOptions.endpointUrl = endpointUrl;
        }

        if (dependencyValues) {
            backendCallOptions.params = { ...backendCallOptions.params, ...dependencyValues };
        }
        if (!dependencies || dependencyValues) {
            setLoading(true);
            axiosCallWrapper(backendCallOptions)
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
                    setOptions([]);
                });
        } else {
            setOptions([]);
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
    // hideClearBtn=true only passed for OAuth else its undefined
    // effectiveIsClearable button will be visible only for the required=false and createSearchChoice=false single-select fields.
    const effectiveIsClearable = !(effectiveDisabled || restProps.required || hideClearBtn);

    return createSearchChoice ? (
        <StyledDiv className="dropdownBox">
            <ComboBox
                value={props.value === null ? '' : props.value}
                name={field}
                error={error}
                disabled={effectiveDisabled}
                onChange={handleChange} // eslint-disable-line react/jsx-no-bind
                inline
            >
                {options && options.length > 0 && options}
            </ComboBox>
            {loadingIndicator}
        </StyledDiv>
    ) : (
        <>
            <SelectWrapper
                inputId={props.id}
                className="dropdownBox"
                data-test-loading={loading}
                value={props.value}
                name={field}
                error={error}
                disabled={effectiveDisabled}
                onChange={handleChange} // eslint-disable-line react/jsx-no-bind
                filter={!disableSearch}
                inline
            >
                {options && options.length > 0 && options}
            </SelectWrapper>{' '}
            {loadingIndicator}
            {effectiveIsClearable ? (
                <Button
                    data-test="clear"
                    appearance="secondary"
                    icon={<Clear />}
                    onClick={() => restProps.handleChange(field, '')}
                />
            ) : null}
        </>
    );
}

export default SingleInputComponent;
