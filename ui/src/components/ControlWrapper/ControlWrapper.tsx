import React from 'react';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import styled from 'styled-components';
import MarkdownMessage, { MarkdownMessageProps } from '../MarkdownMessage/MarkdownMessage';
import CONTROL_TYPE_MAP, { ComponentTypes } from '../../constants/ControlTypeMap';
import { AnyEntity, UtilControlWrapper } from '../BaseFormTypes';
import { AcceptableFormValueOrNullish } from '../../types/components/shareableTypes';

const CustomElement = styled.div``;

const ControlGroupWrapper = styled(ControlGroup).attrs((props: { dataName: string }) => ({
    'data-name': props.dataName,
}))`
    max-width: 100%;

    span[class*='ControlGroupStyles__StyledAsterisk-'] {
        color: red;
    }

    > * {
        &:nth-child(3) {
            width: 320px;
        }
    }
`;

interface ControlWrapperProps {
    mode: string;
    utilityFuncts: UtilControlWrapper;
    value: AcceptableFormValueOrNullish;
    display: boolean;
    error: boolean;
    disabled: boolean;
    serviceName: string;
    dependencyValues: unknown;
    entity?: AnyEntity;
    markdownMessage?: MarkdownMessageProps;
    fileNameToDisplay?: string;
}

class ControlWrapper extends React.PureComponent<ControlWrapperProps> {
    static isString = (str: unknown) => !!(typeof str === 'string' || str instanceof String);

    controlType: ComponentTypes | null;

    constructor(props: ControlWrapperProps) {
        super(props);
        this.controlType = ControlWrapper.isString(props.entity?.type)
            ? CONTROL_TYPE_MAP[String(props.entity?.type)]
            : null;
    }

    render() {
        const { handleChange, addCustomValidator, utilCustomFunctions } = this.props.utilityFuncts;
        // We have to put empty object because markDownMessage prop can be undefined
        // because we are not explicitly setting it but expecting it from custom hooks only.
        const { text, link, color, markdownType, token, linkText } =
            this.props.markdownMessage || {};
        let rowView;
        if (this.props?.entity?.type === 'custom') {
            const data = {
                value: this.props.value,
                mode: this.props.mode,
                serviceName: this.props.serviceName,
            };

            rowView = this.controlType
                ? React.createElement(this.controlType, {
                      data,
                      handleChange,
                      addCustomValidator,
                      utilCustomFunctions,
                      controlOptions: this.props.entity.options,
                      ...this?.props?.entity,
                  })
                : `No View Found for ${this?.props?.entity?.type} type`;
        } else {
            rowView = this.controlType
                ? React.createElement(this.controlType, {
                      handleChange,
                      value: this.props.value,
                      controlOptions: this.props.entity?.options,
                      error: this.props.error,
                      disabled: this.props.disabled,
                      dependencyValues: this.props.dependencyValues,
                      addCustomValidator,
                      fileNameToDisplay: this.props.fileNameToDisplay,
                      mode: this.props.mode,
                      ...this?.props?.entity,
                  })
                : `No View Found for ${this?.props?.entity?.type} type`;
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
                {this?.props?.entity?.help || ''}
            </>
        );

        return (
            this.props.display && (
                <ControlGroupWrapper
                    help={helpText}
                    error={this.props.error}
                    // @ts-expect-error property should be data-name, but is mapped in obj ControlGroupWrapper
                    dataName={this?.props?.entity.field}
                    labelWidth={240}
                    {...this?.props?.entity}
                >
                    <CustomElement>{rowView}</CustomElement>
                </ControlGroupWrapper>
            )
        );
    }
}

export default ControlWrapper;
