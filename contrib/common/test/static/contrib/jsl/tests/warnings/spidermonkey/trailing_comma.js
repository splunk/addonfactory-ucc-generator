/*jsl:option explicit*/
function trailing_comma() {
    /* illegal - trailing comma */
    return { name: 'value', }; /*warning:trailing_comma*/
}
