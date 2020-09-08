define(['splunkjs/mvc/utils'], function (Utils) {

    suite('Util hook override', function () {

        test('works', function () {
            assert.deepEqual(Utils.getPageInfo(), {
                root: '',
                locale: 'en-us',
                app: 'test',
                page: 'page'
            });
        });
    });
});