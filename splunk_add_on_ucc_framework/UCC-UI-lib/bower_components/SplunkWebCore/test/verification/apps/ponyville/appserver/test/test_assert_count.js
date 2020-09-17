define(['underscore'], function (_) {

    suite('Assert count', function () {

        function doAssertions() {
            if (_.isFunction(assert.getCallCounts)) {
                var callCounts = assert.getCallCounts();
                assert.equal(callCounts.current, 0);

                callCounts = assert.getCallCounts();
                assert.equal(callCounts.current, 1);
                assert.equal(1, '1');

                callCounts = assert.getCallCounts();
                assert.equal(callCounts.current, 3);
            } else {
                console.log('This browser doesn\'t support assertion counting ' +
                    'or it\s not enabled - skipping test');
            }
        }

        test('works (first test)', function () {
            doAssertions();
        });

        test('should output console warning', function () {
            //TODO: assert this without calling assert :)
        });

        test('works (second test)', function () {
            doAssertions();
        });
    });
});