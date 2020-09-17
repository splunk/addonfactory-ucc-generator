
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.ReportSubType = $.klass(Splunk.Module.BaseReportBuilderField, {
    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("mode_chooser.js");
    },
    getPlotIntentionArg: function() {
        var selectedOption = $("select option:selected",this.container);
        var plotArgs = {};
        this.lazyAdd(this._selectElement.val(),"splitType", plotArgs);
        return plotArgs;
    },
    absorbPlotIntentionArg: function(intentionArg) {
        if (!intentionArg.hasOwnProperty("splitType")) {
            this.logger.error(this.moduleType + "can not resurrect without the plotIntention's splitType. splitby=" + intentionArg["splitby"]);
        }
        if (intentionArg["splitType"] == "multiple") {
            this.puntToAdvancedMode(_("Report Builder cannot load searches with multiple split-by clauses back into basic mode yet."));
        }
        else if (this._selectElement.val(intentionArg["splitType"])) {
            delete intentionArg["splitType"];
            return true;
        } else {
            this.logger.error(this.moduleType, "unable to resurrect splitType=", intentionArg["splitType"]);
        }
        return false;

    },
    isCompatibleWithIntention: function(plotIntention) {
        if (!plotIntention) {
            return false;
        }
        var relevantModes = {"timechart":1, "chart":1};
        if (!plotIntention["arg"].hasOwnProperty("mode") || !(plotIntention["arg"]["mode"] in relevantModes)) {
            return false;
        }
        return true;
    }
});
