define(['jquery', 'splunk', 'util/sprintf', 'splunk.config', 'imports?$=jquery,this=>window!util'], function($, Splunk, sprintf) {
    Splunk.util.sprintf = sprintf;
    return Splunk.util;
});
