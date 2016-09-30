/*jsl:option explicit*/
function useless_assign() {
    var s = s; /*warning:useless_assign*/

    var o;
    o = o; /*warning:useless_assign*/

    var i;
    for (i = i; ; ) { /*warning:useless_assign*/
        i++;
    }

    for (; i = i; ) { /*warning:useless_assign*/
        i++;
    }

    for (; ; i = i) { /*warning:useless_assign*/
        i++;
    }
}
