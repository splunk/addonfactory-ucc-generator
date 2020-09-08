Splunk.Module.StaticRadio = $.klass(Splunk.Module.AbstractStaticFormElement, {

    initialize: function($super, container) {
        $super(container);
        $('fieldset input[type="radio"]', this.container).bind('click', this.onUserAction.bind(this));
    },

    getListValue: function() {
        return $('fieldset input:checked', this.container).val();
    },
    
    /**
     * Select the selected option fool!
     */
    selectChecked: function() {
        var checked = this.getParam('checked');
        if (checked) {
            $('input',this.container).filter(function() {return $(this).val() == checked;}).prop('checked', true);
        } else if ($('fieldset input:checked', this.container).length == 0) {
            $('fieldset input:first', this.container).prop('checked', true);
        }
    },    
    
    onContextChange: function($super) {
        var context = this.getContext();
        var formValue = context.get('form.'+this.token);
        if (formValue) {
            this.setParam('checked', formValue);
            this.selectChecked();
        }        
        $super();            
    },
    
    resetUI: function() {
        this.selectChecked();
    }
    
});
