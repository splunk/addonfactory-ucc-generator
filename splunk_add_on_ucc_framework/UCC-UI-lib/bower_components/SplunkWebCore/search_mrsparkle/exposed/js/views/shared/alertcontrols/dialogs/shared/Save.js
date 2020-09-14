define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/ACLReadOnly',
        'models/services/data/ui/Manager',
        'collections/services/data/ui/ModAlerts',
        'collections/shared/ModAlertActions',
        'collections/services/data/ui/Times',
        'views/Base',
        'views/shared/Modal',
        'views/shared/delegates/ModalTimerangePicker',
        'views/shared/FlashMessages',
        'views/shared/alertcontrols/dialogs/shared/Settings',
        'views/shared/alertcontrols/dialogs/shared/triggerconditions/Master',
        'views/shared/alertcontrols/dialogs/shared/triggeractions/Master',
        'views/shared/timerangepicker/dialog/Master',
        'util/pdf_utils',
        'util/splunkd_utils'
        
    ],
    function(
        $,
        _,
        Backbone,
        module,
        ACLReadOnlyModel,
        ManagerViewModel,
        ModAlertsUICollection,
        ModAlertActionsCollection,
        TimesCollection,
        BaseView,
        ModalView,
        TimeRangeDelegate,
        FlashMessagesView,
        SettingsView,
        TriggerConditionsView,
        TriggerActionsView,
        TimeRangePickerDialog,
        pdfUtils,
        splunkd_utils
    ){
    return BaseView.extend({
        moduleId: module.id,
        /**
         * @param {Object} options {
         *     model: {
         *         alert: <models.search.Alert>,
         *         user: <models.services.admin.User>,
         *         application: <models.Application>,
         *         serverInfo: <models.services.server.ServerInfo>
         *     },
         *     collection: {
         *         alertActions: <collections.shared.ModAlertActions>(Only required for type:actions)
         *         searchBNFs: <collections/services/configs/SearchBNFs> (Optional) Only needed if the showSearchField is true.
         *         appLocals: <collections/services/localapps> (Optional) Only needed if the showSearchField is true.
         *     },
         *     mode: <String>(Optional) create|edit. Determine if view is used for creating a new alert, or
         *           editing a existing alert. Default create.
         *     showSearch: <Boolean> Whether to show the search field. Default false.
         *     showSearchField: <Boolean> Whether to show an editable search field. Default false.
         * }
         */
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            
            var defaults = {
                mode: 'create',
                showSearch: false,
                showSearchField: false
            };

            _.defaults(this.options, defaults);

            this.canShowAppSelector = this.model.user &&
                _.isFunction(this.model.user.canUseApps) &&
                this.model.user.canUseApps() &&
                this.options.showSearchField;

            //deferrs
            this.deferredPdfAvailable = pdfUtils.isPdfServiceAvailable();

            var alertActionsManagerModel = new ManagerViewModel();
            alertActionsManagerModel.set('id', 'alert_actions');
            this.deferredManagerAvailable = alertActionsManagerModel.binaryPromiseFetch({
                data: {
                    app: this.model.application.get("app"),
                    owner: this.model.application.get("owner")
                }
            });
            
            // TODO: this creation of collections is repeated in edit actions
            this.collection = this.collection || {};

            this.collection.alertActionUIs = new ModAlertsUICollection();
            // TODO: Add fetch data options - currently doing and unbouded fetch
            this.deferredAlertActionUIsCollection = this.collection.alertActionUIs.fetch({
                data: {
                    app: this.model.application.get("app"),
                    owner: this.model.application.get("owner")
                }
            });

            // TODO: Add fetch data options - currently doing and unbouded fetch
            this.collection.alertActions = new ModAlertActionsCollection();
            this.deferredAlertActionCollection = this.collection.alertActions.fetch({
                data: {
                    app: this.model.application.get("app"),
                    owner: this.model.application.get("owner"),
                    search: 'disabled!=1'
                },
                addListInTriggeredAlerts: true
            });
            
            this.children.flashMessages = new FlashMessagesView({
                model: {
                    alert: this.model.alert,
                    alertContent: this.model.alert.entry.content,
                    cron: this.model.alert.cron,
                    workingTimeRange: this.model.alert.workingTimeRange
                }
            });

            if (!this.collection.times) {
                this.collection.times = new TimesCollection();
                this.timesCollectionDeferred = this.collection.times.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner"),
                        count: -1
                    }
                });
            }
            
            this.children.settings = new SettingsView({
                model: {
                    alert: this.model.alert,
                    user: this.model.user,
                    application: this.model.application,
                    serverInfo: this.model.serverInfo
                },
                collection: {
                    times: this.collection.times,
                    searchBNFs: this.collection.searchBNFs,
                    appLocals: this.collection.appLocals
                },
                showSearch: this.options.showSearch,
                showSearchField: this.options.showSearchField,
                showAppSelector: this.canShowAppSelector,
                mode: this.options.mode
            });
            
            this.children.triggerConditions = new TriggerConditionsView({
                model: {
                    alert: this.model.alert
                }
            });

            this.children.timeRangePickerView = new TimeRangePickerDialog({
                model: {
                    timeRange: this.model.alert.workingTimeRange,
                    user: this.model.user,
                    application: this.model.application
                },
                collection: this.collection.times,
                showPresetsRealTime:false,
                showCustomRealTime:false,
                showCustomDate:false,
                showCustomDateTime:false,
                showPresetsAllTime:true,
                enableCustomAdvancedRealTime:false,
                appendSelectDropdownsTo: '.modal:visible'
            });

            this.model.alert.workingTimeRange.on('applied', function() {
                this.timeRangeDelegate.closeTimeRangePicker();
            }, this);
    
            $.when(this.deferredPdfAvailable, this.deferredManagerAvailable).then(function(pdfAvailable, managerAvailable) {
                this.children.triggerActions = new TriggerActionsView({
                    pdfAvailable: _.isArray(pdfAvailable) ? pdfAvailable[0] : pdfAvailable,
                    canViewAlertActionsManager: managerAvailable,
                    model: {
                        alert: this.model.alert,
                        application: this.model.application
                    },
                    collection: {
                        alertActions: this.collection.alertActions,
                        alertActionUIs: this.collection.alertActionUIs
                    }
                });
            }.bind(this));

        },
        events: {
            'click .btn-primary': function(e) {
                e.preventDefault();
                if (this.model.alert.validateAssociated()) {
                    if (this.options.mode === 'create') {
                        this.saveAlert();
                    } else {
                        this.model.alert.save({}, {
                            validate: false
                        });
                    }
                }
            }
        },
        saveAlert: function() {
            var permissions = this.model.alert.entry.content.get('ui.permissions'),
                data = {
                    app: this.canShowAppSelector ? this.model.alert.entry.acl.get('app') : this.model.application.get('app'),
                    owner: ((permissions === splunkd_utils.USER) ? this.model.application.get('owner') : splunkd_utils.NOBODY)
                };
            this.model.alert.save({},
                {
                    data: data,
                    validate: false,
                    success: function(model) {
                        if (model.entry.acl.get('sharing') !== permissions) {
                            this.model.aclReadOnly = new ACLReadOnlyModel($.extend(true, {}, model.entry.acl.toJSON()));
                            this.model.aclReadOnly.set('sharing', permissions);
                            var data = this.model.aclReadOnly.toDataPayload();
                            this.model.alert.acl.save({}, {
                                data: data,
                                success: function() {
                                    this.model.alert.trigger('saveSuccess');
                                }.bind(this)
                            });
                        } else {
                            this.model.alert.trigger('saveSuccess');
                        }
                    }.bind(this)
                }
            );
        },
        scrollTo: function(position) {
            var mappingOfViews = {
                    'type': 'settings',
                    'trigger': 'triggerConditions',
                    'actions': 'triggerActions'
                };

            if (!position || !mappingOfViews[position]) return;

            var view = mappingOfViews[position],
                inputSelector = '.btn, input[type="text"], input[type="password"], textarea',
                $scrollingBody = $('.modal-body-scrolling:visible'),
                $textInputs = this.children[view].$el.find(inputSelector),
                textInputsLength = $textInputs.length;

            $scrollingBody.animate({
                scrollTop: $scrollingBody.scrollTop() + (this.children[view].$el.offset().top - $scrollingBody.offset().top) - 5
            }, 200);

            if(textInputsLength > 0) {
                for(var i = 0; i < textInputsLength; i++) {
                    var $textInput = $($textInputs[i]);
                    if ($textInput.is(':visible') && $textInput.css('visibility') !== 'hidden') {
                        $textInput.focus();
                        break;
                    }
                }
            }
        },
        _render: function() {
            this.$el.html(ModalView.TEMPLATE);

            var title = _("Edit Alert").t();
            if (this.options.mode === 'create') {
                if (this.options.showSearchField) {
                    title = _('Create Alert').t();
                } else {
                    title = _('Save As Alert').t();
                }
            }
            this.$(ModalView.HEADER_TITLE_SELECTOR).html(title);

            this.$(ModalView.BODY_SELECTOR).remove();

            this.$(ModalView.FOOTER_SELECTOR).before(
                '<div class="vis-area">' +
                    '<div class="slide-area">' +
                        '<div class="content-wrapper">' +
                            '<div class="' + ModalView.BODY_CLASS + '" >' +
                            '</div>' +
                        '</div>' +
                        '<div class="timerange-picker-wrapper">' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );
            
            this.$visArea = this.$('.vis-area').eq(0);
            this.$slideArea = this.$('.slide-area').eq(0);
            this.$contentWrapper = this.$('.content-wrapper').eq(0);
            this.$timeRangePickerWrapper = this.$('.timerange-picker-wrapper').eq(0);
            this.$modalParent = $('.alert-save-as.modal').eq(0).length !== 0 ? $('.alert-save-as.modal').eq(0) : $('.alert-edit.modal').eq(0);
            this.children.timeRangePickerView.render().appendTo(this.$timeRangePickerWrapper);
            this.timeRangeDelegate = new TimeRangeDelegate({
                el: this.el,
                $visArea: this.$visArea,
                $slideArea: this.$slideArea,
                $contentWrapper: this.$contentWrapper,
                $timeRangePickerWrapper: this.$timeRangePickerWrapper,
                $modalParent: this.$modalParent,
                $timeRangePicker: this.children.timeRangePickerView.$el,
                activateSelector: 'a.timerange-control',
                backButtonSelector: 'a.btn.back'
            });

            this.$(ModalView.BODY_SELECTOR).append(ModalView.FORM_HORIZONTAL_COMPLEX);
            this.$(ModalView.BODY_SELECTOR).addClass('modal-body-scrolling');
            this.children.flashMessages.render().appendTo(this.$(ModalView.BODY_FORM_SELECTOR));
            this.children.settings.render().appendTo(this.$(ModalView.BODY_FORM_SELECTOR));
            this.children.triggerConditions.render().appendTo(this.$(ModalView.BODY_FORM_SELECTOR));
            this.children.triggerActions.render().appendTo(this.$(ModalView.BODY_SELECTOR));
            this.$(ModalView.BODY_FORM_SELECTOR).show();
            this.$(ModalView.FOOTER_SELECTOR).append(ModalView.BUTTON_CANCEL);
            this.$(ModalView.FOOTER_SELECTOR).append(ModalView.BUTTON_SAVE);
            this.$(ModalView.FOOTER_SELECTOR).append('<a href="#" class="btn back modal-btn-back pull-left">' + _('Back').t() + '</a>');

            this.$('.btn.back').hide();
            return this;
        },
        render: function() {
            $.when(this.timesCollectionDeferred, this.deferredAlertActionCollection, this.deferredPdfAvailable, this.deferredAlertActionUIsCollection, this.deferredManagerAvailable).then(function() {
                this._render();
            }.bind(this));

            return this;
        }
    });
});
