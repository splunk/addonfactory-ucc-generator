/**
 * @author lbudchenko
 * @date 4/22/15
 *
 * Popup dialog for editing SAML configuration
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/FlashMessages',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup',
    'uri/route'
],

    function(
        $,
        _,
        Backbone,
        module,
        FlashMessages,
        Modal,
        ControlGroup,
        route
        ) {

        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME + ' edit-dialog-modal modal-wide',

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    this.model.saml.transposeToRest();
                    var saveDfd = this.model.saml.save();
                    if (saveDfd) {
                        saveDfd.done(_(function() {
                            this.trigger("samlSaved");
                            this.hide();
                        }).bind(this));
                    }
                },
                'click .upload-file-button': function(e) {
                    e.preventDefault();
                    this.$('#inputReference').click();
                },
                'click .apply-metadata-button': function(e) {
                    e.preventDefault();
                    this.model.controller.trigger('fetchMetadata', this.model.saml.get('metadata'));
                },
                'click .aqr-header': function(e) {
                    this.$('.aqr-header').toggleClass('icon-triangle-down');
                    this.$('.aqr-body').toggle();
                },
                'click .alias-header': function(e) {
                    this.$('.alias-header').toggleClass('icon-triangle-down');
                    this.$('.alias-body').toggle();
                }
            }),

            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
                options = options || {};

                // Create flash messages view
                this.children.flashMessagesView = new FlashMessages({
                    model: {
                        saml: this.model.saml,
                        metadata: this.model.samlMetadata
                    },
                    helperOptions: {
                        removeServerPrefix: true
                    }
                });

                // Create the form controls
                this.children.rawMetadata = new ControlGroup({
                    controlType: 'Textarea',
                    className: 'saml-rawmetadata control-group',
                    controlOptions: {
                        modelAttribute: 'metadata',
                        model: this.model.saml
                    },
                    controlClass: 'controls-block',
                    label: _('Metadata Contents').t()
                });

                this.children.idpSSOUrl = new ControlGroup({
                    controlType: 'Text',
                    className: 'saml-idpSSOUrl control-group',
                    controlOptions: {
                        modelAttribute: 'ui.idpSSOUrl',
                        model: this.model.saml
                    },
                    controlClass: 'controls-block',
                    tooltip: _('This is the protected endpoint on your IdP to which Splunk will send authentication requests.').t(),
                    label: _('Single Sign On (SSO) URL').t()
                });

                this.children.idpSLOUrl = new ControlGroup({
                    controlType: 'Text',
                    className: 'saml-idpSLOUrl control-group',
                    controlOptions: {
                        modelAttribute: 'ui.idpSLOUrl',
                        model: this.model.saml,
                        placeholder: _('optional').t()
                    },
                    controlClass: 'controls-block',
                    tooltip: _('This is the IdP protocol endpoint. If you do not provide this URL, the user will not be logged out.').t(),
                    label: _('Single Log Out (SLO) URL').t()
                });

                this.children.idpCertPath = new ControlGroup({
                    controlType: 'Text',
                    className: 'saml-idpCertPath control-group',
                    controlOptions: {
                        modelAttribute: 'ui.idpCertPath',
                        model: this.model.saml,
                        placeholder: _('optional').t()
                    },
                    controlClass: 'controls-block',
                    tooltip: _('Location of IdP certificate file or, if there are multiple IdP certificates, the directory where those certificates reside.').t(),
                    label: _('IdP certificate path').t(),
                    help: _('Leave blank if you store IdP certificates under $SPLUNK_HOME/etc/auth/idpCerts').t(),
                    enabled: !this.model.serverInfo.isCloud()
                });

                this.children.idpRepCerts = new ControlGroup({
                    controlType: 'SyntheticCheckbox',
                    className: 'saml-idpRepCerts control-group',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.replicateCertificates',
                        model: this.model.saml
                    },
                    label:  _('Replicate Certificates').t(),
                    tooltip: _('Replicate SAML IdP certificates in a Search Head Cluster. This setting will have no effect if search head clustering is disabled.').t()
                });

                this.children.idpCertChains = new ControlGroup({
                    controlType: 'Textarea',
                    className: 'saml-idpCertChains control-group',
                    controlOptions: {
                        modelAttribute: 'ui.idpCertChains',
                        model: this.model.saml
                    },
                    controlClass: 'controls-block',
                    tooltip: _('Upload the certificate chain in this order - root, intermediate(s) and leaf. This is to ensure that the saml response is verified with the correct chain of trust.').t(),
                    label: _('IdP certificate chains').t()
                });

                this.children.issuerId = new ControlGroup({
                    controlType: 'Text',
                    className: 'saml-issuerId control-group',
                    controlOptions: {
                        modelAttribute: 'ui.issuerId',
                        model: this.model.saml
                    },
                    controlClass: 'controls-block',
                    tooltip: _('Entity ID of IDP.').t(),
                    label: _('Issuer Id').t()
                });

                this.children.entityId = new ControlGroup({
                    controlType: 'Text',
                    className: 'saml-entityId control-group',
                    controlOptions: {
                        modelAttribute: 'ui.entityId',
                        model: this.model.saml
                    },
                    controlClass: 'controls-block',
                    tooltip: _('An identifier for this Splunk instance that is unique across all entities on the IdP.').t(),
                    label: _('Entity ID').t()
                });

                this.children.signAuthnRequest = new ControlGroup({
                    controlType: 'SyntheticCheckbox',
                    className: 'saml-signAuthnRequest control-group',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.signAuthnRequest',
                        model: this.model.saml
                    },
                    label:  _('Sign AuthnRequest').t()
                });

                this.children.signedAssertion = new ControlGroup({
                    controlType: 'SyntheticCheckbox',
                    className: 'saml-signedAssertion control-group',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.signedAssertion',
                        model: this.model.saml
                    },
                    tooltip: _('Enable this setting for verification of the signed SAML response against the IdP certificate.').t(),
                    label:  _('Verify SAML response').t()
                });

                this.children.idpAttributeQueryUrl = new ControlGroup({
                    controlType: 'Text',
                    className: 'saml-idpAttributeQueryUrl control-group',
                    controlOptions: {
                        modelAttribute: 'ui.idpAttributeQueryUrl',
                        model: this.model.saml
                    },
                    controlClass: 'controls-block',
                    tooltip: _('This is the endpoint on the IdP to which queries over SOAP should be sent.').t(),
                    label: _('Attribute query URL').t()
                });

                this.children.attributeQueryRequestSigned = new ControlGroup({
                    controlType: 'SyntheticCheckbox',
                    className: 'saml-attributeQueryRequestSigned control-group',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.attributeQueryRequestSigned',
                        model: this.model.saml
                    },
                    label:  _('Sign attribute query request').t()
                });

                this.children.attributeQueryResponseSigned = new ControlGroup({
                    controlType: 'SyntheticCheckbox',
                    className: 'saml-attributeQueryResponseSigned control-group',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.attributeQueryResponseSigned',
                        model: this.model.saml
                    },
                    label:  _('Sign attribute query response').t()
                });

                this.children.attributeAliasRole = new ControlGroup({
                    controlType: 'Text',
                    className: 'saml-attributeAliasRole control-group',
                    controlOptions: {
                        modelAttribute: 'ui.attributeAliasRole',
                        model: this.model.saml
                    },
                    controlClass: 'controls-block',
                    label: _('Role alias').t()
                });

                this.children.attributeAliasRealName = new ControlGroup({
                    controlType: 'Text',
                    className: 'saml-attributeAliasRealName control-group',
                    controlOptions: {
                        modelAttribute: 'ui.attributeAliasRealName',
                        model: this.model.saml
                    },
                    controlClass: 'controls-block',
                    label: _('RealName alias').t()
                });

                this.children.attributeAliasMail = new ControlGroup({
                    controlType: 'Text',
                    className: 'saml-attributeAliasMail control-group',
                    controlOptions: {
                        modelAttribute: 'ui.attributeAliasMail',
                        model: this.model.saml
                    },
                    controlClass: 'controls-block',
                    label: _('Mail alias').t()
                });

                this.children.attributeQuerySoapUsername = new ControlGroup({
                    controlType: 'Text',
                    className: 'saml-attributeQuerySoapUsername control-group',
                    controlOptions: {
                        modelAttribute: 'ui.attributeQuerySoapUsername',
                        model: this.model.saml
                    },
                    controlClass: 'controls-halfblock',
                    label: _('Username').t()
                });

                this.children.attributeQuerySoapPassword = new ControlGroup({
                    controlType: 'Text',
                    className: 'saml-attributeQuerySoapPassword control-group',
                    controlOptions: {
                        modelAttribute: 'ui.attributeQuerySoapPassword',
                        model: this.model.saml,
                        password: true
                    },
                    controlClass: 'controls-halfblock',
                    label: _('Password').t()
                });

                this.children.fqdn = new ControlGroup({
                    controlType: 'Text',
                    className: 'saml-fqdn control-group',
                    controlOptions: {
                        modelAttribute: 'ui.fqdn',
                        model: this.model.saml,
                        placeholder: _('optional').t()
                    },
                    controlClass: 'controls-block',
                    tooltip: _('Provide the host name or IP address. Required if you want to use load balancing.').t(),
                    label: _('Fully qualified domain name or IP of the load balancer').t()
                });

                this.children.redirectPort = new ControlGroup({
                    controlType: 'Text',
                    className: 'saml-redirectPort control-group',
                    controlOptions: {
                        modelAttribute: 'ui.redirectPort',
                        model: this.model.saml,
                        placeholder: _('optional').t()
                    },
                    controlClass: 'controls-block',
                    tooltip: _('Provide a redirect port for the load balancer.').t(),
                    label: _('Redirect port - load balancer port').t()
                });

                this.children.redirectAfterLogoutToUrl = new ControlGroup({
                    controlType: 'Text',
                    className: 'saml-redirectAfterLogoutToUrl control-group',
                    controlOptions: {
                        modelAttribute: 'ui.redirectAfterLogoutToUrl',
                        model: this.model.saml,
                        placeholder: _('optional').t()
                    },
                    controlClass: 'controls-block',
                    tooltip: _('URL to which the user will be redirected upon a logout.').t(),
                    label: _('Redirect to URL after logout').t()
                });

                this.children.ssoBinding = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    className: 'saml-ssoBinding control-group',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.ssoBinding',
                        model: this.model.saml,
                        items: [
                            { label: _("HTTP Post").t(), value: 'HTTPPost' },
                            { label: _("HTTP Redirect").t(), value: 'HTTPRedirect' }
                        ]
                    },
                    defaultValue: this.model.saml.get('ssoBinding'),
                    label:  _('SSO Binding').t(),
                    tooltip: _('The protocol binding to be used for the saml single on request sent to the IdP.').t()
                });

                this.children.sloBinding = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    className: 'saml-sloBinding control-group',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.sloBinding',
                        model: this.model.saml,
                        items: [
                            { label: _("HTTP Post").t(), value: 'HTTPPost' },
                            { label: _("HTTP Redirect").t(), value: 'HTTPRedirect' }
                        ]
                    },
                    defaultValue: this.model.saml.get('sloBinding'),
                    label:  _('SLO Binding').t(),
                    tooltip: _('The protocol binding to be used for the saml logout request sent to the IdP.').t()
                });

                this.children.signatureAlgorithm = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    className: 'saml-signatureAlgorithm control-group',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.signatureAlgorithm',
                        model: this.model.saml,
                        items: [
                            { label: _("SHA1").t(), value: 'RSA-SHA1' },
                            { label: _("SHA256").t(), value: 'RSA-SHA256' }
                        ]
                    },
                    defaultValue: this.model.saml.get('signatureAlgorithm'),
                    label:  _('Signature Algorithm').t(),
                    tooltip: _('Algorithm for signing saml single sign on request for HTTP Redirect Binding.').t()
                });

                this.children.nameIdFormat = new ControlGroup({
                    controlType: 'SyntheticSelect',
                    className: 'saml-nameIdFormat control-group',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.nameIdFormat',
                        model: this.model.saml,
                        items: [
                            { label: '--------------', value: ''},
                            { label: _('Transient').t(), value: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient'},
                            { label: _('Persistent').t(), value: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent'},
                            { label: _('Unspecified').t(), value: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified'},
                            { label: _('Email Address').t(), value: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'},
                            { label: _('X509 Subject Name').t(), value: 'urn:oasis:names:tc:SAML:1.1:nameid-format:X509SubjectName'},
                            { label: _('Windows Domain Qualified Name').t(), value: 'urn:oasis:names:tc:SAML:1.1:nameid-format:WindowsDomainQualifiedName'},
                            { label: _('Kerberos').t(), value: 'urn:oasis:names:tc:SAML:2.0:nameid-format:kerberos'},
                            { label: _('Entity').t(), value: 'urn:oasis:names:tc:SAML:2.0:nameid-format:entity'}
                        ],
                        popdownOptions: {
                            attachDialogTo: $('body')[0]
                        },
                        toggleClassName: 'btn'
                    },
                    defaultValue: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
                    label:  _('Name Id Format').t(),
                    tooltip: _('Leave this empty or pick what is configured on IDP.').t()
                });

                this.model.saml.entry.content.set('name', 'saml');

                this.model.controller.on('metadataComplete', function(model) {
                    // set form fields with data from the parsed metadata
                    this.model.saml.set('ui.signAuthnRequest', model.entry.content.get('signAuthnRequest'));
                    this.model.saml.set('ui.idpAttributeQueryUrl', model.entry.content.get('protocol_endpoints').idpAttributeQueryUrl);
                    this.model.saml.set('ui.idpSLOUrl', model.entry.content.get('protocol_endpoints').idpSLOUrl);
                    this.model.saml.set('ui.idpSSOUrl', model.entry.content.get('protocol_endpoints').idpSSOUrl);
                    this.model.saml.set('ui.issuerId', model.entry.content.get('issuerId'));
                    this.model.saml.set('ui.idpCertPath', model.entry.content.get('idpCertPath'));
                    this.model.saml.set('ui.idpCertificatePayload', model.entry.content.get('idpCertificatePayload'));
                }, this);

                this.listenTo(this.model.saml, 'change:ui.ssoBinding', function(e) {
                    this.model.saml.get('ui.ssoBinding') === 'HTTPRedirect' ?
                      this.$('.saml-signatureAlgorithm').show() :
                      this.$('.saml-signatureAlgorithm').hide();
                }, this);
            },

            updateSelectedFileLabel: function(filename) {
                if (filename) {
                    this.$('.source-label').text(filename);
                } else {
                    this.$('.source-label').text(_('No file selected').t());
                }
            },

            render: function() {
                var rootUrl = this.model.application.get('root');
                var locale = this.model.application.get('locale');
                var helpLink = route.docHelp(rootUrl, locale, 'learnmore.SAML.getstarted');
                var aqrUrl = this.model.saml.get('ui.idpAttributeQueryUrl');
                var aqrUsername = this.model.saml.get('ui.attributeQuerySoapUsername');
                var aqrPassword = this.model.saml.get('ui.attributeQuerySoapPassword');
                var showAqr = aqrUrl && aqrUsername && aqrPassword;
                var aliasRole = this.model.saml.get('ui.attributeAliasRole');
                var aliasRealname = this.model.saml.get('ui.attributeAliasRealName');
                var aliasMail = this.model.saml.get('ui.attributeAliasMail');
                var showAlias = aliasRole || aliasRealname || aliasMail;
                var showSignatureAlgorithm = this.model.saml.get('ui.ssoBinding') === 'HTTPRedirect';

                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_('SAML Configuration').t());
                this.$(Modal.BODY_SELECTOR).show();
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.$(Modal.BODY_FORM_SELECTOR).html(_(this.dialogFormBodyTemplate).template({
                    helpLink: helpLink,
                    spMetadataLink: route.spmetadata(rootUrl, locale),
                    isCloud: this.model.serverInfo.isCloud()
                }));
                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-view-placeholder"));
                this.children.rawMetadata.render().appendTo(this.$(".rawmetadata-placeholder"));
                this.children.idpSSOUrl.render().appendTo(this.$(".idpSSOUrl-placeholder"));
                this.children.idpSLOUrl.render().appendTo(this.$(".idpSLOUrl-placeholder"));
                this.children.idpCertPath.render().appendTo(this.$(".idpCertPath-placeholder"));
                this.children.idpCertChains.render().appendTo(this.$(".idpCertChains-placeholder"));
                this.children.idpRepCerts.render().appendTo(this.$(".idpRepCerts-placeholder"));
                this.children.issuerId.render().appendTo(this.$(".issuerId-placeholder"));
                this.children.entityId.render().appendTo(this.$(".entityId-placeholder"));
                this.children.signAuthnRequest.render().appendTo(this.$(".signAuthnRequest-placeholder"));
                this.children.ssoBinding.render().appendTo(this.$(".ssoBinding-placeholder"));
                this.children.sloBinding.render().appendTo(this.$(".sloBinding-placeholder"));
                this.children.signatureAlgorithm.render().appendTo(this.$(".signatureAlgorithm-placeholder"));
                this.children.signedAssertion.render().appendTo(this.$(".signedAssertion-placeholder"));
                this.children.idpAttributeQueryUrl.render().appendTo(this.$(".idpAttributeQueryUrl-placeholder"));
                this.children.attributeQueryRequestSigned.render().appendTo(this.$(".attributeQueryRequestSigned-placeholder"));
                this.children.attributeQueryResponseSigned.render().appendTo(this.$(".attributeQueryResponseSigned-placeholder"));
                this.children.attributeQuerySoapUsername.render().appendTo(this.$(".attributeQuerySoapUsername-placeholder"));
                this.children.attributeQuerySoapPassword.render().appendTo(this.$(".attributeQuerySoapPassword-placeholder"));
                this.children.attributeAliasRole.render().appendTo(this.$(".attributeAliasRole-placeholder"));
                this.children.attributeAliasRealName.render().appendTo(this.$(".attributeAliasRealName-placeholder"));
                this.children.attributeAliasMail.render().appendTo(this.$(".attributeAliasMail-placeholder"));
                this.children.fqdn.render().appendTo(this.$(".fqdn-placeholder"));
                this.children.redirectPort.render().appendTo(this.$(".redirectPort-placeholder"));
                this.children.redirectAfterLogoutToUrl.render().appendTo(this.$(".redirectAfterLogoutToUrl-placeholder"));
                this.children.nameIdFormat.render().appendTo(this.$(".nameIdFormat-placeholder"));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

                if (showAqr) {
                    this.$('.aqr-header').toggleClass('icon-triangle-down');
                } else {
                    this.$('.aqr-body').hide();
                }
                if (showAlias) {
                    this.$('.alias-header').toggleClass('icon-triangle-down');
                } else {
                    this.$('.alias-body').hide();
                }
                showSignatureAlgorithm ?
                  this.$('.saml-signatureAlgorithm').show() :
                  this.$('.saml-signatureAlgorithm').hide();
                if (_.isUndefined(this.model.saml.get('ui.replicateCertificates'))) {
                  this.model.saml.set('ui.replicateCertificates', true);
                }

                var that = this;
                this.$('#inputReference').on('change', function(e){
                    var file = e.target.files[0];
                    var reader = new FileReader();
                    var readerCallback = function(e) {
                        var metadata = e.target.result;
                        that.model.controller.trigger('fetchMetadata', metadata);
                    };
                    reader.onload = readerCallback;
                    reader.readAsText(file);

                    that.updateSelectedFileLabel(file.name);
                });

                return this;
            },

            dialogFormBodyTemplate: '\
                <% if (isCloud) { %>\
                <div>\
                    <p>\
                        <span class="warning-text"> <%- _("WARNING:").t() %> </span> \
                        <%- _("An error in configuring SAML could result in users and admins \
                        being locked out of Splunk Cloud. Use this link to access the local login \
                        and revert back to None for authentication if you are locked out:").t() %> \
                    </p>\
                    <p>\
                        <%- _("https://{name}.splunkcloud.com/en-US/account/login?loginType=splunk \
                        [replace {name} with your account name]").t() %>\
                    </p>\
                    <p>\
                        <%- _("Be sure to copy this information to a safe place before closing this window.").t() %>\
                    </p>\
                </div>\
                <br/>\
                <% } %>\
                <div class="flash-messages-view-placeholder"></div>\
                <p class="control-heading">\
                    <%- _("Configure SAML for Splunk.").t() %>\
                    <a href="<%- helpLink %>" class="external learnMoreLink" target="_blank"><%= _("Learn More").t() %></a>\
                </p>\
                <br/>\
                <p class="control-heading">\
                    <div class="section-desc"><%- _("Download the SPMetadata from Splunk and add it to your SAML environment to connect to Splunk.").t() %></div>\
                </p>\
                 <label class="control-label" style="display: inline-block;"><%= _("SP Metadata File").t() %></label>\
                 <a href="<%- spMetadataLink %>" class="btn download-file-button" target="_blank"><%- _("Download File").t() %></a>\
                <p class="control-heading">\
                    <div class="section-desc"><%- _("Import Identity Provider (IdP) metadata by browsing to an XML file, or copy and paste the information into the Metadata Contents text box.").t() %></div>\
                </p>\
                 <label class="control-label" style="display: inline-block;"><%= _("Metadata XML File").t() %></label>\
                 <a href="#" class="btn upload-file-button"><%= _("Select File").t() %></a>\
                 <span class="source-label"></span>\
                 <input type="file" id="inputReference" name="spl-file" style="display:none;"/>\
                <div class="rawmetadata-placeholder"></div>\
                <a href="#" class="btn btn-secondary apply-metadata-button"><%- _("Apply").t() %></a>\
                <div class="section-divider clearfix"></div>\
                <p class="control-heading">\
                    <strong><%- _("General Settings").t() %></strong>\
                </p>\
                <div class="idpSSOUrl-placeholder"></div>\
                <div class="idpSLOUrl-placeholder"></div>\
                <div class="idpCertPath-placeholder"></div>\
                <div class="idpCertChains-placeholder"></div>\
                <div class="idpRepCerts-placeholder"></div>\
                <div class="issuerId-placeholder"></div>\
                <div class="entityId-placeholder"></div>\
                <div class="signAuthnRequest-placeholder"></div>\
                <div class="signedAssertion-placeholder"></div>\
                <p class="control-heading aqr-header icon-triangle-right">\
                    <strong><%- _("Attribute Query Requests").t() %></strong>\
                </p>\
                <div class="aqr-body">\
                    <div class="section-desc"><%- _("Attribute query requests are required for scheduled searches.").t() %></div>\
                    <div class="idpAttributeQueryUrl-placeholder"></div>\
                    <div class="attributeQueryRequestSigned-placeholder"></div>\
                    <div class="attributeQueryResponseSigned-placeholder"></div>\
                    <div class="attributeQuerySoapUsername-placeholder"></div>\
                    <div class="attributeQuerySoapPassword-placeholder"></div>\
                </div>\
                <p class="control-heading alias-header icon-triangle-right">\
                    <strong><%- _("Alias").t() %></strong>\
                </p>\
                <div class="alias-body">\
                    <div class="attributeAliasRole-placeholder"></div>\
                    <div class="attributeAliasRealName-placeholder"></div>\
                    <div class="attributeAliasMail-placeholder"></div>\
                </div>\
                <p class="control-heading">\
                    <strong><%- _("Advanced Settings").t() %></strong>\
                </p>\
                <div class="nameIdFormat-placeholder"></div>\
                <div class="fqdn-placeholder"></div>\
                <div class="redirectPort-placeholder"></div>\
                <div class="redirectAfterLogoutToUrl-placeholder"></div>\
                <div class="ssoBinding-placeholder"></div>\
                <div class="signatureAlgorithm-placeholder"></div>\
                <div class="sloBinding-placeholder"></div>\
            '
        });
    });
