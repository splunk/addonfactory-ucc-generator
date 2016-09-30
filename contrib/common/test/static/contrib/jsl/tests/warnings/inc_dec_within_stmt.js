/*jsl:option explicit*/
function inc_dec_within_stmt() {
    var i, s;

    function statements() {
        i++;
        i--;
        ++i;
        --i;
    }

    function for_loops() {
        for (i = 0; i < 10; i++) {
            s = i;
        }
        for (i = 10; i > 0; i--) {
            s = i;
        }
        for(i = 0; i < 5; i++, i--) {
            i++;
        }
        for(i = 0; i < 5; ) {
            i++;
        }

        for (i = 0; i < 5; i = ++i) { /*warning:inc_dec_within_stmt*/
            /*jsl:pass*/
        }
    }

    function expressions() {
        switch (i--) /*warning:inc_dec_within_stmt*/ 
        {
        default:
            break;
        }

        s = new String(i++); /*warning:inc_dec_within_stmt*/

        s = --i; /*warning:inc_dec_within_stmt*/
    }

    function jsl_ignore() {
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
}
