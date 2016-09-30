/* try skipping some files */
/*conf:+process process/i* */
/*conf:-process process/ignore* */

/* try skipping a file that was never added */
/*conf:-process process/error.ecmascript*/

/* try skipping a file that was added multiple times */
/*conf:+process process/error-2.ecmascript*/
/*conf:+process process/error-2.ecmascript*/
/*conf:-process process/error-2.ecmascript*/

function zero() {
    return 0;
}
