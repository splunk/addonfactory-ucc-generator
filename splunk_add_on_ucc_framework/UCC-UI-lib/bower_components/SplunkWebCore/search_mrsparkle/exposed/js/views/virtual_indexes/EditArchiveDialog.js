/**
 * @author jszeto
 * @date 11/05/2014
 *
 * Dialog to edit the Older Than field of an archive
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
        'models/virtual_indexes/EditArchive',
        'views/shared/FlashMessages',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'views/virtual_indexes/custom_controls/TimeSecondsControl',
        'splunk.util'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        EditArchive,
        FlashMessages,
        Modal,
        ControlGroup,
        TimeSecondsControl,
        splunkUtil
    ) {
        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME,

            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);

                // Create a working model to store the older than value and to perform validation
                this.model.editArchive = new EditArchive({"vix.output.buckets.older.than" :
                                                          this.model.archive.entry.content.get("vix.output.buckets.older.than")});

                this.timeThresholdControl = new TimeSecondsControl({
                    modelAttribute: 'vix.output.buckets.older.than',
                    model: this.model.editArchive
                });

                this.children.timeThreshold = new ControlGroup({
                    className: 'control-group',
                    controlClass: 'controls-block',
                    controls: [this.timeThresholdControl],
                    label: _('Older Than').t(),
                    help: _('Archive if the bucket is older than this value').t()
                });

                this.children.flashMessages = new FlashMessages({model:this.model.editArchive});
            },
            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    if (this.model.editArchive.set({}, {validate:true})) {
                        this.model.archive.entry.content.set({"vix.output.buckets.older.than" :
                             this.model.editArchive.get("vix.output.buckets.older.than")});
                        $.when(this.model.archive.save()).done(_(function() {
                            this.hide();
                        }).bind(this));
                    }
                }
            }),
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Edit Archive - ").t() + this.model.archive.entry.get('name'));
                this.$(Modal.BODY_SELECTOR).append(this.children.flashMessages.render().el);
                this.$(Modal.BODY_SELECTOR).append(this.children.timeThreshold.render().el);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">'+ _('Save').t() + '</a>');
                return this;
            }

        });
    });
