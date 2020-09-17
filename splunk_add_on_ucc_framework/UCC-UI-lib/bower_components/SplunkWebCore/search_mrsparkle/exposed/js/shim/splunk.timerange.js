define([
       'splunk',
       'splunk.util',
       'splunk.logger',
       'splunk.i18n',
       'splunk.time',
       'lowpro',
       'time_range'],
       function(Splunk) {
    Splunk.namespace("Globals");
    if (!Splunk.Globals.timeZone) {
        Splunk.Globals.timeZone = new Splunk.TimeZone(Splunk.util.getConfigValue('SERVER_ZONEINFO'));
    }
    return Splunk.TimeRange;
});
