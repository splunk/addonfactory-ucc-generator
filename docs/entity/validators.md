### Common Properties

- `type`<span class="required-asterisk">*</span> specifies which validator type to use.
- `errorMsg`<span class="required-asterisk">*</span> displays a custom error message. UCC provides [default error messages](https://github.com/splunk/addonfactory-ucc-generator/blob/main/ui/src/main/webapp/constants/messageDict.ts).

### String

<h3> Properties </h3>
- `minLength`<span class="required-asterisk">*</span> specifies the minimum number of characters allowed.
- `maxLength`<span class="required-asterisk">*</span> specifies the maximum number of characters allowed.

See the following example usage:

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
- `pattern`<span class="required-asterisk">*</span> is a Regex pattern.

See the following example usage:

```json
{
    "type": "regex",
    "errorMsg": "Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",
    "pattern": "^[a-zA-Z]\\w*$"
}
```

### Number

<h3> Properties </h3>
- `range`<span class="required-asterisk">*</span> is the range within which the target value should fall.

See the following example usage:

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

If you're using a regexp internally, this [regex](https://github.com/splunk/addonfactory-ucc-generator/blob/main/ui/src/main/webapp/constants/preDefinedRegex.ts) checks whether a field value is a URL or not.

### Email

No parameters are needed.

Using a regexp internally is recommended by [WHATWG](https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email)).

### IPV4

No parameters are needed.

Internally, it checks the IPV4 address using this [regex](https://github.com/splunk/addonfactory-ucc-generator/blob/main/ui/src/main/webapp/constants/preDefinedRegex.ts).

### Date 

No parameters are needed.

It is validated if the field's value is a date in the [ISO 8601](https://www.w3.org/TR/1998/NOTE-datetime-19980827) format.
It uses the regex from [moment.js](https://github.com/moment/moment/blob/2.17.1/moment.js#L1980).
