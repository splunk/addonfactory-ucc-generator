define([
    "module",
    "underscore",
    "jquery",
    "backbone",
    "ace/ace",
    "views/Base",
    "util/general_utils",
    "util/xml",
    "splunk.util",
    "./XMLEditorMessage",
    "./XMLEditor.pcss"
], function(module,
            _,
            $,
            Backbone,
            Ace,
            BaseView,
            GeneralUtils,
            XML,
            SplunkUtil,
            XMLEditorMessage) {

    var Range = Ace.require('ace/range').Range;

    var TOOLBAR_HEIGHT = 112;
    var STATE_MSG_HEIGHT = 32;
    var FOOTER_HEIGHT = 52;

    return BaseView.extend({
        moduleId: module.id,
        className: 'dashboard-xml-editor-wrapper',
        defaultOptions: {
            autoAdjustHeight: true,
            fixedHeight: 0,
            showMessages: true
        },
        events: {
            "click a.editor-goto-line": "gotoLine"
        },
        commands: [
            {
                name: 'format',
                bindKey: {win: 'Ctrl-Shift-F', mac: 'Command-Shift-F'},
                exec: 'formatDashboardXML',
                readOnly: false
            }
        ],
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.options = _.extend({}, this.defaultOptions, this.options);
            this.editor = null;
            this.$editor = null;
            this.model = _.extend({
                editorMessage: new Backbone.Model()
            }, this.model);
            this.collection = _.extend({}, this.collection);
            if (this.options.showMessages) {
                this.children.message = new XMLEditorMessage({
                    collection: {
                        dashboardMessages: this.collection.dashboardMessages
                    },
                    model: {
                        application: this.model.application,
                        state: this.model.state,
                        message: this.model.editorMessage
                    }
                });
            }
            this.listenTo(this.model.editor, 'change:theme', this.applyTheme);
            this.listenTo(this.model.editor, 'change:mode', this.applyMode);
            this.listenTo(this.model.editor, 'change:showPrintMargin', this.applyEditorOptions);
            this.listenTo(this.model.editor, 'change:annotations', this.applyAnnotations);
            this.debouncedUpdateHeight = _.debounce(this.updateHeight.bind(this), 250);
            $(window).on('resize', this.debouncedUpdateHeight);
        },
        applyMode: function() {
            this.editor.getSession().setMode(this.model.editor.get('mode') || "ace/mode/xml");
        },
        applyTheme: function() {
            this.editor.setTheme(this.model.editor.get('theme') || "ace/theme/chrome");
        },
        applyEditorOptions: function() {
            this.editor.setOptions({
                showPrintMargin: GeneralUtils.normalizeBoolean(this.model.editor.get('showPrintMargin'), {"default": false}),
                fontSize: this.model.editor.get('fontSize') || '12px',
                useWorker: false,
                useSoftTabs: true,
                tabSize: 2,
                readOnly: this.options.readOnly,
                wrap: GeneralUtils.normalizeBoolean(this.model.editor.get('wrap'), {"default": true})
            });
        },
        applyEditorCommands: function() {
            var cmds = _(this.commands).chain().map(function(command) {
                var cmd = _.clone(command);
                cmd.exec = this[command.exec].bind(this);
                return cmd;
            }, this).value();
            this.editor.commands.removeCommands(cmds);
            this.editor.commands.addCommands(cmds);
        },
        buildSummarySpecifiedResult: function(result, type, message) {
            message.level = type;
            message.text = result.msg;
            message.link = '#L' + result.line;
            message.linkClass = 'editor-goto-line';
            message.linkData = {line: result.line};
            var validationLinkText = {
                error: _('Error on line %d: ').t(),
                warning: _('Warning on line %d: ').t()
            };
            message.linkText = SplunkUtil.sprintf(validationLinkText[type], result.line);
            message.linkPosition = 'before';
        },
        gotoLine: function(e) {
            e.preventDefault();
            var target = e.target;
            var line = $(target).data("line");
            this.editor.resize(true);
            this.editor.gotoLine(line, 0, true);
            this.editor.focus();
        },
        getSummaryMessage: function(parseResults) {
            var message = {
                text: _("No validation issues").t(),
                level: "info",
                link: undefined,
                linkText: undefined,
                linkPosition: undefined,
                linkClass: undefined
            };
            var errorCount = parseResults.errors.length, warningCount = parseResults.warnings.length;
            if (errorCount > 1) {
                if (warningCount > 0) {
                    message.text = SplunkUtil.sprintf(_("%d Validation errors, %d validation warnings").t(), errorCount, warningCount);
                } else {
                    message.text = SplunkUtil.sprintf(_("%d Validation errors").t(), errorCount);
                }
                message.level = "error";
            } else if (errorCount == 1) {
                this.buildSummarySpecifiedResult(parseResults.errors[0], 'error', message);
            } else {    //No errors
                if (warningCount > 1) {
                    message.text = SplunkUtil.sprintf(_("%d Validation warnings").t(), warningCount);
                    message.level = "warning";
                } else if (warningCount == 1) {
                    this.buildSummarySpecifiedResult(parseResults.warnings[0], 'warning', message);
                }
            }
            return message;
        },
        clearEditorMarkers: function() {
            _.each(this.editor.getSession().getMarkers(), function(marker) {
                this.editor.getSession().removeMarker(marker.id);
            }, this);
        },
        applyAnnotations: function() {
            this.clearEditorMarkers();
            var result = this.model.editor.get('parseResults');
            if (!result) {
                this.model.editorMessage.unset({
                    text: true,
                    level: true
                });
                return;
            }
            var summaryMessage = this.getSummaryMessage(result);
            var annotations = [];
            var hasGlobalError = false;
            var editor = this.editor;
            if (result.warnings.length || result.errors.length) {
                _(result.warnings).each(function(warning) {
                    var line = warning.line - 1;
                    annotations.push({
                        "type": "warning",
                        "text": warning.msg,
                        "row": line,
                        "column": 0
                    });
                    editor.getSession().addMarker(new Range(line, 0, line, 10), "splunk_warning_marker", "fullLine");
                });
                _(result.errors).each(function(error) {
                    var line = error.line - 1;
                    if (line < 0) {
                        //deal with the global error
                        hasGlobalError = true;
                        summaryMessage.text = error.msg;
                        summaryMessage.level = "error";
                    } else {
                        annotations.push({
                            "type": "error",
                            "text": error.msg,
                            "row": line,
                            "column": 0
                        });
                        editor.getSession().addMarker(new Range(line, 0, line, 10), "splunk_error_marker", "fullLine");
                    }
                });
            }

            this.model.editorMessage.set(summaryMessage);

            this.editor.getSession().setAnnotations(annotations);
        },
        getEditorValue: function() {
            return this.editor.getSession().getDocument().getValue();
        },
        setEditorValue: function(val) {
            this.editor.getSession().getDocument().setValue(val);
        },
        formatDashboardXML: function(editor) {
            try {
                var $formattedXML = XML.formatDashboardXML(XML.parse(this.getEditorValue()));
                this.setEditorValue(XML.serialize($formattedXML));
            }
            catch (e) {
                //do something?
            }
        },
        newEditorSession: function() {
            this.editor.setSession(Ace.createEditSession(this.model.editor.get('code') || ''));
        },
        updateHeight: function() {
            if (this.options.autoAdjustHeight) {
                this.$editor.height($(window).height() - TOOLBAR_HEIGHT - STATE_MSG_HEIGHT - FOOTER_HEIGHT);
            } else {
                this.$editor.height(this.options.fixedHeight);
            }
            if (this.editor) {
                this.editor.resize();
            }
        },
        render: function() {
            if (this.children.message) {
                this.children.message.render().appendTo(this.$el);
            }
            this.$editor = $("<div></div>").addClass("dashboard-xml-editor").appendTo(this.$el);
            this.$editor.attr('id', 'dashboard-editor');
            this.updateHeight();
            this.editor = Ace.edit(this.$editor[0]);
            this.editor.$blockScrolling = Infinity;
            this.newEditorSession();
            this.editor.getSession().getDocument().on('change', function() {
                this.model.editor.set('code', this.getEditorValue());
            }.bind(this));
            this.applyMode();
            this.applyTheme();
            this.applyEditorOptions();
            this.applyEditorCommands();
            this.applyAnnotations();
            this.editor.focus();
            return this;
        },
        destroyEditor: function() {
            if (this.editor) {
                this.editor.destroy();
                this.editor = null;
            }
        },
        remove: function() {
            $(window).off('resize', this.debouncedUpdateHeight);
            this.destroyEditor();
            BaseView.prototype.remove.apply(this, arguments);
        }
    });
});