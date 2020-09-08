define([
    './builtin-types'
], function(
    builtins
) {

    suite('ES6 Promise', function() {

        test('single promise with a timeout', function() {
            return assert.eventually.equal(
                new builtins.Promise(function(resolve) {
                    setTimeout(function() {
                        resolve('AHA');
                    }, 50);
                }),
                'AHA',
                'promise resolves arguments correct'
            );
        });

    });

    suite('ES6 Map', function() {

        test('map with string and non-string keys', function() {
            var m = new builtins.Map();
            var s = function () {};
            m.set('hello', 42);
            m.set(s, 34);

            assert.equal(m.get('hello'), 42, 'can retrieve with string key');
            assert.equal(m.get(s), 34, 'can retrieve with non-string key');
            assert.equal(m.size, 2, 'size is correct');
        });

    });

    suite('ES6 Set', function() {

        test('set with string and non-string values', function() {
            var s = new builtins.Set();
            var t = function() {};
            s.add('hello').add('goodbye').add('hello').add(t);

            assert.isTrue(s.has('hello'), 'has is correct with string key');
            assert.isTrue(s.has(t), 'has is correct with non-string key');
            assert.equal(s.size, 3, 'size is correct with deduping');
        });

    });

    suite('ES6 WeakMap', function() {

        test('weak map with non-string keys', function() {
            var w = new builtins.WeakMap();
            var element1 = window;
            var element2 = document.createElement('div');

            w.set(element1, 'window');
            w.set(element2, 'div');

            assert.equal(w.get(element1), 'window', 'lookup by reference works for window');
            assert.equal(w.get(element2), 'div', 'lookup by reference works for div');

            element2 = null;
            assert.isUndefined(w.get(element2), 'lookup for nulled reference is undefined');
        });

    });

    suite('ES6 Symbol', function() {

        test('symbol basic behavior', function() {
            var s1 = builtins.Symbol('foo');
            var s2 = builtins.Symbol('foo');
            var obj = {};
            obj[s1] = 'foo one';
            obj[s2] = 'foo two';

            assert.isTrue(s1 !== s2, 'symbols are unique even with the same seed');
            assert.equal(obj[s1], 'foo one', 'lookup an object key using a symbol');
            assert.equal(obj[s2], 'foo two', 'lookup an object key using a different symbol');
        });
    });

});
