/*jsl:option explicit*/
function ambiguous_nested_stmt() {
    var a, i, s;
    a = new Array(1, 2, 3);

    /* legal: else if */
    if (s == "false") {
        i = 0;
    }
    else if (s == "true") {
        i = 1;
    }

    /* if, else */
    if (true)
        s = "A";
    else
        s = "B";

    /* skip with */

    /* try, catch, finally always require braces */

    /* do...while */
    do s += ".";
    while (false);

    /* for */
    for (i = 0; i < 20; i += 1)
        s += i;

    /* for...in */
    for (i in a)
        s += a[i];

    /* while */
    while (i > 0)
        s += "~";

    /* illegal */
    if (i)
        if (s) { /*warning:ambiguous_nested_stmt*/
            i = s;
        }
        else { /*warning:ambiguous_else_stmt*/
            s = i;
        }

    /* illegal */
    if (i)
        while (s) { /*warning:ambiguous_nested_stmt*/
            i = s;
        }

    /* illegal */
    if (i)
        do { /*warning:ambiguous_nested_stmt*/
            i = s;
        } while (s);

    /* illegal */
    if (i)
        for (i = 0; i < 1; i++) { /*warning:ambiguous_nested_stmt*/
            i++;
        }
}
