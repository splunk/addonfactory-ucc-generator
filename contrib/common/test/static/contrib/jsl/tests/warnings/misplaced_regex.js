/*jsl:option explicit*/
function misplaced_regex() {
    var i, re;

    /* legal usage: regex in assignment */
    re = /\/\./;

    /* legal usage: regex in object definition */
    var o = { test : /\/\./ };

    /* legal usage: regex as first parameter */
    new String().replace(/\/\./, "<smile>");

    /* legal usage: regex as parameter (besides first) */
    misplaced_regex(re, /\/\./);

    /* legal usage: regex in property */
    var b = /\/\./.test(new String());

    /* illegal usage: anything else */
    i += /\/\./; /*warning:misplaced_regex*/
    i = -/.*/; /*warning:misplaced_regex*/

    /* legal usage: return */
    return /\/\./;
}
