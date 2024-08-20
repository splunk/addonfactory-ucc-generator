import React, { useState, useEffect, ReactElement } from 'react';
import Multiselect from '@splunk/react-ui/Multiselect';
import styled from 'styled-components';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import { z } from 'zod';

import { AxiosCallType, axiosCallWrapper } from '../../util/axiosCallWrapper';
import { filterResponse } from '../../util/util';
import { MultipleSelectCommonOptions } from '../../types/globalConfig/entities';

const MultiSelectWrapper = styled(Multiselect)`
    width: 320px !important;
`;

const WaitSpinnerWrapper = styled(WaitSpinner)`
    margin-left: 5px;
`;

export interface MultiInputComponentProps {
    id?: string;
    handleChange: (field: string, data: string) => void;
    field: string;
    controlOptions: z.TypeOf<typeof MultipleSelectCommonOptions>;
    disabled?: boolean;
    value?: string;
    error?: boolean;
    dependencyValues?: Record<string, unknown>;
}

function MultiInputComponent(props: MultiInputComponentProps) {
    const {
        id,
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
        valueField,
        delimiter = ',',
    } = controlOptions;

    function handleChange(e: unknown, { values }: { values: (string | number | boolean)[] }) {
        if (typeof values[0] === 'string' || values.length === 0) {
            restProps.handleChange(field, values.join(delimiter));
        }
    }

    function generateOptions(itemList: { label: string; value: string | number | boolean }[]) {
        return itemList.map((item) => (
            <Multiselect.Option
                label={item.label}
                value={item.value}
                key={typeof item.value === 'boolean' ? String(item.value) : item.value}
            />
        ));
    }

    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<ReactElement[]>();

    useEffect(() => {
        if (!endpointUrl && items) {
            setOptions(generateOptions(items));
            return;
        }

        let current = true;
        const abortController = new AbortController();

        const apiCallOptions = {
            signal: abortController.signal,
            handleError: true,
            params: { count: -1 },
            serviceName: '',
            endpointUrl: '',
        } satisfies AxiosCallType;
        if (referenceName) {
            apiCallOptions.serviceName = referenceName;
        } else if (endpointUrl) {
            apiCallOptions.endpointUrl = endpointUrl;
        }

        if (dependencyValues) {
            apiCallOptions.params = { ...apiCallOptions.params, ...dependencyValues };
        }
        if (!dependencies || dependencyValues) {
            setLoading(true);
            axiosCallWrapper(apiCallOptions)
                .then((response) => {
                    if (current) {
                        setOptions(
                            generateOptions(
                                filterResponse(
                                    response.data.entry,
                                    labelField,
                                    valueField,
                                    allowList,
                                    denyList
                                )
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
            abortController.abort('Operation canceled.');
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
                inputId={id}
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

export default MultiInputComponent;
