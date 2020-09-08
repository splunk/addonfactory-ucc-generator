define(
	[
		'jquery',
		'underscore',
		'backbone',
		'models/managementconsole/DmcBase'
	],
	function(
		$,
		_,
		Backbone,
		DmcBaseModel
	) {
		var MORE_THAN_ONE_STANZA = _("Please edit only one stanza at a time.").t();

		return DmcBaseModel.extend({
			url: '/services/dmc/stanzas-meta',

			parseTextToAttr: function(text) {
                var dfd = $.Deferred();

                if (text.trim() !== '') {
					var parseDfd = $.ajax({
						method: 'POST',
						contentType: 'text/plain',
						url: this.url() + '/parser',
						data: text.trim()
					}); 

    				parseDfd.done(function(response) {
    					// Ensure there is one result
    					if (!_.isArray(response) || response.length !== 1) {
                            // if response is an empty array ([]) passed from the endpoint, set stanza name to default
                            // this would only happen if '[default]' was passed to the endpoint to be parsed
                            if (response.length === 0) {
                                dfd.resolve({name: 'default', local: []});
                            } else {
                                dfd.reject({
                                    responseText: JSON.stringify({
                                        error: {message: MORE_THAN_ONE_STANZA}
                                    })
                                });
                            }
    					} else {
    						dfd.resolve(response[0]);
    					}
    				}).fail(function(response) {
    					dfd.reject(response);
    				});
                } else {
                    dfd.resolve({name: '', local: []});
                }

				return dfd;
			},

            parseAttrToText: function(name, local) {
            	if (name || (local && local.length > 0)) {
	                var data = {
	                        name: name || '',
	                        local: local || []
	                    },
	                    parseDfd = $.ajax({
	                        method: 'POST',
	                        contentType: 'application/json',
	                        url: this.url() + '/parser',
	                        data: JSON.stringify(data)
	                    });

	                return parseDfd;
	            } else {
	            	var dfd = $.Deferred();
	            	dfd.resolve('');
	            	return dfd;
	            }
            }
		});
	}
);