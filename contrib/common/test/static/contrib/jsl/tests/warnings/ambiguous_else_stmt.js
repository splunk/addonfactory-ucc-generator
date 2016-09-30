/*jsl:option explicit*/
function ambiguous_else_stmt() {
    var i, j, y;

    if (i)
        if (j) { /*warning:ambiguous_nested_stmt*/
            j++;
        }
    else if (j) { /*warning:ambiguous_else_stmt*/
        i--;
    }

    if (j)
        if (i) /*warning:ambiguous_nested_stmt*/
            for (;;) /*warning:ambiguous_nested_stmt*/
                while (j) /*warning:ambiguous_nested_stmt*/
                    if (y) /*warning:ambiguous_nested_stmt*/
                        y--;
        else /*warning:ambiguous_else_stmt*/
            y++;
}
