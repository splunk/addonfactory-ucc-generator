import assert from 'assert';
import {checkDupKeyValues} from 'app/util/uccConfigurationValidators';
import _, {cloneDeep} from 'lodash';

_.mixin({
    t: (string) => string
}, {
    'chain': false
});

const NORMAL_CONFIG = {
    'configuration':  {
        'title': 'Configurations',
        'description': 'Configure your account, proxy and logging level.',
        'tabs': [
            {
                'name': 'account',
                'title': 'Account',
                'entity': [
                    {
                        'field': 'name',
                        'label': 'Name',
                        'type': 'text',
                        'required': true
                    },
                    {
                        'field': 'endpoint',
                        'label': 'Endpoint',
                        'type': 'text',
                        'required': true,
                        'defaultValue': 'https://firehose.crowdstrike.com/sensors/entities/datafeed/v1',
                        'options': {
                            'enabled': false,
                            'placeholder': 'https://firehose.crowdstrike.com/sensors/entities/datafeed/v1'
                        }
                    }
                ]
            },
            {
                'name': 'logging',
                'title': 'Logging',
                'entity': [
                    {
                        'field': 'loglevel',
                        'label': 'Log Level',
                        'type': 'singleSelect',
                        'options': {
                            'disableSearch': true,
                            'autoCompleteFields': [
                                {'label': 'INFO', 'value': 'INFO'},
                                {'label': 'DEBUG', 'value': 'DEBUG'},
                                {'label': 'ERROR', 'value': 'ERROR'}
                            ]
                        },
                        'defaultValue': 'INFO'
                    }
                ]
            }
        ]
    },
    'inputs': {
        'title': 'Inputs',
        'description': 'This is description',
        'services': [
            {
                'name': 'inputs_01',
                'title': 'Falcon Host Input',
                'entity': [
                    {
                        'field': 'name',
                        'label': 'Name',
                        'type': 'text',
                        'required': true
                    },
                    {
                        'field': 'account',
                        'label': 'Account',
                        'type': 'singleSelect',
                        'required': true
                    }
                ]
            },
            {
                'name': 'inputs_02',
                'title': 'Falcon Host Input test',
                'entity': [
                    {
                        'field': 'name',
                        'label': 'Name',
                        'type': 'text',
                        'help': 'Enter a unique name for each crowdstrike falcon host data input.'
                    },
                    {
                        'field': 'account',
                        'label': 'Account',
                        'type': 'singleSelect',
                        'options': {
                            'endpointUrl': 'splunk_ta_crowdstrike_account'
                        }
                    }
                ]
            }
        ]
    }
};



