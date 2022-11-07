If we need to add a select box that loads dynamically (via an API) or is dependent on another input, we can use the dependencies property.

Here is how you specify single select `google_project` field which is depedent on `google_credentials_name` field.
```
{
    "type": "singleSelect",
    "label": "Project",
    "field": "google_project",
    "required": true,
    "options": {
        "disableSearch": true,
        "dependencies": ["google_credentials_name"],
        "denyList": "^_.*$",
        "endpointUrl": "Splunk_TA_google_cloudplatform_projects",
        "labelField": "projects"
    }
}
```

Here, `google_project` field is dependent upon `google_credentials_name` field. So, in case if `google_project` field is not loaded, `google_credentials_name` field will also not be loaded. Also, it will be repopulated on the change of `google_credentials_name`. So, we don't need Hook to support this type of functionality.
