import Validator from '../../util/Validator';
import { getFormattedMessage } from '../../util/messageUtil';
import FILE from '../../constants/constant';

describe('Validator Class', () => {
    const testEntities = [
        {
            type: 'text',
            label: 'Name',
            validators: [
                {
                    type: 'string',
                    errorMsg: 'Length of ID should be between 1 and 50',
                    minLength: 1,
                    maxLength: 50,
                },
                {
                    type: 'regex',
                    errorMsg:
                        'Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.',
                    pattern: '^[a-zA-Z]\\w*$',
                },
            ],
            options: {
                placeholder: 'Required',
            },
            field: 'name',
            help: 'Enter a unique name for this account.',
            required: true,
        },
    ];

    const ValidatorObject = new Validator(testEntities);

    describe('FileValidator', () => {
        const field = 'file_type_field';
        const validator = {
            type: 'file',
            supportedFileTypes: ['json'],
        };

        test('Check the proper value returned when the file has correct extension, size, and content', () => {
            const data = {
                fileName: 'test.json',
                fileSize: 51200,
                fileContent: '{"test":"test json"}',
            };
            expect(ValidatorObject.FileValidator(field, validator, data)).toBe(false);
        });

        test('Check the proper error message returned for the non json files', () => {
            const data = {
                fileName: 'test.json',
                fileSize: 51200,
                fileContent: '{"test":"test json"}',
            };

            const invalidValidator = {
                type: 'file',
                supportedFileTypes: ['json', 'xml', 'pdf'],
            };

            const returnValue = {
                errorField: field,
                errorMsg: getFormattedMessage(27, 'json'),
            };

            expect(ValidatorObject.FileValidator(field, invalidValidator, data)).toStrictEqual(
                returnValue
            );
        });

        test('Check the proper error message returned for invalid file extension', () => {
            const data = {
                fileName: 'test.xml',
                fileSize: 51200,
                fileContent: '{"test":"test json"}',
            };
            const returnValue = {
                errorField: field,
                errorMsg: getFormattedMessage(24, [validator.supportedFileTypes]),
            };
            expect(ValidatorObject.FileValidator(field, validator, data)).toStrictEqual(
                returnValue
            );
        });

        test('Check the proper error message returned for invalid file size', () => {
            const data = {
                fileName: 'test.json',
                fileSize: 512010,
                fileContent: '{"test":"test json"}',
            };
            const fileSizeInKb = `${FILE.FILE_MAX_SIZE / 1024}KB`;
            const returnValue = {
                errorField: field,
                errorMsg: getFormattedMessage(25, [fileSizeInKb]),
            };
            expect(ValidatorObject.FileValidator(field, validator, data)).toStrictEqual(
                returnValue
            );
        });

        test('Check the proper error message returned for invalid file content', () => {
            const data = {
                fileName: 'test.json',
                fileSize: 51200,
                fileContent: 'abc',
            };
            const returnValue = {
                errorField: field,
                errorMsg: getFormattedMessage(26),
            };
            expect(ValidatorObject.FileValidator(field, validator, data)).toStrictEqual(
                returnValue
            );
        });
    });
});
