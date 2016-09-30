/*jsl:option explicit*/
function invalid_fallthru() {
    /* mistake - invalid use of fallthru */
    /*jsl:fallthru*/ /*warning:invalid_fallthru*/
    var i;
    switch (i) {
      /*jsl:fallthru*/ /*warning:invalid_fallthru*/
      case /*jsl:fallthru*/1: /*warning:invalid_fallthru*/
        break;
      default /*jsl:fallthru*/: /*warning:invalid_fallthru*/
        break;    
    }
}
