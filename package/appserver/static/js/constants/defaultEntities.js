export const defaultLoggingTabEntity = [
    {
        "field": "loglevel",
        "label": "Log Level",
        "type": "singleSelect",
        "options": {
            "disableSearch": true,
            "autoCompleteFields": [
                {"label": "INFO", "value": "INFO"},
                {"label": "DEBUG", "value": "DEBUG"},
                {"label": "ERROR", "value": "ERROR"}
            ]
        },
        "defaultValue": "INFO"
    }
]
