define(['../hello', './hello'], function (ParentSupportHello, SupportHello) {
    //see ponyville/test_support.js, this is the same test from a subdirectory perspective

    suite('Support files in subdirectory', function () {

        test('in parent dir', function () {
            assert.equal(ParentSupportHello.hello, 1);
        });

        test('in same dir', function () {
            assert.equal(SupportHello.hello, 2);
        });
    });
});