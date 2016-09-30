/*jsl:option explicit*/
function unreachable_code() {
    var i;
    i = 0;

    /* unreachable because of break */
    while (i < 100) {
        break;
        i += 1; /*warning:unreachable_code*/
    }

    /* unreachable because of continue */
    while (i > 100) {
        continue;
        i += 1; /*warning:unreachable_code*/
    }

    /* unreachable because of return */
    if (i + i < 0) {
        return;
        i = -i; /*warning:unreachable_code*/
    }

    /* unreachable because of throw */
    if (i == 14) {
        throw i;
        i -= 1; /*warning:unreachable_code*/
    }

    function var_test() {
        return undef;
        var undef;
    }

    function func_test() {
        return fortytwo();
        function fortytwo() {
            return 42;
        }
    }

    /* test unreachable statements in for loops */
    for (i = 0; i < 10; i++) { /*warning:unreachable_code*/
        if (i)
            break;
        else
            return;
    }
    for (i = 0; i < 10; ) {
        if (i)
            break;
        else
            return;
    }

    /* test unreachable statements in do..while loops. */
    do {
        if (i)
            break;
        else
            return;
    } while (i); /*warning:unreachable_code*/

}
