### Common Properties

- `type`<span class="required-asterisk">\*</span> specifies which validator type to use.
- `errorMsg` optional parameter used to pass custom error message displayed when validation fails. UCC provides [default error messages](https://github.com/splunk/addonfactory-ucc-generator/blob/develop/ui/src/constants/messageDict.ts).

### String

<h3> Properties </h3>
- `minLength`<span class="required-asterisk">*</span> specifies the minimum number of characters allowed.
- `maxLength`<span class="required-asterisk">*</span> specifies the maximum number of characters allowed.

See the following example usage:

```json
{
  "type": "text",
  "label": "Index Name",
  "validators": [
      {
        "type": "string",
        "errorMsg": "Length of index name should be between 1 to 80 characters.",
        "minLength": 1,
        "maxLength": 80
      }
  ],
  "field": "index_name"
}
```

### Regex

<h3> Properties </h3>
- `pattern`<span class="required-asterisk">*</span> is a Regex pattern.

See the following example usage:

```json
{
  "type": "text",
  "label": "Name",
  "validators": [
      {
        "type": "regex",
        "errorMsg": "Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.",
        "pattern": "^[a-zA-Z]\\w*$"
      }
  ],
  "field": "name_field"
}
```

### Number

<h3> Properties </h3>
- `range`<span class="required-asterisk">*</span> is the range within which the target value should fall.
- `isInteger` is the boolean which target only integer value if sets true. Default value is false

See the following example usage:

```json
{
  "type": "text",
  "label": "Port",
  "validators": [
      {
        "type": "number",
        "range": [1, 65535],
        "isInteger": true
      }
  ],
  "field": "port"
}
```

### URL

No parameters are needed.

If you're using a regexp internally, this [regex](https://github.com/splunk/addonfactory-ucc-generator/blob/main/ui/src/constants/preDefinedRegex.ts) checks whether a field value is a URL or not.

See the following example usage:

```json
{
  "type": "text",
  "label": "Url",
  "validators": [
      {
        "type": "url",
      }
  ],
  "field": "url"
}
```

### Email

No parameters are needed.

Using a regexp internally is recommended by [WHATWG](<https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email)>).

See the following example usage:

```json
{
  "type": "text",
  "label": "Email",
  "validators": [
      {
        "type": "email",
      }
  ],
  "field": "email"
}
```

### IPV4

No parameters are needed.

Internally, it checks the IPV4 address using this [regex](https://github.com/splunk/addonfactory-ucc-generator/blob/main/ui/src/constants/preDefinedRegex.ts).

See the following example usage:

```json
{
    "field": "testIpv4",
    "label": "Test Ipv4",
    "type": "text",
    "validators": [
        {
            "type": "ipv4"
        }
    ]
}
```

### Date

No parameters are needed.

It is validated if the field's value is a date in the [ISO 8601](https://www.w3.org/TR/1998/NOTE-datetime-19980827) format.
It uses the regex from [moment.js](https://github.com/moment/moment/blob/2.17.1/moment.js#L1980).

See the following example usage:

```json
{
    "field": "testDate",
    "label": "Test Date",
    "type": "text",
    "validators": [
        {
            "type": "date"
        }
    ]
}
```

### Combinations

You can also make a combinations of many validators by providing all of them in single array.

See the following example usage of validators :

```json
{
    "field": "long_url",
    "label": "Insert url at least 10 characters long",
    "type": "text",
    "validators": [
        {
            "type": "url"
        },
        {
          "type": "string",
          "errorMsg": "Length of email should be at least 10 characters",
          "minLength": 10
        }
    ]
}
```
