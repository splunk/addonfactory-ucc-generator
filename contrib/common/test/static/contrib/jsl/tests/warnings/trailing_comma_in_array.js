/*jsl:option explicit*/
function trailing_comma_in_array() {
    var a;

    a = [1,,2];
    a = [1,]; /*warning:trailing_comma_in_array*/
    a = [1,,]; /*warning:trailing_comma_in_array*/
}
