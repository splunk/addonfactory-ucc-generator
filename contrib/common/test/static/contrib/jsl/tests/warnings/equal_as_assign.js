/*jsl:option explicit*/
function equal_as_assign() {
    var a, b;
    while (a = b) { /*warning:equal_as_assign*/
        a++;
    }
}
