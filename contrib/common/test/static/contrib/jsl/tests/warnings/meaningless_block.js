/*jsl:option explicit*/
function meaningless_block() {
    var i;

    /* meaningless block */
    { /*warning:meaningless_block*/
        var s;
        s = i + "%";
    }

    return s;
}
