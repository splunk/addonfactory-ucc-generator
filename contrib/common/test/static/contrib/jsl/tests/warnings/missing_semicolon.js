/*jsl:option explicit*/

function missing_semicolon() {
    /* missing semicolon after return */
    function MissingSemicolonOnReturnStatement() {
        return 0 /*warning:missing_semicolon*/
    }
    function MissingSemicolonOnReturnStatement2() { return 0 } /*warning:missing_semicolon*/

    /* missing semicolon after lambda */
    function x() {
        this.y = function() { return 0; } /*warning:missing_semicolon_for_lambda*/
    }

    /* missing semicolon after lambda */
    x.prototype.z = function() {
        return 1;
    } /*warning:missing_semicolon_for_lambda*/

    do x++;
	while (x < 10) /*warning:missing_semicolon*/
}

