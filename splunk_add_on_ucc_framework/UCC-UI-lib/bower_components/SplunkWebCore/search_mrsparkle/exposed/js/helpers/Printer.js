define([
            'jquery',
            'backbone',
            'splunk.print',
            'global/GlobalReflowQueue'
        ],
        function(
            $,
            Backbone,
            SplunkPrint,
            GlobalReflowQueue
        ) {

    var Printer = $.extend({}, Backbone.Events, {

        PRINT_START: SplunkPrint.prototype.START_EVENT,
        PRINT_END: SplunkPrint.prototype.END_EVENT,

        printPage: function() {
            $(document).trigger(SplunkPrint.prototype.PAGE_EVENT);
        },

        // make sure the legacy print handler is initialized as soon as the DOM is ready.
        // also bind our own DOM listeners
        onDomReady: function() {
            var legacyPrinter = SplunkPrint.getInstance();

            $(document).on(SplunkPrint.prototype.START_EVENT, function() {
                Printer.trigger(Printer.PRINT_START);
                GlobalReflowQueue.validateViews();
            });
            $(document).on(SplunkPrint.prototype.END_EVENT, function() {
                Printer.trigger(Printer.PRINT_END);
                GlobalReflowQueue.validateViews();
            });
        }

    });

    $(function() { Printer.onDomReady(); });

    return Printer;

});