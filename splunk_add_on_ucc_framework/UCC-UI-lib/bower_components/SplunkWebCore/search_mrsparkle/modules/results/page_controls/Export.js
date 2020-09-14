
Splunk.Module.Export = $.klass(Splunk.Module.DispatchingModule, {

    initialize: function($super, container){
        $super(container);
        this.logger = Splunk.Logger.getLogger("Splunk.Module.Export");
        var exportBtn = $("a", this.container);
        exportBtn.bind("click.export", function(){return false;});
    },
    onContextChange: function(){
        this.updateExportLink();
        return;
    },
    onJobDone: function(event){
        this.updateExportLink();
        return;
    },
    updateExportLink : function(){
        var type = this.getParam('exportType');
        var context = this.getContext();
        var search = context.get("search");
        var jobCanExport = ((!search.job.isRealTimeSearch() && type == "event") || search.job.isDone());
        var exportBtn = $("a", this.container);
        
        if (jobCanExport) {
            context = this.getContext();
            var formContainer = $('.exportPopupContainer')[0];
            exportBtn = $("a", this.container);
            
            exportBtn.unbind('click.export');
            exportBtn.bind('click.export', function(){            
                var search = context.get("search");
                if(typeof search == 'undefined' || typeof search == 'undefined' || search.job == 'undefined' || !search.job){
                    return;
                }
                Splunk.Popup.createExportResultsForm(formContainer, search.job, type);
                return false;
            });
        
            exportBtn.removeClass('splIconicLinkDisabled');
        } else {
	    this.resetUI();
	}
    },
    resetUI: function() {
        var exportBtn = $("a", this.container);
        exportBtn.addClass('splIconicLinkDisabled');
        exportBtn.unbind('click.export');
        exportBtn.bind('click.export', function(){return false;});
    },
    onJobProgress: function(event){
        this.updateExportLink();
    }
});