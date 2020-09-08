define(['./support/postcss/Invalid.pcss', './support/postcss/Master.pcssm'], function (pcss, pcssm) {

    suite('PostCSS', function () {

        suiteSetup(function () {
            this.findStyle = function (className) {
                for (var i = 0; i < document.styleSheets.length; i++) {
                    var classes = document.styleSheets[i].cssRules;

                    for (var j = 0; j < classes.length; j++) {
                        if (classes[j].selectorText == className) {
                            return classes[j].style;
                        }
                    }
                }
                return null;
            }
        });

        test('pcss is not compiled (but mocked)', function () {
            //Invalid.pcss contains an invalid statement which causes PostCSS to complain and this test to fail,
            // if the test runner doesn't stub out pcss handling (= return an empty object).
            assert.isObject(pcss);
            assert.lengthOf(Object.keys(pcss), 0);
        });

        test('pcssm is compiled', function () {
            assert.deepEqual(Object.keys(pcssm), ['theme', 'button', 'buttonMixin', 'buttonTexture',
                'buttonColorShift', 'buttonCalc', 'buttonConditional', 'buttonLoop1', 'buttonLoop2']);
        });

        test('pcssm styles are loaded', function () {
            var themeStyle = this.findStyle('.' + pcssm.theme + '::after');

            //as long as the runner cleans all styles for isolation, the following must hold:
            assert.isNull(themeStyle);

            //if styles are supported in the future, replace this with the following:
            ////assert.isNotNull(themeStyle);
            ////assert.equal(themeStyle.content.replace(/['"]/g, '').trim(), 'enterprise');
        });
    });
});
