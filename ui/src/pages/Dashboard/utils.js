export const waitForElementToDisplay = (
    selector,
    selector2,
    callback,
    checkFrequencyInMs,
    timeoutInMs
) => {
    const startTimeInMs = Date.now();
    const loopSearch = () => {
        if (document.querySelector(selector) && document.querySelector(selector2)) {
            callback();
        } else {
            setTimeout(() => {
                if (Date.now() - startTimeInMs > timeoutInMs) return;
                loopSearch();
            }, checkFrequencyInMs);
        }
    };
    loopSearch();
};