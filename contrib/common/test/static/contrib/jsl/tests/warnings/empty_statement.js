/*jsl:option explicit*/
function empty_statement() {
    var i;
    i = 0;

    /* empty statement within while; useless expression */
    while (false); /*warning:empty_statement*/
    while (false) /*jsl:pass*/;  /*warning:invalid_pass*//*warning:empty_statement*/

    while (false) { /*warning:empty_statement*/
    }
    while (false) {
        /*jsl:pass*/
    }

    /* empty block within for; useless expression */
    for (i = 0; i < 2; i += 1) { /*warning:empty_statement*/
    }
    for (i = 0; i < 2; i += 1) {
        /*jsl:pass*/
    }

    /* legal: empty catch statement */
    try {
        i++;
    }
    catch (err) {
    }
}
