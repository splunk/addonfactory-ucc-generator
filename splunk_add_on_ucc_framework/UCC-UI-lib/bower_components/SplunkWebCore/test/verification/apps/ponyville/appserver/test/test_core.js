define([
    'constants/pivot',
    'moment'
], function (ConstantsPivot, Moment) {

    suite('Core imports #1', function () {

        test('regular core import', function () {
            assert.equal(ConstantsPivot.STRING, 'string');
        });
    });

    suite('Core imports #2', function () {

        test('contrib core import', function () {
            assert.isDefined(Moment()._isAMomentObject);
        });
    });
});