import { parseErrorMsg } from './messageUtil';
import messageDict from '../constants/messageDict';

describe('parseErrorMsg', () => {
    it('should parse error message from error object', () => {
        const error = {
            messages: [{ text: 'Error message' }],
        };
        const result = parseErrorMsg(error);
        expect(result).toBe('Error message');
    });

    it('should return unknown message if error object is not in expected format', () => {
        const error = { response: {} };
        const result = parseErrorMsg(error);
        expect(result).toBe(messageDict.unknown);
    });

    it('should return default error message if an exception occurs', () => {
        const error = null;
        const result = parseErrorMsg(error);
        expect(result).toBe(messageDict.unknown);
    });

    it('should parse REST error with JSON message', () => {
        const error = {
            messages: [
                {
                    text: 'Unexpected error "<class \'splunktaucclib.rest_handler.error.RestError\'>" from python handler: "REST Error [404]: Not Found -- HTTP 404 Not Found -- b\'{"messages":[{"type":"ERROR","text":"Not Found"}]}\'". See splunkd.log/python.log for more details.',
                },
            ],
        };
        const result = parseErrorMsg(error);
        expect(result).toBe('Not Found');
    });

    it('should return original message if REST error message is not valid JSON', () => {
        const error = {
            messages: [
                {
                    text: 'Unexpected error "<class \'splunktaucclib.rest_handler.error.RestError\'>" from python handler: "REST Error [404]: Not Found -- HTTP 404 Not Found -- b\'Invalid JSON\'". See splunkd.log/python.log for more details.',
                },
            ],
        };
        const result = parseErrorMsg(error);
        expect(result).toBe(`b'Invalid JSON'`);
    });

    it('should return original message if REST error message does not contain expected structure', () => {
        const error = {
            messages: [
                {
                    text: `Unexpected error "<class 'splunktaucclib.rest_handler.error.RestError'>" from python handler: "REST Error [404]: Not Found -- HTTP 404 Not Found -- b'{"invalid":"structure"}'". See splunkd.log/python.log for more details.`,
                },
            ],
        };
        const result = parseErrorMsg(error);
        expect(result).toBe(`b'{"invalid":"structure"}'`);
    });
});
