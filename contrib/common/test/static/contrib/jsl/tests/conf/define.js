/*conf:+define window*/
/*jsl:option explicit*/
function define() {
    window.alert('http://www.javascriptlint.com/');

    /* cannot use document, however */
    document.write('<a href="http://www.javascriptlint.com/">JavaScript Lint</a>'); /*warning:undeclared_identifier*/
}
