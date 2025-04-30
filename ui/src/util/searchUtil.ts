export const getSearchUrl = (searchParams?: Record<string, string>): URL => {
    const basicUrl = window.location.origin + window.location.pathname;
    const lastIndex = basicUrl.lastIndexOf('/');
    const searchUrl = new URL(`${basicUrl.slice(0, lastIndex)}/search`);

    if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value) {
                searchUrl.searchParams.append(key, value);
            }
        });
    }

    return searchUrl;
};
