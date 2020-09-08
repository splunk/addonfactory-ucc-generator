
Splunk.Module.SuggestedFieldViewer = $.klass(Splunk.Module.MultiFieldViewer, {
    
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement  = Splunk.Module.NEVER_ALLOW;
        
        this.logger = Splunk.Logger.getLogger("SuggestedFieldViewer.js");
        this._fieldHeaderText = _("%s interesting fields");
        
        this.exclusionRegexes = [];
        for (var i=0, len=this._params["exclude"].length; i<len; i++) {
            var regEx = new RegExp(this._params["exclude"][i]);
            this.exclusionRegexes.push(regEx);
        }
    },

    getResultParams: function($super) {
        var params = $super();
        // (currently defaults in conf file to 0.2)
        params["min_freq"] = this._params["minFrequency"];
        
        if (params.hasOwnProperty("field_list")) {
            delete params["field_list"];
        }
        return params;
    },

    /**
     * MultiFieldViewer breaks this out as a method, basically so subclasses
     * can override it and provide some different view of the fields. 
     * In this case, we have overridden getResultParams to NOT pass 
     * "fields".  And then here we filter out based on our criteria.
     */
    getMatchingFields: function(fieldNodes) {
        var context = this.getContext();
        var selectedFields = context.get("results.fields");
        var moduleInstance = this;
        var matchingFields = [];

        var minDistinctCount= this._params["minDistinctCount"];

        $.each(fieldNodes, function(index) {
            var fieldElt  = $(this);
            var fieldName = fieldElt.attr("k");
            // we *DONT* want selected fields.  The point of this module is to suggest 
            // unselected fields.
            if (selectedFields && selectedFields.indexOf(fieldName) !=-1) return true;
            
            // go through our exclusion regexes.
            for (var i=0, len=moduleInstance.exclusionRegexes.length; i<len; i++) {
                if (fieldName.match(moduleInstance.exclusionRegexes[i])) return true;
            }

            //var isExact         = Splunk.util.normalizeBoolean(fieldElt.attr("exact"));
            //var isNumeric       = fieldElt.find("mean").length > 0;

            // check against the minimum distinctCount as specified in the view config.
            var distinctCount   = fieldElt.attr("dc");
            if (distinctCount >= minDistinctCount) {
                matchingFields.push(fieldElt);
            } 
        });
        // truncate down to maxFields;
        if (matchingFields.length > this._params["maxFields"]) {
            matchingFields = matchingFields.splice(0, this._params["maxFields"]);
        }
        return matchingFields;
    },

    getCustomLinks: function($super, fieldName, count, distinctCount, isExact, isNumeric) {
        var customLinks = $super(fieldName, count, distinctCount, isExact, isNumeric);
        customLinks.push($('<a href="#"></a>')
                .text(_("Select and show in results"))
                .click(this.addToSelected.bind(this)));
        return customLinks;
    },

    addToSelected: function() {
        var context = this.getContext();
        var fieldList = context.get("results.fields");
        // suppress duplicates
        if ($.inArray(this.fieldSummaryLayer.fieldName, fieldList) > -1) {
            return false;
        }
        fieldList.push(this.fieldSummaryLayer.fieldName);
        var intention = {"name": "setfields", "arg": fieldList};
        var fieldsContext = new Splunk.Context();
        var fieldsSearch = new Splunk.Search();
        fieldsSearch.addIntention(intention);
        fieldsContext.set("search", fieldsSearch);
        this.passContextToParent(fieldsContext);
        return false;
    },

    updateHeader: function($super, fieldCount, isNumeric) {
        $super(fieldCount, isNumeric);
        if (fieldCount == 0) this.container.hide();
        else this.container.show();
    },

    renderResults: function($super, xmlDoc) {
        $super(xmlDoc);
        // out with the old
        $(".allFieldsLink", this.container).remove();
        var fieldPicker = $(".FieldPicker");
        var search = this.getContext().get("search");
        var fieldPickerCount = search.job.getEventFieldCount();
        if (fieldPicker && fieldPickerCount) {
            // in with the new.
            var allFieldsLink = $("<a>")
                .addClass("allFieldsLink")
                .attr("href", "#")
                .click(function(evt) {
                    $("a.fpActivate", fieldPicker).click();
                    return false;
                })
                .text(sprintf(ungettext("Only %(totalFieldCount)s field available", "View all %(totalFieldCount)s fields", fieldPickerCount), {totalFieldCount: fieldPickerCount}));
            this.container.append(allFieldsLink);
        }
    },

    resetUI: function($super) {
        $super();
        $(".allFieldsLink", this.container).remove();
    }
});
