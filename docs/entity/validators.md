### Common Properties

- `type`<span class="required-asterisk">*</span> - To specify which validator type to use.
- `errorMsg`<span class="required-asterisk">*</span> - UCC provides [default error messages](https://github.com/splunk/addonfactory-ucc-base-ui/blob/main/src/main/webapp/constants/messageDict.js). Using this attribute, A custom error message can be displayed.

### String

<h3> Properties </h3>
- `minLength`<span class="required-asterisk">*</span> - This specifies the minimum number of characters allowed.
- `maxLength`<span class="required-asterisk">*</span> - This specifies the maximum number of characters allowed.

Example usage below:

```json
{
    "type": "string",
    "errorMsg": "Length of index name should be between 1 to 80 characters.",
    "minLength": 1,
    "maxLength": 80
}
```


### Regex

<h3> Properties </h3>
- `pattern`<span class="required-asterisk">*</span> - Regex pattern

Example usage below:

```json
{
    "type": "regex",
    "errorMsg": "Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",
    "pattern": "^[a-zA-Z]\\w*$"
}
```

### Number

<h3> Properties </h3>
- `range`<span class="required-asterisk">*</span> - The range within which the target value should fall.

Example usage below:

```json
{
    "type": "number",
    "range": [
        1,
        65535
    ]
}
```

### URL

No parameters are needed.

It's using a regexp internally this [regex](https://github.com/splunk/addonfactory-ucc-base-ui/blob/main/src/main/webapp/constants/preDefinedRegex.js) for checking whether a field value is a URL or not.

### Email

No parameters are needed.

It's using a regexp internally suggested by [WHATWG](https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email))

### IPV4

No parameters are needed.

Internally, it checks the IPV4 address using this [regex](https://github.com/splunk/addonfactory-ucc-base-ui/blob/main/src/main/webapp/constants/preDefinedRegex.js).

### Date 

No parameters are needed.

It is validated whether or not the field's value is a date in [ISO 8601](https://www.w3.org/TR/1998/NOTE-datetime-19980827) format.
It is using the regex from [moment.js](https://github.com/moment/moment/blob/2.17.1/moment.js#L1980).
