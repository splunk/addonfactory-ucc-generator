define(
    [
        'jquery',
        'underscore',
        'module',
        'models/services/server/ServerSettings',
        'models/shared/Cron',
        'collections/services/admin/FileExplorer',
        'views/Base',
        'views/shared/FlashMessages',
        'views/shared/ScheduleSentence',
        'views/shared/controls/ControlGroup',
        'views/shared/Faq',
        'uri/route',
        'splunk.util'
    ],
    function ($,
              _,
              module,
              ServerSettingsModel,
              Cron,
              FileExplorerCollection,
              BaseView,
              FlashMessagesView,
              ScheduleSentence,
              ControlGroup,
              Faq,
              route,
              splunkUtil
    ) {
        /**
         */
        return BaseView.extend({
            moduleId: module.id,
            className: '',

            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.splunkHomePath = null;
                this.osSep = null; // OS separator is the character delimiting sections in file path

                this.initScriptSelector();

                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        input: this.model.input
                    }
                });

                this.children.command = new ControlGroup({
                    className: 'net-port control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.name',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Command').t(),
                    tooltip: _('On Unix: $SPLUNK_HOME/bin/scripts/getData.sh foo "bar baz"; On Windows: $SPLUNK_HOME\\bin\\scripts\\getData.bat "foo bar" baz').t()
                });

                this.children.intervalManual = new ControlGroup({
                    className: 'net-port control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.interval',
                        model: this.model.input,
                        save: false
                    },
                    label:   _('Interval').t(),
                    tooltip: _('Number of seconds to wait before running the command again.').t()
                });

                this.children.intervalSelect = new ControlGroup({
                    className: 'net-port control-group interSel',
                    controlType: 'SyntheticSelect',
                    controlOptions: {
                        modelAttribute: 'ui.intervalSelection',
                        model: this.model.input,
                        items: [    
                            {value: 'In Seconds'},
                            {value: 'Cron Schedule'}
                        ],
                        toggleClassName: 'btn',
                        popdownOptions: {
                            attachDialogTo: 'body'
                        }
                    },
                    controlClass: 'controls-block',
                    label: _('Interval Input').t(),
                    tooltip: _('Number of seconds to wait before running the command again, or a valid cron schedule.').t()
                });

                // placeholder - value will be overwritten
                this.model.cron = Cron.createFromCronString('0 6 * * 1');
                this.children.intervalCron = new ScheduleSentence({
                    model: {
                        cron: this.model.cron,
                        application: this.model.application
                    },
                    lineOneLabel: _('Interval').t(),
                    popdownOptions: {
                        attachDialogTo: 'body',
                        scrollContainer: 'body'
                    }
                });


                this.children.sourceOverride = new ControlGroup({
                    className: 'net-port control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.source',
                        model: this.model.input,
                        save: false,
                        placeholder: _('optional').t()
                    },
                    label:   _('Source name override').t(),
                    tooltip: _('If set, overrides the default source value for your script entry.').t()
                });

                var scriptHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'gettingstarted.scripted'
                ), scriptTutorialLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.cronschedule'
                );

                this.children.faq = new Faq({faqList: this.faqList(scriptHelpLink, scriptTutorialLink)});

                /* EVENTS */
                this.model.input.on('change:path', function() {
                    // When path is selected, we try to ask file-explorer endpoint to return its contents
                    // if success - we display a dropdown with list of found scripts,
                    // otherwise - display an error and reset the command until user clicks again
                    this.clearError();
                    var selectedPath = this.model.input.get('path');
                    selectedPath = selectedPath.replace('$SPLUNK_HOME', this.splunkHomePath);
                    this.getFolderContentList(selectedPath).done(function(fileList) {
                        fileList = this.filterScriptList(fileList);
                        if (fileList.length) {
                            this.updateScriptList(fileList);
                            this.model.input.set({script: fileList[0]});
                        } else {
                            this.throwError(_('No scripts found under the selected path.').t());
                            if (this.children.scriptlist) {
                                this.children.scriptlist.remove();
                            }
                            this.model.input.set({'ui.name': ''});
                        }
                    }.bind(this)).fail(function() {
                        this.throwError(_('No scripts found under the selected path.').t());
                            if (this.children.scriptlist) {
                                this.children.scriptlist.remove();
                            }
                        this.model.input.set({'ui.name': ''});
                    }.bind(this));
                }.bind(this));

                this.model.cron.on('change', function(){
                    var newInter = this.model.cron.getCronString();
                    this.model.input.set({'ui.interval': newInter});
                }.bind(this));

                this.model.input.on('change:script', function() {
                    var scriptPath = this.model.input.get('script');
                    scriptPath = this.model.input.get('path') + this.osSep + scriptPath;
                    var fullScriptPath = scriptPath.replace('$SPLUNK_HOME', this.splunkHomePath);
                    this.model.input.set({'ui.name': scriptPath});
                    this.model.input.set({'fullScriptPath': fullScriptPath});
                }.bind(this));

                this.model.input.on('change:ui.intervalSelection', function(){
                    if (this.model.input.get('ui.intervalSelection') == "In Seconds"){
                        this.children.intervalCron.$el.hide();
                        this.children.intervalManual.show();
                    }else{
                        this.children.intervalManual.hide();
                        this.children.intervalCron.$el.show();
                        var newInter = this.model.cron.getCronString();
                        this.model.input.set({'ui.interval': newInter});
                    }
                }, this);

            },

            initScriptSelector: function() {
                // Initialize list of available paths
                var that = this;
                this.paths = [
                    ['$SPLUNK_HOME', 'bin', 'scripts'],
                    ['$SPLUNK_HOME', 'etc', 'system', 'bin']
                ];

                if (this.model.wizard.isLocalMode()) {
                    // app paths can't be selected in forwarder mode as they may not exist there
                    _.each(this.collection.appLocals.listWithoutInternals(), function (appModel) {
                        this.paths.push(['$SPLUNK_HOME', 'etc', 'apps', appModel.entry.get('name'), 'bin']);
                    }.bind(this));
                }

                // Detect Splunk home path, determine OS separator and prepare the list for SyntheticSelect
                this.pathsDfd = this.getSplunkHomePath();
                this.pathsDfd.done(function(splunkHomePath) {
                    this.splunkHomePath = splunkHomePath;
                    this.osSep = (splunkHomePath.indexOf('/') !== 0) ? '\\' : '/';
                    this.newpaths = function() {
                        var paths = _.map(that.paths, function(item) {
                            var path = item.join(that.osSep);
                            return {label:path,value:path};
                        });
                        return _.sortBy(paths, 'label');
                    };

                    this.children.paths = new ControlGroup({
                        className: 'paths control-group',
                        controlType: 'SyntheticSelect',
                        controlClass: 'controls-block',
                        controlOptions: {
                            modelAttribute: 'path',
                            model: this.model.input,
                            items: this.newpaths(),
                            className: 'btn-group view-count',
                            menuWidth: 'wide',
                            toggleClassName: 'btn',
                            prompt: _('-- Select script path --').t()
                        },
                        label: _('Script Path').t()
                    });
                }.bind(this));
            },

            getSplunkHomePath: function() {
                var pathDfd = $.Deferred();
                this.serverSettingsModel = new ServerSettingsModel();
                this.serverSettingsModel.set({id: 'settings'});
                this.serverSettingsModel.fetch().done(function() {
                    pathDfd.resolve(this.serverSettingsModel.getSplunkHomePath());
                }.bind(this));
                return pathDfd.promise();
            },

            getFolderContentList: function(path) {
                var listDfd = $.Deferred();
                var fileExplorerCollection = new FileExplorerCollection();

                fileExplorerCollection.url += '/' + encodeURIComponent(path.replace(/\//g, '%2F'));
                fileExplorerCollection.fetch({
                    data: {
                        count: -1
                    }
                }).done(function() {
                    var fileList = [];
                    _.each(fileExplorerCollection.models, function(model) {
                        if (model.hasSubNodes() || model.entry.get('name') === path) {
                            // it's a subdirectory or an empty directory
                            return;
                        }
                        fileList.push(model.entry.content.get('name'));
                    }.bind(this));
                    listDfd.resolve(fileList);
                }).fail(function() {
                    listDfd.reject();
                });
                return listDfd.promise();
            },

            updateScriptList: function(filelist) {
                var newFilelist = _.map(filelist, function(item) {
                    return {label:item,value:item};
                });
                if (this.children.scriptlist) {
                    this.children.scriptlist.remove();
                }

                this.children.scriptlist = new ControlGroup({
                    className: 'script-list control-group',
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'script',
                        model: this.model.input,
                        items: newFilelist,
                        className: 'btn-group view-count',
                        menuWidth: 'wide',
                        toggleClassName: 'btn'
                    },
                    label: _('Script Name').t()
                });

                $(this.children.scriptlist.render().el).insertAfter(this.children.paths.$el);
            },

            filterScriptList: function(fileList) {
                var ignoredExtensions = ['txt', 'pyc', 'pyo'];
                return fileList.filter(function(fileName) {
                    if (fileName.toLowerCase().indexOf('readme') > -1 || ignoredExtensions.indexOf(fileName.substring(fileName.lastIndexOf('.')+1)) > -1) {
                        return false;
                    }
                    return true;
                });
            },

            throwError: function(errMessage) {
                this.children.flashMessages.flashMsgHelper.addGeneralMessage('script_error',
                    {
                        type: 'error',
                        html: errMessage
                    }
                );
            },

            clearError: function() {
                this.children.flashMessages.flashMsgHelper.removeGeneralMessage('script_error');
                this.model.input.trigger('validated', true, this.model.input, []);
            },

            faqList: function() {
                return [
                {
                    question: _('What kind of scripts can I run?').t(),
                    answer: _('It depends on the operating system that this machine runs. If it runs a *nix OS, you can \
                    create and run shell scripts or binaries that send text output to the stdout or stderr output \
                    channels. If it runs Windows, you can deploy batch files or PowerShell scripts. You can create and \
                    use scripts to get data from APIs. You can also use a wrapper to execute a script that Splunk \
                    would not otherwise support. ').t() +
                    '<a class="external" href="' + arguments[0] + '" target="_blank">' + _("Learn More").t() + '</a>'
                },
                {
                    question: _('How do I control when scripts run?').t(),
                    answer: _('You control how often scripts run by specifying an interval (in seconds).').t()
                },
                {
                    question: _('How do I write my own Cron Schedule?').t(),
                    answer: splunkUtil.sprintf(_('Use a special combination of text (known as the cron notation) to specify start and interval times for the scripted input to run. %s to learn how.').t(), '<a class="external" href="' + arguments[1] + '" target="_blank">' + _("See this page").t() + '</a>')
                }
                ];
            },

            template:
                '<div class="inputform_wrapper"><p> \
                 <% if (inputMode == 1) { %> \
                    <%= _("Configure this instance to execute a script or command and to capture its output as event \
                    data. Scripted inputs are useful when the data that you want to index is not available in a file to monitor. ").t() %> \
                 <% } else { %> \
                    <%= _("Configure selected Splunk Universal Forwarders to execute a script or command \
                    and index its output as event data. Scripted inputs are useful when the data you want to index \
                    isn\'t available in a file to monitor.").t() %> \
                 <% } %> \
                 <a class="external" href="<%- helpLink %>" target="_blank"><%= _("Learn More").t() %></a>\
                 </p>\
                 </div>',

            render: function () {
                var helpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.adddata.scripts'
                );

                this.$el.append(_.template(this.template, {
                    inputMode: this.model.wizard.get("inputMode"),
                    helpLink: helpLink
                }));
				var $form = this.$('.inputform_wrapper');
                $form.append(this.children.flashMessages.render().el);
                $form.append(this.children.command.render().el);
                $form.append(this.children.intervalSelect.render().el);
                $form.append(this.children.intervalManual.render().el);
                $form.append(this.children.intervalCron.render().$el);
                this.children.intervalCron.$el.hide();
                $form.append(this.children.sourceOverride.render().el);
                this.$el.append(this.children.faq.render().el);

                this.pathsDfd.done(function() {
                    this.children.command.$el.prepend(this.children.paths.render().el);
                }.bind(this));

                return this;
            }
        });
    }
);
