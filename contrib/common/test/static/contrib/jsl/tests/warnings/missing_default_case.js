/*jsl:option explicit*/
function missing_default_case() {
    var i, s;

    /*missing default case*/
    switch (i) { /*warning:missing_default_case*/
      case 1:
        return 1;
    }

    /* ambivalence - fallthru is meaningless */
    switch (i) {
      case 2:
        /*jsl:fallthru*/ /*warning:invalid_fallthru*/
      case 3:
        s += 1;
        break;
      default:
        break;
    }

    /* ok - intended use of fallthru */
    switch (i) {
      case 0:
        s += "?";
        /*jsl:fallthru*/
      case 1:
        s += "!";
        break;
      default:
        break;
    }

    /* ok - intended use of fallthru */
    switch(i) {
      case 1:
        try {
            i++;
        }
        catch(e)
        {}
        /*jsl:fallthru*/
      case 2:
        i--;
        break;
      default:
        break;
    }

    return "";
}
