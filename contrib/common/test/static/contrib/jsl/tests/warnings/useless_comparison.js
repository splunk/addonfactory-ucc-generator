/*jsl:option explicit*/
function useless_comparison() {
    var i, j, o;

    /* Test expressions */
    if (i+2 < i+2) { /*warning:useless_comparison*/
        return;
    }
    if (j != j) { /*warning:useless_comparison*/
        i++;
    }
    if ((14 * i) / (j - 2) >= (14 * i) / (j - 2)) { /*warning:useless_comparison*/
        return;
    }

    /* Test properties */
    if (o.left == o.left) { /*warning:useless_comparison*/
        return;
    }
    if (o.left == o['left']) { /*warning:useless_comparison*/
        return;
    }
    if (o['left'] == o['left']) { /*warning:useless_comparison*/
        return;
    }
    if (o[i] == o[i]) { /*warning:useless_comparison*/
        return;
    }

    if (o.left == o.right) {
        return;
    }
    if (o['left'] == o.right) {
        return;
    }
    if (o['left'] == o['right']) {
        return;
    }
    if (o[i] == o[j]) {
        return;
    }
    if (o[i] == o.right) {
        return;
    }

    /* Complex expressions not caught because of slight differences */
    if ((14 * i) / (j - 2) == (i * 14) / (j - 2)) {
        return;
    }

    /* allowed since function may have side affects */
    if (useless_comparison() == useless_comparison()) {
        return;
    }
}