describe('Global config check duplicate key/value pairs testes', () => {
    it('A normal config shouldn\'t generate errors', () => {
        const configObj = cloneDeep(NORMAL_CONFIG);
        assert.equal(0, checkDupKeyValues(configObj.inputs, true).length);
    });

    it('Services in the inputs, tabs in the configuration with same name or title are forbidden', () => {
        let configObj = cloneDeep(NORMAL_CONFIG);
        configObj.inputs.services[0].name = configObj.inputs.services[1].name;
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length > 0);

        configObj = cloneDeep(NORMAL_CONFIG);
        configObj.inputs.services[0].title = configObj.inputs.services[1].title;
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length > 0);

        configObj = cloneDeep(NORMAL_CONFIG);
        configObj.configuration.tabs[0].name = configObj.configuration.tabs[1].name;
        assert.equal(true, checkDupKeyValues(configObj.configuration, false).length > 0);

        configObj = cloneDeep(NORMAL_CONFIG);
        configObj.configuration.tabs[0].title = configObj.configuration.tabs[1].title;
        assert.equal(true, checkDupKeyValues(configObj.configuration, false).length > 0);
    });

    it('Entities under same service or tab with same field or label are forbidden', () => {
        let configObj = cloneDeep(NORMAL_CONFIG);
        configObj.inputs.services[0].entity[0].label = configObj.inputs.services[0].entity[1].label;
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length > 0);

        configObj = cloneDeep(NORMAL_CONFIG);
        configObj.inputs.services[0].entity[0].field = configObj.inputs.services[0].entity[1].field;
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length > 0);
    });

    it('Fields in entity options.items with same value or label are forbidden', () => {
        let configObj = cloneDeep(NORMAL_CONFIG);
        configObj.inputs.services[0].entity[0].options = {
            items: [{
                label: '1',
                value: '2'
            }, {
                label: '2',
                value: '3'
            }]
        };
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length === 0);

        configObj.inputs.services[0].entity[0].options = {
            items: [{
                label: 'same',
                value: '2'
            }, {
                label: 'same',
                value: '3'
            }]
        };
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length > 0);

        configObj.inputs.services[0].entity[0].options = {
            items: [{
                label: '1',
                value: 'same'
            }, {
                label: '2',
                value: 'same'
            }]
        };
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length > 0);
    });

    it('Checker should be case insensitive', () => {
        let configObj = cloneDeep(NORMAL_CONFIG);
        configObj.inputs.services[0].entity[0].options = {
            items: [{
                label: '1',
                value: 'INSENSITIVE'
            }, {
                label: '2',
                value: 'insensitive'
            }]
        };
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length > 0);
    });

    it('Entities under same service or tab with same field or label are forbidden', () => {
        let configObj = cloneDeep(NORMAL_CONFIG);
        configObj.inputs.services[0].entity[0].label = configObj.inputs.services[0].entity[1].label;
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length > 0);

        configObj = cloneDeep(NORMAL_CONFIG);
        configObj.inputs.services[0].entity[0].field = configObj.inputs.services[0].entity[1].field;
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length > 0);
    });

    it('Fields in autoCompleteFields with same value are forbidden', () => {
        let configObj = cloneDeep(NORMAL_CONFIG);
        configObj.inputs.services[0].entity[0].options = {
            autoCompleteFields: [{
                label: '1',
                value: '2'
            }, {
                label: '3',
                value: '4'
            }]
        };
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length === 0);

        configObj.inputs.services[0].entity[0].options = {
            autoCompleteFields: [{
                label: '1',
                value: 'same'
            }, {
                label: '3',
                value: 'same'
            }]
        };
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length > 0);

        configObj.inputs.services[0].entity[0].options = {
            autoCompleteFields: [{
                label: 'a',
                children: [
                    {
                        label: 'same',
                        value: '1'
                    }, {
                        label: '3',
                        value: '3'
                    }
                ]
            }, {
                label: 'a',
                children: [
                    {
                        label: 'same',
                        value: '2'
                    }, {
                        label: '6',
                        value: '5'
                    }
                ]
            }]
        };
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length === 0);

        configObj.inputs.services[0].entity[0].options = {
            autoCompleteFields: [{
                label: 'a',
                children: [
                    {
                        label: '1',
                        value: 'same'
                    }, {
                        label: '3',
                        value: '3'
                    }
                ]
            }, {
                label: 'a',
                children: [
                    {
                        label: '9',
                        value: 'same'
                    }, {
                        label: '6',
                        value: '5'
                    }
                ]
            }]
        };
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length > 0);
    });

    it('Fields in autoCompleteFields same group with same label are forbidden', () => {
        let configObj = cloneDeep(NORMAL_CONFIG);
        configObj.inputs.services[0].entity[0].options = {
            autoCompleteFields: [{
                label: '1',
                value: '2'
            }, {
                label: '3',
                value: '4'
            }]
        };
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length === 0);

        configObj.inputs.services[0].entity[0].options = {
            autoCompleteFields: [{
                label: 'same',
                value: '1'
            }, {
                label: 'same',
                value: '2'
            }]
        };
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length > 0);

        configObj.inputs.services[0].entity[0].options = {
            autoCompleteFields: [{
                label: 'a',
                children: [
                    {
                        label: 'same',
                        value: '1'
                    }, {
                        label: '3',
                        value: '3'
                    }
                ]
            }, {
                label: 'a',
                children: [
                    {
                        label: 'same',
                        value: '2'
                    }, {
                        label: '6',
                        value: '5'
                    }
                ]
            }]
        };
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length === 0);

        configObj.inputs.services[0].entity[0].options = {
            autoCompleteFields: [{
                label: 'a',
                children: [
                    {
                        label: 'same',
                        value: '1'
                    }, {
                        label: 'same',
                        value: '3'
                    }
                ]
            }, {
                label: 'a',
                children: [
                    {
                        label: '0',
                        value: '9'
                    }, {
                        label: '6',
                        value: '5'
                    }
                ]
            }]
        };
        assert.equal(true, checkDupKeyValues(configObj.inputs, true).length > 0);
    });
});
