/* Allow C++ style control comments.
https://sourceforge.net/tracker/?func=detail&aid=1534046&group_id=168518&atid=847185
*/
function control_comments() {
    //jsl:declare undeclared_a
    undeclared_a = 1;
    undeclared_b = 2; /*warning:undeclared_identifier*/
}

