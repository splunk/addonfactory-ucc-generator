import React, { Component } from 'react';
import Text from '@splunk/react-ui/Text';
import Button from '@splunk/react-ui/Button';
import Tooltip from '@splunk/react-ui/Tooltip';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import Eye from '@splunk/react-icons/Eye';
import EyeSlashed from '@splunk/react-icons/EyeSlashed';
import { _ } from '@splunk/ui-utils/i18n';
import styled from 'styled-components';
import { variables } from '@splunk/themes';

import { excludeControlWrapperProps } from '../ControlWrapper/utils';
import { ENCRYPTED_FIELD_PLACEHOLDER } from '../../constants/encryptedField';
import { MODE_CONFIG, MODE_EDIT, Mode } from '../../constants/modes';
import { parseErrorMsg } from '../../util/messageUtil';

const RevealGroup = styled.div`
    flex-grow: 1;
`;

const RevealRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${variables.spacingSmall};

    > *:first-child {
        flex-grow: 1;
    }
`;

const RevealError = styled.div`
    color: #d93f3c;
    margin-top: 4px;
`;

export interface TextComponentProps {
    // Number is expected if provided number in globalConfig.json instead of a string.
    value: string | number;
    handleChange: (field: string, value: string | number) => void;
    field: string;
    error?: boolean;
    encrypted?: boolean;
    disabled?: boolean;
    id?: string;
    mode?: Mode;
    controlOptions?: {
        enablePasswordReveal?: boolean;
    };
    /**
     * Provided by BaseFormView via ControlWrapper. Resolves the decrypted
     * value of this entity's encrypted field, or null when nothing is stored.
     */
    fetchStoredClearValue?: (field: string) => Promise<string | null>;
}

interface TextComponentState {
    revealed: boolean;
    revealPending: boolean;
    revealError: string | null;
    storedClearValue: string | null;
}

class TextComponent extends Component<TextComponentProps, TextComponentState> {
    private wasMasked: boolean = false;

    constructor(props: TextComponentProps) {
        super(props);
        this.state = {
            revealed: false,
            revealPending: false,
            revealError: null,
            storedClearValue: null,
        };
    }

    handleChange = (e: unknown, { value }: { value: string | number }) => {
        this.props.handleChange(this.props.field, value);
    };

    handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (this.props.encrypted && e.target.value === ENCRYPTED_FIELD_PLACEHOLDER) {
            this.wasMasked = true;
            this.props.handleChange(this.props.field, '');
        }
    };

    handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (this.props.encrypted && e.target.value === '' && this.wasMasked) {
            this.props.handleChange(this.props.field, ENCRYPTED_FIELD_PLACEHOLDER);
            this.wasMasked = false;
        }
    };

    handleRevealToggle = () => {
        if (this.state.revealed) {
            this.setState({ revealed: false, revealError: null });
            return;
        }
        const { mode, field, fetchStoredClearValue } = this.props;
        if (
            this.state.storedClearValue === null &&
            typeof fetchStoredClearValue === 'function' &&
            this.getStringValue() === ENCRYPTED_FIELD_PLACEHOLDER &&
            (mode === MODE_EDIT || mode === MODE_CONFIG)
        ) {
            // The field still holds the placeholder, so the real value has to
            // be fetched from the endpoint. splunkd enforces the caller's own
            // permissions on that request.
            this.setState({ revealPending: true, revealError: null });
            fetchStoredClearValue(field)
                .then((storedClearValue) => {
                    if (storedClearValue === null) {
                        this.setState({
                            revealPending: false,
                            revealError: _('There is no stored value to show.'),
                        });
                        return;
                    }
                    this.setState({
                        revealed: true,
                        revealPending: false,
                        storedClearValue,
                    });
                })
                .catch((error) => {
                    this.setState({
                        revealPending: false,
                        revealError: parseErrorMsg(error),
                    });
                });
            return;
        }
        this.setState({ revealed: true, revealError: null });
    };

    getStringValue = () => {
        const { value } = this.props;
        return value === null || typeof value === 'undefined' ? '' : value.toString();
    };

    render() {
        const { id, field, disabled, value, encrypted, controlOptions, ...restProps } = this.props;
        const restSuiProps = excludeControlWrapperProps(restProps);
        const { revealed, revealPending, revealError, storedClearValue } = this.state;
        const revealEnabled = Boolean(encrypted && controlOptions?.enablePasswordReveal);
        const stringValue = value === null || typeof value === 'undefined' ? '' : value.toString();
        const showStoredValue =
            revealed && stringValue === ENCRYPTED_FIELD_PLACEHOLDER && storedClearValue !== null;

        const textInput = (
            <Text
                {...restSuiProps}
                inputId={id}
                className={field}
                disabled={disabled && 'dimmed'}
                value={showStoredValue ? storedClearValue : stringValue}
                onChange={this.handleChange}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                type={encrypted && !revealed ? 'password' : 'text'}
            />
        );

        if (!revealEnabled) {
            return textInput;
        }

        let toggleIcon = <Eye />;
        if (revealPending) {
            toggleIcon = <WaitSpinner />;
        } else if (revealed) {
            toggleIcon = <EyeSlashed />;
        }
        const toggleLabel = revealed ? _('Hide value') : _('Show value');
        return (
            <RevealGroup>
                <RevealRow>
                    {textInput}
                    <Tooltip content={toggleLabel}>
                        <Button
                            appearance="secondary"
                            icon={toggleIcon}
                            aria-label={toggleLabel}
                            data-test={`${field}-reveal-toggle`}
                            onClick={this.handleRevealToggle}
                            disabled={Boolean(disabled) || revealPending}
                        />
                    </Tooltip>
                </RevealRow>
                {revealError ? (
                    <RevealError role="alert" data-test={`${field}-reveal-error`}>
                        {revealError}
                    </RevealError>
                ) : null}
            </RevealGroup>
        );
    }
}

export default TextComponent;
