function want_assign_or_call() {
    var a;
    a; /*warning:want_assign_or_call*/
    a++;
    a--;
    a /= 2;
    a %= 4;
    a >>= 3;
    a << 2; /*warning:want_assign_or_call*/

    new function() {
    };

    function test() {
    }

    function() { /*warning:want_assign_or_call*/
        return 42;
    }

    delete a;

    a.b();

    /* Test with arguments to the constructor. */
    new function(x) {
        this.x = x;
    }(42);
}

