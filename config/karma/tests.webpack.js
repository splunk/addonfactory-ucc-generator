var context = require.context('../../package/appserver/static/js', true, /-test\.js$/);
context.keys().forEach(context);
