/*jsl:option explicit*/
function useless_void() {
    var z;
    z = void 0; /*warning:useless_void*/
    z();
}
