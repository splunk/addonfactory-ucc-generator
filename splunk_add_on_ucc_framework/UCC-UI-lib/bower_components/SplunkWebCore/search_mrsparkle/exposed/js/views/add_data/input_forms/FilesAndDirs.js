define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'splunk.util',
        'util/splunkd_utils',
        'views/shared/Faq',
        'models/config',
        'collections/shared/FlashMessages',
        'uri/route',
		'contrib/text!views/add_data/input_forms/FilesAndDirs.html'
    ],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        ControlGroup,
        FlashMessagesView,
        splunkUtil,
        splunkDUtils,
        Faq,
        ConfigModel,
        FlashMessagesCollection,
        route,
        template
    ) {
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            events: {
                'click .control': function() {
                    // reset error messages
                    if (this.children.flashMessages.flashMsgCollection.length) {
                        // reset validation redness
                        this.model.input.trigger('validated', true, this.model.input, []);
                        this.flashMsgHelper.removeGeneralMessage(this.FILE_WARNING_MESSAGE);
                    }
                }
            },
            initialize: function (options) {

                BaseView.prototype.initialize.apply(this, arguments);

                this.FILE_WARNING_MESSAGE = 'FILE_WARNING_MESSAGE';

                // setting defaults
                var defaults = {
                    continuouslyMonitor:  1
                };
                _.defaults(this.model.input.attributes, defaults);

                if (this.model.input){
                    //clear set sourcetype so datapreview autodetection will work on next run
                    this.model.input.unset('ui.sourcetype');
                }

                if(this.model.previewPrimer){
                    //need to ignore previous SID to cause new preview cycle based on selected file
                    this.model.previewPrimer.unset('sid');
                }

                var wildcardHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.wildcard'
                );

                var whitelistblacklistHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.whitelistblacklist'
                );

                var faqList = {
                    1: this.faqListMonitor,
                    2: this.faqListForwarder
                }[this.model.wizard.get("inputMode")];

                this.children.faq = new Faq({faqList: faqList(wildcardHelpLink, whitelistblacklistHelpLink)});

                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        input: this.model.input
                    }
                });

                this.flashMsgHelper = this.children.flashMessages.flashMsgHelper;

                this.children.browseFile = new ControlGroup({
                    className: 'net-port control-group',
                    controlType: 'TextBrowse',
                    controlClass: '',
                    controlOptions: {
                        modelAttribute: 'ui.name',
                        model: this.model.input,
                        applicationModel: this.model.application,
                        browserType: 'files',
                        save: false
                    },
                    label:   _('File or Directory').t(),
                    help:   _('On Windows: c:\\apache\\apache.error.log or \\\\hostname\\apache\\apache.error.log. On Unix: /var/log or /mnt/www01/var/log.').t(),
                    tooltip: _('This can be any file or directory accessible from this Splunk installation. Make sure Splunk has the correct permissions to access the data you want it to collect.').t()
                });

                this.children.filePath = new ControlGroup({
                    className: 'file-path control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.name',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('File or Directory').t(),
                    help:   _('On Windows: c:\\apache\\apache.error.log or \\\\hostname\\apache\\apache.error.log. On Unix: /var/log or /mnt/www01/var/log.').t(),
                    tooltip: _('This can be any file or directory accessible from this Splunk installation. Make sure Splunk has the correct permissions to access the data you want it to collect.').t()
                });

                this.children.continuouslyMonitor = new ControlGroup({
                    className: 'continuous-montior control-group',
                    controlType: 'SyntheticRadio',
                    controlClass: 'controls-halfblock',
                    controlOptions: {
                        modelAttribute: 'continuouslyMonitor',
                        model: this.model.input,
                        items: [
                            {
                                label: _('Continuously Monitor').t(),
                                value: 1
                            },
                            {
                                label: _('Index Once').t(),
                                value: 0
                            }
                        ],
                        save: false
                    }
                });

                this.children.whitelist = new ControlGroup({
                    className: 'whitelist control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.whitelist',
                        model: this.model.input,
                        save: false,
                        placeholder: _('optional').t()
                    },
                    label: _('Whitelist').t(),
                    tooltip: _('Specify a regular expression that files from this source must match to be monitored by Splunk.').t()
                });

                this.children.blacklist = new ControlGroup({
                    className: 'blacklist control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.blacklist',
                        model: this.model.input,
                        save: false,
                        placeholder: _('optional').t()
                    },
                    label: _('Blacklist').t(),
                    tooltip: _('Specify a regular expression that files from this source must NOT match to be monitored by Splunk.').t()
                });

                /* Events */
                if (this.model.wizard.isLocalMode()) {
                    this.model.input.on('change:continuouslyMonitor', function(model, continuouslyMonitor) {
                        // A tricky part: here we hackishly change the input model's url as the switch value changes.
                        // It's because we can't just switch a model from underneath a view on switch change.
                        if (continuouslyMonitor == 1) {
                            this.model.input.url = 'data/inputs/monitor';
                        } else {
                            this.model.input.url = 'data/inputs/oneshot';
                        }
                    }, this);

                    this.model.input.on('change:ui.name', function (model, newName) {
                        this.model.input.getPathDetails().done(function(res) {
                            this.model.wizard.set(res);
                            this.updateVisibility();
                        }.bind(this));
                    }, this);

                    this.model.wizard.on('change:isDirectory', function(model) {
                        if (model.get('isDirectory')) {
                            this.model.input.set('continuouslyMonitor', 1);
                            this.flashMsgHelper.addGeneralMessage(this.FILE_WARNING_MESSAGE, {
                                type: splunkDUtils.INFO,
                                html: _("Data preview will be skipped, it is not supported for directories.").t()
                            });
                        }
                    }, this);
                    this.model.wizard.on('change:isWildcardPath', function(model) {
                        if (model.get('isWildcardPath')) {
                            this.model.input.set('continuouslyMonitor', 1);
                            this.flashMsgHelper.addGeneralMessage(this.FILE_WARNING_MESSAGE, {
                                type: splunkDUtils.INFO,
                                html: _("Data preview will be skipped, it is not supported for paths using wildcards.").t()
                            });
                        }
                    }, this);
                    this.model.wizard.on('change:isArchive', function(model) {
                        if (model.get('isArchive')) {
                            this.flashMsgHelper.addGeneralMessage(this.FILE_WARNING_MESSAGE, {
                                type: splunkDUtils.INFO,
                                html: _("Data preview will be skipped, it is not supported for archives.").t()
                            });
                        }
                    }, this);
                    this.model.wizard.on('change:isUNCPath', function(model) {
                        if (model.get('isUNCPath')) {
                            this.flashMsgHelper.addGeneralMessage(this.FILE_WARNING_MESSAGE, {
                                type: splunkDUtils.INFO,
                                html: _("Data preview will be skipped, it is not supported for UNC paths.").t()
                            });
                        }
                    }, this);
                }
            },


            updateVisibility: function() {
                if (this.model.wizard.isLocalMode()) {
                    this.children.browseFile.show();
                    this.children.filePath.hide();

                    if (this.model.wizard.isDirectory() || this.model.wizard.get('isWildcardPath')) {
                        this.children.continuouslyMonitor.hide();
                        this.children.whitelist.enable();
                        this.children.blacklist.enable();
                    } else {
                        this.children.continuouslyMonitor.show();
                        this.children.whitelist.disable();
                        this.children.blacklist.disable();
                    }
                } else if (this.model.wizard.isForwardMode()) {
                    this.children.browseFile.hide();
                    this.children.filePath.show();
                    this.children.continuouslyMonitor.hide();
                }
            },

            render: function () {
                var helpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.files'
                );

                var template = this.compiledTemplate({
                    inputMode: this.model.wizard.get("inputMode"),
                    helpLink: helpLink
                });
                this.$el.html(template);

                var flashMessagesPlaceholder = this.$('#flashmessages-placeholder');
                flashMessagesPlaceholder.html(this.children.flashMessages.render().el);

                var form = this.$('.serverForm');
                form.append(this.children.browseFile.render().el);
                form.append(this.children.filePath.render().el);
                form.append(this.children.continuouslyMonitor.render().el);
                form.append(this.children.whitelist.render().el);
                form.append(this.children.blacklist.render().el);

                this.$el.append(this.children.faq.render().el);

                this.updateVisibility();
                return this;
            },

            faqListMonitor: function () {
                return [
                    {
                        question: _('What kinds of files can Splunk index?').t(),
                        answer: _('Many kinds. Splunk recognizes many different file formats, and you can \
                    configure it to recognize many more.').t()
                    },
                    {
                        question: _('I can\'t access the file that I want to index. Why?').t(),
                        answer: _('Make sure that the file is available on your system by checking mount points or mapped \
                    drives. Also, make sure the user account that Splunk runs as has proper permissions to \
                    access the file.').t()
                    },
                    {
                        question: _('How do I get remote data onto my Splunk instance?').t(),
                        answer: _('If the data is on a machine on the same network, you can map or mount a drive to access \
                    the data. The most popular option is to forward the data by installing a universal forwarder on \
                    the machine that contains the data.').t()
                    },
                    {
                        question: _('Can I monitor changes to files in addition to their content?').t(),
                        answer: _('Yes. Best Practices suggest using native OS file auditing tools, like Audit Policy for \
                    Windows and auditd for UNIX, and then indexing the output of those tools into Splunk.').t()
                    },
                    {
                        question: _('What is a source type?').t(),
                        answer: _('A source type is a field that defines how Splunk handles a piece of incoming \
                    data. The source type defines specifications for line break behavior, timestamp location, and character set.').t()
                    },
                    {
                        question: _('How do I specify a whitelist or blacklist for a directory?').t(),
                        answer: _('Specify a ').t() + '<a class="external" href="' + arguments[0] + '" target="_blank">' + _("wildcard").t() + '</a>' +
                        _(' or a directory in the "File or Directory" field, then click "Next." Splunk enables the "whitelist" and "blacklist" fields for editing.').t() +
                        '<a class="external" href="' + arguments[1] + '" target="_blank">' + _("Learn More").t() + '</a>'
                    }
                ];
            },

            faqListForwarder: function () {
                return [
                    {
                        question: _('What kinds of files can Splunk index?').t(),
                        answer: _('Many kinds. Splunk recognizes many different file formats, and you can \
                    configure it to recognize many more.').t()
                    },
                    {
                        question: _('Can I browse files on Universal Forwarders through this UI?').t(),
                        answer: _('No, at this time there is no support for browsing remote file systems. Instead, specify \
                    the exact path to the file or directory you wish to monitor.').t()
                    },
                    {
                        question: _('Can I monitor changes to files in addition to their content?').t(),
                        answer: _('Yes. Use native OS file auditing tools, like Audit Policy for Windows and auditd for \
                    UNIX, and then configure the universal forwarder to monitor the file or Event Log channel that \
                    the auditing tool writes to.').t()
                    },
                    {
                        question: _('What is a source type?').t(),
                        answer: _('A source type is a field that defines how Splunk handles a piece of incoming \
                    data. The source type defines specifications for line break behavior, timestamp location, and character set.').t()
                    },
                    {
                        question: _('How do I specify a whitelist or blacklist for a directory?').t(),
                        answer: _('Specify a ').t() + '<a class="external" href="' + arguments[0] + '" target="_blank">' + _("wildcard").t() + '</a>' +
                        _(' or a directory in the "File or Directory" field, then click "Next." Splunk displays the whitelist and blacklist fields. ').t() +
                        '<a class="external" href="' + arguments[1] + '" target="_blank">' + _("Learn More").t() + '</a>'
                    }
                ];
            }
        });
    }
);
