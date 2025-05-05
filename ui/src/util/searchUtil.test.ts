import { getSearchUrl } from './searchUtil';

describe('getSearchUrl', () => {
    it('should return the correct URL when no searchParams are provided', () => {
        const result = getSearchUrl();
        const expectedUrl = `${window.location.origin}${window.location.pathname.slice(
            0,
            window.location.pathname.lastIndexOf('/')
        )}/search`;
        expect(result.toString()).toBe(expectedUrl);
    });

    it('should append search parameters to the URL when searchParams are provided', () => {
        const searchParams = { key1: 'value1', key2: 'value2' };
        const result = getSearchUrl(searchParams);
        const expectedUrl = `${window.location.origin}/search?key1=value1&key2=value2`;
        expect(result.toString()).toBe(expectedUrl);
    });

    it('should handle special characters in search parameters', () => {
        const searchParams = { key1: 'value with spaces', key2: 'value&with&special=chars' };
        const locationSpy = jest.spyOn(window, 'location', 'get');
        locationSpy.mockImplementation(
            () =>
                ({
                    origin: 'https://example.com',
                    pathname: '/path/to/curr ent/page',
                } as Location)
        );
        const result = getSearchUrl(searchParams);
        const expectedUrl = `https://example.com/path/to/curr%20ent/search?key1=value+with+spaces&key2=value%26with%26special%3Dchars`;
        expect(result.toString()).toBe(expectedUrl);
        locationSpy.mockRestore();
    });
});
