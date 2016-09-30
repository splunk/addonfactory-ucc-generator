/*
This failed in cjsl but is working in pyjsl.
https://sourceforge.net/tracker/?func=detail&aid=2146544&group_id=168518&atid=847185
*/
function syntax_error_3() {
    return /^{([^}]*)}$/;
}

