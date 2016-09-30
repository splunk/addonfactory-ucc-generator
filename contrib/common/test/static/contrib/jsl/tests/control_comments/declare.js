/*jsl:option explicit*/
/*conf:-identifier_hides_another*/
function declare() {
    window.alert('http://www.javascriptlint.com/');
    /*jsl:declare window*/ /*warning:redeclared_var*/

    /* redeclaration only at local scope */
    var window;
    var document;
    /*jsl:declare document*//*warning:redeclared_var*/
}

var i = 10 /*warning:missing_semicolon*/
/*jsl:declare sample*/

/* declare was scoped */
window.alert('JavaScript Lint');/*warning:undeclared_identifier*/

document.write('<a href="http://www.javascriptlint.com/">JavaScript Lint</a>');

/*jsl:declare document*/ /*warning:redeclared_var*/
function document()
{
}

/*jsl:declare*//*warning:jsl_cc_not_understood*/
/*jsl:declare variable?*//*warning:jsl_cc_not_understood*/
