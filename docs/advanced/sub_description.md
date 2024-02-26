This feature allows us to pass a broader description on the Input and Configuration pages displayed under main description.

### Sub Descritpion Properties

| Property                                      | Type   | Description                                                          |
| --------------------------------------------- | ------ | -------------------------------------------------------------------- |
| text<span class="required-asterisk">\*</span> | string | is text used for the description, you can put \n to add a breakline. |
| links                                         | object | enables including links inside description                         |

### Links

| Property                                          | Type   | Description                                                                                  |
| ------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| slug<span class="required-asterisk">\*</span>     | string | is used to identify the place for the link to appear. Put it inside the text, surrounded by 2 squared brackets. |
| link<span class="required-asterisk">\*</span>     | string | is the link to be used.                                                                        |
| linkText<span class="required-asterisk">\*</span> | string | is the text to be inserted, instead of slug.                                                        |

### Usage

```json
{
  "name": "example_input_one",
  "title": "Example Input One",
  "entity": [],
  "subDescription": {
    "text": "Ingesting data from to Splunk Cloud?\nRead our [[blogPost]] to learn more about Data Manager and it's availability on your Splunk Cloud instance.",
    "links": [
      {
        "slug": "blogPost",
        "link": "https://splk.it/31oy2b2",
        "linkText": "blog post"
      }
    ]
  }
}
```
