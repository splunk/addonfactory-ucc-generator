/* The tests disable this warning by default becaues of noise. Enable it. */
/*conf:+unreferenced_argument*/
/*conf:+unreferenced_function*/
/*conf:+unreferenced_variable*/

/* outer-level functions shouldn't warn */
var unreferenced_global;
function unreferenced_identifier() {
    /* Test an unreferenced function. */
    function unreferenced_func() { /*warning:unreferenced_function*/
        return true;
    }
    function referenced_func() {
    }
    var referenced_var = referenced_func;
    referenced_var();

    /* Test an unreferenced parameter. */
    var z = new function(unreferenced_parm) { /*warning:unreferenced_argument*/
    };
    z.prop = 42;

    /* Test an unreferenced variable. */
    var unreferenced_variable = 100; /*warning:unreferenced_variable*/
    
    /* An unreferenced duplicate parameter should give one warning. */
    function func_with_dup(unref_dup_parm, unref_dup_parm) { /*warning:unreferenced_argument*/ /*warning:duplicate_formal*/
    }
    func_with_dup();

    /* An unreferenced duplicate variable should give one warning. */
    var unref_dup_var; /*warning:unreferenced_variable*/
    var unref_dup_var; /*warning:redeclared_var*/

    /* Test a try/catch. The error doesn't need to be referenced. */
    var can;
    try {
        can = true; /* we think we can... */
    }
    catch(err) {
        can = false; /* ...but maybe not! */
    }
    can = !can;

    /* Test a with statement. */
    var withobj = {};
    var withval = 42;
    with (withobj) /*warning:with_statement*/
    {
        prop_a = withval;
        var innerval = '42';
        prop_b = innerval;
    }

    /* Test assignments. */
    var assigned_but_unref; /*warning:unreferenced_variable*/
    assigned_but_unref = 42;

    function callback() {
    }
    var assigned_but_ref;
    (assigned_but_ref = callback)();

    /* Test increment and decrement. */
    var unref_inc; /*warning:unreferenced_variable*/
    unref_inc++;
    var unref_dec; /*warning:unreferenced_variable*/
    unref_dec--;

    var tmp;
    var ref_inc;
    tmp = ref_inc++; /*warning:inc_dec_within_stmt*/
    var ref_dec;
    tmp = ref_dec--; /*warning:inc_dec_within_stmt*/
    tmp = -tmp;

    /* Test named functions as references. */
    var fn = function ref_func() { return 42; }; /*warning:unreferenced_function*/
    fn();

    /* Test nested scopes. */
    function get_callback(parm) {
        return function() {
            return parm;
        };
    }

    function test_unused(parm) { /*warning:unreferenced_function*/
        /*jsl:unused parm*/
        /*jsl:unused bogus_outer*/ /*warning:undeclared_identifier*/

        var unused_var;
        /*jsl:unused unused_var*/

        with (parm) { /*warning:with_statement*/
            /*jsl:unused bogus_inner*/ /*warning:undeclared_identifier*/
            x = 42;
        }
    }

    return get_callback(42);
}
