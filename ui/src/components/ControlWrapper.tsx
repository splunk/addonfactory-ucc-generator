import React from 'react';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import styled from 'styled-components';

import MarkdownMessage from './MarkdownMessage';
import CONTROL_TYPE_MAP, { ComponentTypes } from '../constants/ControlTypeMap';

const CustomElement = styled.div``;

const ControlGroupWrapper = styled(ControlGroup).attrs((props: { dataName: string }) => ({
    'data-name': props.dataName,
}))`
    span[class*='ControlGroupStyles__StyledAsterisk-'] {
        color: red;
    }
`;

interface ControlWrapperProps {
    mode: string;
    utilityFuncts: {
        handleChange?: () => void;
        addCustomValidator?: (
            field: string,
            validator: (submittedField: string, submittedValue: string) => void
        ) => void;
        utilCustomFunctions?: unknown;
    };
    value: unknown;
    display: boolean;
    error: boolean;
    entity: {
        type: unknown;
        field: string;
        label: string;
        options: Record<string, unknown>;
        tooltip?: string;
        help?: string;
        encrypted?: boolean;
        required?: boolean;
        defaultValue?: unknown;
    };
    disabled: boolean;
    markdownMessage?: {
        text: string;
        link: string;
        color: string;
        markdownType: 'link' | 'text' | 'hybrid';
        token: string;
        linkText: string;
    };
    serviceName: string;
    dependencyValues: unknown;
    fileNameToDisplay: string;
}

class ControlWrapper extends React.PureComponent<ControlWrapperProps> {
    static isString = (str: unknown) => !!(typeof str === 'string' || str instanceof String);

    controlType: ComponentTypes | null;

    constructor(props: ControlWrapperProps) {
        super(props);
        this.controlType = ControlWrapper.isString(props.entity.type)
            ? CONTROL_TYPE_MAP[String(props.entity.type)]
            : null;
    }

    render() {
        const {
            field,
            type,
            label,
            tooltip,
            help,
            encrypted = false,
            required,
        } = this.props.entity;
        const { handleChange, addCustomValidator, utilCustomFunctions } = this.props.utilityFuncts;
        // We have to put empty object because markDownMessage prop can be undefined
        // because we are not explicitly setting it but expecting it from custom hooks only.
        const { text, link, color, markdownType, token, linkText } =
            this.props.markdownMessage || {};
        let rowView;
        if (this.props.entity.type === 'custom') {
            const data = {
                value: this.props.value,
                mode: this.props.mode,
                serviceName: this.props.serviceName,
            };

            rowView = this.controlType
                ? React.createElement(this.controlType, {
                      data,
                      field,
                      handleChange,
                      addCustomValidator,
                      utilCustomFunctions,
                      controlOptions: this.props.entity.options,
                  })
                : `No View Found for ${type} type`;
        } else {
            rowView = this.controlType
                ? React.createElement(this.controlType, {
                      handleChange,
                      value: this.props.value,
                      field,
                      controlOptions: this.props.entity.options,
                      error: this.props.error,
                      disabled: this.props.disabled,
                      encrypted,
                      dependencyValues: this.props.dependencyValues,
                      required,
                      addCustomValidator,
                      fileNameToDisplay: this.props.fileNameToDisplay,
                      mode: this.props.mode,
                  })
                : `No View Found for ${type} type`;
        }

        const helpText = (
            <>
                <MarkdownMessage
                    text={text || ''}
                    link={link || ''}
                    color={color || ''}
                    markdownType={markdownType || ''}
                    token={token || ''}
                    linkText={linkText || ''}
                />
                {help}
            </>
        );

        return (
            this.props.display && (
                <ControlGroupWrapper
                    label={label}
                    help={helpText}
                    tooltip={tooltip}
                    error={this.props.error}
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore property should be data-name, but is mapped in obj ControlGroupWrapper
                    dataName={field}
                    required={required}
                    labelWidth={240}
                >
                    <CustomElement>{rowView}</CustomElement>
                </ControlGroupWrapper>
            )
        );
    }
}

export default ControlWrapper;
