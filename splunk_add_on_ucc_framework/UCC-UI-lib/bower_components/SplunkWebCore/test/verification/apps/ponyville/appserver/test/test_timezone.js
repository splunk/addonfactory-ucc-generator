define(function () {

    suite('Timezone', function () {

        //timezones and dst stuff is complex - the following test is a very simple approach
        //to verifying tests are executed in the 'correct' default timezone, which is PDT/PST
        //TODO: if we ever include moment-timezone, use moment.tz.guess()
        test('is currently PST or PDT', function () {
            var offset = new Date().getTimezoneOffset();
            assert.ok(offset == 480 || offset == 420, 'Timezone offset isn\'t 7 or 8 hours');
        });
    });
});