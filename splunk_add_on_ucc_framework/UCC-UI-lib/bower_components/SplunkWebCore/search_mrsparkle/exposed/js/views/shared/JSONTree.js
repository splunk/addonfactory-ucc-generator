define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'util/math_utils',
        'bootstrap.tooltip'
    ],
    function($, _, module, BaseView, math_utils) {
        return BaseView.extend({
            moduleId: module.id,
            className: "json-tree",
            /**
             * @param {Object} options {
             *     json: <json stringified object>
             *     isValidJSON: <a flag allowing opt-out of safe set json routine>
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                
                var defaults = {
                        isValidJSON: false,
                        json: '{}'
                };
                this.options = $.extend(true, defaults, this.options);

                if(this.options.isValidJSON) {
                    this._json = this.options.json;
                } else {
                    this.setJSON(this.options.json);
                }
            },
            setJSON: function(json) {
                var parsed;

                if(typeof json !== 'string') {
                    json = JSON.stringify(json);
                } 

                try{
                    parsed = JSON.parse(json);
                } catch(e) {}
                
                this._json = parsed;
            }, 
            isValidJSON: function() {
                return !!this._json;
            },
            events: {
                'click .jsexpands': function(e) {
                    var $target = $(e.currentTarget),
                        path = $target.data('path'),
                        search = $target.data('search');
                    this.trigger('interaction');
                    this.interacted = true;

                    if (!$target.next().is('span')) {
                        $target.after(this.renderNextLevel(path, search));
                    }
                    $target.removeClass('jsexpands').addClass('jscollapse').text('[-]').next().show();
                    
                    e.preventDefault();
                },
                'click .jscollapse': function(e) {
                    var $target = $(e.currentTarget);
                    this.trigger('interaction');
                    this.interacted = true;
                    $target.removeClass('jscollapse').addClass('jsexpands').text('[+]').next().hide();
                    e.preventDefault();
                }
            },
            /**
             * Return HTML string of expanded object/array
             * 
             * @param path {string}: used for drilldown
             * @param search {string}: such as key1.key2.key3,
             *      used to get object/array by this._json[key1][key2][key3]
             */
            renderNextLevel: function(path, search) {
                var keys = search.split('.'),
                    len = keys.length,
                    obj = this._json;

                for(var i = 0; i < len ; i++) {
                    var key = this.decodeKey(keys[i]);
                    obj = obj[key];
                }

                return this.compiledTemplate({
                    _: _,
                    obj: obj,
                    indent: 2 * len,
                    path: path,
                    search: search,
                    math_utils: math_utils,
                    encodeKey: this.encodeKey,
                    valueTemplate: _.template(this.valueTemplate)
                });
            },
            encodeKey: function(key) {
                return key.replace(/\./g, "\\u002e");
            },
            decodeKey: function(key) {
                return key.replace(/\\u002e/g, ".");
            },
            render: function() {
                if(!this.interacted) {
                    this.$el.html(this.compiledTemplate({
                        _: _,
                        obj: this._json,
                        indent: 0,
                        path: '',
                        search: '',
                        math_utils: math_utils,
                        encodeKey: this.encodeKey,
                        valueTemplate: _.template(this.valueTemplate)
                    }));
                    this.$el.find('.isLessThanMinSafeInt').tooltip({title:_('This value may have been rounded because it exceeds the minimum allowed int value.').t()});
                    this.$el.find('.isGreaterThanMaxSafeInt').tooltip({title:_('This value may have been rounded because it exceeds the maximum allowed int value.').t()});
                }
                return this;
            },
            template: '\
                <% var indent = indent + 2; %>\
                <% var level  = indent/2; %>\
                <% var isObj = !(obj instanceof Array); %>\
                <% var list  = (isObj) ? _.keys(obj).sort() : obj; %>\
                <% if (level == 1) { %>\
                    <span><%if(isObj) { %>{<% } else { %>[<% } %></span>\
                    <% if (list.length > 0) { %>\
                        <a href="#" class="jscollapse">[-]</a>\
                    <% } %>\
                <% } %>\
                <span>\
                <% var i = 0; %>\
                <% for(; i<list.length; i++){ %>\
                    <br/>\
                    <% for(var j=0; j<indent; j++){ %>&nbsp;<% } %>\
                    \
                    <% var key = list[i]; %>\
                    <% if(isObj) { %>\
                        <% var newPath = path + (path ? "." : "") + key; %>\
                        <% var newSearch = search + (search ? "." : "") + encodeKey(key); %>\
                        <% var value = obj[key]; %>\
                        \
                        <% if(math_utils.isLessThanMinSafeInt(obj[list[i]])) { %>\
                            <span class="key level-<%-level%> isLessThanMinSafeInt">\
                        <% } else if(math_utils.isGreaterThanMaxSafeInt(obj[list[i]])) { %>\
                            <span class="key level-<%-level%> isGreaterThanMaxSafeInt">\
                        <% } else { %>\
                            <span class="key level-<%-level%>">\
                        <% } %>\
                        <span class="key-name"><%-key%></span>:\
                            <% var type = ( value === null) ? "null": typeof value; %>\
                            <%= valueTemplate({_:_, indent: indent, type: type, value: value, path: newPath, search: newSearch})%>\
                        </span>\
                    <% } else { %>\
                        <% var newPath = path + "{}"; %>\
                        <% var newSearch = search + (search ? "." : "") + i; %>\
                        <% var type = (key === null) ? "null": typeof key; %>\
                        <%= valueTemplate({_:_, indent: indent, type: type, value: key, path: newPath, search: newSearch})%>\
                    <% } %>\
                <% } %>\
                </span>\
                <% if (level == 1) { %>\
                    <br>\
                    <% for(var j=0; j< indent-2; j++){ %>&nbsp;<% } %>\
                    <% if(isObj){ %><span>}</span><% } else { %><span>]</span><%}%>\
                <% } %>\
            ',
            valueTemplate:'\
                <% if(!_.isObject(value)) { %>\
                    <span class="t <%- type %>" data-path="<%- path %>" ><%- value === null ? "null" : value %></span>\
                <% } else { %>\
                    <span><%if(!(value instanceof Array)) { %>{<% } else { %>[<% } %></span>\
                    <a href="#" class="jsexpands" data-path="<%- path %>" data-search="<%- search %>">[+]</a>\
                    <br>\
                    <% for(var j=0; j< indent; j++){ %>&nbsp;<% } %>\
                    <span><%if(!(value instanceof Array)) { %>}<% } else { %>]<% } %></span>\
                <% } %>\
            '
        });
    }
 );
