import React from 'react';
import SUIDate, { DateChangeHandler } from '@splunk/react-ui/Date';

interface DatePickerComponentProps {
    value: string;
    handleChange: (field: string, value: string) => void;
    field: string;
    disabled?: boolean;
}

const DatePickerComponent = (props: DatePickerComponentProps) => {
    const handleChange: DateChangeHandler = (_: unknown, { value }: { value: string }) => {
        props.handleChange(props.field, value);
    };

    return (
        <SUIDate
            highlightToday
            value={props.value}
            onChange={handleChange}
            disabled={props.disabled}
        />
    );
};

export default DatePickerComponent;
