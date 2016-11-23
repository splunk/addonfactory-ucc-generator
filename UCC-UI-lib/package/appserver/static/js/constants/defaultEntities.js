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
];

export const defaultProxyTabEntity = [
    {"field": "proxy_enabled", "label": "Enable", "type": "checkbox"},
    {
        "field": "proxy_type",
        "label": "Proxy Type",
        "type": "singleSelect",
        "options": {
            "disableSearch": true,
            "autoCompleteFields": [
                {"label": "http", "value": "http"},
                {"label": "socks4", "value": "socks4"},
                {"label": "socks5", "value": "socks5"}
            ]
        },
        "defaultValue": "http"
    },
    {"field": "proxy_url", "label": "Host", "type": "text"},
    {"field": "proxy_port", "label": "Port", "type": "text"},
    {"field": "proxy_username", "label": "Username", "type": "text"},
    {
        "field": "proxy_password",
        "label": "Password",
        "type": "text",
        "encrypted": true,
        "associated": "username"
    }
];
