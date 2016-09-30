/*jsl:option explicit*/
function duplicate_case_in_switch() {
    var i, o, s;

    switch (i) {
      case i:
        s += "...";
        break;
      case -1:
        s = "";
        break;
      case duplicate_case_in_switch():
        s = "0";
        break;
      case o.prop:
        i = 4;
        break;
      case "\"str1'":
      case "str2":
        i = null;
        break;

      /* mistake - duplicated */
      case i: /*warning:duplicate_case_in_switch*/
        s = "~";
        break;

      /* mistake - duplicated */
      case -1: /*warning:duplicate_case_in_switch*/
        s = "!";
        break;

      /* mistake - duplicated */
      case duplicate_case_in_switch(): /*warning:duplicate_case_in_switch*/
        s = "";
        break;

      /* mistake - duplicated */
      case o['prop']: /*warning:duplicate_case_in_switch*/
        s = i;
        break;

      /* mistake - duplicated */
      case '"str1\'': /*warning:duplicate_case_in_switch*/
        s = 0;
        break;

      /* ok - not duplicated */
      case 100000000:
      case 100000001:
        s = 1;
        break;

      /* mistake - duplicated */
      case 100000000: /*warning:duplicate_case_in_switch*/
        s = -1;
        break;

      default:
        break;
    }
}
