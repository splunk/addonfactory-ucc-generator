This feature allows us to pass a Javascript function as a string to apply customized validation to form data.

By using this approach, developers can write custom JavaScript code where they can write their business logic and by validating they may return error messages which will be displayed at the top of the form. 

This custom javascript function have a parameter (for ex. dataDict) which contains the form data object.

This function will be called after all validators have validated the data form.

### Usage

```json
{
    "name": "example_input_one",
    "title": "Example Input One",
    "entity": [],
    "options": {
        "saveValidator": "function start_data_validator(dataDict) { const provided_datetime = new Date(dataDict['start_date']).getTime(); const current_datetime = new Date().getTime(); if (provided_datetime > current_datetime) { return 'Start date should not be in future'; }}"
    }
}
```
