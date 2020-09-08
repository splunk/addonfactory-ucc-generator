#2.0.2 - 2016-03-02
* Fix parsing of strings with escape character used for escaping characters
  other than single quotes [#12](https://github.com/andyjansson/postcss-conditionals/issues/12)

#2.0.1 - 2016-01-20
* Allow for quoted empty strings

#2.0.0 - 2015-09-01
* Update to PostCSS v5.

#1.4.0 - 2015-09-01
* Fix value type being incorrectly transformed for certain unit types.
* Expand mixed-type operations to include things such as comparisons of
  differently typed values.

#1.3.1 - 2015-08-24
* Fix `@else` incorrectly being invoked when any statement other than the one
  directly preceding the `@else` is true.

#1.3.0 - 2015-08-19
* Add support for nested if statements
* Add boolean data type

#1.2.0 - 2015-05-27
* Add transformations and comparisons of color values

#1.1.2 - 2015-05-26
* Fix parsing of negative values [#2](https://github.com/andyjansson/postcss-conditionals/issues/2)

# 1.1.1 - 2015-05-18
* Add arithmetics for CSS units

# 1.0.0 - 2015-05-05
* Initial release
