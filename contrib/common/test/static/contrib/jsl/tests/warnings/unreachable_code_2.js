function unreachable_code_2() {

    // Function declarations are never unreachable.
    function scope_a()
    {
        return inner();
        function inner() {
            return 10;
        }
    }

    // Variable declarations are never unreachable.
    function scope_b()
    {
        return value;
        var value;
    }

    // Variable assignments are, however.
    function scope_c()
    {
        return value_a;
        var value_a = 10; /*warning:unreachable_code*/
    }

    // Test multiple variables.
    function scope_d()
    {
        return value_a;
        var value_a, value_b = 10, value_c; /*warning:unreachable_code*/
    }
}

