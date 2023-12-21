This feature allows us to pass broarder description on Input and Configuration page displayed under main description.

### Sub Descritpion Properties

| Property                                      | Type   | Description                                                          |
| --------------------------------------------- | ------ | -------------------------------------------------------------------- |
| text<span class="required-asterisk">\*</span> | string | Text used for that description, you can put \n to add a breakline |
| links                                         | object | To enable including links inside description                         |

### Links

| Property                                          | Type   | Description                                                                                  |
| ------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| slug<span class="required-asterisk">\*</span>     | string | Used to identify place for link to appear, put inside text, surrounded by 2 squared brackets |
| link<span class="required-asterisk">\*</span>     | string | Link to be used                                                                              |
| linkText<span class="required-asterisk">\*</span> | string | Text to be inserted instead of slug                                                          |

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
