define(
    [
        'jquery',
        'underscore',
        'splunk.util',
        'splunk.config',
        'util/general_utils'
    ],
    function($, _, splunkUtils, splunkConfig, generalUtils) {
        
        var SYSTEM = "system",
            GLOBAL = "global",
            APP = "app",
            USER = "user",
            NOBODY = "nobody",
            WILDCARD = "-",
            VERBOSE = "verbose",
            FAST = "fast",
            SMART = "smart",
            RISKY_COMMAND = 'risky_command',
            FATAL = 'fatal',
            ERROR = 'error',
            WARNING = 'warn',
            INFO = 'info',
            NETWORK_ERROR = 'network_error',
            NOT_FOUND = '404',
            DEFAULT_LOCALE = 'en-US';
        
        var fullpath = function(path, options) {
            options = options || {};
            var isServicesPath = /^\/services/.test(path),
                isAbsolute = /^\/.*/.test(path),
                isFullPath = /^http[s]?:\/\//.test(path);

            //return if it is already a full path
            if (isFullPath) {
                return path;
            }

            //return if not a relative path
            if (isAbsolute && !isServicesPath){
                return path;
            } else if (isAbsolute && isServicesPath) {
                return splunkConfig.SPLUNKD_PATH + path;
            }

            // If we don't have an app name (explicitly or implicitly), we default to /services/
            if (!options.app && !options.owner) {
                return splunkConfig.SPLUNKD_PATH + "/services/" + path;
            }

            // Get the app and owner, first from the passed in namespace or
            // default to wild cards
            var owner = options.owner || WILDCARD;
            var app   = options.app || WILDCARD;

            options.sharing = (options.sharing || "").toLowerCase();
             
            // Modify the owner and app appropriately based on the sharing parameter
            if (options.sharing === APP || options.sharing === GLOBAL) {
                owner = NOBODY;
            } else if (options.sharing === SYSTEM) {
                owner = NOBODY;
                app = SYSTEM;
            }
            return splunkConfig.SPLUNKD_PATH + "/servicesNS/" + encodeURIComponent(owner) + "/" + encodeURIComponent(app) + "/" + path;
        };
        
        var xhrErrorResponseParser = function(response, id) {
            var responseData = {}, 
                isValidJSON = true,
                messages = [];
            id = id || _("object from SplunkD").t();
                        
            if(response.hasOwnProperty('responseText') && response.hasOwnProperty('getResponseHeader')) {
               var contentType = response.getResponseHeader('Content-Type');
               if (contentType && (contentType.indexOf('application/json') > -1) && response.responseText) {
                    try {
                        responseData = JSON.parse(response.responseText);
                    }
                    catch(e) {
                        isValidJSON = false;
                    }
                }
            }
                        
            // have to maintain compatibility with older models that have the response wrapped in a "data" attribute
            if(response.hasOwnProperty('data')) {
                responseData = responseData.data;
            }
            
            if (response.hasOwnProperty('status')) {
                if (response.status == 404 && $.isEmptyObject(responseData)) {
                    messages.push(createMessageObject(
                        NOT_FOUND,
                        splunkUtils.sprintf(
                            _('Could not retrieve %s. Make sure that this resource exists and has the correct permissions.').t(),
                            id
                        )
                    ));
                } else if (response.status == 0 || response.status == 12029) {
                    messages.push(createMessageObject(NETWORK_ERROR, _('Your network connection may have been lost or Splunk may be down.').t()));
                }
            }
            
            if (!isValidJSON) {
                messages.push(createMessageObject(ERROR, splunkUtils.sprintf(_('Invalid JSON from: %s.').t(), id)));
            } else if (responseData.messages) {
                messages = messages.concat(parseMessagesObject(responseData.messages));
            } else if (response.messages) {
                var responseMessages = parseMessagesObject(response.messages);
                if (responseMessages.length) {
                    messages = messages.concat(responseMessages);
                } else {
                    messages.push(createMessageObject(ERROR, _('Server error').t()));
                }
            } else if (_.isString(response)) {
                messages.push(createMessageObject(ERROR, response));
            }
            
            if (!messages.length) {
                messages.push(createMessageObject(ERROR, _('Server error').t()));
            }
            
            return messages;
        };

        var prepareSyncOptions = function(options, baseUrl) {
            var appOwner = {},
                defaults = {data: {output_mode: 'json'}};

            if (options && options.data){
                appOwner = $.extend(appOwner, { //JQuery purges undefined
                    app: options.data.app || undefined,
                    owner: options.data.owner || undefined,
                    sharing: options.data.sharing || undefined
                });
                delete options.data.app;
                delete options.data.owner;
                delete options.data.sharing;
            }
            defaults.url = fullpath(baseUrl, appOwner);
            return $.extend(true, defaults, options || {});
        };
        
        var nameFromString = function(str) {
            str = str || "";
            return str.toLowerCase().replace(/\s/g, "_").replace(/\W/g, "");
        };

        var quoteSearchFilterValue = function(value) {
            // Reusing string-quoting semantics of JSON.stringify()
            // Backslash-escapes quotes and backslashes in the value
            // 'foo\bar "baz"' -> '"foo\\bar \"baz\"'
            return JSON.stringify(String(value));
        };

        var createSearchFilterString = function(value, keys, options) {
            var values = (value) ? (value.match(generalUtils.VALUES_REGEX) || []): [];
            options = options || {};
            return _(keys).map(function(key) {
                if (values.length) {
                    var result = '(' + _.chain(values)
                            .map(function(value) {
                                // if value has quote around it remove quotes
                                if (value.match(generalUtils.QUOTES_REGEX)) {
                                    var len = value.length;
                                    value = value.substring(1, len-1);
                                }
                                //escape quotes
                                return [key, '="*', value.replace(/'/g,"\\'").replace(/"/g,'\\"'), '*"'].join('');
                            },this)
                            .join(' AND ')
                            .value();
                    // If we have a conditional filter to add, AND it with the current key
                    if (options.conditions && options.conditions[key]) {
                        result += " AND " + options.conditions[key];
                    }
                    return result  + ")";
                } else {
                    return [key, '=*'].join('');
                }
            },this).join(' OR ');
        };

        var createSearchFilterObj = function(value, keys) {
            var values = (value) ? (value.match(generalUtils.VALUES_REGEX) || []): [],
            filterObj = {}; 

            if (values.length) {
                var matches = [];
                _(values).each(function(value){
                    if (value.match(generalUtils.QUOTES_REGEX)) {
                        var len = value.length;
                        value = value.substring(1, len-1);
                    }
                    matches.push(value.replace(/'/g,"\\'").replace(/"/g,'\"'));
                },this);   

                _(keys).each(function(key) {
                    filterObj[key] = matches;
                }, this);
            }
            return filterObj;
        };

        var parseError = function(error) {
            var passedErrors = {},
                parsedError;

            if (error.responseText) {
                try {
                    parsedError = JSON.parse(error.responseText);
                }
                catch(e) {
                    parsedError = {};
                }
                if (parsedError.messages) {
                    _.each(parsedError.messages, function(value) {
                        passedErrors['splunkD:' + value.type] = value.text;
                    });
                }
            } else {
                passedErrors = error;
            }
            return passedErrors;
        };

        var createMessageObject = function(type, message, help) {
            type = type.toLowerCase();

            var jsonStart = message.indexOf("~!~{");
            var jsonEnd = message.lastIndexOf("}~!~");
            var jsonMsg;
            var messageText = message;

            if (jsonStart != -1 && jsonEnd != -1) {
                try
                {
                    var jsonBlock = message.slice(jsonStart+3, jsonEnd+1);
                    jsonMsg = JSON.parse(jsonBlock);
                    messageText = jsonMsg.errorMessageEnglish;
                }
                catch (e) {
                }
            }
            // Handle structured message
            return ({
                key: _.uniqueId('splunkd_' + type),
                type: type,
                message: messageText,
                text: messageText,
                help: help
            });

        };
        
        var parseMessagesObject = function(messages) {
            if(!messages) {
                return [];
            }
            return _(messages).map(function(message) {
                return createMessageObject(message.type, message.text, message.help || "");
            });
        };

        
        var messagesContainsOneOfTypes = function(messages, types){
            if (messages) {
                for(var i = 0; i < messages.length; i++) {
                    if (_.indexOf(types, messages[i].type) != -1) {
                        return true;
                    }
                }
            }
            return false;
        };
        
        var filterMessagesByTypes = function(messages, types) {
            var filteredMessages = [];
            if (messages) {
                for(var i = 0; i < messages.length; i++) {
                    if (_.indexOf(types, messages[i].type) != -1) {
                        filteredMessages.push(messages[i]);
                    }
                }
            }
            return filteredMessages;
        };
        
        /**
         * Munge the difference between what splunkd outputs and what the renderer expects for message type.
         *
         * Namely splunkd has a 'fatal' type that we re-map to 'error', and splunkd uses 'warn' where the renderer
         * wants 'warning'.
         */
        var normalizeType = function(type) {
            if(type === FATAL) {
                return ERROR;
            }
            if(type === WARNING) {
                return 'warning';
            }
            return type;
        };
        
        var addAnchorsToWildcardArray = function(wildcardArray) {
            return _.map(wildcardArray, function(wildcard){
                if (!/^\^/.test(wildcard)){
                    return "^" + wildcard;
                }
                return wildcard;
            });
        };
        
        var createSplunkDMessage = function(type, text) {
            return {
                messages: [{
                    type: type,
                    text: text
                }]
            };
        };

        var getSharingLabel = function(sharing) {
            switch (sharing) {
                case USER:
                    return _("Private").t();
                case APP:
                    return _("App").t();
                case GLOBAL:
                    return _("Global").t();
                case SYSTEM:
                    return _("Global").t();
            }
        };

        var getPermissionLabel = function(sharing, owner) {
            switch (sharing) {
                case USER:
                    return splunkUtils.sprintf(_("Private. Owned by %s.").t(), owner);
                case APP:
                    return splunkUtils.sprintf(_("Shared in App. Owned by %s.").t(), owner);
                case GLOBAL:
                case SYSTEM:
                    return splunkUtils.sprintf(_("Shared Globally. Owned by %s.").t(), owner);
            }
            return "";
        };
        
        var normalizeValuesForPOST = function(values) {
            var valuesCopy = $.extend(true, {}, values);
            _.each(valuesCopy, function(value, key) {
                if (typeof(value) === "boolean") {
                    if (value) {
                        valuesCopy[key] = "1";
                    } else {
                        valuesCopy[key] = "0";
                    }
                }              
            });
            return valuesCopy;
        };
        
        var normalizeBooleanTo01String = function(value) {
            var bool = splunkUtils.normalizeBoolean(value);
            if (bool) {
                return "1";
            }
            return "0";
        };
        
        var isExistingEntity = function(payload) {
            if (
        		payload && 
        		payload.entry && 
        		_.isArray(payload.entry) && 
        		payload.entry[0].links && 
        		payload.entry[0].links.alternate && 
        		!/.\/_new$/.test(payload.entry[0].links.alternate)
            ) {
                return true;
            }
            return false;
        };
         
        var getHeaders = function(headersString) {
            var headers = {};
            var headerLines = headersString.split("\n");
            for(var i = 0; i < headerLines.length; i++) {
                if (headerLines[i].trim() !== "") {
                    var headerParts = headerLines[i].split(": ");
                    headers[headerParts[0]] = headerParts[1];
                }
            }
            return headers;
        };

        /**
         * A utility function for translating a jquery response object (jqXHR) to the format expected
         * by consumers of the sdk.
         * @param  {jqXHR} response
         * @return {Object} formatted response data
         */
        var convertToSDKResponse = function(response) {
            return {
                status: response.status,
                // If the response is successful, 'error' will be 'success' to conform with sdk api
                error: response.statusText,
                data: response.responseJSON,
                response: {
                    statusCode: response.status,
                    headers: getHeaders(response.getAllResponseHeaders())
                }
            };
        };

        return {
            // constants for splunkd message types
            RISKY_COMMAND: RISKY_COMMAND,
            FATAL: FATAL,
            ERROR: ERROR,
            WARNING: WARNING,
            INFO: INFO,
            NOT_FOUND: NOT_FOUND,
            NETWORK_ERROR: NETWORK_ERROR,
            
            //constants for ACL
            SYSTEM: SYSTEM,
            GLOBAL: GLOBAL,
            APP: APP,
            USER: USER,
            NOBODY: NOBODY,
            WILDCARD:  WILDCARD,
            
            //constants for the adhoc search level
            VERBOSE: VERBOSE,
            FAST: FAST,
            SMART: SMART,

            //constans for filters
            VALUES_REGEX: generalUtils.VALUES_REGEX,
            QUOTES_REGEX: generalUtils.QUOTES_REGEX,

            DEFAULT_LOCALE: DEFAULT_LOCALE,

            fullpath: fullpath,
            prepareSyncOptions: prepareSyncOptions,
            nameFromString: nameFromString,
            quoteSearchFilterValue: quoteSearchFilterValue,
            createSearchFilterString: createSearchFilterString,
            createSearchFilterObj: createSearchFilterObj,
            parseError: parseError,
            parseMessagesObject: parseMessagesObject,
            createMessageObject: createMessageObject,
            messagesContainsOneOfTypes: messagesContainsOneOfTypes,
            addAnchorsToWildcardArray: addAnchorsToWildcardArray,
            createSplunkDMessage: createSplunkDMessage,
            getSharingLabel: getSharingLabel,
            getPermissionLabel: getPermissionLabel,
            normalizeType: normalizeType,
            filterMessagesByTypes: filterMessagesByTypes,
            xhrErrorResponseParser: xhrErrorResponseParser,
            normalizeValuesForPOST: normalizeValuesForPOST,
            normalizeBooleanTo01String: normalizeBooleanTo01String,
            isExistingEntity: isExistingEntity,
            getHeaders: getHeaders,
            convertToSDKResponse: convertToSDKResponse
        };
    });
