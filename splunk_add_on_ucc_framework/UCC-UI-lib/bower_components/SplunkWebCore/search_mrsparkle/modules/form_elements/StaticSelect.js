Splunk.Module.StaticSelect = $.klass(Splunk.Module.AbstractStaticFormElement, {

    initialize: function($super, container) {
        $super(container);
        $('select', this.container).bind('change', this.onUserAction.bind(this));
    },

    getListValue: function() {
        return $('select', this.container).val();
    },
    
    /**
     * Select the selected option fool!
     */
    selectSelected: function() {
        var selected = this.getParam('selected');
        if (selected) {
            $('option',this.container).filter(function() {return $(this).val() == selected;}).prop('selected', true);
        }
    },    
    
    onContextChange: function($super) {
        var context = this.getContext();
        var formValue = context.get('form.'+this.token);
        if (formValue) {
            this.setParam('selected', formValue);
            this.selectSelected();
        }
        $super();        
    },

    resetUI: function() {
        if (this.getParam('selected')) {
            this.selectSelected();
        } else {
            var select = $('select', this.container);
            select.val($('option:first', select).val());
        }
    }
    
});
