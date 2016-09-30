/*jsl:option explicit*/
function inc_dec_within_stmt() {
    var x;
    do {
        var y = x--; /*warning:inc_dec_within_stmt*/
    } while (x > 0);

    do y = x--; /*warning:inc_dec_within_stmt*/
    while (x > 0);

    do {
        /*jsl:ignore*/
        var y = x--;
        /*jsl:end*/
    } while (x > 0);

    do {
       x++;
    } while (x < 0);
}
