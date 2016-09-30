/*jsl:option explicit*/
function nested_comment() {
    /* nested comment */
    /* /* */ /*warning:nested_comment*/
    return "";
}
