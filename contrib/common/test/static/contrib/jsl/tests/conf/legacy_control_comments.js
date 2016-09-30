/*conf:-legacy_control_comments*/

/* Make sure that legacy control comments aren't respected */
function legacy_control_comments() {
    /*@ignore@*/
    ; /*warning:empty_statement*/
    /*@end@*/
}
