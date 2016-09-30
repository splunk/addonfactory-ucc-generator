function unterminated_comment() {
    /*
        This should not produce a syntax error
        when ending a multiline-comment like this:
    ////////////////////////////////////////////////////////*/ /*warning:nested_comment*/

    return true;
}
