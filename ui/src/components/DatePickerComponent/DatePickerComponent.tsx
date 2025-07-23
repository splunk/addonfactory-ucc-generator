import React, { Component } from 'react';
import SUIDate from '@splunk/react-ui/Date';

interface DatePickerState {
    value: string;
}

interface DatePickerComponentProps {
    value: string;
    handleChange: (field: string, value: string) => void;
    field: string;
    disabled?: boolean;
}

class DatePickerComponent extends Component<DatePickerComponentProps, DatePickerState> {
    handleChange = (_: unknown, { value }: { value: string }) => {
        this.props.handleChange(this.props.field, value);
    };

    render() {
        return (
            <SUIDate
                highlightToday
                value={this.props.value}
                onChange={this.handleChange}
                disabled={this.props.disabled}
            />
        );
    }
}

export default DatePickerComponent;
