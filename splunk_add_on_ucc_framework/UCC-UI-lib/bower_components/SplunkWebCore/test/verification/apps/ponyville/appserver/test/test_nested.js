define(function () {
    //verifies that nested suites are handled correctly

    suite('one', function () {
        var counter = 0;

        suiteTeardown(function () {
            assert.equal(3, counter);
        });

        test('test one', function () {
            assert.equal(0, counter);
            counter++;
        });

        suite('two', function () {
            suite('three', function () {
                test('test three', function () {
                    assert.equal(2, counter);
                    counter++;
                });
            });

            test('test two', function () {
                assert.equal(1, counter);
                counter++;
            });
        });
    });
});