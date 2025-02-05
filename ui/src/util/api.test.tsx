import { delay, http, HttpResponse } from 'msw';
import { generateEndPointUrl, getRequest } from './api';
import { getGlobalConfigMock } from '../mocks/globalConfigMock';
import { setUnifiedConfig } from './util';
import { server } from '../mocks/server';

const mockGenerateToastFn = jest.fn();
jest.mock('./util', () => ({
    ...jest.requireActual('./util'),
    generateToast: () => mockGenerateToastFn(),
}));

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
    function setup() {
        const mockConfig = getGlobalConfigMock();
        setUnifiedConfig({
            ...mockConfig,
            meta: {
                ...mockConfig.meta,
                restRoot: 'testing_name',
            },
        });
    }

    it('should call callbackOnError if handleError is true', async () => {
        setup();
        server.use(http.get('*', () => HttpResponse.json({}, { status: 500 })));

        const callbackOnError = jest.fn();

        await expect(() =>
            getRequest({
                endpointUrl: 'testing_endpoint',
                handleError: true,
                callbackOnError,
            })
        ).rejects.toThrow();

        expect(mockGenerateToastFn).toHaveBeenCalledTimes(1);
        expect(callbackOnError).toHaveBeenCalled();
    });
    it('should not call callbackOnError if handleError is false', async () => {
        setup();
        server.use(http.get('*', () => HttpResponse.json({}, { status: 500 })));
        const callbackOnError = jest.fn();

        await expect(() =>
            getRequest({
                endpointUrl: 'testing_endpoint',
                handleError: false,
                callbackOnError,
            })
        ).rejects.toThrow();

        expect(mockGenerateToastFn).not.toHaveBeenCalled();
        expect(callbackOnError).not.toHaveBeenCalled();
    });

    it('should not show error if request is cancelled', async () => {
        setup();
        server.use(
            http.get('*', async () => {
                await delay('infinite');

                return HttpResponse.json();
            })
        );
        const abortController = new AbortController();

        const request = getRequest({
            endpointUrl: 'testing_endpoint',
            handleError: true,
            signal: abortController.signal,
        });

        abortController.abort();

        await expect(request).rejects.toThrow();
        expect(mockGenerateToastFn).not.toHaveBeenCalled();
    });
});
