# Dependent Dropdown

This feature allows dynamic loading options for the `singleSelect` and the `multipleSelect` fields when the options for that field depend on other fields' values. It loads options via an API call to the endpoint mentioned in `endpointUrl` under options when any dependencies field is updated and all required dependencies fields are non-null.

All non-required dependencies fields can be of any type, but all required dependencies fields should only be of single-select type.

All dependencies fields' values are added to the endpoint URL as query parameters.

If endpoint is refering to **internal** endpoint, remember to update restmap.conf and web.conf accordingly.

If endpoint is refering to **external** endpoint remember to share content in [correct format](#data-format) adjusted to splunk APIs. Remember to provide data in format where data are nested inside entry and content object.

## Usage

```json
{
    "field": "bucket_name",
    "label": "S3 Bucket",
    "type": "singleSelect",
    "required": true,
    "options": {
        "disableonEdit": true,
        "dependencies": [
            "aws_account",
            "aws_iam_role",
            "aws_s3_region",
            "private_endpoint_enabled",
            "sts_private_endpoint_url",
            "s3_private_endpoint_url"
        ],
        "endpointUrl": "splunk_ta_aws/splunk_ta_aws_s3buckets"
    }
}
```

> Note: When using the text type field, add debounce using the custom hook to reduce the number of API calls.

## Data format

### Simplest format with just name

If you won't add any specification regarding label or value `name` property will be used for both.

Example data:

```json
{
    "entry": [
        {
            "name": "firstEntry"
        },
        {
            "name": "secondEntry"
        }
    ]
}
```

Values in dropdown:

First entry => label `firstEntry`, value `firstEntry`<br>
Second entry => label `secondEntry`, value `secondEntry`

### Format with custom label and value

If you will pass `labelField` or `valueField` to component configuration, data retrieved from `entry.content` will be used as corresponding values. For label data from `entry.content[labelField]` will be assigned. For value data from `entry.content[valueField]` will be assigned.

Example dropdown label configuration:

```json
"options": {
    "labelField": "uniqueName",
    "valueField": "calculatedValue"
}
```


Example data:

```json
{
    "entry": [
        {
            "name": "firstEntry",
            "content": {
                "uniqueName": "First entry",
                "calculatedValue": "123456"
            }
        },
        {
            "name": "secondEntry",
            "content": {
                "uniqueName": "Second entry",
                "calculatedValue": "654321"
            }
        }
    ]
}
```

Values in dropdown:

First entry => label `First entry`, value `123456`<br>
Second entry => label `Second entry`, value `654321`
