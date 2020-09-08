
Splunk.Module.EntitySelectLister = $.klass(Splunk.Module.AbstractEntityLister, {

    initialize: function($super, container) {
        $super(container);

        var self = this;
        $('select', this.container).bind('change', function(event) {
            self.onUserAction(event);
            self.setParam('selected', self.getListValue(), true);
	    });
    },

    isDisabled: function() {
        return $('select', this.container).prop('disabled');
    },

    getListValue: function() {
        return $('select', this.container).val();
    },

    /**
     * Select the selected option fool! If selectUsingValue is true, then use the value to select.
     * Otherwise, see if the option text contains the selected value.
     */
    selectSelected: function() {
        this.useDelay = false;
        var selected = this.getParam('selected');

        if (selected) {
            var selectUsingValue = Splunk.util.normalizeBoolean(this.getParam('selectUsingValue'));

            if (selected == "{app}") selected = Splunk.ViewConfig.app.id;
            if (selected == "{user}") selected = window.$C['USERNAME'];
            
            var labelBased;

            if (!selectUsingValue)
                labelBased = $('select > option:contains("' + selected + '")', this.container);
            else
                labelBased = $('select > option[value="' + Splunk.util.escapeSelector(selected) + '"]', this.container);
            if (labelBased.length > 0) {
                try {
                    labelBased.prop('selected', true);
                    this.useDelay = false;
                //Fix for IE6
                //using native javascript to select an option from the select dropdown
                } catch(e) {
                    labelBased.get(0).setAttribute('selected', 'selected');
                    this.useDelay = true;
                }
                return;
            }
        }
    },

    renderResults: function($super, html) {
        $('select', this.container).empty();
        $('select', this.container).append(html);
        this.selectSelected();
        $('select', this.container).prop('disabled', false);
        //Fix for IE6
        //using setTimeout to fix AJAX call delay issues
        if (this.useDelay)
            setTimeout(function(){$super(html);},0);
        else
            $super(html);
    }

});
