define(
        [
            'jquery',
            'underscore',
            'module',
            'views/Base',
            'views/shared/Modal',
            'views/shared/delegates/ModalTimerangePicker',
            'views/shared/reportcontrols/dialogs/schedule_dialog/step1/Schedule',
            'views/shared/timerangepicker/dialog/Master',
            'views/shared/FlashMessages'
        ],
        function(
            $,
            _,
            module,
            Base,
            Modal,
            TimeRangeDelegate,
            ScheduleView,
            TimeRangePickerDialog,
            FlashMessage
        ) {
        return Base.extend({
            moduleId: module.id,
            /**
            * @param {Object} options {
            *        model: {
            *            application: <models.Application>
            *            inmem: <models.Report>,
            *            cron: <models.Cron>,
            *            timeRange: <models.TimeRange>,
            *            user: <models.services.admin.User>,
            *            appLocal: <models.services.AppLocal>,
            *            scheduleWindow: <models.shared.ScheduleWindow>
            *        },
            *        collection: <collections.services.data.ui.Times>
            * }
            **/
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                //views
                this.children.flashMessage = new FlashMessage({ 
                    model: {
                        inmem: this.model.inmem,
                        cron: this.model.cron,
                        scheduleWindow: this.model.scheduleWindow
                    }
                });
                
                var warningMessage = this.model.inmem.get('schedule_warning_message');
                if (warningMessage) {
                    this.children.flashMessage.flashMsgHelper.addGeneralMessage('schedule_warning_message', warningMessage);
                }

                this.children.scheduleView = new ScheduleView({
                    model: {
                        application: this.model.application,
                        inmem: this.model.inmem,
                        cron: this.model.cron,
                        timeRange: this.model.timeRange,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        scheduleWindow: this.model.scheduleWindow
                    },
                    collection: this.collection
                });


                this.children.timeRangePickerView = new TimeRangePickerDialog({
                    model: {
                        timeRange: this.model.timeRange,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        application: this.model.application
                    },
                    collection: this.collection,
                    showPresetsRealTime:false,
                    showCustomRealTime:false,
                    showCustomDate:false,
                    showCustomDateTime:false,
                    showPresetsAllTime:true,
                    enableCustomAdvancedRealTime:false,
                    appendSelectDropdownsTo: '.modal:visible'
                });

                this.model.timeRange.on('applied', function() {
                    this.timeRangeDelegate.closeTimeRangePicker();
                }, this);

                this.model.inmem.on('togglePrimaryButton', this.togglePrimaryButton, this);
            },
            events: {
                'click .modal-btn-primary' : function(e) {
                    if (this.model.inmem.get('scheduled_and_enabled')) {
                        if (this.model.user.canUseAlerts()) {
                            this.model.inmem.trigger('next');
                        } else {
                            this.model.inmem.trigger('saveSchedule');
                        }

                    } else {
                        this.model.inmem.entry.content.set('is_scheduled', 0);
                        this.model.inmem.save({}, {
                            success: function(model, response){
                                this.model.inmem.trigger('saveSuccessNotScheduled');
                            }.bind(this)
                        });  
                    }
                    e.preventDefault();
                }
            },
            togglePrimaryButton: function() {
                if(this.model.inmem.get('scheduled_and_enabled') && this.model.user.canUseAlerts()) {
                    this.$('.modal-btn-primary').html(_("Next").t());
                } else {
                    this.$('.modal-btn-primary').html(_("Save").t());
                }
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Edit Schedule").t());

                this.$(Modal.BODY_SELECTOR).remove();

                this.$(Modal.FOOTER_SELECTOR).before(
                    '<div class="vis-area">' +
                        '<div class="slide-area">' +
                            '<div class="content-wrapper schedule-wrapper">' +
                                '<div class="' + Modal.BODY_CLASS + '" >' +
                                '</div>' +
                            '</div>' +
                            '<div class="timerange-picker-wrapper">' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                );

                this.$visArea = this.$('.vis-area').eq(0);
                this.$slideArea = this.$('.slide-area').eq(0);
                this.$scheduleWrapper = this.$('.schedule-wrapper').eq(0);
                this.$timeRangePickerWrapper = this.$('.timerange-picker-wrapper').eq(0);
                this.$modalParent = $('.schedule-modal').eq(0);

                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));
                this.children.scheduleView.render().appendTo(this.$(Modal.BODY_SELECTOR));

                this.children.timeRangePickerView.render().appendTo(this.$timeRangePickerWrapper);

                this.timeRangeDelegate = new TimeRangeDelegate({
                    el: this.el,
                    $visArea: this.$visArea,
                    $slideArea: this.$slideArea,
                    $contentWrapper: this.$scheduleWrapper,
                    $timeRangePickerWrapper: this.$timeRangePickerWrapper,
                    $modalParent: this.$modalParent,
                    $timeRangePicker: this.children.timeRangePickerView.$el,
                    activateSelector: 'a.timerange-control',
                    backButtonSelector: 'a.btn.back'
                });

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">' + _('Save').t() + '</a>');
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn back modal-btn-back pull-left">' + _('Back').t() + '</a>');
                this.$('.btn.back').hide();
                
                this.togglePrimaryButton();

                return this;
            }
        });
    }
);
