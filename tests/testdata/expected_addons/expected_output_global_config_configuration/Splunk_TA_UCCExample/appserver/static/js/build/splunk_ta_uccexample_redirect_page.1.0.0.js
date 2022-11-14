(() => {
    // This method takes param name and searches it from windows url, if found returns it
    // eslint-disable-next-line consistent-return
    const getUrlParam = (param) => {
        let params = window.location.search.substring(1);
        params = params.split('&');
        for (let i = 0; i < params.length; i += 1) {
            const kv = params[i].split('=');
            if (kv[0] === param) {
                return kv[1];
            }
        }
    };
    // Check if we get any error param in url
    const error = getUrlParam('error');
    let message = {};
    // If we get error param return the error param
    if (error !== undefined) {
        message = { error };
    } else {
        // Else return the code and state param
        const code = getUrlParam('code');
        const state = getUrlParam('state');
        message = { code, state };
    }
    // Call the parent windows' getMessage method
    window.opener.getMessage(message);
    // Close the window
    window.close();
})();
