define(
    [
        'jquery',
        'underscore',
        'models/Base',
        'backbone',
        'util/string_utils',
        'util/splunkd_utils'
    ],
    function($, _, BaseModel, Backbone, string_utils, splunkd_utils) {
        var SHelper = BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
                this.initializeAssociated();
                this.MAX_MATCHING_SEARCHES = 5;
                this.MAX_NEXT_COMMANDS = 10;
                this.MAX_MATCHING_TERMS = 10;
                this.MAX_SEARCH_LENGTH = 60;
                this.MAX_KEYWORD_LENGTH = 40;
                this.MAX_COMMAND_HISTORY = 5;
                this.MAX_COMMAND_ARGS = 10;
            },
            url: 'search/shelper',
            sync: function(method, model, options) {
                if (method!=='read') {
                    throw new Error('invalid method: ' + method);
                }
                var syncOptions = splunkd_utils.prepareSyncOptions(options, model.url);
                return Backbone.sync.call(this, method, model, syncOptions);
            },
            initializeAssociated: function() {
                var RootClass = this.constructor;

                this.command = this.command || new RootClass.Command();
                this.associated.command = this.command;
            },
            parse: function(response, options) {
                response = $.extend(true, {}, response);
                this.initializeAssociated();
                this.command.set(response.command);
                delete response.command;
                var totalKeywords = response.matchingTerms ? Math.min(response.matchingTerms.length, this.MAX_NEXT_COMMANDS) : 0
                    + response.matchingSearches ? Math.min(response.matchingSearches.length, this.MAX_SEARCH_HISTORY) : 0
                    + response.commandHistory ? Math.min(response.commandHistory.length, this.MAX_COMMAND_HISTORY) : 0
                    + response.commandArgs ? Math.min(response.commandArgs.length, this.MAX_COMMAND_ARGS) : 0
                    + response.commonNextCommands ? Math.min(response.commonNextCommands.length, this.MAX_NEXT_COMMANDS) : 0;
                this.set("totalKeywords", totalKeywords);
                return response;
            }
        },
        {
            Command: BaseModel,
            CONSIDER_STRINGS: {
                'dedup': _('Consider using "dedup … sortby …" rather than "sort … | dedup …"').t(),
                'raw': _('Consider using "count()" rather than "count(_raw)"').t(),
                'ipCIDR': _('Consider using CIDR support in the search operator (e.g., "host=10.0.0.1/16")').t(),
                'firstTermSearch': _('Your first search term is also a search command. Did you mean "%(better)s"?').t(),
                'wildCard': _('Wildcards are supported with an asterisk (\'*\'), not an ellipsis (\'...\').').t(),
                'andOrNot': _('Boolean operators must be uppercased (e.g., AND, OR, NOT) otherwise the search is looking for the terms \'and\', \'or\', and \'not\'.').t(),
                'where': _('Consider combining the \'where\' condition (%(worse)s) into the \'search\' condition (%(better)s)').t()
            }
        });
        return SHelper;
    }
);
