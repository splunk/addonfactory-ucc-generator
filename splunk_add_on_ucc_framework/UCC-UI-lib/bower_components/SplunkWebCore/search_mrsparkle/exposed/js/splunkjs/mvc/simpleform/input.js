define(function(require) {
    return {
        SubmitButton: require('./input/submit'),
        TextInput: require('./input/text'),
        DropdownInput: require('./input/dropdown'),
        RadioGroupInput: require('./input/radiogroup'),
        TimeRangeInput: require('./input/timerange'),
        
        /* Deprecated */
        Submit: require('./input/submit'),
        Text: require('./input/text'),
        Dropdown: require('./input/dropdown'),
        Radio: require('./input/radiogroup'),
        TimeRangePicker: require('./input/timerange')
    };
});