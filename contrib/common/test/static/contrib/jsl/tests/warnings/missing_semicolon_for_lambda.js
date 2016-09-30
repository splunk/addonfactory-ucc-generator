/*jsl:option explicit*/
/*jsl:declare global*/

/* Test with a simple variable. */
var x = function() {
    return {};
} /*warning:missing_semicolon_for_lambda*/
x();

var a, b = function() { }, c /*warning:missing_semicolon*/
b();
var d, e = function() { } /*warning:missing_semicolon_for_lambda*/
e();

var y;
y = function() {
    return [];
} /*warning:missing_semicolon_for_lambda*/
y();

global = function() {
    return null;
} /*warning:missing_semicolon_for_lambda*/
global();

function Foo()
{
    this.bar = 10;

    /* Test an assignment to a member. */
    this.setBar = function(bar) {
        this.bar = bar;
    } /*warning:missing_semicolon_for_lambda*/

    this.setBar(this.bar * 2);
}

/* Test an assignment to a prototype. */
Foo.prototype.getBar = function() {
    return this.bar;
} /*warning:missing_semicolon_for_lambda*/

var foo = new Foo();
