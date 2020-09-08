Splunk.Module.EntityRadioLister = $.klass(Splunk.Module.AbstractEntityLister, {

    initialize: function($super, container) {
        $super(container);
    },

    isDisabled: function() {
        return $('fieldset input', this.container).prop('disabled') || $('fieldset input', this.container).length == 0;
    },

    getListValue: function() {
        return $('fieldset input:checked', this.container).val();
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
            $('fieldset input[value=' + checked + ']', this.container).prop('checked', false);
            $('fieldset input[value=' + checked + ']', this.container).prop('checked', true);
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
        $super(html);
    }

});
