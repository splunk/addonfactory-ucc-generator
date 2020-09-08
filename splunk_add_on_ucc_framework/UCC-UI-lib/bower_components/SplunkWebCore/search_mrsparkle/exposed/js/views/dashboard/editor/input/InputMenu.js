define(
    [
        'module',
        'jquery',
        'underscore',
        'splunkjs/mvc',
        'splunkjs/mvc/simpleform/edit/editinputmenu',
        'splunkjs/mvc/searchmanager',
        'splunkjs/mvc/savedsearchmanager',
        'splunkjs/mvc/utils'
    ],
    function(module,
             $,
             _,
             mvc,
             EditInputMenuView,
             SearchManager,
             SavedSearchManager,
             utils) {

        return EditInputMenuView.extend({

            moduleId: module.id,
            initialize: function(options) {
                this.inputSettings = options.inputSettings;
                EditInputMenuView.prototype.initialize.apply(this, arguments);
            },
            applyChanges: function() {
                this.workingSettings.validate();
                if (this.workingSettings.isValid()) {
                    var prev = this.model.toJSON({tokens: true});
                    var newAttributes = this.workingSettings.toJSON({tokens: true});
                    // manually syncup the search attribute from editor
                    this.model.set(newAttributes, {tokens: true});
                    this.inputSettings && this.inputSettings.set(_.pick(newAttributes, 'search'), {
                        silent: true,
                        tokens: true
                    });
                    this.hide();
                    this.updateSearchManager(prev);
                    this.trigger('apply');
                }
            },
            updateSearchManager: function(previous) {
                var type = this.model.get('searchType');
                if ((!type || type === 'inline' || type === 'postprocess') && (this.model.get('search', {tokens: true}) != null)) {
                    var managerId = previous['managerid'];
                    var manager = mvc.Components.get(managerId);
                    if (manager && !(manager instanceof SavedSearchManager)) {
                        this.updateInlineSearchManager(manager);
                    } else {
                        // Ensure we have a managerid
                        this.model.set('managerid', this.model.get('managerid') || _.uniqueId('populating_search_'));
                        if (previous['search'] != this.model.get('search', {tokens: true})
                            || previous['populating_earliest_time'] != this.model.get('populating_earliest_time', {tokens: true})
                            || previous['populating_latest_time'] != this.model.get('populating_latest_time', {tokens: true})) {
                            this.createInlineSearchManager();
                        }
                    }
                } else if (type === 'saved' && this.model.get('searchName')) {
                    this.model.set('managerid', this.model.get('managerid') || _.uniqueId('populating_saved_search_'));
                    if (previous['searchName'] != this.model.get('searchName')) {
                        this.createSavedSearchManager();
                    }
                }
            },
            updateInlineSearchManager: function(manager) {
                manager.settings.set({
                    "latest_time": this.model.get('populating_latest_time', {tokens: true}),
                    "earliest_time": this.model.get('populating_earliest_time', {tokens: true}),
                    "search": this.model.get('search', {tokens: true})
                }, {tokens: true});
            },
            createInlineSearchManager: function() {
                new SearchManager({
                    "id": this.model.get('managerid'),
                    "latest_time": this.model.get('populating_latest_time', {tokens: true}),
                    "earliest_time": this.model.get('populating_earliest_time', {tokens: true}),
                    "search": this.model.get('search', {tokens: true}),
                    "app": utils.getCurrentApp(),
                    "auto_cancel": 90,
                    "status_buckets": 0,
                    "preview": true,
                    "timeFormat": "%s.%Q",
                    "wait": 0
                }, {replace: true, tokens: true});
            },
            createSavedSearchManager: function() {
                new SavedSearchManager({
                    "id": this.model.get('managerid'),
                    "searchname": this.model.get("searchName"),
                    "app": utils.getCurrentApp(),
                    "auto_cancel": 90,
                    "status_buckets": 0,
                    "preview": true,
                    "timeFormat": "%s.%Q",
                    "wait": 0
                }, {replace: true, tokens: true});
            }
        });
    });