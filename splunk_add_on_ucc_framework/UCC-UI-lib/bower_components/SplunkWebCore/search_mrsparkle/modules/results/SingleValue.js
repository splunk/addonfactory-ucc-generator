
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

// Simple module to pull a single value out of a result set and display it
Splunk.Module.SingleValue = $.klass(Splunk.Module.DispatchingModule, {
    initialize: function($super, container) {
        $super(container);

        this._before_label = this._params['beforeLabel'];
        this._after_label = this._params['afterLabel'];
        this._under_label = this._params['underLabel'];
        this._link_search = this._params['linkSearch'];
        this._target_view = this._params['linkView'];
        this._link_fields  = this._params['linkFields'] && this._params['linkFields'].split(/\s*,\s*/);
        this._result_element = $('.singleResult', container);
        this.entity_name = 'results';
        if (this._params['additionalClass']) {
            $('.SingleValueHolder', container).addClass(this._params['additionalClass']);
        }
        this._classField = this._params['classField'];
        this._originalClass = $('.SingleValueHolder', container).attr('class');

        this.logger = Splunk.Logger.getLogger("SingleValue.js");
        if (this._link_search) {
            for(var i=0; i<this._link_fields.length; i++) {
                switch(this._link_fields[i].toLowerCase()) {
                    case 'result':
                        this._linkElement(this._result_element);
                        break;
                    case 'beforelabel':
                        this._linkElement($('.singleLabelBefore', this.container));
                        break;
                    case 'underlabel':
                        this._linkElement($('.singleLabelUnder', this.container));
                        break;
                    case 'afterlabel':
                        this._linkElement($('.singleLabelAfter', this.container));
                        break;
                    default:
                        break;
                }
            }
        }
    },

    onContextChange: function(evt) {
        this.getResults();
    },

    onJobProgress: function(evt) {
        this.getResults();
    },

    onJobDone: function(evt) {
        this.logger.debug('SINGLEVALUE - onjobdone');
        this.getResults();
    },

    getResultParams: function($super) {
        var params = $super();
        var context = this.getContext();
        var search  = context.get("search");
        var sid     = search.job.getSearchId();
        if (!sid) {
            this.logger.error(this.moduleType, "Assertion Failed. getResultParams was called, but searchId is missing from my job.");
        }
        params.sid = sid;
        params.field = this._params['field'];
        params.entity_name = this.entity_name;
        params.classField = this._classField;
        if (this.getParam('format')) {
            params.format = this.getParam('format');
        }
        var postprocess = search.getPostProcess();
        if (postprocess)
            params.postprocess = postprocess;

        return params;
    },

    renderResults: function($super, result) {

        // hacky way to return two values in string for now.  replace with json.
        // split result into result and fieldclass to add as formatting class
        var parts = result.split("//!-!//");
        result = parts[0];
        if (parts.length > 1) {
            var fieldClass = parts[1];
            $('.SingleValueHolder', this.container).attr('class', this._originalClass);
            $('.SingleValueHolder', this.container).addClass(fieldClass);
        }
        $(this._result_element).text(result);

        if (this._before_label) {
            $('.singleLabelBefore', this.container).html(this._before_label);
        } else {
            $('.singleLabelBefore', this.container).remove();
        }

        if (this._under_label) {
            $('.singleLabelUnder', this.container).html(this._under_label);
        } else {
            $('.singleLabelUnder', this.container).remove();
        }

        if (this._after_label) {
            $('.singleLabelAfter', this.container).html(this._after_label);
        } else {
            $('.singleLabelAfter', this.container).remove();
        }

    },

    _linkElement: function(el) {
        link_target=$('<a href="#"></a>');
        $(el).wrap(link_target).parent().click(this._handleClick.bind(this));
    },

    _handleClick: function(e) {
        var context = this.getContext();
        var search  = context.get("search");
        search.abandonJob();
        search.setBaseSearch(this._link_search);
        search.sendToView(this._target_view);
        e.preventDefault();
        return false;
    }
});
