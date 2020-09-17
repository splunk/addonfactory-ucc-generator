define(
    [
        'underscore',
        'module',
        'models/Base',
        'views/Base',
        'views/shared/controls/SyntheticSelectControl'
    ],
    function(
        _,
        module,
        BaseModel,
        BaseView,
        SyntheticSelectControl
    ) {
        /**
         * @param Object options {
         *      model: <Backbone.Model>,
         *      collection: <Collection>,
         *      deferreds: <Deferreds>,
         *      addNewSourcetypeLink: <Boolean>,
         *      addLabel: <Boolean>,
         *      searchPulldownOnly: <Boolean> - if true, the filter will only search sourcetypes with pulldown_type=1
         *      attachToModal: <Boolean> - if true, attaches the popdown to the Modal instead of body
         * }
         */
        return BaseView.extend({
            moduleId: module.id,
            className: 'sourcetypeMenu',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                // models
                this.stateModel = new BaseModel();
                this.rawSearch = new BaseModel();
                // flag to keep drop down open when entering a search
                this.alreadyShown = false;

                var popdownOptions = {
                    attachDialogTo: 'body',
                    ignoreClasses: ['input-container',
                        'shared-tablecaption-input',
                        'search-query'],
                    ignoreEscape: true
                };
                if (this.options.attachToModal) {
                    popdownOptions.attachDialogTo = '.modal:visible';
                    popdownOptions.scrollContainer = '.modal:visible .modal-body:visible';
                }

                var opts = {
                    label: this.options.addLabel ? _('Source type: ').t() : '',  //IB
                    defaultValue: 'default',
                    toggleClassName: 'btn',
                    menuClassName: 'dropdown-menu-sourcetype',
                    items: this.buildCategoryItems(),
                    prompt: _('Select Source Type').t(),
                    popdownOptions: popdownOptions,
                    maxLabelLength: 50,
                    stateModel: this.stateModel,
                    rawSearch: this.rawSearch
                };
                if(this.model.sourcetypeModel){
                    opts.model = this.model.sourcetypeModel.entry;
                    opts.modelAttribute = 'name';
                } else if (this.model && this.options.modelAttribute) {
                    opts.model = this.model;
                    opts.modelAttribute = this.options.modelAttribute;
                }
                this.children.sourcetypes = new SyntheticSelectControl(opts);

                // This override is a hack that makes sourcetypes outside the 'pulldown_type=1' collection to be displayed
                //  on the SourcetypeMenu's label. By default, only items in the dropdown will be shown and others ignored.
                this.children.sourcetypes.findItem = function(val) {
                    if (val === '__auto__learned__') {
                        return;
                    }
                    return {value: val};
                };

                this.collection.sourcetypesCollection.on('sync', function() {
                    this.setItems();
                }, this);

                this.stateModel.on('change:search', _.debounce(function() {
                    this.alreadyShown = true;
                    var sourcetypes = this.collection.sourcetypesCollection,
                        search = this.stateModel.get('search') || '';

                    if (this.options.searchPulldownOnly) {
                        if (search) {
                            search += ' AND ';
                        }
                        search += 'pulldown_type=1';
                    }

                    sourcetypes.safeFetch({
                        data: {
                            search: search,
                            count: 1000
                        },
                        success: function() {
                        }.bind(this)
                    });
                }.bind(this), 250), this);
            },
            
            setItems: function() {
                var rawSearch = this.rawSearch.get('rawSearch');
                if (rawSearch && rawSearch !== '') {
                    this.children.sourcetypes.setItems(this.buildSearchItems(), {alreadyShown: this.alreadyShown});
                } else {
                    this.children.sourcetypes.setItems(this.buildCategoryItems(), {alreadyShown: this.alreadyShown});
                }
            },
            
            buildCategoryItems: function(){
                var items = [],
                    staticItems = [],
                    dynamicItems = [],
                    categoryToIndex = {};

                if (this.options.addNewSourcetypeLink) { //IB
                    staticItems.push({
                        value: _('default').t(),
                        label: _('Default Settings').t(),
                        description: _('Splunk\'s default source type settings').t()
                    });
                }

                this.collection.sourcetypesCollection.each(function(sourcetype){
                    var name = sourcetype.entry.get('name'),
                        category = sourcetype.entry.content.get('category') || _('Uncategorized').t(),
                        description = sourcetype.entry.content.get('description') || '',
                        item;

                    // item must have a name value to be considered
                    if (!name) {
                        return;
                    }

                    //Add client side manufactured sourcetype to static items
                    if(name === '__auto__learned__'){
                        staticItems.push({
                            value: name,
                            label: _('Recommended Settings').t(),
                            description: _('Splunk\'s suggested settings based on source file').t()
                        });
                        return;
                    }

                    item = {
                        value: _(name).t(),
                        category: _(category).t(),
                        description: _(description).t()
                    };

                    if (category in categoryToIndex) {
                        // append item to corresponding category
                        dynamicItems[categoryToIndex[category]].children.push(item);
                    } else {
                        // add new category, and append item to it
                        dynamicItems.push({value:  _(category).t(), children: []});
                        categoryToIndex[category] = dynamicItems.length-1;
                        dynamicItems[dynamicItems.length-1].children.push(item);
                    }
                });

                // Sort categories
                dynamicItems.sort(function(a,b) {
                    return a.value.localeCompare(b.value);
                });

                items = staticItems.length > 0 ? [staticItems, dynamicItems] : [dynamicItems];
                return items;
            },
            
            buildSearchItems: function(){
                var items = [];

                this.collection.sourcetypesCollection.each(function(sourcetype){
                    var name = sourcetype.entry.get('name'),
                        description = sourcetype.entry.content.get('description') || '';

                    // item must have a name value to be considered
                    if (!name || (name === '__auto__learned__')) {
                        return;
                    }

                    items.push({
                        value: name,
                        description: description
                    });
                });

                if (items.length === 0) {
                    items.push({label: _('No Results').t()});
                }

                return items;
            },
            
            render: function() {
                if (this.children.sourcetypes) {
                    this.children.sourcetypes.detach();
                }
                this.$el.append(this.children.sourcetypes.render().$el);
                
                if (this.alreadyShown) {
                    this.children.sourcetypes.children.popdown.show();
                }                
                return this;
            }
        });
    }
);