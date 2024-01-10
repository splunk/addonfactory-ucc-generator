import React, { Component } from 'react';
import RadioBar from '@splunk/react-ui/RadioBar';
import styled from 'styled-components';

const RadioBarWrapper = styled(RadioBar)`
    width: 320px;
`;

const RadioBarOption = styled(RadioBar.Option)`
    margin-left: 0px !important;
`;

interface RadioComponentProps {
    value: string;
    handleChange: (field: string, value: string) => void;
    field: string;
    controlOptions: {
        items: {
            value: string;
            label: string;
        }[];
    };
    disabled: boolean;
}

class RadioComponent extends Component<RadioComponentProps> {
    handleChange = (e: unknown, { value }: { value: string }) => {
        this.props.handleChange(this.props.field, value);
    };

    render() {
        return (
            <RadioBarWrapper
                inline
                onChange={this.handleChange}
                value={this.props.value}
                key={this.props.field}
            >
                {this.props.controlOptions.items.map((item) => (
                    <RadioBarOption
                        key={item.value}
                        value={item.value}
                        label={item.label}
                        disabled={this.props.disabled}
                    />
                ))}
            </RadioBarWrapper>
        );
    }
}

export default RadioComponent;
