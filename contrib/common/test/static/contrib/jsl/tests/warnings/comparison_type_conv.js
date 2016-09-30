/*jsl:option explicit*/
function comparison_type_conv() {
    var a, b, c;

    /* comparison against null */
    if (a == null || b < c) { /*warning:comparison_type_conv*/
        a = b;
    }
    if (a === null || b < c) {
        a = b;
    }

    /* comparison against zero */
    if (c > a && a + b == 0) { /*warning:comparison_type_conv*/
        c = -c;
    }
    if (c > a && a + b === 0) {
        c = -c;
    }

    /* comparison against blank string */
    if (a == "") { /*warning:comparison_type_conv*/
        b = c;
    }
    if (a === "") {
        b = c;
    }

    /* comparison against true */
    if (a == true) { /*warning:comparison_type_conv*/
        c = b;
    }
    if (a === true) {
        c = b;
    }

    /* comparison against false */
    if (a == false) { /*warning:comparison_type_conv*/
        c = a;
    }
    if (a === false) {
        c = a;
    }
}
