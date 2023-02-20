# Modular Input Type column

If your add-on has multiple modular inputs there is a way to render an additional 
column to show the input type of each input created.

Go to `header` field under `pages > inputs > table` and add another element there.

```text
"header": [
    ...
    {
        "label": "Input Type",
        "field": "serviceTitle"
    }
    ...
]
```
