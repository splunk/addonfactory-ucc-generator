/*jsl:option explicit*/
function missing_break() {
    var i, o, s;

    switch (i) {
      /* okay because of return */
      default:
        return "";
    }

    switch (i) {
      /* okay because of throw */
      default:
        throw s;
    }

    switch (i) {
      case 1:
        s += ".";
        /*missing break*/

      case 2: /*warning:missing_break*/
        /*okay because of return*/
        s += ",";
        return s;

      case 3:
        /*okay because of throw*/
        s += ";";
        throw s;

      case 4:
        /*okay because of break/throw*/
        if (s) {
            break;
        }
        else {
            throw i;
        }

      case 5:
        /*missing break in catch*/
        try {
            i--;
            break;
        }
        catch (err) {
            s = null;
        }
        finally {
            i++;
        }

      case 6: /*warning:missing_break*/
        /*ok; finally statement does not affect it */
        try {
            i--;
            break;
        }
        catch (err) {
            s = null;
            break;
        }
        finally {
            i++;
        }

      case 7:
        /*ok; break statement in catch and finally*/
        try {
            i--;
        }
        catch (err) {
            s = null;
            break;
        }
        finally {
            i++;
            break;
        }

      case 8:
        /*ok; return statement in finally*/
        try {
            i--;
        }
        catch (err) {
            s = null;
        }
        finally {
            i++;
            return i;
        }

      case 9:
        /* test a break inside a loop */
        for (;;) {
            break;
        }

      default: /*warning:missing_break*/
        break;
    }

    return "";
}
