# Help message

This property allows to pass a structured description under the entity component.
You can use it as a simple string text or create a string with link references for more context.

You can also use `\n` to start new line.

### Help Properties

| Property                                      | Type   | Description                                                  |
| --------------------------------------------- | ------ | ------------------------------------------------------------ |
| text<span class="required-asterisk">\*</span> | string | is text displayed directly below input.                      |
| links                                         | array  | array of links objects, enables including links inside text. |
| link                                          | string | if present whole text is used as a single link.              |

### Links

| Property                                          | Type   | Description                                                                                                                                                        |
| ------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| slug<span class="required-asterisk">\*</span>     | string | is used to identify the place for the link to appear. Put it inside the text, surrounded by 2 squared brackets (for `example_slug` put `[[example_slug]]` in text). |
| link<span class="required-asterisk">\*</span>     | string | is the link to be used.                                                                                                                                            |
| linkText<span class="required-asterisk">\*</span> | string | is the text to be inserted, instead of slug.                                                                                                                       |

### Usage

```json
{
  "field": "url",
  "label": "URL",
  "type": "text",
  "help": {
    "text": "Enter the URL, for example \n you can use https://splunk.github.io/addonfactory-ucc-generator/ \n also see [[docs_link]] for more reference",
    "links":[{
      "slug": "docs_link",
      "link": "https://splunk.github.io/addonfactory-ucc-generator/",
      "linkText": "reference",
    }]
  },
  "required": true,
}
```
