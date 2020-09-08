# postcss-conditionals [![Build Status][ci-img]][ci]

[PostCSS] plugin that enables ```@if``` statements in your CSS.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/andyjansson/postcss-conditionals.svg
[ci]:      https://travis-ci.org/andyjansson/postcss-conditionals

## Installation

```js
npm install postcss-conditionals
```

## Usage

```js
var fs = require('fs');
var postcss = require('postcss');
var conditionals = require('postcss-conditionals');

var css = fs.readFileSync('input.css', 'utf8');

var output = postcss()
  .use(conditionals)
  .process(css)
  .css;
```

Using this ```input.css```: 

```css
.foo {
  @if 3 < 5 {
    background: green;
  }
  @else {
    background: blue;
  }
}
```

you will get:

```css
.foo {
  background: green;
}
```

Also works well with [postcss-simple-vars]:

```css
$type: monster;
p {
  @if $type == ocean {
    color: blue;
  } @else if $type == matador {
    color: red;
  } @else if $type == monster {
    color: green;
  } @else {
    color: black;
  }
}
```
[postcss-simple-vars]: https://github.com/postcss/postcss-simple-vars

and with [postcss-for]:

```css
@for $i from 1 to 3 {
  .b-$i { 
    width: $i px;
    @if $i == 2 {
      color: green;
    }
  }
}
```

[postcss-for]: https://github.com/antyakushev/postcss-for