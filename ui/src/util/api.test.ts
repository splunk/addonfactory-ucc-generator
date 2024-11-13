import { http, HttpResponse } from 'msw';
import { generateEndPointUrl, getRequest } from './api';
import { getGlobalConfigMock } from '../mocks/globalConfigMock';
import { setUnifiedConfig } from './util';
import { server } from '../mocks/server';

describe('generateEndPointUrl', () => {
    it('should return the correct endpoint URL', () => {
        const mockConfig = getGlobalConfigMock();
        setUnifiedConfig({
            ...mockConfig,
            meta: {
                ...mockConfig.meta,
                restRoot: 'testing_name',
            },
        });
        const name = 'testing_endpoint';

        const result = generateEndPointUrl(name);

        expect(result).toMatchInlineSnapshot(`"testing_name_testing_endpoint"`);
    });
});

describe('getRequest', () => {
    beforeEach(() => {
        const mockConfig = getGlobalConfigMock();
        setUnifiedConfig({
            ...mockConfig,
            meta: {
                ...mockConfig.meta,
                restRoot: 'testing_name',
            },
        });
        server.use(http.get('*', () => HttpResponse.json({}, { status: 500 })));
    });
    it('should call callbackOnError if handleError is true', async () => {
        const callbackOnError = jest.fn();

        await expect(() =>
            getRequest({
                endpointUrl: 'testing_endpoint',
                handleError: true,
                callbackOnError,
            })
        ).rejects.toThrow();

        expect(callbackOnError).toHaveBeenCalled();
    });
    it('should not call callbackOnError if handleError is false', async () => {
        const callbackOnError = jest.fn();

        await expect(() =>
            getRequest({
                endpointUrl: 'testing_endpoint',
                handleError: false,
                callbackOnError,
            })
        ).rejects.toThrow();

        expect(callbackOnError).not.toHaveBeenCalled();
    });
});
