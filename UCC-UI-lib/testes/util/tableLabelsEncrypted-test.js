import assert from 'assert';
import {configManager} from 'app/util/configManager';
import Util from 'app/util/Util';
import _, {cloneDeep} from 'lodash';
import unifiedConfig from 'repoBaseDir/globalConfig.json';

configManager.init();

_.mixin({
    t: (string) => string
}, {
    'chain': false
});

const NORMAL_CONFIG = {
    'name': 'account',
    'title': 'Account',
    'entity': [
        {
            'field': 'api_key',
            'label': 'API Key',
            'type': 'text',
            'required': true,
            'encrypted': false
        }
    ]
};



describe('Encrypted table labels testes', () => {
    it('A normal entity should generate same text', () => {
        const config = cloneDeep(NORMAL_CONFIG);
        const srcText = 'Awesome, Splunk DES';
        config.entity[0].id = `abc/${unifiedConfig.meta.restRoot}/${config.name}/a`;
        const text = Util.encryptTableText(config, config.entity[0], 'api_key', srcText);
        assert.equal(srcText, text);
    });

    it('A encrypted entity should generate ""******"', () => {
        const config = cloneDeep(NORMAL_CONFIG);
        config.entity[0].id = `abc/${unifiedConfig.meta.restRoot}/${config.name}/a`;
        config.entity[0].encrypted = true;
        const srcText = 'Awesome, Splunk DES';
        const text = Util.encryptTableText(config, config.entity[0], 'api_key', srcText);

        assert.equal('******', text);
    });

    it('A encrypted entity should generate ""******" with empty field value', () => {
        const config = cloneDeep(NORMAL_CONFIG);
        config.entity[0].id = `abc/${unifiedConfig.meta.restRoot}/${config.name}/a`;
        config.entity[0].encrypted = true;
        const srcText = '';
        const text = Util.encryptTableText(config, config.entity[0], 'api_key', srcText);

        assert.equal('******', text);
    });
});
