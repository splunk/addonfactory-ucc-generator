define(
    [
		'jquery',
		'backbone',
		'util/splunkd_utils',
		'models/Base',
		'models/SplunkDBase',
		'underscore',
		'splunk.util'
    ],
    function($, Backbone, splunkd_utils, BaseModel, SplunkDBaseModel, _, splunkUtil) {
        /**
         * @constructor
         * @memberOf models
         * @name SavedSearch
         * @extends models.Base
         */
        var Embed = BaseModel.extend(/** @lends models.SavedSearch.prototype */{
            initialize: function(attributes, options) {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            sync: function(method, model, options) {
                var defaults = {
                    data: {
                        output_mode: 'json'
                    }
                };
                switch(method) {
                    case 'update':
                        defaults.processData = true;
                        defaults.type = 'POST';
                        defaults.url = splunkd_utils.fullpath(model.id);
                        $.extend(true, defaults, options);
                        break;
                    default:
                        throw new Error('invalid method: ' + method);
                }
                return Backbone.sync.call(this, method, model, defaults);
            }
        });
        var URL = 'saved/searches';
        return SplunkDBaseModel.extend({
            url: URL,
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
                this.on('change:id', function() {
                    var shareLink,
                        unshareLink;
                    if (this.id) {
                        shareLink = this.id + '/embed';
                        unshareLink = this.id + '/unembed';
                    }
                    this.embed.set('id', shareLink);
                    this.unembed.set('id', unshareLink); 
                }, this);
                this.embed.on('sync', function() {
                    this.safeFetch();
                }, this);
                this.unembed.on('sync', function() {
                    this.safeFetch();
                }, this);
            },
            initializeAssociated: function() {
                SplunkDBaseModel.prototype.initializeAssociated.apply(this, arguments);
                this.embed = this.embed || new this.constructor.Embed();
                this.associated.embed = this.embed;
                this.unembed = this.unembed || new this.constructor.Embed();
                this.associated.unembed = this.unembed;
            },
            parse: function(response, options) {
                options = options || {};
                response = this.migrateAttributes(response, options);
                _.extend(options, {skipClone: true});
                this.initializeAssociated();
                if (splunkd_utils.isExistingEntity(response)) { 
                    var id = response.entry[0].links.alternate;
                    this.embed.set('id', id + '/embed');
                    this.unembed.set('id', id + '/unembed'); 
                }
                return SplunkDBaseModel.prototype.parse.call(this, response, options);
            },
            setFromSplunkD: function(payload, options) {
                options = options || {};
                payload = this.migrateAttributes(payload, options);
                _.extend(options, {skipClone: true});
            	if (splunkd_utils.isExistingEntity(payload)) {
                    var id = payload.entry[0].links.alternate;  
                    this.embed.set('id', id + '/embed');
                    this.unembed.set('id', id + '/unembed');
                }
                return SplunkDBaseModel.prototype.setFromSplunkD.call(this, payload, options);
            },
            migrateAttributes: function(response, options) {
                options = options || {};
                if (!options.skipClone) {
                    response = $.extend(true, {}, response);
                }
                
                if (response && response.entry && response.entry[0].content) {
                    var content = response.entry[0].content,
                        format = content['action.email.format'];

                    if (_.indexOf(['html', 'plain', 'pdf'], format) != -1) {
                        // for backwards compatibility for SPL-79585
                        response.entry[0].content['action.email.format'] = 'table';
                        if (format !== 'pdf') {
                            response.entry[0].content['action.email.content_type'] = format;
                        }
                    } else if (format ==='csv' && splunkUtil.normalizeBoolean(content['action.email.sendresults']) &&
                            !(splunkUtil.normalizeBoolean(content['action.email.sendcsv']) ||
                                splunkUtil.normalizeBoolean(content['action.email.sendpdf']) ||
                                splunkUtil.normalizeBoolean(content['action.email.inline']))) {
                        // for backwards compatibility for SPL-79561
                        response.entry[0].content['action.email.sendcsv'] = '1';
                    }
                }
                return response;
            }
        }, 
        {
            Embed: Embed,
            buildId: function(name, app, owner, sharing) {
                if (sharing === splunkd_utils.APP || sharing === splunkd_utils.GLOBAL) {
                    owner = splunkd_utils.NOBODY;
                } else if (sharing === splunkd_utils.SYSTEM) {
                    owner = splunkd_utils.NOBODY;
                    app = splunkd_utils.SYSTEM;
                }
                
                return '/servicesNS/' + encodeURIComponent(owner) +
                        '/' + encodeURIComponent(app) + '/' + URL + '/' + encodeURIComponent(name);
            }
        });
    }
);
