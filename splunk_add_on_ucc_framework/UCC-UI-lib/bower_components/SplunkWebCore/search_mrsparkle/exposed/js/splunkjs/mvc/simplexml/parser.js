define([
    'underscore',
    'dashboard/DashboardParser',
    'util/console'
], function(_, DashboardParser, console) {

    function LegacyDashboardParser() {
        console.warn('simplexml/parser is deprecated, use dashboard/DashboardParser instead');
        DashboardParser.apply(this, arguments);
    }

    _.extend(LegacyDashboardParser.prototype, DashboardParser.prototype);

    var defaultParserInstance;
    _.extend(LegacyDashboardParser, DashboardParser, {
        getDefault: function() {
            return defaultParserInstance || (defaultParserInstance = LegacyDashboardParser.createDefault());
        },
        createDefault: function() {
            return new LegacyDashboardParser(LegacyDashboardParser.getDefaultConfig());
        }
    });

    return DashboardParser;
});