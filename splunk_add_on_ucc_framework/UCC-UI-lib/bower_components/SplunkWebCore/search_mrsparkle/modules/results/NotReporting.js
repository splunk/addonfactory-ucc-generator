Splunk.Module.NotReporting = $.klass(Splunk.Module, {
    initialize: function($super, container){
        $super(container);
        $(".ButtonSwitcher").click(function() {
            var sel = $('.resultsOptionsActivator');
            var csel = $('.SplunkModule.Count');
            if (!$(".results-table-help").is(":visible")) {
                sel.removeClass("splIconicLinkDisabled");
                csel.show();
            } else {
                sel.addClass("splIconicLinkDisabled");
                csel.hide();
            }
        });
        $(".results-table-help li > a").click(function() {
        	$("li.create-report > a").click();
        	return false;
        });
    }
});
