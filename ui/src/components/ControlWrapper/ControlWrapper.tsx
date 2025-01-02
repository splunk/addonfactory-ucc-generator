import React from 'react';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import styled from 'styled-components';
import MarkdownMessage from '../MarkdownMessage/MarkdownMessage';
import CONTROL_TYPE_MAP, { ComponentTypes } from '../../constants/ControlTypeMap';
import { AnyEntity, UtilControlWrapper } from '../../types/components/BaseFormTypes';
import { AcceptableFormValueOrNullish } from '../../types/components/shareableTypes';
import CustomControl from '../CustomControl/CustomControl';
import { Mode } from '../../constants/modes';

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

export interface ControlWrapperProps {
    mode: Mode;
    utilityFuncts: UtilControlWrapper;
    value: AcceptableFormValueOrNullish;
    display: boolean;
    error: boolean;
    disabled: boolean;
    serviceName: string;
    dependencyValues: unknown;
    entity?: AnyEntity;
    markdownMessage?: {
        text: string;
        link?: string;
        color?: string;
        markdownType?: 'text' | 'link' | 'hybrid';
        token?: string;
        linkText?: string;
    };
    fileNameToDisplay?: string;
    modifiedEntitiesData?: {
        help?: string;
        label?: string;
        required?: boolean;
    };
    page?: string;
    id?: number;
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
                ? React.createElement(this.controlType as typeof CustomControl, {
                      data,
                      handleChange,
                      addCustomValidator,
                      utilCustomFunctions,
                      controlOptions: this.props.entity.options,
                      ...this?.props?.entity,
                      ...this.props?.modifiedEntitiesData,
                  })
                : `No View Found for ${this?.props?.entity?.type} type`;
        } else {
            rowView = this.controlType
                ? React.createElement(
                      // TODO: refactor props of each component or use switch case instead of CONTROL_TYPE_MAP
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      this.controlType as any,
                      {
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
                          ...this.props?.modifiedEntitiesData,
                          page: this.props.page,
                          id: this.props.id,
                      }
                  )
                : `No View Found for ${this?.props?.entity?.type} type`;
        }

        const helpText = (
            <>
                <MarkdownMessage
                    text={text || ''}
                    link={link || ''}
                    color={color || ''}
                    markdownType={markdownType}
                    token={token || ''}
                    linkText={linkText || ''}
                />
                {this.props?.modifiedEntitiesData?.help || this?.props?.entity?.help || ''}
            </>
        );

        const isRequiredModified =
            typeof this.props?.modifiedEntitiesData?.required === 'boolean'
                ? this.props?.modifiedEntitiesData?.required
                : this.props.entity?.required;

        const isFieldRequired =
            isRequiredModified === undefined // // if oauth_field exists field required by default
                ? 'oauth_field' in (this.props.entity || {}) // if oauth_field does not exists not required by default
                : isRequiredModified;

        const label = this.props?.modifiedEntitiesData?.label || this?.props?.entity?.label || '';
        const labelFor = this.props.id !== undefined ? this.props.id.toString() : undefined;
        return (
            this.props.display && (
                <ControlGroupWrapper
                    {...this?.props?.entity}
                    {...this.props?.modifiedEntitiesData}
                    help={helpText}
                    error={this.props.error}
                    // @ts-expect-error property should be data-name, but is mapped in obj ControlGroupWrapper
                    dataName={this?.props?.entity.field}
                    labelWidth={240}
                    required={isFieldRequired}
                    label={label}
                    labelFor={labelFor}
                >
                    <CustomElement>{rowView}</CustomElement>
                </ControlGroupWrapper>
            )
        );
    }
}

export default ControlWrapper;
