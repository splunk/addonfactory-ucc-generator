/*jsl:option explicit*/
function comma_separated_stmts() {
    var b, i, j;

    /* comma (legit) */
    for (i = 0, j = 0; i < 10; i += 2, j += 4) {
        b = ((i + j) / 2 == i - j);
    }

    /* comma (unclear) */
    for (i = 0; i < 10, j > 20; i++) { /*warning:comma_separated_stmts*/
        j = i;
    }

    /* comma (unclear) */
    b = false, i = 0, j = 0; /*warning:comma_separated_stmts*/
}
