import assert from 'assert';
import {validateSchema} from 'app/util/validators';
import globalConfig from 'repoBaseDir/globalConfig.json';

describe('Schema test', () => {
    it('Local reference config JSON should match the schema', () => {
        const res = validateSchema(globalConfig);
        assert.equal(false, res.failed);
    });
});
