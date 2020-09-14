Splunk.Module.SearchRadioLister = $.klass(Splunk.Module.AbstractSearchLister, {

    initialize: function($super, container) {
        $super(container);
    },

    isDisabled: function() {
        return $('fieldset input', this.container).prop('disabled') || $('fieldset input', this.container).length == 0;
    },

    getListValue: function() {
        return $('fieldset input:checked', this.container).val();
    },

    getTokenValues: function() {
        var checked = $('fieldset input:checked', this.container);
        return {
            'value': checked.val(),
            'key': checked.attr('key'),
            'label': $('fieldset input:checked + label', this.container).text()
        };
    },

    getResultParams: function($super) {
        var params = $super();
        params['name'] = this.getParam('name');
        return params;
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

    renderResults: function($super, html) {
        $('fieldset input', this.container).remove();
        $('fieldset span', this.container).remove();
        $('fieldset', this.container).append(html);
        this.selectChecked();
        $('fieldset input[type="radio"]', this.container).bind('click', this.onUserAction.bind(this));
        $('fieldset input[type="radio"]', this.container).addClass('radio');
        $super(html);
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
