/*jsl:option explicit*/
function assign_to_function_call() {
    var o;
    var s;

    o = {};
    s = 'prop';

    o.prop = [];
    o['prop'] = [];

    o.getThis = function() { return this; };
    o.getThis() = {}; /*warning:assign_to_function_call*/

    ((function(){return 0;})()) = []; /*warning:assign_to_function_call*/
}
