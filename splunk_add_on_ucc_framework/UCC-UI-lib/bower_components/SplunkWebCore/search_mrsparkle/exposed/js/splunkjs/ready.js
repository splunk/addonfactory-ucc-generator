define(function(require, exports, module) {    
    var $ = require('jquery');
    var _ = require('underscore');
    var console = require('util/console');
    var mvc = require('splunkjs/mvc');
    var sdk = require('splunkjs/splunk');
    var sharedModels = require('splunkjs/mvc/sharedmodels');
    var Splunk = require('splunk');
    var splunkConfig = require('splunk.config');
    var TokenAwareModel = require('splunkjs/mvc/tokenawaremodel');

    // The current session key.
    // NOTE: Keep this module-private to prevent session token theft.
    var activeSessionKey = null;
    
    // NOTE: This function can potentially be called multiple times.
    // loginLoad cannot be called multiple times and will 
    // return on any repeated calls
    var ready = function(name, req, onLoad, config) {
        req = req || ready._getRequire();
        
        // Dependencies to be filled in depending on what is needed on the page
        var deps = [];
        
        // Find all the components that were existent as DOM elements,
        // and add their dependencies, but only for ones that haven't
        // been initialized yet
        $('[data-require]:not([data-initialized])').each(function() {
            var $this = $(this);
            deps.push($this.attr('data-require'));
        });
        
        req(deps, function() {
            ready._enableComponentDivs(mvc);
            ready._enableTokenSafeSpans(mvc, _, TokenAwareModel, console);
            
            // If in independent mode, login
            // else initiate the callback
            if (splunkConfig.INDEPENDENT_MODE) {
                login.loginLoad(name, req, onLoad, config);
            }
            else {
                // Signal that the splunkjs/ready! plugin is finished loading
                onLoad(mvc);
            }
        });
    };
    
    ready.load = function(name, req, onLoad, config) {
        if (config.isBuild) {
            onLoad(null);
        }
        else {
            ready(name, req, onLoad, config);
        }
    };
    
    // === _enableComponentDivs ===
    
    /*
     * Locates all Django-style component divs on the page and
     * instantiates the appropriate components for them.
     */
    ready._enableComponentDivs = function(mvc) {            
        // Instantiate all views that we haven't instantiated yet
        var views = $('.splunk-view:not([data-initialized])');
        _.each(views, function(el, idx) {
            var site = $(el);
            var id = site.attr('id');
            var requiredFile = site.data('require');
            
            if (!requiredFile) {
                return;
            }
            
            var options = _decodeOptions(site, mvc);
            
            options.id = id;
            options.el = site;
            
            var Constructor = ready._getRequire()(requiredFile);
            var view = new Constructor(options);
            view.render();
            
            site.attr('data-initialized', '');
        });
        
        // Instantiate all components that we haven't instantiated yet
        var managers = $('.splunk-manager:not([data-initialized])');
        _.each(managers, function(el, idx) {
            var site = $(el);
            var id = site.attr('id');
            var requiredFile = site.data('require');
            
            if (!requiredFile) {
                return;
            }
            
            var options = _decodeOptions(site, mvc);
            
            options.id = id;
            
            var Constructor = ready._getRequire()(requiredFile);
            var manager = new Constructor(options);
            
            site.attr('data-initialized', '');
        });
    };
    
    var _decodeOptions = function($el, mvc) {
        var options = {};
        var optionsString = $el.attr('data-options');
        if (optionsString && optionsString.length > 0) {
            options = JSON.parse(optionsString);
            _.each(options, function(v, k) {
                options[k] = _decodeOptionValue(v, mvc);
            });
        }
        return options;
    };
    
    var _decodeOptionValue = function(optionValue, mvc) {
        // Treat falsy values as literal values
        if (!optionValue) {
            return optionValue;
        }
        
        switch (optionValue.type) {
            case 'token_safe':
                return mvc.tokenSafe(optionValue.value);
            case undefined:
                // Literal value
                return optionValue;
            default:
                throw Error('Unrecognized option value type: ' + optionValue.type);
        }
    };
    
    // === _enableTokenSafeSpans ===
    
    /*
     * Locates all <span class="splunk-tokensafe" ...> elements initially on the
     * page and wires them to be automatically updated when the associated
     * template changes.
     */
    ready._enableTokenSafeSpans = function(mvc, _, TokenAwareModel, console) {
        _.each($('.splunk-tokensafe:not([data-initialized])'), function(siteView) {
            var template = $(siteView).data('value');
            if (!template) {
                console.warn(
                    'Ignoring .splunk-tokensafe element with missing ' +
                    'data-value attribute.');
                return;
            }
            
            var siteModel = new TokenAwareModel({
                'value': mvc.tokenSafe(template)
            });
            
            var updateSiteView = function() {
                $(siteView).text(siteModel.get('value'));
            };
            
            // Keep site updated when template resolves to
            // different literal strings
            updateSiteView();
            siteModel.on('change:value', updateSiteView);
            
            $(siteView).attr('data-initialized', '');
        });
    };


    ready._getRequire = function () {
        /* jshint undef: false */

        //returns 'require', whether webpack is parsing this or not
        return typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__ : require;
    };

    ready._setSessionKey = function(key) {
        activeSessionKey = key;
    };

    // This object is called upon to handle authentication logic
    // in independent mode.
    var login = {
        // This is used as a guard for loginLoad to check and return
        // if it has been called multiple times
        _wasCalled: false,

        loginLoad: function(name, req, onLoad, config) {
            // This function can only be called once meaningfully
            // if it is called more than once, it returns without
            // doing anything. 
            if (login._wasCalled) {
                onLoad(mvc);
            }
            login._wasCalled = true;

            // Check that Authentication is provided and return otherwise.
            if (!splunkConfig.AUTHENTICATE) {
                // No authentication provided
                throw new Error('Could not authenticate. No login information');
            }
            
            // Lookup the authentication function from the global config.
            var authFunction = null;
            if (_.isFunction(splunkConfig.AUTHENTICATE)) {
                authFunction = splunkConfig.AUTHENTICATE;  
            }
            else if (_.isObject(splunkConfig.AUTHENTICATE)) {
                // If the global config specifies a {username, password} dictionary
                // in lieu of a function, create a default authenticate function
                // that tries to login with the provided credentials.
                
                if (!splunkConfig.AUTHENTICATE.username || !splunkConfig.AUTHENTICATE.password) {
                    throw new Error('Could not log in. Missing username/password');
                }
                    
                authFunction = function(done) {
                    var http = null;
                    if (splunkConfig.SPLUNKD_IS_PROXIED) {
                        http = new sdk.ProxyHttp(splunkConfig.SPLUNKD_PATH);
                    }
                    else {
                        http = new splunkjs.JQueryHttp();
                    }
                        
                    var service = new sdk.Service(http, {
                        username: splunkConfig.AUTHENTICATE['username'],
                        password: splunkConfig.AUTHENTICATE['password'],
                        scheme: splunkConfig.SCHEME,
                        host: splunkConfig.HOST, 
                        port: splunkConfig.PORT 
                    });

                    service.login(function(err) {
                        var key = service.sessionKey;
                        done(err, {sessionKey: key, username: splunkConfig.AUTHENTICATE['username']});
                    });
                };
            }
            else {
                throw new Error('Could not authenticate. Invalid login information');
            }
            
            // Install prefilters
            login._installAmbientAuthenticationPrefilter();
            login._installSessionTimeoutPrefilter(authFunction);

            // Try to authenticate. 
            // This calls the authFunction with a callback that 
            // takes err, and a dictionary containing the 
            // username and the session key, ex:
            // {username: 'foo', sessionKey: 'adfklajfdlkadfj'}
            authFunction(function(err, credentialsDict) {
                if (err) {
                    onLoad.error(new Error('Login failed. Authenticate(done) received an error'));
                    return;
                }
                if (!credentialsDict || !credentialsDict.sessionKey || !credentialsDict.username) {
                    onLoad.error(new Error('Login failed. Authenticate did not provide a username or sessionKey'));
                    return;
                }

                // Save the session key for future use
                activeSessionKey = credentialsDict.sessionKey;
                mvc._setSessionKey(activeSessionKey);

                // Set the username
                splunkConfig.USERNAME = credentialsDict.username;
                splunkConfig.USER_DISPLAYNAME = credentialsDict.username;

                // Shared models has already been created, but use of the 'app'
                // model relies on the username, which is not valid until now
                // here we update the username to a valid value. This happens
                // before ready completes and therefore, before it the shared model
                // is meaningfully accessed 
                sharedModels._setAppOwner(credentialsDict.username);

                // Need a service to get timezone info
                var tzService = mvc.createService().get('/services/search/timeparser/tz', null, function(err, response) {
                    if (err) {
                        onLoad.error(new Error('Login failed. Unable to retrieve timezone information from splunk server.'));
                        return;
                    }

                    splunkConfig.SERVER_ZONEINFO = response.data;

                    // We set this because the timerange shim does. 
                    Splunk.namespace('Globals');
                    Splunk.Globals.timeZone = new Splunk.TimeZone(response.data);

                    // Signal that the splunkjs/ready! plugin is finished loading
                    onLoad(mvc);
                });
            });
        },
        
        // Add Authorization and X-ProxyDestination headers to requests made to
        // the proxy that don't already have such headers.
        _installAmbientAuthenticationPrefilter: function() {
            $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
                // Passthru requests that aren't for splunkd
                if (options.url.indexOf(splunkConfig.SPLUNKD_PATH) !== 0) {
                    return;
                }

                if (!options.headers) {
                    options.headers = {};
                }
                
                // Fill out the 'Authorization' header
                if (activeSessionKey) {
                    if (!options.headers.hasOwnProperty('Authorization')) {
                        options.headers['Authorization'] = 'Splunk ' + activeSessionKey;
                    }
                }

                // If we are proxied, add a desitnation header
                if (splunkConfig.SPLUNKD_IS_PROXIED) {
                    if (!options.headers.hasOwnProperty('X-ProxyDestination')) {
                        // Else fill out the 'X-ProxyDestination' header
                        var targetUrl = options.url.substring(splunkConfig.SPLUNKD_PATH.length);
                        if (options.data) {
                            // JQuery moves form query parameters from the
                            // request content to the URL before sending the final
                            // request. Perform the same transformation on the
                            // target URL for the proxy so that form query 
                            // parameters aren't lost.
                            targetUrl += '?' + options.data;
                        }
                        options.headers['X-ProxyDestination'] = 
                            splunkConfig.SCHEME + '://' + 
                            splunkConfig.HOST + ':' + splunkConfig.PORT + 
                            targetUrl;
                    }
                }
                else {
                    delete options.headers['X-ProxyDestination'];
                }
            });
        },
        
        // Intercept requests to the proxy that receive an HTTP 401 Unauthorized
        // response. If this happens, enqueue all subsequent requests and try
        // to reauthenticate. Upon reauthentication success, resume all enqueued
        // requests with the new session key.
        _installSessionTimeoutPrefilter: function(authFunction) {
            // If a reauthentication function is provided, set it. 
            // otherwise we wrap the original authentication function
            var sessionTimeoutFunction = splunkConfig.ON_SESSION_EXPIRED || function(auth, done) { auth(done); };

            // Stores whether there is authentication pending
            var authPending = false;

            // A list of requests waiting for authentication
            var waiting = [];

            // Add a request filter. This is largely based on explanation and 
            // code for reauthentication found here: 
            // http://stackoverflow.com/questions/11793430/retry-a-jquery-ajax-request-which-has-callbacks-attached-to-its-deferred
            $.ajaxPrefilter(function(options, originalOptions, jqXHR) {

                // Decrement remaining retries, or initialize to 1.
                originalOptions._retry = isNaN(originalOptions._retry)
                    ? 1
                    : originalOptions._retry - 1;

                // Requests that are not meant for splunkd are passed through
                if (options.url.indexOf(splunkConfig.SPLUNKD_PATH) !== 0) {
                    return;
                }

                // There is an implicit assumption that the success/error callbacks
                // get invoked prior to any promise .rejected()/.done() callbacks, which is why
                // we save them and then call them explicitly, rather than queuing
                // them as promise callbacks themselves.
                // This is specifically because Backbone uses 'success' when
                // fetching models, and assumes that any promise callback is invoked
                // after this. Unfortunately, prefilter happens prior to the handling
                // of success/error, thus causing us to need to reorder here.

                // Save the original error/success callback for later
                // in case some other prefilter clobbers it
                originalOptions._error = originalOptions.error;
                originalOptions._success = originalOptions.success;

                // Overwrite *current request* success/error callback
                options.error = $.noop();
                options.success = $.noop();

                var dfd = $.Deferred();

                // Here is where we call the success function explicitly
                // before resolving the promise. 
                jqXHR.done(function() {
                    var args = Array.prototype.slice.call(arguments);
                    if (originalOptions._success) {
                        originalOptions._success.apply(this, arguments);
                    }
                    dfd.resolveWith(jqXHR, args);
                });

                // If the request fails, do something else
                // yet still resolve
                jqXHR.fail(function() {
                    var args = Array.prototype.slice.call(arguments);

                    // On 401 we put the request on the waiting queue.
                    // If there is no authentication call pending, we start one
                    if (jqXHR.status === 401 && originalOptions._retry > 0) {
                        // Put this request in waiting
                        waiting.push({storedOptions: originalOptions, storedDfd: dfd});
                        
                        // If no auth pending, start one
                        if (!authPending) {
                            authPending = true;

                            // Try to reauthenticate
                            sessionTimeoutFunction(authFunction, function(err, credentialsDict) {
                                if (err) {
                                    throw new Error('Authentication attempt failed');
                                }

                                authPending = false;

                                // Save the session key for future use
                                activeSessionKey = credentialsDict.sessionKey;
                                mvc._setSessionKey(activeSessionKey);

                                // Set the username
                                splunkConfig.USERNAME = credentialsDict.username;
                                splunkConfig.USER_DISPLAYNAME = credentialsDict.username;

                                // Update the sharedmodel username
                                sharedModels._setAppOwner(credentialsDict.username);

                                // Resend the requests that were waiting
                                _.each(waiting, function(pending) { 
                                    // Change authentication headers to the new sessionKey
                                    pending.storedOptions.headers = pending.storedOptions.headers || {};
                                    pending.storedOptions.headers.Authorization = 'Splunk ' + activeSessionKey;
                                    // And re-send the request
                                    $.ajax(pending.storedOptions).then(pending.storedDfd.resolve, pending.storedDfd.reject);
                                });
                                waiting = [];
                            });
                        }                                
                    } else {
                        // This mirrors the success case. We call the original 
                        // error explicitly before rejecting the promise.
                        if (originalOptions._error) {
                            originalOptions._error.apply(this, arguments);  
                        }
                        dfd.rejectWith(jqXHR, args);
                    }
                });

                // Now override the jqXHR's promise functions with our deferred
                return dfd.promise(jqXHR);
            });
        }
    };
    
    return ready;
});