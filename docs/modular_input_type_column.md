# Modular Input Type column

If your add-on has multiple modular inputs there is a way to render an additional 
column to show the input type of each input created.

Go to `header` field under `pages > inputs > table` and add another element there.

```text
"header": [
    ...
    {
        "label": "Input Type",
        "field": "serviceName",
        "mapping": {
            "input_name_1": "Input name 1",
            "input_name_2": "Input name 2"
        }
    }
    ...
]
```

The key under `mapping` field is the name of your modular input and the value is
how it will be rendered in the UI.
