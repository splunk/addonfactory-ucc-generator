/*jsl:option explicit*/
function use_of_label() {
    var o;

    /* label disallowed */
    MyWhile: /*warning:use_of_label*/
    while (true) {
        /* label disallowed */
        MyFor: /*warning:use_of_label*/
        for (var x in o) {
            if (x) {
                break MyWhile;
            }
            else {
                continue MyWhile;
            }
        }
    }
}
