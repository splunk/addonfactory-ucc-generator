define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'helpers/managementconsole/url',
        'views/shared/Modal',
        './ForwarderSetupDialog.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        urlHelper,
        Modal,
        css
    ) {
        return Modal.extend({
            moduleId: module.id,
            className: [Modal.CLASS_NAME, 'modal-wide', 'fwd-setup-dialog'].join(' '),

            initialize: function(options) {
                Modal.prototype.initialize.call(this, options);

                this.listenTo(this.model.forwarderSetup, 'sync', this.debouncedRender);
            },

            events: $.extend({}, Modal.prototype.events, {
				'click .nix-tab a': function(e) {
					e.preventDefault();
					this.$('.windows-tab').removeClass('active');
					this.$('.pre70-tab').removeClass('active');
					this.$('.nix-tab').addClass('active');
					this.$('.windows-forwarders').hide();
					this.$('.pre70-forwarders').hide();
					this.$('.nix-forwarders').show();
				},

				'click .windows-tab a': function(e) {
					e.preventDefault();
					this.$('.windows-tab').addClass('active');
					this.$('.pre70-tab').removeClass('active');
					this.$('.nix-tab').removeClass('active');
					this.$('.windows-forwarders').show();
					this.$('.pre70-forwarders').hide();
					this.$('.nix-forwarders').hide();
				},
				'click .pre70-tab a': function(e) {
					e.preventDefault();
					this.$('.windows-tab').removeClass('active');
					this.$('.pre70-tab').addClass('active');
					this.$('.nix-tab').removeClass('active');
					this.$('.windows-forwarders').hide();
					this.$('.pre70-forwarders').show();
					this.$('.nix-forwarders').hide();
				}  				
            }),
            
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_.escape(_("Forwarder Setup").t()));
                this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
                    serverName: this.model.forwarderSetup.entry.content.get('serverName'),
                    mgmtPort: this.model.forwarderSetup.entry.content.get('mgmtHostPort'),
                    dsPassword: this.model.forwarderSetup.entry.content.get('dsClearPassword'),
                    isAuthenticated: this.model.forwarderSetup.entry.content.get('requireAuthentication'),
                    sslVerifyServerCert: this.model.forwarderSetup.entry.content.get('sslVerifyServerCert'),
                    sslPackagedCaCertFile: this.model.forwarderSetup.entry.content.get('sslPackagedCaCertFile'),
                    sslAppCaCertFile: this.model.forwarderSetup.entry.content.get('sslAppCaCertFile'),
                    sslCommonName: this.model.forwarderSetup.entry.content.get('sslCommonName'),
                    helpLink: urlHelper.docUrl('learnmore.fm.setup')
                }));

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DONE);
                
				this.$('.nix-tab').addClass('active');
				this.$('.windows-tab').removeClass('active');
				this.$('.pre70-tab').removeClass('active');
				this.$('.nix-forwarders').show();				
				this.$('.windows-forwarders').hide();
				this.$('.pre70-forwarders').hide();
				
                return this;
            },

            template: '\
	            <div><%- _("Follow these setup instructions for your forwarder version and operating system.").t() + "  "%>\
	            <span class="text-bold"><%- _("Splunk Cloud Forwarder Management is supported for Splunk forwarders 6.5.0 or later.").t()%> </span>\
    			<%- _("You need access to the Splunk CLI on your forwarder to execute the commands below.").t() + "  "%>\
    			<a class="external" href="<%- helpLink %>" target="_blank">\
    			<%- _("Learn more.").t()%>\
    			</a>\
            	</div><br>\
	            <ul class="nav nav-tabs main-tabs">\
	                <li class="nix-tab">\
	                    <a href="#nix-forwarders" data-toggle="tab"><%- _("*nix Forwarders").t() %></a>\
	                </li>\
	                <li class="windows-tab">\
	                    <a href="#windows-forwarders" data-toggle="tab"><%- _("Windows Forwarders").t() %></a>\
	                </li>\
	                <li class="pre70-tab">\
	                	<a href="#pre70-forwarders" data-toggle="tab"><%- _("Manual Setup").t() %></a>\
	                </li>\
	        	</ul>\
	            <div class="tab-content">\
	            	<div class="tab-pane nix-forwarders">\
            			<ol class="instruction-list">\
            			    <li style="padding-top: 5px;padding-bottom: 5px">Download the Splunk universal forwarder from\
                                <a class="doc-link" href="http://www.splunk.com/download/universalforwarder" target="_blank"> Splunk Downloads web page <i class="icon-external"></i></a> . Install and start the universal forwarder on one or more machines in your network.\
                            </li>\
	                		<li class="fwd-setup-item"><%- _("Run the following command from the").t() + " "%><span class="fwd-setup-location">$SPLUNK_HOME/bin</span><%-" " + _("directory on your forwarder. Your forwarder will be restarted.").t()%>\
                                <div class="fwd-setup-stanza"><pre>./splunk set deploy-poll <%- serverName %>:<%- mgmtPort %><%if (isAuthenticated) {%> -pass4SymmKey <%- dsPassword %> <%}%> <%if (sslVerifyServerCert) {%>-verifyServerCert <%- sslVerifyServerCert %> -caCertFile \'<%- sslPackagedCaCertFile %>\' -commonNameToCheck <%- sslCommonName %> -sslVersions tls1.2 <%}%>&& ./splunk restart</pre></div>\
                            </li>\
	        				<li>\
	        					<%- _("Your forwarder should connect and show up on this page shortly after the restart.").t()%>\
	        				</li>\
            			</ol>\
            		</div>\
            		<div class="tab-pane windows-forwarders">\
            			<ol class="instruction-list">\
            			    <li style="padding-top: 5px;padding-bottom: 5px">Download the Splunk universal forwarder from\
                                <a class="doc-link" href="http://www.splunk.com/download/universalforwarder" target="_blank"> Splunk Downloads web page <i class="icon-external"></i></a> . Install and start the universal forwarder on one or more machines in your network.\
                            </li>\
	        				<li class="fwd-setup-item"><%- _("Run the following command from the").t() + " "%><span class="fwd-setup-location">%SPLUNK_HOME%\\bin</span><%-" " + _("directory on your forwarder. Your forwarder will be restarted.").t()%>\
                                <div class="fwd-setup-stanza"><pre>splunk.exe set deploy-poll <%- serverName %>:<%- mgmtPort %><% if (isAuthenticated) {%> -pass4SymmKey <%- dsPassword %> <%}%> <%if (sslVerifyServerCert) {%>-verifyServerCert <%- sslVerifyServerCert %> -caCertFile "<%- sslPackagedCaCertFile %>" -commonNameToCheck <%- sslCommonName %> -sslVersions tls1.2 <%}%>&& splunk.exe restart</pre></div>\
	            			</li>\
							<li>\
								<%- _("Your forwarder should connect and show up on this page shortly after the restart.").t()%>\
							</li>\
            			</ol>\
            		</div>\
            		<div class="pre70-forwarders">\
    					<ol class="instruction-list">\
    					    <li style="padding-top: 5px;padding-bottom: 5px">Download the Splunk universal forwarder from\
                                <a class="doc-link" href="http://www.splunk.com/download/universalforwarder" target="_blank"> Splunk Downloads web page <i class="icon-external"></i></a> . Install and start the universal forwarder on one or more machines in your network.\
                            </li>\
							<li class="fwd-setup-item"><%- _("Create or edit").t() + " " %><span class="fwd-setup-location">$SPLUNK_HOME/etc/system/local/deploymentclient.conf</span><%- " " + _("on the forwarder to add the following stanza:").t() + " "%>\
							    <pre class="fwd-setup-stanza">[target-broker:deploymentServer]\
							    <br>targetUri = <%- serverName %>:<%- mgmtPort %>\
							    <%if (sslVerifyServerCert) {%><br>\
							        <br>[deployment-client]\
                                    <br>sslVerifyServerCert = <%- sslVerifyServerCert %>\
                                    <br>sslCommonNameToCheck = <%- sslCommonName %>\
                                    <br>sslVersions = tls1.2\
                                    <br>caCertFile = <%- sslPackagedCaCertFile %>\
                                <%}%></pre>\
						    </li>\
            				<% if (isAuthenticated) { %>\
            					<li class="fwd-setup-item"><%- _("Create or edit").t() + " " %><span class="fwd-setup-location">$SPLUNK_HOME/etc/system/local/server.conf</span><%- " " + _("on the forwarder to add the following stanza:").t() + " "%><pre class="fwd-setup-stanza">[deployment]<br>pass4SymmKey = <%- dsPassword %></pre></li>\
                			<% } %>\
        	    			<li class="fwd-setup-item"><%- _("Restart your forwarder with the following command:").t() + " "%>\
            					<div><br><%-_("For a *nix forwarder, in").t()%> <span class="fwd-setup-location">$SPLUNK_HOME/bin</span></div>\
            					<div><pre class="fwd-setup-stanza">./splunk restart</pre></div>\
            					<div><%-_("For a Windows forwarder, in").t()%> <span class="fwd-setup-location">%SPLUNK_HOME%\\bin</span>\
            					</div><pre class="fwd-setup-stanza">splunk.exe restart</pre>\
            				</li>\
							<li>\
								<%- _("Your forwarder should connect and show up on this page shortly after the restart.").t()%>\
							</li>\
            			</ol>\
            		</div>\
	            </div>\
            '
        });
    }
);