/*jsl:option explicit*/
/*conf:-want_assign_or_call*/
function multiple_plus_minus() {
    var i, j;
    i = 0;
    j = 0;

    /* disallow confusing +/- */
    i+++j; /*warning:multiple_plus_minus*//*warning:inc_dec_within_stmt*/
    j---i; /*warning:multiple_plus_minus*//*warning:inc_dec_within_stmt*/
}
