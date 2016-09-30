// Test each combination of arg, var, function, and jsl:declare.
function identifier_hides_another(arg_hides_arg,
                                  function_hides_arg,
                                  var_hides_arg,
                                  declare_hides_arg) {

    function arg_hides_function() { return true; }
    function function_hides_function() { return true; }
    function var_hides_function() { return true; }
    function declare_hides_function() { return true; }

    var arg_hides_var;
    var function_hides_var;
    var var_hides_var;
    var declare_hides_var;

    /*jsl:declare arg_hides_declare*/
    /*jsl:declare function_hides_declare*/
    /*jsl:declare var_hides_declare*/
    /*jsl:declare declare_hides_declare*/

    function inner(arg_hides_arg,
                   arg_hides_function,
                   arg_hides_var,
                   arg_hides_declare) { /*warning:identifier_hides_another*//*warning:identifier_hides_another*//*warning:identifier_hides_another*//*warning:identifier_hides_another*/

        function function_hides_arg() { return true; } /*warning:identifier_hides_another*/
        function function_hides_function() { return true; } /*warning:identifier_hides_another*/
        function function_hides_var() { return true; } /*warning:identifier_hides_another*/
        function function_hides_declare() { return true; } /*warning:identifier_hides_another*/

        var var_hides_arg; /*warning:identifier_hides_another*/
        var var_hides_function; /*warning:identifier_hides_another*/
        var var_hides_var; /*warning:identifier_hides_another*/
        var var_hides_declare; /*warning:identifier_hides_another*/

        /*jsl:declare declare_hides_arg*/ /*warning:identifier_hides_another*/
        /*jsl:declare declare_hides_function*/ /*warning:identifier_hides_another*/
        /*jsl:declare declare_hides_var*/ /*warning:identifier_hides_another*/
        /*jsl:declare declare_hides_declare*/ /*warning:identifier_hides_another*/
    }
}

