/*jsl:option explicit*/
function default_not_at_end() {
    var i;

    /*default case at top*/
    switch (i) {
      default:
        i++;
        break;
      case 1: /*warning:default_not_at_end*/
        return 1;
    }

    return 0;
}
