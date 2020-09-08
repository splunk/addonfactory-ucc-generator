//delay karma start
window.__karma__.loaded = function () {
};

//because the initial compilation can take minutes, we need to keep Karma's connection intact,
// otherwise browserNoActivityTimeout will be exceeded.
var scriptKeepAlive = setInterval(function () {
    window.__karma__.info({type: 'debug'}); //send a fake/empty logging event (somewhat hacky, doesn't log anything)
}, 4000);

//load the commons chunk - contains the webpack runtime and the test bootstrap module (see test-bootstrap.es)
var commonsChunkScript = document.createElement('script');
commonsChunkScript.setAttribute('src', '/webpack/test-common-bundle.js');
commonsChunkScript.onload = function () {
    clearInterval(scriptKeepAlive);
};
document.body.appendChild(commonsChunkScript);
