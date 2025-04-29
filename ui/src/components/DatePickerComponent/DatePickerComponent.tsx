import React, { Component } from 'react';
import moment from 'moment';
import Date from '@splunk/react-ui/Date';

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
    constructor(props: DatePickerComponentProps) {
        super(props);

        const today = moment().format('YYYY-MM-DD');
        const lastDayOfMonth = moment().endOf('month').format('YYYY-MM-DD');
        const firstDayOfMonth = moment().startOf('month').format('YYYY-MM-DD');
        const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');

        const selectedDay = today === lastDayOfMonth ? firstDayOfMonth : tomorrow;

        this.state = {
            value: selectedDay,
        };
    }

    componentDidMount() {
        this.props.handleChange(this.props.field, this.state.value);
    }

    handleChange = (_: unknown, { value }: { value: string }) => {
        this.setState({ value });
        this.props.handleChange(this.props.field, value);
    };

    render() {
        return (
            <Date
                highlightToday
                value={this.state.value}
                onChange={this.handleChange}
            />
        );
    }
}

export default DatePickerComponent;
