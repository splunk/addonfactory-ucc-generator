import React from 'react';

import ReactUiDate from '@splunk/react-ui/Date';

interface DateProps {
    value: string;
    field: string;
    error?: boolean;
    disabled?: boolean;
    handleChange: (field: string, value: string) => void;
}

function Date({ disabled, field, value, error, handleChange }: DateProps) {
    return (
        <ReactUiDate
            disabled={disabled}
            value={value}
            error={error}
            onChange={(_, { value }) => handleChange(field, value)}
        />
    );
}

export default Date;
