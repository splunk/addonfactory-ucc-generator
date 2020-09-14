/**
 * Builds a searchable dropdown menu
 * @author: nmistry
 * @date: 11/4/16
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/delegates/Popdown',
    'views/shared/controls/TextControl',
    'splunk.util',
    'util/string_utils',
    'views/Base',
    './Master.pcss'
], function (
    $,
    _,
    Backbone,
    module,
    Popdown,
    InputView,
    splunkUtil,
    stringUtil,
    BaseView
) {

    /****************** START OF BASE INTERFACE ***************************/

    /**
     * Interface class. Subclass should implement
     *  + getLabel
     *  + getMenu
     */
    var defaultOptions = {
        toggleClassName: 'btn',
        menuClassName: '',
        rerenderMenuOnShow: true,
        popdownOptions: {}
    };
    var toggleClass = 'dropdown-toggle';
    var labelClass = 'dropdown-label-container';
    var menuClass = 'dropdown-menu-container';
    var DropdownView = BaseView.extend({
        moduleId: module.id,
        className: 'control btn-group',

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);

            var popdownIgnoreClasses = ['ignore-clicks'];
            this.options = $.extend(true, {}, defaultOptions, this.options);
            this.options.popdownOptions.el = this.el;
            _.isArray(this.options.popdownOptions.ignoreClasses) ?
                this.options.popdownOptions.ignoreClasses = this.options.popdownOptions.ignoreClasses.concat(popdownIgnoreClasses):
                this.options.popdownOptions.ignoreClasses = popdownIgnoreClasses;

            this.children.popdown = new Popdown(this.options.popdownOptions);
            if (this.options.rerenderMenuOnShow) {
                this.listenTo(this.children.popdown, 'show', this.renderMenu);
            }
            this.popdownDialogEvents = {};
        },

        // INTERFACES
        /**
         * returns html to be displayed within label
         */
        getLabelHTML: function () {},

        /**
         * returns html to be displayed within the menu
         */
        getMenuHTML: function () {},
        // END OF INTERFACE

        /**
         * Renders the label and adds it to the template.
         * Implement getLabelHTML to customize what gets displayed
         *
         */
        renderLabel: function () {
            this.$('.'+labelClass).html(this.getLabelHTML());
            this.delegateEvents();
        },

        /**
         * Renders the menu html and adds it to the template
         * Implement getMenuHTML to customize what gets displayed
         *
         */
        renderMenu: function () {
            var popdownDialogEl = this.children.popdown.getPopdownDialogEl();
            var popdownDialogEvents = this.children.popdown.getPopdownEvents();
            var $el;
            if (popdownDialogEl) {
                $el = $(popdownDialogEl);
                $el.find('.'+menuClass).html(this.getMenuHTML());
            }
            if (popdownDialogEvents && !_.isEmpty(this.popdownDialogEvents)) {
                this.children.popdown.delegatePopdownEvents($.extend(true, {}, popdownDialogEvents, this.popdownDialogEvents));
            }
            this.delegateEvents();
        },

        /**
         * DO NOT override! The goal of the interface class
         * is to provide the functionality for the menu
         * Use helpers like getLableHTML/getMenuHTML instead
         *
         * @returns {DropdownView}
         */
        render: function () {
            this.$el.html(this.compiledTemplate({
                toggleClass: toggleClass,
                labelClass: labelClass,
                menuClass: menuClass
            }));

            this.$('.'+toggleClass).addClass(this.options.toggleClassName);
            this.$('.dropdown-menu').addClass(this.options.menuClassName);
            this.renderLabel();
            this.renderMenu();
            return this;
        },

        /**
         * DO NOT override the template.
         */
        template: '\
            <a class="<%- toggleClass %>">\
                <span class="<%- labelClass %>"></span>\
                <span class="caret"></span>\
            </a>\
            <div class="dropdown-menu"><div class="arrow"></div><div class="<%- menuClass %>"></div></div>\
        '
    }, {
        LABEL_SELECTOR: '.'+labelClass,
        MENU_SELECTOR:  '.'+menuClass,
        TOGGLE_SELECTOR:  '.'+toggleClass
    });

    /****************** END OF BASE INTERFACE ***************************/



    var OptionModel = Backbone.Model.extend({
        defaults: {
            label: '',
            value: null,
            icon: void 0,
            iconClassName: '',
            iconURL: void 0,
            iconURLClassName: '',
            description: void 0,
            descriptionPosition: 'bottom',
            selected: false,
            disabled: false
        },
        idAttribute: 'value'
    });

    var OptionsCollection = Backbone.Collection.extend({
        model: OptionModel,
        comparator: 'value',
        addStaticOption: function (option, otherOptions) {
            option.__type = 'static';
            this.add(option, otherOptions);
        },
        getStaticModels: function () {
            return this.where({__type: 'static'});
        },
        addSelectedOption: function (option, otherOptions) {
            option.__type = 'selected';
            this.add(option, otherOptions);
        },
        getSelectedModels: function () {
            return this.where({__type: 'selected'});
        },
        addDynamicOption: function (option, otherOptions) {
            option.__type = 'dynamic';
            this.add(option, otherOptions);
        },
        getDynamicModels: function () {
            return this.where({__type: 'dynamic'});
        },
        markAsSelected: function (values) {
            values = _.isArray(values) ? values : [values];
            _.each(values, function(value) {
                var model = this.get(value);
                if (model) {
                    model.set('selected', true);
                }
            }.bind(this));
        },
        markAsUnselected: function (value) {
            var model = this.get(value);
            if (model) {
                model.set('selected', false);
                return true;
            }
            return false;
        },
        clearAllSelection: function(value) {
            this.each(function(model) {
                model.set('selected', false);
            });
        },
        getSelected: function () {
            return this.filter(function(model) { return model.get('selected');});
        }


    });

    var OptionView = BaseView.extend({
        moduleId: module.id,
        tagName: 'a',
        className: 'synthetic-select',
        render: function () {
            this.$el.html(this.compiledTemplate({
                item: this.model.toJSON()
            }));
            if (this.model.get('disabled')) {
                this.$el.addClass('disabled');
            }
            if (this.model.get('selected')) {
                this.$el.attr('data-selected', 'selected');
                this.$('.icon-check').show();
            }
            this.$el.data(this.model.toJSON());
            return this;
        },
        template: '\
            <i class="icon-check" style="display:none"></i>\
            <% if (item.icon) { %> <i class="icon-<%-item.icon%> <%-item.iconClassName %>"></i><% } %>\
            <% if (item.iconURL) { %> <img class="<%-item.iconURLClassName %>" src="<%-item.iconURL%>" alt="icon"><% } %>\
            <span class="link-label"><%- item.label %></span>\
            <% if (item.description && (item.descriptionPosition == "right")) { %> <span class="link-description"><%- item.description %></span><% } %>\
            <% if (item.description && (item.descriptionPosition == "bottom")) { %> <span class="link-description-below"><%- item.description %></span><% } %>\
        '
    });

    var SearchableMenu = DropdownView.extend({
        moduleId: module.id,

        initialize: function (options) {
            options || (options = {});
            DropdownView.prototype.initialize.call(this, options);

            _.defaults(this.options, {
                label: '',
                valueSeparator: ',',
                maxLabelLength: 50,
                multiSelect: true,
                menuClassName: '',
                unsetModelOnInvalidValue: true,
                renderOptionsAs: 'sortedByValue',
                searchPrompt: _('filter').t()
            });
            this.options.menuClassName = this.options.menuClassName + ' dropdown-menu-selectable dropdown-menu-searchable dropdown-menu-wide';
            this.modelToOptionConverter = this.options.modelToOptionConverter || this._modelToOptionConverter;

            if (!this.model || !this.options.modelAttribute) {
                throw new Error('model and modelAttribute are required');
            }
            // if (!_.isArray(this.model.get(this.options.modelAttribute))) {
            //     throw new Error('modelAttribute\'s value should be an array');
            // }
            if (this.options.modelAttribute) {
                this.$el.attr('data-name', this.options.modelAttribute);
            }
            this.model = {
                target: this.model,
                filter: new Backbone.Model()
            };
            this.listenTo(this.model.target, 'change:'+this.options.modelAttribute, this.renderLabel);

            this.collection || (this.collection = {});
            this.isSearchable = !!this.collection.search;
            if (this.isSearchable && !(this.collection.search && _.isFunction(this.collection.search.searchByValues) && _.isFunction(this.collection.search.search))) {
                this.isSearchable = false;
                throw new Error('Please make sure the search collection implements searchByValues and search functions');
            }

            this.collection._options = this.collection._options || new OptionsCollection();
            this.collection._searchOptions = this.collection._searchOptions || new OptionsCollection();

            this.__addStaticOptions();
            this.__addDynamicOptions();

            $.when(this.__addCurrentlySetOption()).done(this._setInitialSelection.bind(this));


            this.children = this.children || {};
            this.children.options = this.children.options || [];
            this.children.searchOptions = this.children.searchOptions || [];

            if (this.isSearchable) {
                this.children.searchFilter = new InputView({
                    canClear: true,
                    style: 'search',
                    updateOnKeyUp: true,
                    updateOnAutofill: true,
                    model: this.model.filter,
                    modelAttribute: 'rawSearch',
                    placeholder: this.options.searchPrompt
                });
                this.listenTo(this.model.filter, 'change:rawSearch', _.debounce(this.performSearch, 250));
                this.listenTo(this.collection.search, 'request', this._showLoading);
                this.listenTo(this.collection.search, 'reset', this._hideLoading);
                this.listenTo(this.collection.search, 'reset', this.updateSearchResults);
            }

            this.popdownDialogEvents['click a.synthetic-select'] = this.handleSyntheticSelectClick.bind(this);
            this.compiledMenuTemplate = this.compileTemplate(this.menuTemplate);
        },

        __addStaticOptions: function () {
            this.options.staticOptions || (this.options.staticOptions = []);
            _.each(this.options.staticOptions, function(option) {
                this.collection._options.addStaticOption(option);
            }.bind(this));
        },

        __addDynamicOptions: function () {
            // add items from listing
            if (this.collection.listing) {
                this.collection.listing.each(function (model) {
                    // this prevent duplicates from being added
                    this.collection._options.addDynamicOption(this.modelToOptionConverter(model));
                }.bind(this));
            }
        },

        __addCurrentlySetOption: function () {
            var $deferred = $.Deferred();

            var currentlySetValues;
            var currentlySetValue = this.model.target.get(this.options.modelAttribute);
            if (_.isString(currentlySetValue)) {
                currentlySetValues = currentlySetValue.split(this.options.valueSeparator);
            }

            if (_.isEmpty(currentlySetValues)){
                return $deferred.resolve();
            }

            var validateAndAddValues = [];
            if (this.isSearchable) {
                _.each(currentlySetValues, function(value) {
                    if (!this.collection._options.get(value)) {
                        validateAndAddValues.push(value);
                    }
                }.bind(this));

                if (!this.options.multiSelect && validateAndAddValues.length > 0) {
                    validateAndAddValues = [validateAndAddValues[0]];
                }

                return this.validateAndAddSelectedOptions(validateAndAddValues);

            } else {
                $deferred.resolve();
            }
            return $deferred;

        },

        validateAndAddSelectedOptions: function (values) {
            if (_.isEmpty(values)) {
                return $.Deferred().resolve();
            }
            var successFn = function (models) {
                _.each(models, function(model){
                    var option = this.modelToOptionConverter(model);
                    option.selected = true;
                    this.collection._options.addDynamicOption(option);
                    $deferredAdd.resolve();
                }.bind(this));
            }.bind(this);

            var $deferredAdd = this.collection.search.searchByValues(values);
            $.when($deferredAdd).then(successFn).fail(function(){$deferredAdd.reject();});
            return $deferredAdd;
        },

        _setInitialSelection: function () {
            var value = this.model.target.get(this.options.modelAttribute);
            var values = _.isString(value) && value.split(this.options.valueSeparator);

            if (!this.options.multiSelect && values.length>0) {
                this.collection._options.clearAllSelection();
                values = [values[0]];
            }
            _.each(values, function (value) {
                this.collection._options.markAsSelected(value);
            }.bind(this));

            this._updateModel();
            this.renderLabel();
        },

        _updateModel: function () {
            var selectedModels = this.collection._options.getSelected();
            var selectedValues = _.map(selectedModels, function (model) { return model.get('value'); });
            var value = selectedValues.join(this.options.valueSeparator);
            this.model.target.set(this.options.modelAttribute, value);
        },

        handleSyntheticSelectClick: function (e) {
            e.preventDefault();
            var $target = $(e.currentTarget);
            if ($target.hasClass('disabled')) return;

            var data = $target.data();
            var modelValue = data.value;

            if (!_.isEmpty(this.model.filter.get('rawSearch'))) {
                // add the option from searchCollection to optionsCollection
                var optionModel = this.collection._searchOptions.get(data.value);
                this.collection._options.addDynamicOption(optionModel);
            }


            if (!this.options.multiSelect) {
                this.collection._options.clearAllSelection();
                this.collection._options.markAsSelected([modelValue]);
            } else {
                if (data.selected) {
                    this.collection._options.markAsUnselected([modelValue]);
                } else {
                    this.collection._options.markAsSelected([modelValue]);
                }
            }
            this._updateModel();
            this.clearSearch();
        },

        _showLoading: function () {
            if (!this.$menu) {
                return;
            }

            this.$menu.find('.info')
                .html(_('Loading ...').t())
                .show();
        },

        _hideLoading: function () {
            if (!this.$menu) {
                return;
            }

            var $info = this.$menu.find('.info');
            if (this.collection.search.length > 0) {
                $info.hide();
            } else {
                if (!_.isEmpty(this.model.filter.get('rawSearch'))) {
                    $info.html(_('No results found.').t());
                } else {
                    $info.hide();
                }
            }
        },

        performSearch: function (model, value, options) {
            if (!_.isEmpty(value)) {
                return this.collection.search.search(value);
            }

            this.clearSearch();
            this._hideLoading();
            this._renderOptions();
        },

        clearSearch: function () {
            this.collection._searchOptions.reset();
            if (this.isSearchable) {
                this.children.searchFilter.clear();
            }
            _.each(this.children.searchOptions, function(view) { view.remove();});
            this.children.searchOptions.length = 0;
        },

        updateSearchResults: function () {
            // clean up everything we had so far
            this.collection._searchOptions.reset();
            var userSearch = this.model.filter.get('rawSearch');
            if (_.isEmpty(userSearch)) {
                return;
            }

            this.collection.search.each(function (model) {
                // create option
                var option = this._modelToOptionConverter(model);
                // add it to the searchOptions collection
                this.collection._searchOptions.addDynamicOption(option);
            }.bind(this));


            this.collection._searchOptions.markAsSelected(this.model.target.get(this.options.modelAttribute));
            this._renderOptions();
        },


        _modelToOptionConverter: function (model) {
            return {
                label: model.getLabel(),
                value: model.getValue()
            };
        },

        getOptionsHTML: function (collection) {
            var $html = $('<ul></ul>');

            // clean up the old view
            _.each(this.children.options, function(view) { view.remove();});
            this.children.options.length = 0;

            collection.each(function (model) {
                var $option = $('<li></li>');
                var optionView = new OptionView({model: model});
                $option.html(optionView.render().el);
                $html.append($option);
                this.children.options.push(optionView);
            }.bind(this));

            return $html;

        },

        _renderOptionsAsSortedByValue: function () {
            var $menuOptionsContainer = this.$menu.find('.menu-options');
            if (_.isEmpty(this.model.filter.get('rawSearch'))) {
                $menuOptionsContainer.html(this.getOptionsHTML(this.collection._options));
            } else {
                //render search results as menu
                $menuOptionsContainer.html(this.getOptionsHTML(this.collection._searchOptions));
            }
        },

        _renderOptions: function () {
            var renderAs = this.options.renderOptionsAs;
            switch(renderAs) {
                // encourage to implement various ordering
                default:
                    this._renderOptionsAsSortedByValue();
                    break;
            }
        },

        /**
         * Implements interface function
         * @returns {html}
         */
        getLabelHTML: function () {
            var selectedModels = this.collection._options.getSelected();
            var selectedLabels = _.map(selectedModels, function (model) { return model.get('label'); });
            var labelText = selectedLabels.length > 0 && stringUtil.truncateTrailingString(this.options.label + selectedLabels.join(', '), this.options.maxLabelLength) || this.options.prompt;
            return labelText;
        },

        getMenuHTML: function () {
            var $html = $(this.compiledMenuTemplate());

            if (!this.isSearchable) {
                $html.find('.searchables').hide();
            } else {
                $html.find('.search-filter').append(this.children.searchFilter.render().el);
                this.children.searchFilter.clear();
            }

            // make menu available outside of getMenuHTML
            this.$menu = $html;
            this._renderOptions();

            $html.find('.info').hide();
            return $html;
        },

        menuTemplate: '\
            <div>\
                <div class="searchables ignore-clicks search-filter"></div>\
                <div class="menu-options"></div>\
                <div class="ignore-clicks info"></div>\
            </div>\
        '
    });

    return SearchableMenu;
});