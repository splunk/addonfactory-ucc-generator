# Proxy

The Proxy tab is a predefined component that allows to create a proxy tab with default configurations. It is added in the `pages.configuration.tabs` array

![image](../images/configuration/proxy_tab.png)


### Minimal definition

```json
{
  "type": "proxyTab"
}
```

This creates the tab seen in the image above with 3 default entities that are `Enable` (checkbox for enabling proxy), `Host` (proxy host) and `Port` (proxy port).

### Available configurations

Below are the available configurations provided by UCC.

- Name (auto generated):

```
proxy
```

- Title (auto generated):

```
Proxy
```

- Enable proxy :

```json
{
    "type": "checkbox", 
    "label": "Enable",
    "field": "proxy_enabled"
}
```

- Proxy type :

```json
{
    "type": "singleSelect",
    "label": "Proxy Type",
    "required": false,
    "options": {
        "disableSearch": true,
        "autoCompleteFields": [
            {"value": "http", "label": "http"},
            {"value": "socks4", "label": "socks4"},
            {"value": "socks5", "label": "socks5"},
        ],
    },
    "defaultValue": "http",
    "field": "proxy_type",
}
```

- Host :

```json
{
    "type": "text",
    "label": "Host",
    "validators": [
        {
            "type": "string",
            "errorMsg": "Max host length is 4096",
            "minLength": 0,
            "maxLength": 4096,
        },
        {
            "type": "regex",
            "errorMsg": "Proxy Host should not have special characters",
            "pattern": "^[a-zA-Z]\\w*$",
        },
    ],
    "field": "proxy_url",
}
```

- Port :

```json
{
    "type": "text",
    "label": "Port",
    "validators": [{"type": "number", "range": [1, 65535], "isInteger": true}],
    "field": "proxy_port",
}
```

- Username :

```json
{
    "type": "text",
    "label": "Username",
    "validators": [
        {
            "type": "string",
            "errorMsg": "Max length of username is 50",
            "minLength": 0,
            "maxLength": 50,
        }
    ],
    "field": "proxy_username",
}
```

- Password :

```json
{
    "type": "text",
    "label": "Password",
    "validators": [
        {
            "type": "string",
            "errorMsg": "Max length of password is 8192",
            "minLength": 0,
            "maxLength": 8192,
        }
    ],
    "encrypted": true,
    "field": "proxy_password",
}
```

- DNS Resolution checkbox :

```json
{
    "type": "checkbox",
    "label": "DNS resolution",
    "field": "proxy_rdns",
}
```

If you only specify `"type": "proxyTab"` in your globalConfig file, entities such as `proxy_type`, `username`, `password`, and `dns_resolution` will not be generated, only the `host`, `port`, `enabled` entities will be generated.  To include the optional entities in your add-on (from the [available configurations](#available-configurations) listed above), you need to set them to `True`.

### Usage

It is placed just like every other configuration tab.

```json
{
    "pages": {
        "configuration": {
            "tabs": [
              {
                "type": "proxyTab"
              }
            ],
            "title": "Configuration",
            "description": "..."
        }
    }
}
```

To customize these entities, you can define them in JSON with specific keys for each one (see the [keys section](#keys) for details on the required keys for each entity). You only need to specify your custom values in the JSON there's no need to include required fields like `type`, `fields` (if you don't need to change them) etc. Refer to the [Example](#example) for further clarification.

> **_NOTE:_**
    There are 2 ways to exclude optional entities in your add-on, either omit them from the proxy tab, or set the entities to false.

### Keys

| Key Name     | Description                                                        |
|----------------|--------------------------------------------------------------------|
| enable_proxy  | Whether proxy should be enabled                                   |
| proxy_type     | Type of Proxy communication protocols supported. Default: `SOCKS4`, `SOCKS5`, `HTTP` |
| host      | Hostname (FQDN, IPv6 or IPv4) of the Proxy server |
| port     | Port of the Proxy server that accepts the connection |
| username | Username used to authenticate the access to Proxy Server |
| password | Password for the provided username to authenticate access to Proxy Server |
| dns_resolution     | Whether DNS resolution should be done by Proxy server or not |


### Example

```json
{
   "type": "proxyTab",
   "name": "custom_proxy",
   "warning": {
        "config": {
        "message": "Some warning message"
        }
    },
   "port": {
       "label": "Proxy port",
       "validator": [
           {
               "type": "number",
               "range": [
                   1025,
                   65535
               ],
               "isInteger": true
           }
       ]
   },
   "username": true,
   "password": {
       "label": "Password for Proxy"
   },
   "dns_resolution": false,
}
```

The above will get converted to the older definition (mentioned below) in your output directory.

![image](../images/configuration/proxy_tab_custom.png)

```json
{
--8<-- "tests/unit/tabs/test_proxy_tab.py:9:71"
}
```
