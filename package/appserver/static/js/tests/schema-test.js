import assert from 'assert';
import config from 'rootDir/globalConfig';
import {validateSchema} from 'app/util/validators';
import 'rootDir/globalConfig.js'

describe('Schema test', () => {
    it('Local reference config JSON should match the schema', () => {
        const res = validateSchema(window.__globalConfig);
        assert.equal(false, res.failed);
    });
});
