define(['jquery', 'util/ajax_no_cache'], function ($) {
    //this test verifies that no cache buster is added to requests (by jQuery)

    //TODO: someone has to explain this to me – the test runner
    //overrides util/ajax_no_cache to NOT do anything, which causes
    //jQuery to NOT apply cache busting? I must be missing something

    suite('util/ajax_no_cache override', function () {

        setup(function () {
            this.xhr = sinon.useFakeXMLHttpRequest();
            var requests = this.requests = [];

            this.xhr.onCreate = function (xhr) {
                requests.push(xhr);
            };
        });

        teardown(function () {
            this.xhr.restore();
        });

        test('works', function () {
            $.get('foo');

            assert.equal(1, this.requests.length);
            assert.equal(this.requests[0].url, 'foo');
        });
    });
});