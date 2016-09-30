/*jsl:option explicit*/
function parseint_missing_radix() {
    var i;

    i = parseInt();/*warning:parseint_missing_radix*/

    i = parseInt('061');/*warning:parseint_missing_radix*/
    i = parseInt('061', 8);

    i = parseInt('0xA');/*warning:parseint_missing_radix*/
    i = parseInt('0xA', 16);

    i = parseInt('81');/*warning:parseint_missing_radix*/
    i = parseInt('81', 10);
}
