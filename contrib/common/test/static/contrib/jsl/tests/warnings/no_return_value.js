/*jsl:option explicit*/
function no_return_value() {
    function error1(b) {
        if (b)
            return true;
        else
            return; /*warning:no_return_value*/
    }
    
    function error2(b) {
        if (b) {
            return; /*warning:no_return_value*/
        }
        else {
            return "";
        }
    }
    
    function error3(b) { /*warning:no_return_value*/
        if (b) {
            return "";
        }
    }
    
    function correct(b) {
        if (b)
            return;
        else
            return;
    }
}
