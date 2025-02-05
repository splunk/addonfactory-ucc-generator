import React, { useState, useEffect, ReactElement } from 'react';
import Select from '@splunk/react-ui/Select';
import Button from '@splunk/react-ui/Button';
import ComboBox from '@splunk/react-ui/ComboBox';
import Clear from '@splunk/react-icons/enterprise/Clear';
import styled from 'styled-components';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import { z } from 'zod';

import { variables } from '@splunk/themes';
import { RequestParams, generateEndPointUrl, getRequest } from '../../util/api';
import { SelectCommonOptions } from '../../types/globalConfig/entities';
import { filterResponse, FilterResponseParams } from '../../util/util';
import { getValueMapTruthyFalse } from '../../util/considerFalseAndTruthy';
import { AcceptableFormValue, StandardPages } from '../../types/components/shareableTypes';
import { excludeControlWrapperProps } from '../ControlWrapper/utils';

const WaitSpinnerWrapper = styled(WaitSpinner)`
    margin-left: ${variables.spacingSmall};
`;

const StyledClearButton = styled(Button)`
    margin-left: ${variables.spacingSmall};
`;

type BasicFormItem = { value: AcceptableFormValue; label: string };

type FormItem =
    | BasicFormItem
    | {
          label: string;
          children: BasicFormItem[];
      };

export interface SingleInputComponentProps {
    id?: string;
    disabled?: boolean;
    value: AcceptableFormValue;
    handleChange: (field: string, value: string) => void;
    field: string;
    dependencyValues?: Record<string, unknown>;
    controlOptions: z.TypeOf<typeof SelectCommonOptions> & {
        hideClearBtn?: boolean;
    };
    required: boolean;
    page?: StandardPages;
}

function SingleInputComponent(props: SingleInputComponentProps) {
    const { id, field, disabled = false, controlOptions, dependencyValues, ...restProps } = props;
    const {
        endpointUrl,
        denyList,
        allowList,
        dependencies,
        createSearchChoice,
        referenceName,
        disableSearch,
        labelField,
        valueField,
        autoCompleteFields,
        hideClearBtn,
    } = controlOptions;

    const handleChange = (e: unknown, obj: { value: AcceptableFormValue }) => {
        props.handleChange(field, String(obj.value));
    };
    const Option = createSearchChoice ? ComboBox.Option : Select.Option;
    const Heading = createSearchChoice ? ComboBox.Heading : Select.Heading;

    function generateOptions(items: FormItem[]) {
        const data: ReactElement[] = [];
        items.forEach((item) => {
            if (
                'value' in item &&
                item.value !== null &&
                item.value !== undefined &&
                item.value !== '' &&
                item.label
            ) {
                // splunk will maps those when sending post form
                // so worth doing it earlier to keep same state before and after post
                const itemValue = String(getValueMapTruthyFalse(item.value, props.page));
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore JSX element type 'Option' does not have any construct or call signatures.
                data.push(<Option label={item.label} value={itemValue} key={item.value} />);
            }
            if ('children' in item && item.children && item.label) {
                data.push(<Heading key={item.label}>{item.label}</Heading>);
                item.children.forEach((child) => {
                    const childValue = String(getValueMapTruthyFalse(child.value, props.page));
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore JSX element type 'Option' does not have any construct or call signatures.
                    data.push(<Option label={child.label} value={childValue} key={childValue} />);
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

        const url = referenceName
            ? generateEndPointUrl(encodeURIComponent(referenceName))
            : endpointUrl;

        if ((dependencies && !dependencyValues) || !url) {
            setOptions([]);
            return;
        }

        let mounted = true;
        const abortController = new AbortController();

        const backendCallOptions = {
            signal: abortController.signal,
            endpointUrl: url,
            handleError: true,
            params: { count: -1 },
        } satisfies RequestParams;

        if (dependencyValues) {
            backendCallOptions.params = { ...backendCallOptions.params, ...dependencyValues };
        }

        setLoading(true);
        getRequest<{ entry: FilterResponseParams }>(backendCallOptions)
            .then((data) => {
                if (mounted) {
                    setOptions(
                        generateOptions(
                            filterResponse(data.entry, labelField, valueField, allowList, denyList)
                        )
                    );
                    setLoading(false);
                }
            })
            .catch(() => {
                if (mounted) {
                    setLoading(false);
                    setOptions([]);
                }
            });

        // eslint-disable-next-line consistent-return
        return () => {
            mounted = false;
            abortController.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dependencyValues]);

    const effectiveDisabled = loading ? true : disabled;
    const loadingIndicator = loading ? <WaitSpinnerWrapper /> : null;
    // hideClearBtn=true only passed for OAuth else its undefined
    // effectiveIsClearable button will be visible only for the required=false and createSearchChoice=false single-select fields.
    const effectiveIsClearable = !(effectiveDisabled || props.required || hideClearBtn);

    // ControlWrapper passes a lot of extra props that conflict with SUI components
    const restSuiProps = excludeControlWrapperProps(restProps);
    return createSearchChoice ? (
        <>
            <ComboBox
                {...restSuiProps}
                // @ts-expect-error SUI does not declare inputId, but it is there
                inputId={id}
                value={
                    // if value is empty use empty string as ComboBox accepts only string
                    props.value === null || typeof props.value === 'undefined'
                        ? ''
                        : String(props.value)
                }
                name={field}
                disabled={effectiveDisabled}
                onChange={handleChange}
            >
                {options && options.length > 0 && options}
            </ComboBox>
            {loadingIndicator}
        </>
    ) : (
        <>
            <Select
                {...restSuiProps}
                menuStyle={{ width: '100%' }}
                inputId={props.id}
                data-test-loading={loading}
                value={
                    // if value is empty use empty string as Select accepts only string
                    props.value === null || typeof props.value === 'undefined'
                        ? ''
                        : String(props.value)
                }
                name={field}
                disabled={effectiveDisabled}
                onChange={handleChange}
                filter={!disableSearch}
                inline={false}
            >
                {options && options.length > 0 && options}
            </Select>{' '}
            {loadingIndicator}
            {effectiveIsClearable ? (
                <StyledClearButton
                    data-test="clear"
                    appearance="secondary"
                    icon={<Clear />}
                    onClick={() => props.handleChange(field, '')}
                />
            ) : null}
        </>
    );
}

export default SingleInputComponent;
