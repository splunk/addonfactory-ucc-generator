define([
    'jquery',
    'underscore',
    'backbone',
    './SplunkInputBase',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/dropdownview',
    'util/general_utils',
    'util/console'
], function($, _, Backbone, InputBase, SearchManager, DropdownView, GeneralUtils, console) {

    var SplunkSearchDropdown = Object.create(InputBase);

    _.extend(SplunkSearchDropdown, {

        // hooks for testing
        
        searchManagerConstructor: SearchManager,
        dropdownViewConstructor: DropdownView,
        
        createManager: function() {
            if (!this.manager) {
                var SearchManager = this.searchManagerConstructor;
                this.manager = new SearchManager({
                    "auto_cancel": 90,
                    "status_buckets": 0,
                    "preview": false,
                    "runWhenTimeIsUndefined": false,
                    "cache": false,
                    "max_time": 60
                });
            }
            this.updateSearch();
        },

        getMaxResults: function() {
            var attrValue = $(this).attr('max-results');
            if (attrValue) {
                var val = +attrValue;
                if (!_.isNaN(val) && val % 1 === 0 && val > 0) {
                    return val;
                }
            }
            return 1000;
        },
        
        getSearchString: function(){
            var searchString = $.trim($(this).attr('search'));
            if (!searchString) {
                console.warn('No search string provided for <splunk-search-dropdown>');
                return null;
            }
            return searchString + ' | head ' + this.getMaxResults();
        },

        updateSearch: function() {
            var props = {
                search: this.getSearchString(),
                earliest_time: $(this).attr('earliest'),
                latest_time: $(this).attr('latest')
            };
            var appAttr = $(this).attr('app');
            if (appAttr) {
                props.app = appAttr;
            }
            this.manager.set(props);
        },

        renderDropDown: function() {
            this.removeView();
            var allowCustomValueAttr = $(this).attr('allow-custom-value');
            var allowCustomValue = allowCustomValueAttr === '' || GeneralUtils.normalizeBoolean(allowCustomValueAttr, {'default': false});
            var labelField = $(this).attr('label-field');
            if (!labelField) {
                console.warn('No label-field specified for <splunk-search-dropdown>');
                return;
            }
            var valueField = $(this).attr('value-field');
            if (!valueField) {
                console.warn('No value-field specified for <splunk-search-dropdown>');
                return;
            }
            var DropdownView = this.dropdownViewConstructor;
            this.view = new DropdownView({
                el: $('<div></div>').appendTo(this),
                managerid: this.manager.id,
                value: this.model.get('value'),
                labelField: labelField,
                valueField: valueField,
                width: null,
                allowCustomValues: allowCustomValue,
                minimumResultsForSearch: 1
            });

            this.view.settings.on('change:value', function(view, value) {
                this.model.set('value', value || '');
            }.bind(this));

            this.view.render();
        },

        removeView: function() {
            if (this.view) {
                this.view.remove();
            }
        },

        removeManager: function() {
            if (this.manager) {
                this.manager.dispose();
                this.manager = null;
            }
        },

        attachedCallback: function() {
            InputBase.attachedCallback.apply(this, arguments);
            this._attached = true;
            this.createManager();
            this.renderDropDown();
        },

        detachedCallback: function() {
            InputBase.detachedCallback.apply(this, arguments);
            this._attached = false;
            this.removeView();
            this.removeManager();
        },

        attributeChangedCallback: function() {
            InputBase.attributeChangedCallback.apply(this, arguments);
            if (this._attached) {
                this.createManager();
                this.renderDropDown();
            }
        }

    });

    return document.registerElement('splunk-search-dropdown', {prototype: SplunkSearchDropdown});
});