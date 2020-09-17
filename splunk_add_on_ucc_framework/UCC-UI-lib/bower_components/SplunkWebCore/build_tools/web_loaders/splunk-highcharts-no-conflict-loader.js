/**
 * A webpack loader that loads the Highcharts library in no-conflict mode, ensuring that it
 * has no effect on the global scope.  If there is an existing version of Highcharts on the
 * global scope, it will be temporarily removed so that Splunk's Highcharts can load without error.
 */

module.exports = function highchartsNoConflictLoader(content) {
    var intro = '' + 
        'var previousHighcharts = window.Highcharts;' +
        'window.Highcharts = null;';
    var outro = '' +
        'module.exports = window.Highcharts;' +
        'window.Highcharts = previousHighcharts;';
    
    return intro + content + outro; 
};