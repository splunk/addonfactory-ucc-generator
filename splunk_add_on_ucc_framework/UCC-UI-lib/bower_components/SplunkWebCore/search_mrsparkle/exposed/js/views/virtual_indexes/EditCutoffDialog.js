/**
 * @author claral
 *
 * Dialog to edit the Cutoff Sec field of an archive
 *
 * INPUTS:
 *
 * model: {
 *     archive {models/services/data/vix/Index} - The archive index to edit
 * }
 */
define([
        'jquery',
        'underscore',
        'module',
        'backbone',
        'models/Base',
        'models/virtual_indexes/EditCutoffSec',
        'views/shared/FlashMessages',
        'views/shared/Modal',
        'views/virtual_indexes/custom_controls/OptionalTimeSecondsControl',
        'uri/route'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        BaseModel,
        EditCutoffSec,
        FlashMessages,
        Modal,
        OptionalTimeSecondsControl,
        route
    ) {
        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME,

            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
                
                var cutoffSec = this.model.archive.entry.content.get("vix.unified.search.cutoff_sec");
                var unifiedSearchEnabled = this.model.limits.getUnifiedSearch();

                // Create a working model to store the cutoff_sec value and to perform validation
                this.model.editCutoffSec = new EditCutoffSec({
                    'vix.unified.search.cutoff_sec': cutoffSec
                });
                
                var helpText = _('Query against virtual index for events older than this value.').t();
                var docLink = route.docHelp(this.model.application.get('root'),
                                            this.model.application.get('locale'),
                                            'learnmore.unifiedsearch.about');
                var helpLink = ' <a href="' + docLink + '" class="doc" target="_blank">' + _('Learn More').t() + ' <i class="icon-external"></i></a>';

                this.children.timeThreshold = new OptionalTimeSecondsControl({
                    enabled: unifiedSearchEnabled && cutoffSec,
                    modelAttribute: 'vix.unified.search.cutoff_sec',
                    model: this.model.editCutoffSec,
                    checkboxLabel: _("Enable Unified Search").t(),
                    checkboxHelp: _("Unified Search may increase search runtime.").t(),
                    timeLabel: _('Cutoff Time').t(),
                    timeHelp: helpText + helpLink
                });

                this.children.flashMessages = new FlashMessages({model:this.model.editCutoffSec});
            },
            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    if (this.children.timeThreshold.isEnabled()){
                        // Unified Search is on, so validate and save the new value.
                        if (this.model.editCutoffSec.set({}, {validate:true})) {
                            this.saveDfd = $.Deferred();
                            if (!this.model.limits.getUnifiedSearch()) {
                                // Unified Search is turned on globally when it is turned on for an index.
                                // Only update limits.conf if Unified Search is being turned on.
                                this.model.limits.entry.content.set({'unified_search': 1});
                                $.when(this.model.limits.save()).done(_(function() {
                                    this.saveDfd.resolve();
                                }).bind(this));
                            } else {
                                this.saveDfd.resolve();
                            }
                            $.when(this.saveDfd).done(_(function() {
                                this.saveCutoffSec(this.model.editCutoffSec.get('vix.unified.search.cutoff_sec'));
                            }).bind(this));
                        }
                    } else {
                        // Unified Search is off, so save an empty value.
                        // Saving an empty value turns off unified search for this index and archive.
                        this.saveCutoffSec('');
                    }
                }
            }),
            saveCutoffSec: function(val) {
                this.model.archive.entry.content.set({'vix.unified.search.cutoff_sec': val});
                $.when(this.model.archive.save()).done(_(function() {
                    this.hide();
                }).bind(this));
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Edit Archive - ').t() + this.model.archive.entry.get('name'));
                this.$(Modal.BODY_SELECTOR).append(this.children.flashMessages.render().el);
                this.$(Modal.BODY_SELECTOR).append(this.children.timeThreshold.render().el);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
                
                return this;
            }

        });
    });
