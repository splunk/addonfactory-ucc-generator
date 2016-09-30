/*jsl:option explicit*/
function anon_no_return_value() {
    var error1 = function(b) {
        if (b)
            return true;
        else
            return; /*warning:anon_no_return_value*/
    };

    var error2 = function(b) {
        if (b) {
            return; /*warning:anon_no_return_value*/
        }
        else {
            return "";
        }
    };


    var correct = function(b) {
        if (b)
            return;
        else
            return;
    };
}
