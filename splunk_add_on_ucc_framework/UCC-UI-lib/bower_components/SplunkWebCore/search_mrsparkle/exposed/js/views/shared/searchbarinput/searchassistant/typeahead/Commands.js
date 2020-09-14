define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'splunk.util'
    ],
    function(_, $, module, Base, splunkUtil) {
        return Base.extend({
            moduleId: module.id,
            /**
             * @param <Object> options {
             *     <Object> model: {
             *         sHelper: <models.search.SHelper>
             *     }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.sHelper, 'change:commandArgs change:commonNextCommands change:commandHistory', this.debouncedRender);
            },
            render: function() {
                var data = {
                    _: _,
                    commandHistory: _.first(this.model.sHelper.get("commandHistory") || [], this.model.sHelper.MAX_COMMAND_HISTORY),
                    name: this.model.sHelper.command.get("name") || "",
                    commandArgs: _.first(this.model.sHelper.get("commandArgs") || [], this.model.sHelper.MAX_COMMAND_ARGS),
                    nextCommands: _.first(this.model.sHelper.get("commonNextCommands") || [], this.model.sHelper.MAX_NEXT_COMMANDS),
                    buildReplacement: this.buildReplacement,
                    parseExample: this.parseExample,
                    search: this.model.sHelper.get("search") || ""
                };
                var template = _.template(this.template, data);
                this.$el.html(template);

                this.model.sHelper.trigger('childRendered');

                return this;
            },
            parseExample: function(name, arg) {
                return splunkUtil.sprintf("... | %s %s", name, arg);
            },
            buildReplacement: function(search, item, value) {
                //If the value type is a choice, there are several different command args available
                if (value) {
                    //Replaces the last occurrence of the item with the fully formed command
                    var newString = search.trim().replace(new RegExp(item.arg + "$"), item.replacement);
                    //Append an equals sign if it doesn't exist; else append just the value
                    newString += newString[newString.length-1] !== '=' ? '=' + value : value;
                    return newString;
                } else {
                    return search.trim().replace(new RegExp(item.arg + "$"), item.replacement);
                }
            },
            template: '\
               <% if (nextCommands.length > 0){ %><h5><%= _("Common Next Commands").t() %></h5>\
                    <% _.each(nextCommands, function(cmd) { %>\
                        <a class="typeahead-keyword" tabindex="0" title="<%- cmd.description %>" data-replacement="<%- cmd.nextCommand %>" data-type="nextCommand">\
                        <%- cmd.nextCommand %></a>\
                <% })} %>\
                <% if (commandHistory.length > 0){ %><h5><%= _("Command History").t() %></h5>\
                <% _.each(commandHistory, function(arg) { %>\
                    <a class="typeahead-keyword" tabindex="0" data-replacement="<%- arg.replacement %>">\
                    <%- parseExample(name, arg.arg) %></a>\
                <% })} %>\
                <% if(commandArgs.length > 0){ %><h5><%= _("Command Args").t() %></h5>\
                <% _.each(commandArgs, function(arg) { %>\
                    <% if (arg.valueChoice) { %>\
                        <% _.each(arg.valueChoice, function(value) { %>\
                            <a class="typeahead-keyword" tabindex="0" data-replacement="<%- buildReplacement(search, arg, value) %>">\
                            <%= value%></a>\
                        <% }); %>\
                    <% } else { %>\
                        <a class="typeahead-keyword" tabindex="0" data-replacement="<%- buildReplacement(search, arg) %>">\
                        <%- arg.valueType || arg.replacement %></a>\
                    <% } %>\
                <% })} %>\
            '
        });
    }
);