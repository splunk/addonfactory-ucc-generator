/*jsl:option explicit*/
function option_explicit() {
    var o = {};

    with (o) { /*warning:with_statement*/
        /* should not warn about undeclared identifier */
        some_variable = another_variable;
        if (o) {
            second_value = first_variable;
        }
    }
}
