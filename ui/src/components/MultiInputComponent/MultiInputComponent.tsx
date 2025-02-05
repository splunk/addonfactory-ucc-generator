import React, { useState, useEffect, ReactElement } from 'react';
import Multiselect from '@splunk/react-ui/Multiselect';
import styled from 'styled-components';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import { z } from 'zod';

import { MultiselectChangeHandler } from '@splunk/react-ui/types/src/Multiselect/Multiselect';
import { RequestParams, generateEndPointUrl, getRequest } from '../../util/api';
import { filterResponse, FilterResponseParams } from '../../util/util';
import { MultipleSelectCommonOptions } from '../../types/globalConfig/entities';
import { invariant } from '../../util/invariant';
import { AcceptableFormValue } from '../../types/components/shareableTypes';
import { excludeControlWrapperProps } from '../ControlWrapper/utils';

const WaitSpinnerWrapper = styled(WaitSpinner)`
    margin-left: 5px;
`;

export interface MultiInputComponentProps {
    id?: string;
    handleChange: (field: string, data: string) => void;
    field: string;
    controlOptions: z.TypeOf<typeof MultipleSelectCommonOptions>;
    disabled?: boolean;
    value?: AcceptableFormValue;
    dependencyValues?: Record<string, unknown>;
}

function MultiInputComponent(props: MultiInputComponentProps) {
    const {
        id,
        field,
        disabled = false,
        value,
        controlOptions,
        dependencyValues,
        handleChange,
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

    const onChange: MultiselectChangeHandler = (_e, { values }) => {
        if (typeof values[0] === 'string' || values.length === 0) {
            handleChange(field, values.join(delimiter));
        }
    };

    function generateOptions(itemList: { label: string; value: string | number | boolean }[]) {
        return itemList.map((item) => (
            <Multiselect.Option
                label={item.label}
                value={String(item.value)}
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

        let mounted = true;
        const abortController = new AbortController();

        const url = referenceName
            ? generateEndPointUrl(encodeURIComponent(referenceName))
            : endpointUrl;
        invariant(
            url,
            '[MultiInputComponent] referenceName or endpointUrl or items must be provided'
        );

        const apiCallOptions = {
            signal: abortController.signal,
            handleError: true,
            params: { count: -1 },
            endpointUrl: url,
        } satisfies RequestParams;
        if (dependencyValues) {
            apiCallOptions.params = { ...apiCallOptions.params, ...dependencyValues };
        }
        if (!dependencies || dependencyValues) {
            setLoading(true);
            getRequest<{ entry: FilterResponseParams }>(apiCallOptions)
                .then((data) => {
                    if (mounted) {
                        setOptions(
                            generateOptions(
                                filterResponse(
                                    data.entry,
                                    labelField,
                                    valueField,
                                    allowList,
                                    denyList
                                )
                            )
                        );
                    }
                })
                .finally(() => {
                    if (mounted) {
                        setLoading(false);
                    }
                });
        }
        // eslint-disable-next-line consistent-return
        return () => {
            mounted = false;
            abortController.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dependencyValues]);

    const effectiveDisabled = loading ? true : disabled;
    const loadingIndicator = loading ? <WaitSpinnerWrapper /> : null;

    const valueList = value ? String(value).split(delimiter) : [];
    const restSuiProps = excludeControlWrapperProps(restProps);

    return (
        <>
            <Multiselect
                {...restSuiProps}
                inputId={id}
                style={{ width: '100%' }}
                values={valueList}
                name={field}
                disabled={effectiveDisabled}
                allowNewValues={createSearchChoice}
                onChange={onChange} // eslint-disable-line react/jsx-no-bind
            >
                {options && options.length > 0 && options}
            </Multiselect>
            {loadingIndicator}
        </>
    );
}

export default MultiInputComponent;
