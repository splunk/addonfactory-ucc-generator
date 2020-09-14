define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'views/shared/PopTart',
        'util/splunkd_utils',
        'splunk.util'
    ],
    function(
        module,
        $,
        _,
        BaseView,
        PopTartView,
        splunkdUtils,
        splunkUtil
    )
    {
        /**
         * @param {Object} options {
         *     model: <Backbone.Model>,
         *     map: <Function(model)> return the id and name as an object,
         *     selectedModelId: (Optional) The currently set id
         * }
         */
        var MenuView = PopTartView.extend({
            className: 'dropdown-menu dropdown-menu-selectable home-dashboard-autosuggest',
            events: $.extend({}, PopTartView.prototype.events, {
                'click li a': function (e) {
                    e.preventDefault();
                    var $target = $(e.target);
                    this.model.set({
                        id: $target.attr('data-id')
                    });
                }
            }),
            render: function() {
                this.el.innerHTML = PopTartView.prototype.template_menu;
                this.$el.append(this.compiledTemplate({
                    _: _,
                    selectedModelId: this.options.selectedModelId,
                    collection: this.collection,
                    splunkUtil: splunkUtil,
                    map: this.options.map
                }));
            },
            template: '\
                <% if (!collection.size()) { %>\
                    <div class="no-results"><%- _("No Results.").t() %></div>\
                <% } else { %>\
                    <ul>\
                        <% collection.each(function(model) { %>\
                            <% var attr = map(model); %>\
                            <li><a href="#" title="<%-attr.name %>" data-id="<%- attr.id %>"><%= (selectedModelId===attr.id) ? \'<i class="icon-check"></i>\' : "" %><i class="icon-dashboard"></i><%- splunkUtil.smartTrim(attr.name, 45) %></a></li>\
                        <% }) %>\
                    <% var remaining = collection.models[0].paging.get("total") - collection.size(); %>\
                    <% if (remaining > 0) { %>\
                        <li class="truncated"><%- splunkUtil.sprintf(_("%s more dashboards(s), continue typing to refine").t(), remaining) %></li>\
                    <% } %>\
                    </ul>\
                <% } %>\
            '
        });
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'form',
            /**
             * @param {Object} options {
             *     model: {
             *          state: <models.State>,
             *          active: <models.*>  the last saved model will be shown as the initially selected model
             *     collection: <Backbone.Collection>,
             *     map: <Function(model)> return the id and name as an object,
             * }
             */
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.listenTo(this.collection, 'sync', this.showMenu);

                if (this.model.active) {
                    var attr = this.options.map(this.model.active);
                    this.model.state.set('id', attr.id);
                }
                this.listenTo(this.model.state, 'change:id', function() {
                    var model = this.collection.get(this.model.state.get('id'));
                    this.displaySelectedModel(model); 
                });
            },
            displaySelectedModel: function(model) {
                if (model) {  // User has made a valid selection from the auto-suggest results 
                        this.$('input').toggleClass('selected', true);
                        var attr = this.options.map(model);
                        var name = attr.name;
                        this.model.state.set('search', '', {silent:true});
                        this.$('input').val(name).attr('title', name);
                } else {  // User does not have a valid selection.  change to "unselected" state 
                        this.$('input').toggleClass('selected', false);
                }
            }, 
            events: {
                'keyup input': function(e) {
                    e.preventDefault();
                    if (e.keyCode == 27) {
                        this.clear();
                    } else if(e.keyCode == 13) {  //User pressed 'enter' key.  Don't do anything, just submit the form. 
                        return;
                    }          
                },
                'input input': function(e) {
                    e.preventDefault();
                    this.set(this.$('input').val());
                    if (this.$('input').val().trim()) {
                        this.model.state.unset('id');
                    } else {
                        this.model.state.set('id', "");
                    }  
                },
                'change input': function(e) {
                    e.preventDefault();
                    var value = this.$('input').val().trim();
                    if (value !== this.$('input').val()) {
                        this.$('input').val(value);
                    }
                },
                'click .placeholder': function(e) {
                    this.$('input').focus();
                },
                'click input': function(e) {
                    //this.showMenu();
                    this.model.state.trigger('change:search'); 
                },
                'click .edit-btn': function(e) {
                    //this.showMenu();
                    this.model.state.trigger('change:search'); 
                },
                'submit': function(e) {
                    return false;
                }
            },
            clear: function(){
                this.$('input').val('');
                this.set('');
            },
            set: _.debounce(function(value) {
                //filter exists 
                if (value.length) {
                    this.model.state.set('search', value);
                } else {
                    this.model.state.set('search', '');
                }
            }, 250),
            showMenu: function() {
                if (this.children.poptart) {
                    this.children.poptart.remove();
                } 

                // show the currently selected item if it exists, or show the last saved item
                var selectedModelId = ''; 
                if (this.model.state.get('id')) { 
                    selectedModelId = this.model.state.get('id'); 
                } else if (this.model.active){
                    var attr = this.options.map(this.model.active);
                    selectedModelId = attr.id;
                }

                this.children.poptart = new MenuView({
                    mode: 'menu',
                    onHiddenRemove: true,
                    collection: this.collection,
                    map: this.options.map,
                    model: this.model.state,
                    selectedModelId: selectedModelId 
                });
                this.children.poptart.appendTo(this.$el).render();
                this.children.poptart.show(this.$('input'), {$onOpenFocus: this.$('input')}); 
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _,
                    model: this.model.state
                }));
 
                if (this.model.active) {
                    this.displaySelectedModel(this.model.active); 
                }
     
                return this;
            },
            template: '\
                <input type="text" class="dashboard-search-query" style="margin-bottom:0px" placeholder="<%-_("No dashboard selected").t() %>" value="<%- model.get("search") %>">\
                <a class="btn edit-btn"><span class="caret"></span></a>\
           '
        });
    }
);
