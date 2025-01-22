import React from 'react';
import Switch from '@splunk/react-ui/Switch';
import { isFalse } from '../../util/considerFalseAndTruthy';

export interface CheckBoxComponentProps {
    value: 0 | 1 | boolean;
    handleChange: (field: string, value: 0 | 1) => void;
    field: string;
    disabled?: boolean;
}

class CheckBoxComponent extends React.Component<CheckBoxComponentProps> {
    handleChange = () => {
        if (this.props.value && !isFalse(this.props.value)) {
            this.props.handleChange(this.props.field, 0);
        } else {
            this.props.handleChange(this.props.field, 1);
        }
    };

    render() {
        const { field, value, ...restSuiProps } = this.props;
        return (
            <Switch
                {...restSuiProps}
                value={field}
                onClick={this.handleChange}
                selected={!(value ? isFalse(value) : true)}
                appearance="checkbox"
            />
        );
    }
}

export default CheckBoxComponent;
