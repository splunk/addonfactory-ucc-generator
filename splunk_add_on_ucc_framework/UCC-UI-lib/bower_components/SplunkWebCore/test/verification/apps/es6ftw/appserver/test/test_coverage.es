/* global __coverage__ */

// Verifies code coverage generation for ES5 and ES6 files. This has a
// couple of limitations at the moment:
//    * There's only one (one-line) ES6 core source module
//    * Core source coverage is affected by edits to the modules,
//        meaning this test would constantly break if we assert it
//  Generated statement coverage is verified for modules we
//  control (test app modules).

import _ from 'lodash';
import * as coverage5 from 'app/es6ftw/CoverageES5'; // es5 app
import { parse as evalParser } from 'util/eval/parser'; // es5 core
import * as coverage6 from 'app/es6ftw/CoverageES6'; // es6 app
import * as envUtil from 'util/env'; // es6 core (replace this once there's a more extensive one)

suite('Coverage support for ES6 tests and ES5/ES6 modules', function () {
    test('ES6 coverage (app)', function () {
        assert.equal(coverage6.helloSayerArrow()('world'), 'Hello world');
        assert.equal(coverage6.helloSayerArrowDefault()('world!'), 'Hello world!');
        assert.equal(coverage6.additionDestructuring([2, 3]), 5);
        assert.equal(coverage6.stringFunction('bar'), true);

        const x = new coverage6.X(5);
        assert.equal(x.y, 5);
        assert.equal(x.xy(5), 25);
        assert.equal(coverage6.X.xx(), 42);
        assert.equal(new coverage6.Y(5).xy(5), 625);

        const fileCov = _.find(__coverage__, c => c.path.endsWith('CoverageES6.es'));
        assert.deepEqual(fileCov.s, {
            0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1,
            6: 1, 7: 2, 8: 0, 9: 3, 10: 1, 11: 1,
        });
    });

    test('ES5 coverage (app)', function () {
        assert.equal(coverage5.addition([2, 3]), 5);

        const fileCov = _.find(__coverage__, c => c.path.endsWith('CoverageES5.js'));
        assert.deepEqual(fileCov.s, { 1: 1, 2: 0, 3: 0, 4: 1, 5: 1, 6: 1, 7: 1 });
    });

    test('ES6 coverage (core)', function () {
        assert.deepEqual(envUtil, { DEBUG: true });
    });

    test('ES5 coverage (core)', function () {
        assert.deepEqual(evalParser('"foobar"'), {
            type: 'Literal',
            value: 'foobar',
            raw: '"foobar"',
        });
    });
});