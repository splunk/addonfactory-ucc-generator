/*jsl:option explicit*/
function legacy_cc_not_understood() {
    /* illegal - missing end */
    /*@control comment starts but doesn't end*/ /*warning:legacy_cc_not_understood*/

    /* illegal - unrecognized */
    /*@bogon@*/ /*warning:legacy_cc_not_understood*/
    return;
}
