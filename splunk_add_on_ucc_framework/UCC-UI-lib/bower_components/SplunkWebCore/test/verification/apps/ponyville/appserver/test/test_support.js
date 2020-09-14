define(['./hello', './subdir/hello'], function (SupportHello, SubdirSupportHello) {
    //verifies that support files are available, even from subdirectories

    suite('Support files in root', function () {

        test('in parent dir', function () {
            assert.equal(SupportHello.hello, 1);
        });

        test('in same dir', function () {
            assert.equal(SubdirSupportHello.hello, 2);
        });
    });
});