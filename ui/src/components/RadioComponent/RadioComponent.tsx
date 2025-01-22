import React, { Component } from 'react';
import RadioBar from '@splunk/react-ui/RadioBar';
import styled from 'styled-components';
import { getValueMapTruthyFalse } from '../../util/considerFalseAndTruthy';
import { StandardPages } from '../../types/components/shareableTypes';

const RadioBarOption = styled(RadioBar.Option)`
    margin-left: 0px !important;
`;

interface RadioComponentProps {
    id?: string;
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
    page?: StandardPages;
}

class RadioComponent extends Component<RadioComponentProps> {
    handleChange = (e: unknown, { value }: { value: string }) => {
        this.props.handleChange(this.props.field, value);
    };

    render() {
        const { value, controlOptions, disabled, page, ...restSuiProps } = this.props;
        return (
            <RadioBar
                {...restSuiProps}
                onChange={this.handleChange}
                value={value ? getValueMapTruthyFalse(value, page) : value}
            >
                {controlOptions.items.map((item) => (
                    <RadioBarOption
                        key={item.value}
                        value={getValueMapTruthyFalse(item.value, page)}
                        label={item.label}
                        disabled={disabled}
                    />
                ))}
            </RadioBar>
        );
    }
}

export default RadioComponent;
