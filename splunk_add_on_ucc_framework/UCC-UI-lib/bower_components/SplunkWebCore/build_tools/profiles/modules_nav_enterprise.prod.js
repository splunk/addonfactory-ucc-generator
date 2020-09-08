var ProgressPlugin = require('webpack/lib/ProgressPlugin');

/**
 * The splunk.components should not be minified. It will be minified at run time
 * and breaks when minified ahead of time.
 * @type {Object}
 */
 module.exports = {
     plugins: [
         // Prints progress of the build to the console
         new ProgressPlugin(function(progress, msg) {
             process.stdout.write('\r                                                      ');
             if (progress !== 1) {
                 process.stdout.write('\rProgress: ' + Math.round(progress * 100) + '% ' + msg);
             }
         })
     ]
 };
